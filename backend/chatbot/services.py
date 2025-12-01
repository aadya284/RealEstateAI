"""
Service for interacting with Google Gemini API
"""
import logging
import json
from typing import Optional, Dict, Any
import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Service to handle Gemini API interactions for real estate analysis"""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def analyze_location(self, location: str, query: str) -> Dict[str, Any]:
        """
        Analyze a real estate location using Gemini
        
        Args:
            location: The location to analyze
            query: The user's query about the location
            
        Returns:
            Dictionary with analysis results
        """
        try:
            prompt = self._build_analysis_prompt(location, query)
            response = self.model.generate_content(prompt)
            
            if response.text:
                return {
                    'success': True,
                    'response': response.text,
                    'location': location,
                }
            else:
                return {
                    'success': False,
                    'error': 'No response from Gemini API',
                    'location': location,
                }
                
        except Exception as e:
            logger.error(f"Error analyzing location {location}: {str(e)}")
            return {
                'success': False,
                'error': f"Analysis failed: {str(e)}",
                'location': location,
            }

    def generate_market_trends(self, location: str) -> Dict[str, Any]:
        """
        Generate market trends for a location
        
        Args:
            location: The location to analyze
            
        Returns:
            Dictionary with trend analysis
        """
        try:
            prompt = f"""Provide a detailed market trend analysis for real estate in {location}. 
            Include:
            1. Price trends (up/down/stable)
            2. Demand outlook
            3. Investment potential (1-10 score)
            4. Key factors affecting the market
            5. Recommendations
            
            Format the response as JSON with these fields:
            - price_trend: "up" | "down" | "stable"
            - demand_score: 0-10
            - outlook: string
            - key_factors: array of strings
            - recommendation: string
            """
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                try:
                    # Try to parse JSON from response
                    import re
                    json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                    if json_match:
                        data = json.loads(json_match.group())
                        return {'success': True, 'data': data, 'location': location}
                except (json.JSONDecodeError, AttributeError):
                    # If JSON parsing fails, return raw response
                    return {
                        'success': True,
                        'response': response.text,
                        'location': location,
                    }
            
            return {
                'success': False,
                'error': 'No response from Gemini API',
                'location': location,
            }
            
        except Exception as e:
            logger.error(f"Error generating trends for {location}: {str(e)}")
            return {
                'success': False,
                'error': f"Trend analysis failed: {str(e)}",
                'location': location,
            }

    def compare_locations(self, locations: list) -> Dict[str, Any]:
        """
        Compare multiple real estate locations
        
        Args:
            locations: List of location names to compare
            
        Returns:
            Dictionary with comparison results
        """
        try:
            locations_str = ", ".join(locations)
            prompt = f"""Compare the following real estate markets: {locations_str}
            
            Provide comparison in these aspects:
            1. Price ranges
            2. Market demand
            3. Growth potential
            4. Investment risk level
            5. Best investment type for each location
            
            Format as a clear, structured comparison table."""
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                return {
                    'success': True,
                    'response': response.text,
                    'locations': locations,
                }
            
            return {
                'success': False,
                'error': 'No response from Gemini API',
                'locations': locations,
            }
            
        except Exception as e:
            logger.error(f"Error comparing locations: {str(e)}")
            return {
                'success': False,
                'error': f"Comparison failed: {str(e)}",
                'locations': locations,
            }

    def chat(self, message: str, context: Optional[str] = None) -> Dict[str, Any]:
        """
        General chatbot interaction
        
        Args:
            message: User message
            context: Optional context (location, previous conversation)
            
        Returns:
            Dictionary with response
        """
        try:
            prompt = self._build_chat_prompt(message, context)
            response = self.model.generate_content(prompt)
            
            if response.text:
                return {
                    'success': True,
                    'response': response.text,
                }
            
            return {
                'success': False,
                'error': 'No response from Gemini API',
            }
            
        except Exception as e:
            logger.error(f"Error in chatbot interaction: {str(e)}")
            return {
                'success': False,
                'error': f"Chat failed: {str(e)}",
            }

    @staticmethod
    def _build_analysis_prompt(location: str, query: str) -> str:
        """Build a prompt for location analysis"""
        return f"""You are an expert real estate analyst. Provide detailed analysis for {location}.
        
        User query: {query}
        
        Please provide:
        1. Current market overview
        2. Price analysis
        3. Demand indicators
        4. Investment potential
        5. Key recommendations
        
        Be specific with data points where possible and provide actionable insights."""

    @staticmethod
    def _build_chat_prompt(message: str, context: Optional[str] = None) -> str:
        """Build a prompt for general chatbot interaction"""
        system_prompt = """You are a knowledgeable real estate expert AI assistant. 
        Help users with questions about real estate markets, investment strategies, 
        location analysis, and property trends. Be helpful, accurate, and provide 
        practical insights.
        
        CRITICAL RULES FOR RESPONSE:
        1. Keep responses EXTREMELY CONCISE (max 2-3 sentences for casual messages)
        2. For casual greetings like "hi", "hello", "how are you" - respond with just 1-2 sentences max
        3. For technical real estate questions - provide brief key points (max 50-70 words)
        4. NEVER write paragraphs or long explanations
        5. NO markdown formatting - write plain text only
        6. Use bullet points only if absolutely necessary (max 3 bullets)
        7. Get straight to the point, no fluff"""
        
        if context:
            return f"{system_prompt}\n\nContext: {context}\n\nUser: {message}"
        return f"{system_prompt}\n\nUser: {message}"
