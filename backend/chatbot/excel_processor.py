"""
Utility service for Excel file processing and data manipulation
"""
import pandas as pd
import logging
from typing import Dict, List, Any, Tuple
import json

logger = logging.getLogger(__name__)


class ExcelProcessorService:
    """Service to process Excel files and filter data"""

    @staticmethod
    def process_excel_file(file) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Process uploaded Excel file and return parsed data
        
        Args:
            file: Django uploaded file object
            
        Returns:
            Tuple of (success, message, data)
        """
        try:
            # Read Excel file
            df = pd.read_excel(file, engine='openpyxl')
            
            # Convert to JSON-serializable format
            columns = df.columns.tolist()
            data = df.fillna('').to_dict('records')
            
            return True, "File processed successfully", {
                'columns': columns,
                'data': data,
                'row_count': len(data),
            }
            
        except Exception as e:
            logger.error(f"Error processing Excel file: {str(e)}")
            return False, f"Error processing file: {str(e)}", {}

    @staticmethod
    def filter_data(
        data: List[Dict[str, Any]],
        filter_criteria: Dict[str, Any]
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Filter data based on given criteria
        
        Args:
            data: List of data records
            filter_criteria: Dictionary with filter conditions
                Example: {
                    'location': 'New York',
                    'price_range': {'min': 100000, 'max': 500000},
                    'demand_score': {'min': 7}
                }
                
        Returns:
            Tuple of (filtered_data, filter_summary)
        """
        df = pd.DataFrame(data)
        filtered_df = df.copy()
        
        filter_summary = {
            'original_rows': len(df),
            'filters_applied': [],
        }
        
        try:
            # Apply text filters (exact or contains)
            for column, value in filter_criteria.items():
                if isinstance(value, dict):
                    # Handle range filters
                    if 'min' in value:
                        filtered_df = filtered_df[filtered_df[column] >= value['min']]
                        filter_summary['filters_applied'].append(
                            f"{column} >= {value['min']}"
                        )
                    if 'max' in value:
                        filtered_df = filtered_df[filtered_df[column] <= value['max']]
                        filter_summary['filters_applied'].append(
                            f"{column} <= {value['max']}"
                        )
                    if 'values' in value:
                        # Handle multiple value filter
                        filtered_df = filtered_df[filtered_df[column].isin(value['values'])]
                        filter_summary['filters_applied'].append(
                            f"{column} in {value['values']}"
                        )
                elif isinstance(value, list):
                    # Multiple values filter
                    filtered_df = filtered_df[filtered_df[column].isin(value)]
                    filter_summary['filters_applied'].append(f"{column} in {value}")
                else:
                    # Exact match or contains
                    if isinstance(value, str) and '*' in value:
                        # Wildcard match
                        pattern = value.replace('*', '')
                        filtered_df = filtered_df[
                            filtered_df[column].astype(str).str.contains(pattern, case=False)
                        ]
                        filter_summary['filters_applied'].append(f"{column} contains {pattern}")
                    else:
                        # Exact match
                        filtered_df = filtered_df[filtered_df[column] == value]
                        filter_summary['filters_applied'].append(f"{column} = {value}")
            
            filter_summary['filtered_rows'] = len(filtered_df)
            filtered_data = filtered_df.fillna('').to_dict('records')
            
            return filtered_data, filter_summary
            
        except Exception as e:
            logger.error(f"Error filtering data: {str(e)}")
            return data, {'error': str(e)}

    @staticmethod
    def generate_chart_data(
        data: List[Dict[str, Any]],
        chart_type: str,
        x_column: str,
        y_column: str,
        group_by: str = None
    ) -> Dict[str, Any]:
        """
        Generate chart data from filtered data
        
        Args:
            data: List of data records
            chart_type: 'bar', 'line', 'pie', 'scatter'
            x_column: Column for X-axis
            y_column: Column for Y-axis (values)
            group_by: Optional column to group data
            
        Returns:
            Chart data ready for visualization
        """
        try:
            df = pd.DataFrame(data)
            
            if group_by and group_by in df.columns:
                # Group and aggregate
                grouped = df.groupby(group_by)[y_column].sum().reset_index()
                return {
                    'type': chart_type,
                    'labels': grouped[group_by].astype(str).tolist(),
                    'datasets': [
                        {
                            'label': y_column,
                            'data': grouped[y_column].tolist(),
                            'backgroundColor': ExcelProcessorService._generate_colors(len(grouped)),
                        }
                    ]
                }
            else:
                # Simple chart
                if chart_type == 'pie':
                    labels = df[x_column].unique().tolist()
                    return {
                        'type': 'pie',
                        'labels': labels,
                        'datasets': [
                            {
                                'label': y_column,
                                'data': df[y_column].tolist(),
                                'backgroundColor': ExcelProcessorService._generate_colors(len(labels)),
                            }
                        ]
                    }
                else:
                    return {
                        'type': chart_type,
                        'labels': df[x_column].astype(str).tolist(),
                        'datasets': [
                            {
                                'label': y_column,
                                'data': df[y_column].tolist(),
                                'borderColor': 'rgba(75, 192, 192, 1)',
                                'backgroundColor': 'rgba(75, 192, 192, 0.1)',
                            }
                        ]
                    }
                    
        except Exception as e:
            logger.error(f"Error generating chart data: {str(e)}")
            return {'error': str(e)}

    @staticmethod
    def get_data_summary(data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate summary statistics for data
        
        Args:
            data: List of data records
            
        Returns:
            Summary statistics
        """
        try:
            df = pd.DataFrame(data)
            summary = {
                'total_records': len(df),
                'columns': df.columns.tolist(),
                'numeric_columns': df.select_dtypes(include=['number']).columns.tolist(),
                'statistics': {}
            }
            
            # Generate statistics for numeric columns
            for col in summary['numeric_columns']:
                summary['statistics'][col] = {
                    'min': float(df[col].min()),
                    'max': float(df[col].max()),
                    'mean': float(df[col].mean()),
                    'median': float(df[col].median()),
                    'std': float(df[col].std()),
                }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return {'error': str(e)}

    @staticmethod
    def _generate_colors(count: int) -> List[str]:
        """Generate random colors for charts"""
        colors = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
        ]
        return [colors[i % len(colors)] for i in range(count)]

    @staticmethod
    def export_to_csv(data: List[Dict[str, Any]], filename: str = None) -> bytes:
        """
        Export data to CSV format
        
        Args:
            data: List of data records
            filename: Optional filename
            
        Returns:
            CSV data as bytes
        """
        try:
            df = pd.DataFrame(data)
            csv_data = df.to_csv(index=False)
            return csv_data.encode('utf-8')
        except Exception as e:
            logger.error(f"Error exporting to CSV: {str(e)}")
            return b''

    @staticmethod
    def export_to_excel(data: List[Dict[str, Any]], filename: str = None) -> bytes:
        """
        Export data to Excel format
        
        Args:
            data: List of data records
            filename: Optional filename
            
        Returns:
            Excel data as bytes
        """
        try:
            import io
            df = pd.DataFrame(data)
            output = io.BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            return output.getvalue()
        except Exception as e:
            logger.error(f"Error exporting to Excel: {str(e)}")
            return b''
