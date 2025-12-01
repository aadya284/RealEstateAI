"""
URL Configuration for Real Estate Chatbot API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from chatbot.views import (
    ChatbotViewSet,
    RealEstateAnalysisViewSet,
    DataUploadViewSet,
    FilterDataViewSet,
    ChartViewSet,
)

router = DefaultRouter()
router.register(r'data-upload', DataUploadViewSet, basename='data-upload')
router.register(r'filter-data', FilterDataViewSet, basename='filter-data')
router.register(r'chart', ChartViewSet, basename='chart')
router.register(r'chatbot', ChatbotViewSet, basename='chatbot')
router.register(r'analysis', RealEstateAnalysisViewSet, basename='analysis')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]
