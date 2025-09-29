import axios from 'axios';

const SUMMARIZATION_PROMPT = `You are an expert cybersecurity analyst specializing in Censys host data analysis.
Your task is to analyze the provided host data and create a comprehensive, actionable summary.
Data to analyze:
{data}
Please provide a summary that includes:

Overview: Dataset size, scope, and overall risk level (Critical/High/Medium/Low)
Critical Findings: Immediate security threats requiring urgent attention

Active malware/C2 infrastructure
Critical vulnerabilities (CVSS ≥7.0) with CVE numbers
Known exploited vulnerabilities


Geographic & Infrastructure Patterns: Notable hosting providers, ASNs, and geographic clustering
Service Analysis: Exposed services, unusual ports, and authentication gaps
Security Concerns: Misconfigurations, outdated software, and suspicious indicators
Immediate Actions: Top 3 priority recommendations and key IOCs for blocking/monitoring

Format your response as clear, structured text with bullet points where appropriate.
Prioritize actionable insights over descriptive analysis. Include specific technical details (CVE IDs, CVSS scores, ports) when relevant`;

// GitHub Models API configuration
const GITHUB_API_BASE = 'https://models.github.ai';

// Available GitHub AI models (Official GitHub Models API format)
const GITHUB_MODELS = {
  // OpenAI Models (with provider prefix)
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
  'o1-mini': 'openai/o1-mini',

  // Meta Llama Models
  'Meta-Llama-3.1-8B-Instruct': 'meta/llama-3.1-8b-instruct',
  'Meta-Llama-3.1-70B-Instruct': 'meta/llama-3.1-70b-instruct',
  'Llama-3.2-11B-Vision-Instruct': 'meta/llama-3.2-11b-vision-instruct',

  // Mistral Models
  'Mistral-Large-2407': 'mistral/mistral-large-2407',
  'Mistral-Nemo-Instruct-2407': 'mistral/mistral-nemo-instruct-2407',
  'Ministral-3B': 'mistral/ministral-3b',

  // Cohere Models
  'Cohere-command-r-plus': 'cohere/command-r-plus',
  'Cohere-command-r': 'cohere/command-r'
};

async function callGitHubModel(prompt, modelName, apiKey) {
  try {
    const response = await axios.post(
      `${GITHUB_API_BASE}/inference/chat/completions`,
      {
        messages: [
          {
            role: 'system',
            content: 'You are an expert cybersecurity analyst specializing in Censys host data analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: modelName,
        temperature: 0.1,
        max_tokens: 2000,
        top_p: 1.0
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from GitHub Models API');
    }
  } catch (error) {
    if (error.response) {
      // API returned an error response
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error('Invalid GitHub API token. Please check your GITHUB_TOKEN and ensure it has not expired.');
      } else if (status === 403) {
        const errorMsg = data?.error?.message || 'Access denied';
        if (errorMsg.includes('fine-grained') || errorMsg.includes('organization')) {
          throw new Error('Fine-grained token access denied. For fine-grained tokens, ensure: 1) Token has access to GitHub Models, 2) Organization allows fine-grained tokens, 3) Consider using a classic token instead.');
        }
        throw new Error(`Access denied: ${errorMsg}. Please ensure your GitHub token has the required permissions for GitHub Models API.`);
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (status === 404) {
        throw new Error(`Model "${modelName}" not found. Please check the model name.`);
      } else {
        throw new Error(`GitHub API error (${status}): ${data?.error?.message || 'Unknown error'}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The model is taking too long to respond.');
    } else {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

export async function summarizeData(data, requestedModel = null) {
  try {
    // Validate required environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN environment variable is required for GitHub Models API');
    }

    // Get model configuration - use requested model or fall back to env/default
    const modelKey = requestedModel || process.env.GITHUB_MODEL || 'gpt-4o-mini';
    const modelName = GITHUB_MODELS[modelKey];

    if (!modelName) {
      throw new Error(`Unsupported model: ${modelKey}. Available models: ${Object.keys(GITHUB_MODELS).join(', ')}`);
    }

    // Process input data
    let processedData;
    if (typeof data === 'string') {
      processedData = data;
    } else {
      processedData = JSON.stringify(data, null, 2);
    }

    // Truncate large datasets
    if (processedData.length > 20000) {
      processedData = processedData.substring(0, 20000) + '\n\n[Data truncated for processing...]';
    }

    // Create the final prompt
    const prompt = SUMMARIZATION_PROMPT.replace('{data}', processedData);

    console.log(`🤖 Using GitHub Model: ${modelName}`);
    console.log(`📊 Processing data (${processedData.length} characters)`);

    // Call GitHub Models API
    const summary = await callGitHubModel(prompt, modelName, githubToken);

    return summary;
  } catch (error) {
    console.error('Error in summarizeData:', error);

    // Re-throw with consistent error messages
    if (error.message.includes('GITHUB_TOKEN')) {
      throw new Error('GitHub API token configuration error. Please check your environment variables.');
    }

    if (error.message.includes('rate limit') || error.message.includes('429')) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    if (error.message.includes('timeout')) {
      throw new Error('Request timeout. Please try with a smaller dataset or try again later.');
    }

    throw new Error(`Summarization failed: ${error.message}`);
  }
}