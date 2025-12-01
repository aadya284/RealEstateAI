# Real Estate Chatbot Backend - Django API

A Django REST API backend for the Real Estate Chatbot application, powered by Google Gemini AI.

## Features

- **AI-Powered Chatbot**: Integration with Google Gemini API for intelligent real estate conversations
- **Location Analysis**: Detailed analysis of real estate markets
- **Market Trends**: Track and analyze real estate trends
- **Location Comparison**: Compare multiple real estate markets
- **Conversation History**: Track and retrieve past conversations
- **Analytics**: Query analytics and response metrics
- **RESTful API**: Complete REST API with Django REST Framework
- **CORS Enabled**: Ready for frontend integration

## Project Structure

```
backend/
├── config/              # Django configuration
│   ├── settings.py      # Django settings
│   ├── urls.py          # URL routing
│   └── wsgi.py          # WSGI configuration
├── chatbot/             # Main chatbot app
│   ├── models.py        # Database models
│   ├── views.py         # API views
│   ├── serializers.py   # DRF serializers
│   ├── services.py      # Gemini API service
│   └── admin.py         # Django admin config
├── manage.py            # Django management script
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables
```

## Installation

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
source venv/bin/activate  # On macOS/Linux
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup Environment Variables

Update `.env` with your Gemini API key:

```
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Chatbot Endpoints

#### 1. Send Chat Message
- **URL**: `POST /api/chatbot/chat/`
- **Request Body**:
```json
{
  "message": "Tell me about real estate in New York",
  "location": "New York",
  "session_id": "user-session-123"
}
```
- **Response**:
```json
{
  "response": "Real estate in New York...",
  "location": "New York",
  "timestamp": "2024-12-01T10:30:00Z"
}
```

#### 2. Analyze Location
- **URL**: `POST /api/chatbot/analyze_location/`
- **Request Body**:
```json
{
  "message": "Provide detailed analysis",
  "location": "Los Angeles"
}
```
- **Response**:
```json
{
  "location": "Los Angeles",
  "analysis": "Detailed analysis...",
  "timestamp": "2024-12-01T10:30:00Z"
}
```

#### 3. Get Conversation History
- **URL**: `GET /api/chatbot/history/?session_id=user-session-123`
- **Response**:
```json
[
  {
    "id": 1,
    "user_message": "...",
    "bot_response": "...",
    "location": "New York",
    "created_at": "2024-12-01T10:30:00Z"
  }
]
```

### Real Estate Analysis Endpoints

#### 1. Search Real Estate Data
- **URL**: `GET /api/analysis/search/?location=New York`
- **Response**: Array of matching real estate data

#### 2. Get Trending Locations
- **URL**: `GET /api/analysis/trending/`
- **Response**: Top 10 trending real estate locations

#### 3. Compare Locations
- **URL**: `POST /api/analysis/compare/`
- **Request Body**:
```json
{
  "locations": ["New York", "Los Angeles", "Chicago"]
}
```
- **Response**:
```json
{
  "locations": [...],
  "comparison": "Detailed comparison...",
  "timestamp": "2024-12-01T10:30:00Z"
}
```

## Database Models

### ConversationHistory
- Stores user messages and bot responses
- Tracks location and session information
- Indexed by creation date

### RealEstateData
- Stores real estate market information
- Includes price trends, demand scores
- Caches analysis results

### UserQuery
- Tracks user queries for analytics
- Records response times
- Categorizes query types

## Services

### GeminiService
Handles all interactions with Google Gemini API:

- `analyze_location(location, query)` - Analyze a specific location
- `generate_market_trends(location)` - Generate market trend analysis
- `compare_locations(locations)` - Compare multiple locations
- `chat(message, context)` - General chatbot interaction

## Configuration

### CORS Settings
Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` in `.env` and `settings.py` for production.

### Database
By default uses SQLite. To switch to PostgreSQL:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'realestate_db',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Deployment

### With Gunicorn

```bash
pip install gunicorn
gunicorn config.wsgi --bind 0.0.0.0:8000
```

### With Docker

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "config.wsgi", "--bind", "0.0.0.0:8000"]
```

Build and run:

```bash
docker build -t realestate-api .
docker run -p 8000:8000 realestate-api
```

## Testing

Run tests:

```bash
python manage.py test
```

## Admin Panel

Access Django admin at `http://localhost:8000/admin` with superuser credentials.

## Troubleshooting

### Gemini API Key Issues
- Ensure `GEMINI_API_KEY` is set in `.env`
- Verify API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikeys)

### CORS Issues
- Check `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Verify frontend is making requests to correct API URL

### Migration Errors
```bash
python manage.py makemigrations
python manage.py migrate
```

## Development

For development with hot reload:

```bash
python manage.py runserver 0.0.0.0:8000
```

## License

MIT License
