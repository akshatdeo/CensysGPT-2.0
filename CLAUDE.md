# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CensysGPT-2.0 is a full-stack AI application that transforms Censys host data into actionable security insights using GitHub's AI Models API. The application consists of a React frontend and Node.js backend with Express.

## Commands

### Backend Development
```bash
cd server
npm install              # Install dependencies
npm run dev             # Start development server with nodemon (port 3002)
npm start              # Start production server
```

### Frontend Development
```bash
cd Client
npm install              # Install dependencies
npm run dev             # Start Vite dev server (port 5173)
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

### Full Application Setup
1. Set up backend: `cd server && npm install && cp .env.example .env`
2. Configure GitHub token in `server/.env`
3. Start backend: `npm run dev` (from server directory)
4. Set up frontend: `cd Client && npm install`
5. Start frontend: `npm run dev` (from Client directory)

## Architecture

### Frontend Architecture
- **Framework**: React 19 with Vite build tool
- **Components**: Modular component structure in `src/components/`
  - `DataInput.jsx`: Handles file upload and text input with validation
  - `SummaryDisplay.jsx`: Displays AI-generated summaries with export features
  - `LoadingSpinner.jsx`: Loading state indicator
- **State Management**: React hooks (useState) for local state
- **API Communication**: Fetch API to communicate with backend on port 3002

### Backend Architecture
- **Framework**: Express.js with ES modules
- **API Structure**: Single summarization endpoint at `/summarize`
- **AI Integration**: GitHub Models API through `services/summarizer.js`
- **Data Processing**: JSON parsing with graceful fallback to text processing
- **Error Handling**: Comprehensive error messages for API failures

### Key Integration Points
- Frontend expects backend on `http://localhost:3001` (configured in App.jsx:7)
- Backend defaults to port 3001 but can use PORT environment variable
- Data flow: User input → DataInput → App → Backend API → GitHub Models → Response chain

## Environment Configuration

### Required Environment Variables (Backend)
- `GITHUB_TOKEN`: GitHub personal access token for Models API access
- `GITHUB_MODEL`: AI model selection (default: 'gpt-4o-mini')
- `PORT`: Server port (default: 3001)

### Available GitHub Models
The application supports multiple AI models via GitHub Models API:
- GPT models: `gpt-4o`, `gpt-4o-mini`
- Phi-3 models: `phi-3-medium-128k-instruct`, `phi-3-mini-128k-instruct`
- Llama models: `meta-llama-3-70b-instruct`, `meta-llama-3-8b-instruct`
- Mistral models: `mistral-large`, `mistral-nemo`, `mistral-small`

### GitHub Token Setup
- Classic tokens recommended over fine-grained tokens
- No additional scopes required for GitHub Models API
- Fine-grained tokens may face organization policy restrictions

## Key Implementation Details

### Data Processing Pipeline
1. Frontend validates and parses JSON input (with text fallback)
2. Backend receives data via POST `/summarize`
3. Data is truncated to 20KB for API limits in `summarizer.js:125`
4. Specialized cybersecurity prompt engineered for analysis
5. GitHub Models API processes data with temperature 0.1 for consistency

### Error Handling Strategy
- Frontend displays user-friendly error messages
- Backend provides detailed error context for debugging
- Specific handling for GitHub API errors (401, 403, 429, 404)
- Timeout handling for long-running requests (60 second limit)

### Security Considerations
- API keys stored server-side only
- CORS enabled for local development
- Input validation and sanitization
- File processing happens client-side when possible

## Common Development Tasks

### Adding New AI Models
1. Add model mapping to `GITHUB_MODELS` object in `services/summarizer.js:25`
2. Update `.env.example` with new model options
3. Test API compatibility with new model

### Modifying Analysis Prompts
- Edit `SUMMARIZATION_PROMPT` in `services/summarizer.js:3`
- Maintain structured output format for consistent frontend display
- Test prompt changes with various data types

### Frontend Component Development
- Follow existing pattern of prop-based component communication
- Use React hooks for state management
- Maintain responsive design principles in CSS

### API Endpoint Development
- Follow Express.js patterns established in `index.js`
- Implement comprehensive error handling
- Maintain JSON response format consistency

## Port Configuration Note
**Important**: There's a port mismatch in the current configuration:
- Frontend expects backend on port 3001 (`App.jsx:7`)
- Backend defaults to port 3001 but `.env.example` shows 3001
- README suggests backend runs on port 3002
When making changes, ensure port consistency across all configuration files.