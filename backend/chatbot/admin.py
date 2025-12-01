"""
Django admin configuration for chatbot models
"""
from django.contrib import admin
from chatbot.models import ConversationHistory, RealEstateData, UserQuery


@admin.register(ConversationHistory)
class ConversationHistoryAdmin(admin.ModelAdmin):
    list_display = ('location', 'created_at', 'session_id')
    list_filter = ('location', 'created_at')
    search_fields = ('user_message', 'bot_response', 'location')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(RealEstateData)
class RealEstateDataAdmin(admin.ModelAdmin):
    list_display = ('location', 'average_price', 'demand_score', 'last_updated')
    list_filter = ('demand_score', 'last_updated')
    search_fields = ('location',)
    readonly_fields = ('last_updated', 'created_at')


@admin.register(UserQuery)
class UserQueryAdmin(admin.ModelAdmin):
    list_display = ('query_type', 'location', 'response_time', 'created_at')
    list_filter = ('query_type', 'location', 'created_at')
    search_fields = ('query_text', 'location')
    readonly_fields = ('created_at',)
