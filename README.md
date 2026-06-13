# Kernel Logic 1 (chatai) - User Guide

Kernel Logic 1 is an intelligent AI Chat web application developed by NS Studio. Designed to maximize the efficiency of AI interactions, it seamlessly supports both casual conversation and advanced programming tasks.

## ✨ Key Features
- Multi-Model Support: Choose between Google's Gemini API and local/OpenAI-compatible models via Ollama.
- Code Mode: A specialized system configuration optimized for programming, debugging, and technical problem-solving.
- URL Data Extraction: Submit website links directly into the chat for the AI to read and analyze (powered by jina.ai).
- Markdown & Code Highlighting: Beautifully renders text and code blocks with syntax highlighting and a built-in "Copy Code" button.
- Reasoning Process: Supports transparent display of the AI's step-by-step thinking via the <think> tag.
- Chat History: Local browser storage (Sidebar) keeps track of your past conversations so you never lose your progress.

## 🛠️ Installation & Initial Setup

1. Install Dependencies:
   npm install

2. Configure Environment Variables:
   Create or edit the `.env` file in your root directory:
   VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

3. Set Up API Proxy (For Local Models):
   If you plan to use Ollama or other custom APIs, modify the `proxy` section in your `vite.config.js` file to match your local server URL.

## 🚀 Getting Started

1. Run the Development Server:
   npm run dev

2. Access via Browser:
   Open your browser and navigate to the default URL: http://localhost:5173

## 📝 Usage Tips
- General Chatting: Type your prompt into the bottom input field and press Enter (or click the send button).
- Activating Code Mode: Click the code icon (</>) to toggle Code Mode for high-precision technical tasks.
- Attaching Links: Simply paste a URL into the chat. The system will automatically fetch and ingest the website's content for analysis.
- Managing Conversations: Use the left Sidebar to start a new chat session or clear/return to previous history.

---
Engineered by NS Studio · Frontier Grade Intelligence
