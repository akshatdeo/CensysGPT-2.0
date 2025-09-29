# 🔍 Censys AI Data Summarizer

A full-stack AI agent application that transforms Censys host data into actionable security insights using GitHub's AI Models API with multiple state-of-the-art language models.

## 🎯 Project Overview

This application provides an intelligent summarization service for Censys host data, enabling security analysts to quickly extract key insights, identify patterns, and assess risks from large datasets. The system integrates with GitHub's AI Models API, providing access to multiple state-of-the-art language models including GPT-4o, Phi-3, Llama 3, and Mistral models.

**Architecture:**
- **Frontend**: React + Vite for a modern, responsive user interface
- **Backend**: Node.js + Express API with direct GitHub Models integration
- **AI**: GitHub Models API supporting GPT-4o, Phi-3, Llama 3, Mistral, and more

## 🚀 Features

- **Multi-format Data Input**: Support for JSON, CSV, and plain text data formats
- **File Upload & Text Input**: Flexible data entry options with drag-and-drop support
- **AI-Powered Analysis**: Advanced prompt engineering for cybersecurity-focused insights
- **Multiple AI Models**: Choose from GPT-4o, Phi-3, Llama 3, Mistral, and other GitHub Models
- **Rich Summary Output**: Structured analysis with geographic, service, and risk assessments
- **Export Capabilities**: Copy to clipboard and download summaries
- **Real-time Processing**: Live status updates and error handling
- **Responsive Design**: Mobile-friendly interface with modern UI components

## 📁 Project Structure

```
CensysGPT-2.0/
├── Client/                     # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── DataInput.jsx   # Data input interface
│   │   │   ├── SummaryDisplay.jsx # Summary results display
│   │   │   └── LoadingSpinner.jsx # Loading indicator
│   │   ├── App.jsx            # Main application component
│   │   ├── App.css           # Application styles
│   │   └── main.jsx          # React entry point
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── server/                    # Node.js backend API
│   ├── services/
│   │   └── summarizer.js     # GitHub Models AI integration
│   ├── index.js              # Express server
│   ├── package.json          # Backend dependencies
│   └── .env.example          # Environment variables template
└── README.md                 # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- GitHub personal access token (for GitHub Models API)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CensysGPT-2.0
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your GitHub token
# Get your token from: https://github.com/settings/tokens
GITHUB_TOKEN=your_github_token_here
GITHUB_MODEL=gpt-4o-mini
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
# Server runs on http://localhost:3002
```

**Terminal 2 - Frontend Application:**
```bash
cd Client
npm run dev
# Frontend runs on http://localhost:5173
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

The backend uses environment variables for configuration:

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | 3002 |
| `GITHUB_TOKEN` | Yes | GitHub personal access token | - |
| `GITHUB_MODEL` | No | AI model to use | gpt-4o-mini |

**Available Models:**
- `gpt-4o` - Most capable OpenAI model
- `gpt-4o-mini` - Faster, cost-effective OpenAI model (default)
- `phi-3-medium-128k-instruct` - Microsoft Phi-3 Medium
- `phi-3-mini-128k-instruct` - Microsoft Phi-3 Mini
- `meta-llama-3-70b-instruct` - Meta Llama 3 70B
- `meta-llama-3-8b-instruct` - Meta Llama 3 8B
- `mistral-large` - Mistral Large
- `mistral-nemo` - Mistral Nemo
- `mistral-small` - Mistral Small

### Getting GitHub Access Token

You can use either a **Classic Token** (recommended) or a **Fine-grained Token**:

#### Option 1: Classic Token (Recommended)
1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Censys AI Summarizer")
4. **No additional scopes needed** - GitHub Models works with basic token permissions
5. Copy the generated token to your `.env` file

#### Option 2: Fine-grained Token
1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Fine-grained personal access token"
3. Configure repository access (if required by your organization)
4. **Note**: Fine-grained tokens may have additional restrictions:
   - Organization policy may block fine-grained tokens
   - May require specific repository permissions
   - GitHub Models API compatibility varies
5. If you encounter access issues, consider using a classic token instead

### Switching AI Models

To switch between AI models, update your `.env` file:

```bash
# For GPT-4o (most capable)
GITHUB_MODEL=gpt-4o

# For faster processing
GITHUB_MODEL=gpt-4o-mini

