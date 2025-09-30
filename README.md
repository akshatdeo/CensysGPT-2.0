# CensysGPT 2.0 

A full-stack AI agent application that transforms Censys host data into actionable security insights using OpenAI's large language models. 

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Testing Instructions](#-testing-instructions)
- [AI Techniques & Prompt Engineering](#-ai-techniques--prompt-engineering)
- [Assumptions](#-assumptions)
- [Future Enhancements](#-future-enhancements)
- [Project Structure](#-project-structure)

## 🎯 Project Overview

This application provides an intelligent summarization service for Censys host data, enabling security analysts to quickly extract key insights, identify patterns, and assess risks from large datasets. The system integrates with OpenAI's Chat Completions API, providing access to language models including GPT-5 (with reasoning capabilities), GPT-4o, and GPT-3.5.

This app was created for me entry to the Censys take home assignment. As requested, it was made partly using generative AI tools, specifically Claude Code. 

## ✨ Features

- **AI-Powered Analysis**: GPT based summarization with cybersecurity-focused prompts.
- **Multiple AI Models**: Support for GPT-5 (reasoning), GPT-4o, o1, and GPT-3.5
- **File Upload & Text Input**: Flexible data entry with drag-and-drop support
- **Rich Summary Output**: Structured analysis with geographic, service, and risk assessments
- **Export Capabilities**: Copy to clipboard and download summaries
- **Dark Mode**: Theme toggle with persistent preference

## 🛠 Tech Stack

**Frontend:**
- React 19 
- Vite 
- CSS3 

**Backend:**
- Node.js 
- Express 
- Axios 
- dotenv 

##  Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm package manager
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### 1. Clone the Repository

```bash
git clone https://github.com/akshatdeo/CensysGPT-2.0
cd CensysGPT-2.0
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env

# Edit .env with your OpenAI API key
# OPENAI_API_KEY=your_openai_api_key_here
```

**Environment Variables:**
```env
OPENAI_API_KEY=your_openai_api_key_here    # Required
OPENAI_MODEL=gpt-5-mini                     # Optional, defaults to gpt-5-mini
PORT=3001                                   # Optional, defaults to 3001
```

### 3. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd Client

# Install dependencies
npm install
```

### 4. Start the Application

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
# ✅ Server runs on http://localhost:3001
```

**Terminal 2 - Frontend Application:**
```bash
cd Client
npm run dev
# ✅ Frontend runs on http://localhost:5173
```

**Access the application**: Open your browser to `http://localhost:5173`

## 📖 Usage Guide

### 1. Loading Data

**Option A: Text Input**
1. Paste JSON data directly into the text area
2. Click "Load Sample Data" to see example format
3. Supports both structured JSON and plain text

**Option B: File Upload**
1. Drag and drop or browse for files
2. Supported formats: `.json`, `.txt`, `.csv`
3. Files are processed client-side

### 2. Selecting AI Model

Choose from available models:
- **gpt-5-mini** - Advanced reasoning, best quality (recommended)
- **gpt-4o-mini** - Fast and cost-effective
- **gpt-4o** - Powerful previous generation
- **o1-mini** - Reasoning model alternative

### 3. Generating Summary

1. Click "Generate Summary"
2. Wait for analysis, usually under 3 minutes. 
3. View report.

### 4. Exporting Results

- **Copy to Clipboard**: One-click copy
- **Download**: Save as text file

## 🧪 Testing Instructions

### Manual Testing

1. **Start both servers** (backend and frontend as described above)

2. **Test Sample Data**
   ```bash
   # In the UI:
   - Click "Load Sample Data" button
   - Select a model (e.g., gpt-4o-mini for faster testing)
   - Click "Generate Summary"
   - Verify summary appears with structured sections
   ```

3. **Test File Upload**
   - Create a small JSON file with host data
   - Drag and drop into the upload area
   - Verify file content loads into text area
   - Generate summary and verify results

4. **Test Error Handling**
   ```bash
   # Invalid data:
   - Enter "invalid json data"
   - Should gracefully process as text

   # Missing API key:
   - Remove OPENAI_API_KEY from .env
   - Restart server
   - Should show configuration error
   ```

5. **Test Export Features**
   - Generate a summary
   - Click "Copy to Clipboard" - verify copied
   - Click "Download Summary" - verify file downloads

### API Testing

Test the backend directly:

```bash
# Test server health
curl http://localhost:3001/

# Expected output:
{
  "message": "Censys AI Summarization API is running!",
  "version": "2.0",
  "api": "OpenAI Responses API"
}

# Test summarization endpoint
curl -X POST http://localhost:3001/summarize \
  -H "Content-Type: application/json" \
  -d '{"data": {"test": "sample host data"}, "model": "gpt-4o-mini"}'

# Expected: JSON response with summary and metadata
```


## 🤖 AI Techniques & Prompt Engineering

### 1. Model Selection Strategy

The application implements intelligent model detection and parameter adjustment:

**Reasoning Models (GPT-5, o1)**
- Use chain-of-thought processing for deeper analysis
- Require higher token limits (16,000 vs 4,000)
- No system messages (user messages only)
- No temperature control (model-optimized)
- Extended timeout (300 seconds)

**Standard Models (GPT-4o, GPT-3.5)**
- Direct response generation
- Standard token limits (2,000-4,000)
- System + user message structure
- Temperature control (0.1 for consistency)
- Standard timeout (300 seconds)

### 2. Prompt Engineering

**Structured Prompt Design:**

```javascript
const ANALYSIS_PROMPT = `You are an autonomous cybersecurity analyst specializing in Censys host-data. Use Python for data analysis and web lookups for vulnerability enrichment.Do not output Python code

 Analyze the provided Censys host dataset and provide a comprehensive, in-depth security assessment. Your analysis should include: 
1. Overview: Dataset size, scope, and overall risk level (Critical/High/Medium/Low) 
2. Critical Findings**: Immediate security threats requiring urgent attention - Active malware/C2 infrastructure - Critical vulnerabilities (CVSS ≥7.0) with CVE numbers - Known exploited vulnerabilities 
3. Geographic & Infrastructure Patterns**: Notable hosting providers, ASNs, and geographic clustering 
4. Service Analysis: Exposed services, unusual ports, and authentication gaps 
5. Security Concerns: Misconfigurations, outdated software, and suspicious indicators 
6. Immediate Actions: Top 3 priority recommendations and key IOCs for blocking/monitoring 

Analyze the data systematically: 
- Inspect the data structure and identify key security indicators 
- Calculate statistics for ports, services, and geographic distribution 
- Identify high-risk patterns and anomalies - Cross-reference findings with known vulnerability databases 
- Provide evidence-based insights with specific examples from the data Format your final response as clear, structured text with bullet points. 
Prioritize actionable insights over descriptive analysis. Include specific technical details (CVE IDs, CVSS scores, ports, IPs) when relevant. 
Structure your output with proper capitlizations and formatting with section breaks for clarity. 

Dataset to Analyze:
{Data}`;
```

**Key Prompt Engineering Techniques:**
- **Role Definition**: Establishes expert cybersecurity analyst persona
- **Structured Output**: Enforces consistent 6-section format
- **Specificity**: Requests CVE IDs, CVSS scores, ports, IPs
- **Actionability**: Emphasizes recommendations over descriptions
- **Context Injection**: Embeds actual data within prompt

### 3. Error Handling & Resilience

- **File Format Error**: Invalid JSON processes as plain text
- **Token Management**: Automatic truncation with user notification
- **Timeout Handling**: Timeouts handled manually by user 
- **Multiple Models**: Supports multiple GPT models


## 📝 Assumptions

1. **OpenAI API Access**: Users have a valid OpenAI API key with available quota
2. **Data Format**: Input data follows general Censys host data structure (flexible parsing)
3. **Internet Connectivity**: Active internet connection for API calls
4. **Modern Browser**: Recent versions of Chrome, Firefox, Safari, or Edge
7. **Local Development**: Application runs on localhost (production deployment not configured)
8. **API Costs**: Users are aware of OpenAI API usage costs (varies by model)

## 🔮 Future Enhancements

Given the limited scope of this assignment, there are many desireable features that can be integrated. 

### High Priority

1. **Streaming Responses**
   - Implement SSE (Server-Sent Events) for real-time output
   - Show progressive analysis results as they generate
   - Reduce perceived latency for reasoning models

2. **Enhanced Data Visualization**
   - Interactive charts for geographic distribution
   - Port/service distribution graphs
   - Risk level pie charts and heatmaps

3. **Batch Processing**
   - Upload multiple files simultaneously
   - Parallel processing with progress tracking
   - Bulk export functionality

4. **Model Comparison**
   - Side-by-side analysis from different models
   - Performance metrics (speed, cost, quality)
   - A/B testing capabilities

5. **Advanced Prompt Templates**
   - User-defined custom prompts
   - Template library for different analysis types
   - Prompt versioning and management

6. **Data Persistence**
   - Save analysis history to database
   - Search and filter previous summaries
   - Export historical data to CSV/PDF

7. **Authentication & Multi-User**
   - User accounts with OAuth integration
   - Team workspaces and sharing
   - Role-based access control

8. **Real-time Censys Integration**
   - Direct Censys API connectivity
   - Query builder interface
   - Automatic data refresh

9. **Cost Optimization**
   - Local caching of common queries
   - Smart data chunking for large datasets
   - Cost tracking dashboard

11. **Fine-tuned Models**
    - Custom models trained on cybersecurity data
    - Domain-specific terminology recognition
    - Improved accuracy for security patterns

12. **Machine Learning Features**
    - Anomaly detection algorithms
    - Trend prediction and forecasting
    - Automated risk scoring

14. **Mobile Applications**
    - Native iOS app
    - Native Android app
    - Push notifications for critical findings

15. **Advanced Analytics**
    - Natural language query interface
    - Correlation analysis across datasets
    - Threat intelligence feed integration

## 📁 Project Structure

```
CensysGPT-2.0/
├── Client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── DataInput.jsx        # File/text input component
│   │   │   ├── SummaryDisplay.jsx   # Results display component
│   │   │   └── LoadingSpinner.jsx   # Loading state component
│   │   ├── App.jsx                  # Main application component
│   │   ├── App.css                  # Application styles
│   │   └── main.jsx                 # React entry point
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Vite configuration
├── server/                          # Node.js backend
│   ├── services/
│   │   ├── responsesAnalyzer.js     # Active OpenAI service (comprehensive)
│   ├── index.js                     # Express server & API routes
│   ├── package.json                 # Backend dependencies
│   └── .env.example                 # Environment template
├── CLAUDE.md                        # Developer guidance
└── README.md                        # This file
```

## 🔒 Security Considerations

- **API Keys**: Stored server-side only, never exposed to frontend
- **Data Privacy**: File processing happens client-side when possible
- **Input Validation**: Sanitized data input and error handling
- **CORS**: Configured for local development (restrict in production)
- **Environment Variables**: Sensitive data in .env (not committed)

## 🐛 Troubleshooting

**"OpenAI API key configuration error"**
- Verify OPENAI_API_KEY is set in `server/.env`
- Restart backend server after changing .env
- Check API key is valid at OpenAI dashboard

**"Request timeout"**
- Normal for GPT-5/o1 reasoning models (up to 2-3 minutes)
- Try gpt-4o-mini for faster responses
- Reduce dataset size if timeout persists

**"Frontend not connecting to backend"**
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify API_BASE_URL in App.jsx matches server port



