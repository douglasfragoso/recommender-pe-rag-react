# 🤖 Multi AI Assistant with RAG

## About the Project

A modern and responsive interface developed for the **Multi AI Assistant**, focusing on the user experience for the tourist assistant **Vamu! Rec**. The project consumes the Spring Boot API, offering real-time chat via **Server-Sent Events (SSE)**, conversation history management, and system status monitoring.

The application reflects the brand's visual identity (Navy Blue and Orange), ensuring smooth and intuitive navigation on both desktop and mobile devices.

## Key Features

### Interactive Chat & Streaming
- **Real-time Streaming**: Visualization of AI responses being typed in real-time (typewriter effect).
- **Multi-Model Selector**: Easy switching between **DeepSeek**, **Gemini**, and **Ollama**.
- **Visual Identity**: Custom "Vamu! Rec" theme with visual status feedback.

### History & Persistence
- **Navigable History**: Sidebar with paginated previous conversations (10 items per page).
- **Click-to-Load**: Instant loading of past conversation context by clicking on the list.
- **Smart Formatting**: Organized rendering of user questions and AI responses.

### Technologies
- **React 18** - UI Library
- **Vite** - High-performance build tool
- **Bootstrap 5** - Responsive styling framework
- **Axios** - Optimized HTTP client
- **EventSource API** - Native SSE consumption
- **Lucide React** - Lightweight and modern icons

## Setup and Installation

### Prerequisites
* **Node.js** (v18 or higher)
* **Backend** running (Spring Boot on port 8080)

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/recommender-pe-rag-react.git](https://github.com/your-username/recommender-pe-rag-react.git)
cd recommender-pe-rag-react
```

2. Install dependencies
```bash
npm install
```

3. Configure Environment Variables
Create a .env file in the project root (optional, if you need to change the API URL):

Snippet de código
```bash
VITE_API_BASE_URL=http://localhost:8080
```
4. Run the project
Bash
```bash
npm run dev
```

Access the application at: http://localhost:5173

Important: Ensure the [Backend Service](https://github.com/douglasfragoso/recommender-pe-rag) is running before starting the frontend.

