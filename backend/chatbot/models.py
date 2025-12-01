"""
Database models for the chatbot application
"""
from django.db import models
from django.utils import timezone
import json


class DataUpload(models.Model):
    """Store uploaded Excel files and processed data"""
    session_id = models.CharField(max_length=100, db_index=True)
    file_name = models.CharField(max_length=255)
    file_data = models.JSONField()  # Store parsed Excel data as JSON
    columns = models.JSONField()  # Store column names
    row_count = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['session_id', '-uploaded_at']),
        ]

    def __str__(self):
        return f"{self.file_name} - {self.uploaded_at}"


class FilteredResult(models.Model):
    """Store filtered query results from Excel data"""
    data_upload = models.ForeignKey(DataUpload, on_delete=models.CASCADE)
    query_id = models.CharField(max_length=100, db_index=True)
    filter_criteria = models.JSONField()  # Store filter conditions
    filtered_data = models.JSONField()  # Store filtered rows
    row_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Filtered Result - {self.query_id}"


class ConversationHistory(models.Model):
    """Store conversation history between user and chatbot"""
    data_upload = models.ForeignKey(DataUpload, on_delete=models.SET_NULL, null=True, blank=True)
    user_message = models.TextField()
    bot_response = models.TextField()
    location = models.CharField(max_length=255, null=True, blank=True)
    filtered_result = models.ForeignKey(FilteredResult, on_delete=models.SET_NULL, null=True, blank=True)
    chart_data = models.JSONField(null=True, blank=True)  # Store chart data
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Conversation Histories"

    def __str__(self):
        return f"Conversation - {self.created_at}"


class RealEstateData(models.Model):
    """Store real estate analysis data"""
    location = models.CharField(max_length=255, unique=True, db_index=True)
    price_trend = models.JSONField(default=dict)  # Store price trends as JSON
    demand_score = models.FloatField(default=0.0)
    average_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    property_count = models.IntegerField(default=0)
    analysis_summary = models.TextField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-last_updated']
        verbose_name_plural = "Real Estate Data"

    def __str__(self):
        return f"{self.location} - {self.average_price}"


class UserQuery(models.Model):
    """Track user queries for analytics"""
    query_text = models.TextField()
    query_type = models.CharField(
        max_length=50,
        choices=[
            ('analysis', 'Location Analysis'),
            ('trend', 'Trend Analysis'),
            ('comparison', 'Location Comparison'),
            ('filter', 'Data Filter'),
            ('general', 'General Question'),
        ],
        default='general'
    )
    location = models.CharField(max_length=255, null=True, blank=True)
    response_time = models.FloatField(default=0.0)  # in seconds
    was_helpful = models.BooleanField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['location', '-created_at']),
            models.Index(fields=['query_type', '-created_at']),
        ]

    def __str__(self):
        return f"{self.query_type} - {self.created_at}"
