"""
API Views for the chatbot application
"""
import logging
import time
import uuid
from django.utils import timezone
from django.http import FileResponse, JsonResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser

from chatbot.models import (
    ConversationHistory, RealEstateData, UserQuery,
    DataUpload, FilteredResult
)
from chatbot.serializers import (
    ConversationHistorySerializer,
    RealEstateDataSerializer,
    UserQuerySerializer,
    ChatMessageSerializer,
    ChatResponseSerializer,
    DataUploadSerializer,
    FilteredResultSerializer,
    FileUploadSerializer,
    FilterDataSerializer,
    ChartGeneratorSerializer,
)
from chatbot.services import GeminiService
from chatbot.excel_processor import ExcelProcessorService

logger = logging.getLogger(__name__)




class DataUploadViewSet(viewsets.ModelViewSet):
    """ViewSet for Excel file uploads and data management"""
    queryset = DataUpload.objects.all()
    serializer_class = DataUploadSerializer
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=False, methods=['post'])
    def upload(self, request):
        """
        Upload and process Excel file
        POST /api/data-upload/upload/
        """
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        session_id = serializer.validated_data['session_id']

        # Process Excel file
        success, message, data = ExcelProcessorService.process_excel_file(file)

        if not success:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save to database
        upload = DataUpload.objects.create(
            session_id=session_id,
            file_name=file.name,
            file_data=data['data'],
            columns=data['columns'],
            row_count=data['row_count'],
        )

        response_serializer = DataUploadSerializer(upload)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def get_by_session(self, request):
        """
        Get uploads by session ID
        GET /api/data-upload/get_by_session/?session_id=xxx
        """
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploads = DataUpload.objects.filter(session_id=session_id)
        serializer = DataUploadSerializer(uploads, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """
        Preview uploaded data
        GET /api/data-upload/{id}/preview/
        """
        try:
            upload = self.get_object()
            summary = ExcelProcessorService.get_data_summary(upload.file_data)
            return Response({
                'file_name': upload.file_name,
                'row_count': upload.row_count,
                'columns': upload.columns,
                'summary': summary,
                'sample_data': upload.file_data[:5] if upload.file_data else [],
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Preview error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FilterDataViewSet(viewsets.ModelViewSet):
    """ViewSet for data filtering and analysis"""
    queryset = FilteredResult.objects.all()
    serializer_class = FilteredResultSerializer

    @action(detail=False, methods=['post'])
    def apply_filter(self, request):
        """
        Apply filters to uploaded data
        POST /api/filter-data/apply_filter/
        """
        serializer = FilterDataSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data_upload_id = serializer.validated_data['data_upload_id']
        filter_criteria = serializer.validated_data['filter_criteria']

        try:
            upload = DataUpload.objects.get(id=data_upload_id)
        except DataUpload.DoesNotExist:
            return Response(
                {'error': 'Data upload not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Apply filters
        filtered_data, summary = ExcelProcessorService.filter_data(
            upload.file_data,
            filter_criteria
        )

        # Save filtered result
        query_id = str(uuid.uuid4())
        filtered_result = FilteredResult.objects.create(
            data_upload=upload,
            query_id=query_id,
            filter_criteria=filter_criteria,
            filtered_data=filtered_data,
            row_count=len(filtered_data),
        )

        return Response({
            'filtered_result_id': filtered_result.id,
            'query_id': query_id,
            'summary': summary,
            'filtered_data': filtered_data,
            'row_count': len(filtered_data),
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def download_csv(self, request, pk=None):
        """
        Download filtered data as CSV
        GET /api/filter-data/{id}/download_csv/
        """
        try:
            filtered_result = self.get_object()
            csv_data = ExcelProcessorService.export_to_csv(
                filtered_result.filtered_data,
                filename='filtered_data.csv'
            )
            
            return FileResponse(
                csv_data,
                as_attachment=True,
                filename='filtered_data.csv',
                content_type='text/csv'
            )
        except Exception as e:
            logger.error(f"CSV download error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def download_excel(self, request, pk=None):
        """
        Download filtered data as Excel
        GET /api/filter-data/{id}/download_excel/
        """
        try:
            filtered_result = self.get_object()
            excel_data = ExcelProcessorService.export_to_excel(
                filtered_result.filtered_data,
                filename='filtered_data.xlsx'
            )
            
            return FileResponse(
                excel_data,
                as_attachment=True,
                filename='filtered_data.xlsx',
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        except Exception as e:
            logger.error(f"Excel download error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChartViewSet(viewsets.ViewSet):
    """ViewSet for chart generation"""

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate chart from data
        POST /api/chart/generate/
        """
        serializer = ChartGeneratorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data_upload_id = serializer.validated_data['data_upload_id']
        chart_type = serializer.validated_data['chart_type']
        x_column = serializer.validated_data['x_column']
        y_column = serializer.validated_data['y_column']
        group_by = serializer.validated_data.get('group_by', '')

        try:
            upload = DataUpload.objects.get(id=data_upload_id)
        except DataUpload.DoesNotExist:
            return Response(
                {'error': 'Data upload not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Generate chart data
        chart_data = ExcelProcessorService.generate_chart_data(
            upload.file_data,
            chart_type,
            x_column,
            y_column,
            group_by if group_by else None
        )

        return Response(chart_data, status=status.HTTP_200_OK)


class ChatbotViewSet(viewsets.ViewSet):
    """ViewSet for chatbot interactions"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        try:
            self.gemini_service = GeminiService()
        except ValueError as e:
            logger.error(f"Failed to initialize Gemini service: {str(e)}")
            self.gemini_service = None

    @action(detail=False, methods=['post'])
    def chat(self, request):
        """
        Chat with context from uploaded data
        POST /api/chatbot/chat/
        """
        serializer = ChatMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not self.gemini_service:
            return Response(
                {'error': 'Chatbot service unavailable'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        message = serializer.validated_data['message']
        location = serializer.validated_data.get('location', '')
        session_id = serializer.validated_data.get('session_id', '')

        start_time = time.time()

        try:
            # Get context from uploaded data if available
            context = ""
            chart_data = None
            table_data = None
            
            if session_id:
                uploads = DataUpload.objects.filter(session_id=session_id).first()
                if uploads:
                    summary = ExcelProcessorService.get_data_summary(uploads.file_data)
                    context = f"Using data: {summary.get('total_records')} records with columns: {', '.join(summary.get('columns', []))}"
                    
                    # Extract chart and table data based on the query - ALWAYS extract fresh data
                    chart_data, table_data = self._extract_chart_data(uploads.file_data, message)
                    logger.info(f"Extracted chart data for query '{message}': {chart_data is not None}")

            # Get response from Gemini
            location_context = f"User is asking about {location}" if location else None
            full_context = f"{context}\n{location_context}" if context and location_context else (context or location_context)
            
            result = self.gemini_service.chat(message, full_context)

            response_time = time.time() - start_time

            if result['success']:
                # Save conversation history
                conv = ConversationHistory.objects.create(
                    user_message=message,
                    bot_response=result['response'],
                    location=location,
                    session_id=session_id,
                )

                # Track query analytics
                UserQuery.objects.create(
                    query_text=message,
                    query_type=self._determine_query_type(message),
                    location=location if location else None,
                    response_time=response_time,
                )

                response_data = {
                    'response': result['response'],
                    'location': location,
                    'timestamp': timezone.now(),
                }
                
                # Add chart data if available
                if chart_data:
                    response_data['chart'] = chart_data
                    logger.info(f"Added chart data to response: {chart_data}")
                else:
                    logger.info("No chart data to add")
                    
                if table_data:
                    response_data['table'] = table_data
                    logger.info(f"Added table data to response with {len(table_data)} records")
                else:
                    logger.info("No table data to add")
                
                logger.info(f"Response data before serialization: {response_data}")
                response_serializer = ChatResponseSerializer(data=response_data)
                response_serializer.is_valid(raise_exception=True)
                logger.info(f"Serialized data: {response_serializer.data}")
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': result.get('error', 'Failed to generate response')},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            logger.error(f"Chat error: {str(e)}")
            return Response(
                {'error': 'An error occurred while processing your request'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def analyze_with_data(self, request):
        """
        Analyze location using uploaded data context
        POST /api/chatbot/analyze_with_data/
        """
        serializer = ChatMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not self.gemini_service:
            return Response(
                {'error': 'Chatbot service unavailable'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        location = serializer.validated_data.get('location', '')
        query = serializer.validated_data['message']
        session_id = serializer.validated_data.get('session_id', '')

        if not location:
            raise ValidationError({'location': 'Location is required for analysis'})

        try:
            # Get context from uploaded data
            context = ""
            if session_id:
                uploads = DataUpload.objects.filter(session_id=session_id).first()
                if uploads:
                    summary = ExcelProcessorService.get_data_summary(uploads.file_data)
                    context = f"Data context: {summary}"

            result = self.gemini_service.analyze_location(location, query)

            if result['success']:
                ConversationHistory.objects.create(
                    user_message=query,
                    bot_response=result['response'],
                    location=location,
                    session_id=session_id,
                )

                UserQuery.objects.create(
                    query_text=query,
                    query_type='analysis',
                    location=location,
                )

                return Response({
                    'location': location,
                    'analysis': result['response'],
                    'timestamp': timezone.now(),
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': result.get('error', 'Analysis failed')},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            logger.error(f"Location analysis error: {str(e)}")
            return Response(
                {'error': 'Failed to analyze location'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def history(self, request):
        """
        Get conversation history
        GET /api/chatbot/history/?session_id=xxx
        """
        session_id = request.query_params.get('session_id')
        location = request.query_params.get('location')

        query = ConversationHistory.objects.all()

        if session_id:
            query = query.filter(session_id=session_id)
        if location:
            query = query.filter(location=location)

        serializer = ConversationHistorySerializer(query, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def _extract_chart_data(file_data, query):
        """
        Extract chart and table data from uploaded file based on query
        Filters and processes data according to user's specific question
        
        Args:
            file_data: Dictionary with 'data' and 'columns' keys
            query: User's query message
            
        Returns:
            Tuple of (chart_data, table_data)
        """
        try:
            import pandas as pd
            import re
            
            # Handle both dict and list formats
            if isinstance(file_data, dict):
                records = file_data.get('data', [])
            elif isinstance(file_data, list):
                records = file_data
            else:
                logger.info("Invalid file_data format")
                return None, None
            
            if not records:
                logger.info("No records found in file data")
                return None, None
            
            df = pd.DataFrame(records)
            query_lower = query.lower()
            
            logger.info(f"DataFrame shape: {df.shape}, columns: {df.columns.tolist()}")
            logger.info(f"DataFrame dtypes:\n{df.dtypes}")
            logger.info(f"Query: {query}")
            
            # Identify column types
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            string_cols = df.select_dtypes(include=['object']).columns.tolist()
            location_cols = [col for col in df.columns if any(x in col.lower() for x in ['location', 'area', 'place', 'city', 'region'])]
            price_cols = [col for col in numeric_cols if any(x in col.lower() for x in ['price', 'cost', 'value', 'amount'])]
            demand_cols = [col for col in numeric_cols if any(x in col.lower() for x in ['demand', 'score', 'rating', 'popularity', 'interest'])]
            
            logger.info(f"Identified - Numeric: {numeric_cols}, Location: {location_cols}, Price: {price_cols}, Demand: {demand_cols}")
            
            filtered_df = df.copy()
            
            # Filter by location if mentioned in query
            if location_cols:
                location_col = location_cols[0]
                words = query_lower.split()
                for word in words:
                    if len(word) > 3:  # Skip short words
                        matches = filtered_df[location_col].astype(str).str.contains(word, case=False, na=False)
                        if matches.any():
                            logger.info(f"Filtered by location word '{word}', remaining rows: {matches.sum()}")
                            filtered_df = filtered_df[matches]
                            break
            
            logger.info(f"After filtering, rows: {len(filtered_df)}")
            
            chart_data = None
            table_data = None
            
            # Generate chart data based on available columns and query
            if len(filtered_df) > 0:
                # Use first 10 rows for chart
                chart_df = filtered_df.head(10) if len(filtered_df) >= 10 else filtered_df
                
                years = list(range(2021, 2021 + len(chart_df)))
                
                # Determine which columns to use for chart
                price_col = price_cols[0] if price_cols else (numeric_cols[0] if numeric_cols else None)
                demand_col = demand_cols[0] if demand_cols else (numeric_cols[1] if len(numeric_cols) > 1 else None)
                
                logger.info(f"Using price_col: {price_col}, demand_col: {demand_col}")
                
                if price_col:
                    prices = chart_df[price_col].fillna(0).astype(float).tolist()
                    demand = chart_df[demand_col].fillna(0).astype(float).tolist() if demand_col else [float(i*1.5) for i in range(len(prices))]
                    
                    chart_data = {
                        'years': years,
                        'prices': prices,
                        'demand': demand[:len(prices)],
                    }
                    logger.info(f"Generated chart_data: {chart_data}")
                elif numeric_cols:
                    # Fallback: use first two numeric columns
                    col1 = numeric_cols[0]
                    col2 = numeric_cols[1] if len(numeric_cols) > 1 else numeric_cols[0]
                    
                    prices = chart_df[col1].fillna(0).astype(float).tolist()
                    demand = chart_df[col2].fillna(0).astype(float).tolist()[:len(prices)]
                    
                    chart_data = {
                        'years': years,
                        'prices': prices,
                        'demand': demand,
                    }
                    logger.info(f"Generated fallback chart_data: {chart_data}")
            
            # Create table data - show relevant records based on query
            if len(filtered_df) > 0:
                table_data = filtered_df.head(5).to_dict('records')
                logger.info(f"Generated table_data with {len(table_data)} records")
            elif len(df) > 0:
                table_data = df.head(5).to_dict('records')
                logger.info(f"Generated fallback table_data with {len(table_data)} records")
            
            logger.info(f"Returning: chart_data={chart_data is not None}, table_data={table_data is not None}")
            return chart_data, table_data
            
        except Exception as e:
            logger.error(f"Error extracting chart data: {str(e)}", exc_info=True)
            return None, None

    @staticmethod
    def _determine_query_type(message: str) -> str:
        """Determine the type of query based on message content"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['trend', 'growth', 'demand', 'future']):
            return 'trend'
        elif any(word in message_lower for word in ['compare', 'vs', 'versus', 'difference']):
            return 'comparison'
        elif any(word in message_lower for word in ['filter', 'show', 'display', 'list']):
            return 'filter'
        elif any(word in message_lower for word in ['analyze', 'analysis', 'details', 'info']):
            return 'analysis'
        
        return 'general'


class RealEstateAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for real estate data and analysis"""
    
    queryset = RealEstateData.objects.all()
    serializer_class = RealEstateDataSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search for real estate data by location
        GET /api/analysis/search/?location=New York
        """
        location = request.query_params.get('location')
        
        if not location:
            return Response(
                {'error': 'Location parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = RealEstateData.objects.filter(location__icontains=location)
        serializer = self.get_serializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        """
        Get trending real estate locations
        GET /api/analysis/trending/
        """
        trending_data = RealEstateData.objects.order_by('-demand_score')[:10]
        serializer = self.get_serializer(trending_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def compare(self, request):
        """
        Compare multiple locations
        POST /api/analysis/compare/
        """
        locations = request.data.get('locations', [])
        
        if not locations or not isinstance(locations, list):
            return Response(
                {'error': 'Locations list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            gemini_service = GeminiService()
            result = gemini_service.compare_locations(locations)

            if result['success']:
                return Response({
                    'locations': locations,
                    'comparison': result['response'],
                    'timestamp': timezone.now(),
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': result.get('error', 'Comparison failed')},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            logger.error(f"Comparison error: {str(e)}")
            return Response(
                {'error': 'Failed to compare locations'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
