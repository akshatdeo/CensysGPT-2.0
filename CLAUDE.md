# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CensysGPT-2.0 is a full-stack AI application that transforms Censys host data into actionable security insights using OpenAI's Chat Completions API. The application consists of a React frontend and Node.js backend with Express.

## Commands

### Backend Development
```bash
cd server
npm install              # Install dependencies
npm run dev             # Start development server with nodemon (port 3001)
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
2. Configure OpenAI API key in `server/.env`
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
- **API Communication**: Fetch API to communicate with backend on port 3001

### Backend Architecture
- **Framework**: Express.js with ES modules
- **API Structure**: Single summarization endpoint at `/summarize`
- **AI Integration**: OpenAI Chat Completions API through `services/responsesAnalyzer.js`
- **Data Processing**: JSON parsing with graceful fallback to text processing
- **Error Handling**: Comprehensive error messages for API failures

### Key Integration Points
- Frontend expects backend on `http://localhost:3001` (configured in App.jsx:7)
- Backend defaults to port 3001 but can use PORT environment variable
- Data flow: User input → DataInput → App → Backend API → OpenAI → Response chain
- All three service files (`summarizer.js`, `codeInterpreter.js`, `responsesAnalyzer.js`) use the same Chat Completions API pattern

## Environment Configuration

### Required Environment Variables (Backend)
- `OPENAI_API_KEY`: OpenAI API key for Chat Completions API access
- `OPENAI_MODEL`: AI model selection (default: 'gpt-5-mini')
- `PORT`: Server port (default: 3001)

### Available OpenAI Models
The application supports multiple AI models via OpenAI Chat Completions API:
- GPT-5 models: `gpt-5`, `gpt-5-mini`, `gpt-5-nano` (reasoning models)
- GPT-4o models: `gpt-4o`, `gpt-4o-mini`
- GPT-4 models: `gpt-4-turbo`, `gpt-4`
- GPT-3.5: `gpt-3.5-turbo`
- o1 models: `o1-preview`, `o1-mini` (reasoning models)

### OpenAI API Key Setup
- Get your API key from: https://platform.openai.com/api-keys
- Add to `server/.env`: `OPENAI_API_KEY=your_api_key_here`

## Key Implementation Details

### OpenAI API Integration
The application uses three service files that all use the Chat Completions API:

1. **`summarizer.js`** - Basic summarization with lower token limits
2. **`codeInterpreter.js`** - Extended analysis (named for legacy reasons, no longer uses code interpreter)
3. **`responsesAnalyzer.js`** - Comprehensive analysis (currently active service)

All three services share the same API pattern but with different:
- Token limits (2,000-16,000 depending on model and service)
- Timeout settings (300 seconds for reasoning models)
- Prompt engineering for specific analysis depths

### Model-Specific Handling
The services automatically detect model types and adjust parameters:

**Reasoning Models (o1, GPT-5):**
- Use `max_completion_tokens` instead of `max_tokens`
- No system messages (user messages only)
- No temperature/top_p parameters
- Higher token limits (8,000-16,000) to account for internal reasoning
- Extended timeout (300 seconds)

**Standard Models (GPT-4, GPT-3.5):**
- Use `max_tokens` parameter
- Support system messages
- Support temperature/top_p parameters
- Standard token limits (2,000-4,000)
- Standard timeout (300 seconds)

### Data Processing Pipeline
1. Frontend validates and parses JSON input (with text fallback)
2. Backend receives data via POST `/summarize`
3. Data is truncated to 200KB for API limits in `responsesAnalyzer.js:160`
4. Specialized cybersecurity prompt engineered for analysis
5. OpenAI API processes data with model-appropriate parameters
6. Response is validated and returned to frontend

### Error Handling Strategy
- Frontend displays user-friendly error messages
- Backend provides detailed error context for debugging
- Specific handling for OpenAI API errors (401, 403, 429, 404)
- Timeout handling for long-running requests (300 second limit)
- Logging of unexpected API responses for debugging

### Security Considerations
- API keys stored server-side only
- CORS enabled for local development
- Input validation and sanitization
- File processing happens client-side when possible

## Common Development Tasks

### Adding New AI Models
1. Add model identifier to the detection logic in each service file (check for `usesCompletionTokens`)
2. Update `.env.example` with new model options
3. Test API compatibility with new model
4. Adjust token limits if needed

### Modifying Analysis Prompts
- Edit `ANALYSIS_PROMPT` in `services/responsesAnalyzer.js:3`
- Maintain structured output format for consistent frontend display
- Test prompt changes with various data types and models

### Frontend Component Development
- Follow existing pattern of prop-based component communication
- Use React hooks for state management
- Maintain responsive design principles in CSS

### API Endpoint Development
- Follow Express.js patterns established in `index.js`
- Implement comprehensive error handling
- Maintain JSON response format consistency

## Important Notes

### Port Configuration
- Frontend: `http://localhost:5173` (Vite default)
- Backend: `http://localhost:3001` (configured in server and frontend)
- Ensure consistency across `server/.env`, `server/index.js:9`, and `Client/src/App.jsx:7`

### Service File Usage
The current implementation uses `responsesAnalyzer.js` as the active service (imported in `server/index.js:4`). The other two service files (`summarizer.js` and `codeInterpreter.js`) exist for alternative analysis options but follow the same API pattern.

### Reasoning Model Considerations
When using GPT-5 or o1 models:
- Expect longer response times (30-120 seconds typical)
- Internal reasoning tokens count against `max_completion_tokens`
- Monitor for timeout issues and increase timeout if needed
- Consider using standard models for faster development/testing