# For open-source alternatives
GITHUB_MODEL=meta-llama-3-8b-instruct
GITHUB_MODEL=phi-3-mini-128k-instruct
```

## 📖 Usage Guide

### 1. Data Input Methods

**Text Input:**
- Paste JSON data directly into the textarea
- Use the "Load Sample Data" button to see example format
- Supports both structured JSON and plain text

**File Upload:**
- Drag and drop or browse for files
- Supported formats: `.json`, `.txt`, `.csv`
- Files are processed client-side for privacy

### 2. Sample Data Format

The application works best with structured Censys host data:

```json
{
  "hosts": [
    {
      "ip": "192.168.1.100",
      "location": {
        "country": "US",
        "city": "San Francisco"
      },
      "services": [
        {
          "port": 80,
          "service": "http",
          "banner": "nginx/1.20.1"
        }
      ],
      "autonomous_system": {
        "name": "Example Corp",
        "asn": 12345
      }
    }
  ]
}
```

### 3. Understanding Summaries

AI-generated summaries include:
- **Overview**: Dataset scope and size
- **Key Findings**: Most significant security insights
- **Geographic Distribution**: Location-based patterns
- **Service Analysis**: Common ports and protocols
- **Security Concerns**: Potential vulnerabilities
- **Risk Assessment**: Overall threat evaluation

## 🧪 Testing Instructions

### Manual Testing

1. **Start both servers** (backend and frontend)
2. **Load sample data** using the provided button
3. **Generate summary** and verify AI response
4. **Test file upload** with a JSON file
5. **Verify error handling** with invalid data
6. **Test export features** (copy/download)

### API Testing

Test the backend directly:

```bash
# Test server health
curl http://localhost:3002/

# Test summarization endpoint
curl -X POST http://localhost:3002/summarize \
  -H "Content-Type: application/json" \
  -d '{"data": {"test": "sample data"}}'
```

### Expected Behavior

- ✅ Valid data should generate structured summaries
- ✅ Invalid JSON should fall back to text processing
- ✅ Missing GitHub token should show configuration errors
- ✅ Large datasets should be truncated gracefully
- ✅ Network errors should display user-friendly messages

## 🤖 AI Techniques & Implementation

### GitHub Models Integration

The application integrates directly with GitHub's AI Models API for:
- **Model Variety**: Access to GPT-4o, Phi-3, Llama 3, Mistral, and more
- **Cost Efficiency**: Competitive pricing and free tier availability
- **Performance**: Direct API integration for fast responses
- **Reliability**: Enterprise-grade infrastructure and uptime

### Prompt Engineering

The summarization prompt is specifically designed for cybersecurity analysis:

```javascript
const SUMMARIZATION_PROMPT = `You are an expert cybersecurity analyst...
1. **Overview**: Brief description of the dataset
2. **Key Findings**: Security insights and patterns
3. **Geographic Distribution**: Location patterns
4. **Service Analysis**: Common services and ports
5. **Security Concerns**: Vulnerabilities
6. **Risk Assessment**: Overall threat level
```

### Model Configuration

- **Temperature**: Set to 0.1 for consistent, factual outputs
- **Max Tokens**: Limited to 2000 for concise summaries
- **Data Truncation**: Large datasets limited to 20,000 characters
- **Fallback Handling**: Graceful degradation for API failures

## 🚧 Current Limitations

1. **Data Size**: Limited to ~20KB per request for optimal performance
2. **Rate Limits**: Dependent on chosen LLM provider's API limits
3. **Context Window**: Large datasets may lose detail due to truncation
4. **Real-time Processing**: No streaming responses (batch processing only)
5. **Authentication**: No user management or API key validation

## 🔮 Future Enhancements

### Short Term
- [ ] **Streaming Responses**: Real-time summary generation
- [ ] **Data Persistence**: Save and retrieve previous summaries
- [ ] **Export Formats**: PDF, Word, and CSV export options
- [ ] **Batch Processing**: Handle multiple files simultaneously
- [ ] **Theme Support**: Dark/light mode toggle

### Medium Term
- [ ] **Advanced Analytics**: Statistical analysis and trend detection
- [ ] **Custom Prompts**: User-defined analysis templates
- [ ] **Collaboration**: Share summaries with team members
- [ ] **API Rate Limiting**: Built-in request throttling
- [ ] **Data Visualization**: Charts and graphs for insights

### Long Term
- [ ] **Fine-tuned Models**: Custom models trained on cybersecurity data
- [ ] **Real-time Integration**: Direct Censys API connectivity
- [ ] **Machine Learning**: Pattern recognition and anomaly detection
- [ ] **Enterprise Features**: SSO, audit logs, compliance reporting
- [ ] **Mobile App**: Native iOS/Android applications

## 🔒 Security Considerations

- **API Keys**: Stored server-side only, never exposed to frontend
- **Data Privacy**: File processing happens client-side when possible
- **Input Validation**: Sanitized data input and error handling
- **CORS Protection**: Configured for local development
- **Rate Limiting**: Recommend implementing in production

## 🐛 Troubleshooting

### Common Issues

**"GitHub API token configuration error"**
- Verify your GitHub token is correctly set in `.env`
- Ensure your token has not expired
- Restart the backend server after changing environment variables
- **For fine-grained tokens**: Check organization policies and repository access
- **If issues persist**: Try generating a classic token instead

**"Failed to generate summary"**
- Check internet connectivity
- Verify API quota/billing status
- Try with smaller data samples
- Check browser console for detailed errors

**Frontend not connecting to backend**
- Ensure backend server is running on port 3002
- Check for CORS issues in browser console
- Verify `API_BASE_URL` in frontend matches backend port

### Getting Help

1. Check the browser developer console for detailed error messages
2. Review backend server logs for API-related issues
3. Verify your data format matches expected JSON structure
4. Test with the provided sample data first

## 📄 License

This project is licensed under the ISC License - see the package.json files for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for the cybersecurity community**