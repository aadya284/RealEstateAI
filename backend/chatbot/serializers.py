"""
Serializers for the chatbot API
"""
from rest_framework import serializers
from chatbot.models import (
    ConversationHistory, RealEstateData, UserQuery,
    DataUpload, FilteredResult
)


class DataUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataUpload
        fields = [
            'id', 'session_id', 'file_name', 'columns',
            'row_count', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at']


class FilteredResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilteredResult
        fields = [
            'id', 'query_id', 'filter_criteria', 'filtered_data',
            'row_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ConversationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationHistory
        fields = [
            'id', 'user_message', 'bot_response', 'location',
            'created_at', 'session_id', 'filtered_result', 'chart_data'
        ]
        read_only_fields = ['id', 'created_at']


class RealEstateDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealEstateData
        fields = [
            'id', 'location', 'price_trend', 'demand_score',
            'average_price', 'property_count', 'analysis_summary', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']


class UserQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuery
        fields = [
            'id', 'query_text', 'query_type', 'location',
            'response_time', 'was_helpful', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ChatMessageSerializer(serializers.Serializer):
    """Serializer for chat message requests"""
    message = serializers.CharField(max_length=5000)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    session_id = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty")
        return value.strip()


class ChatResponseSerializer(serializers.Serializer):
    """Serializer for chat message responses"""
    response = serializers.CharField()
    location = serializers.CharField(required=False, allow_blank=True)
    data = serializers.JSONField(required=False)
    chart = serializers.JSONField(required=False)
    table = serializers.JSONField(required=False)
    timestamp = serializers.DateTimeField()


class FileUploadSerializer(serializers.Serializer):
    """Serializer for file uploads"""
    file = serializers.FileField()
    session_id = serializers.CharField(max_length=100)


class FilterDataSerializer(serializers.Serializer):
    """Serializer for data filtering requests"""
    data_upload_id = serializers.IntegerField()
    filter_criteria = serializers.JSONField()


class ChartGeneratorSerializer(serializers.Serializer):
    """Serializer for chart generation"""
    data_upload_id = serializers.IntegerField()
    chart_type = serializers.CharField(max_length=50)  # bar, line, pie, scatter
    x_column = serializers.CharField(max_length=255)
    y_column = serializers.CharField(max_length=255)
    group_by = serializers.CharField(max_length=255, required=False, allow_blank=True)

