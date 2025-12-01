🏡 RealEstateAI
AI-Powered Real Estate Analysis Chatbot (React + Django + Gemini)

RealEstateAI is a full-stack web application that provides locality-based real estate insights through a simple chatbot interface.
Users can type natural-language queries like:

“Analyze Wakad”

“Show price trend for Aundh”

The system processes a real-estate dataset (Excel), filters relevant information, and returns:

✔ AI-generated summary using Gemini

✔ Interactive charts (price & demand trends)

✔ Filtered table data from the dataset

This project was developed as part of a full-stack developer assignment, demonstrating skills in frontend UI, backend APIs, data processing, and AI integration.

🚀 Features
🔹 Chat-Based Interface

Clean, simple chat UI built with React + Bootstrap

Accepts user queries in natural language

Displays AI responses, charts, and data tables

🔹 Excel Data Processing

Python (pandas) filtering based on locality

Returns dataset slices needed for visualization

Handles year-wise price and demand trend extraction

🔹 AI-Generated Summaries

Integrated with Gemini 2.5 Flash

Produces short, contextual locality analysis summaries

🔹 Visualization

Interactive line charts using Chart.js

Helps users understand trends quickly

Auto-updates on every query

🧠 Tech Stack
Frontend

React (Vite)

Bootstrap 5

Axios

Chart.js

Backend

Django

Django REST Framework

Pandas + OpenPyXL

AI

Google Gemini

Model used: models/gemini-2.5-flash

📂 Project Structure
RealEstateAI/
│
├── backend/
│   ├── api/
│   │   ├── views.py
│   │   ├── utils.py
│   │   └── urls.py
│   ├── settings/
│   └── data/real_estate.xlsx
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatInput.jsx
    │   │   ├── ChartView.jsx
    │   │   ├── TableView.jsx
    │   ├── App.jsx
    │   └── main.jsx


(Note: folders may differ depending on your final structure.)

⚙️ Setup & Installation
1️⃣ Clone the Repository
git clone https://github.com/aadya284/RealEstateAI.git
cd RealEstateAI

🛠 Backend Setup (Django)

Install dependencies:

pip install -r requirements.txt


Add your Gemini API key in .env or settings:

GOOGLE_API_KEY=your_key_here


Run the backend:

python manage.py runserver


Backend will run at:

http://localhost:8000

🎨 Frontend Setup (React)
cd frontend
npm install
npm run dev


Frontend will run at:

http://localhost:5173

🧪 Example Query

Try typing into the chat:

Analyze Wakad


The UI will display:

A short AI-generated summary

A price trend chart

A demand trend chart

A filtered data table

🤖 Gemini Summary Example (Code Snippet)
import google.generativeai as genai
genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel("models/gemini-2.5-flash")
response = model.generate_content(f"Give a short real estate analysis summary for {area}")
summary = response.text

🎯 Purpose of This Project

This project demonstrates:

API development with Django

Real-time data filtering

AI-enhanced UX using Gemini

Frontend state handling & visualization

Full-stack integration end-to-end

🧑‍💻 Author

Aadya Paradkar
Full Stack Developer

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
