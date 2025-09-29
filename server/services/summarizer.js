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

// OpenAI API configuration
const OPENAI_API_BASE = 'https://api.openai.com/v1';

// Available OpenAI models
const OPENAI_MODELS = {
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
  'gpt-4-turbo': 'gpt-4-turbo',
  'gpt-4': 'gpt-4',
  'gpt-3.5-turbo': 'gpt-3.5-turbo',
  'o1-preview': 'o1-preview',
  'o1-mini': 'o1-mini'
};

async function callOpenAIModel(prompt, modelName, apiKey) {
  try {
    // Models that use max_completion_tokens and don't support system messages
    const usesCompletionTokens = ['o1-preview', 'o1-mini', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano'].some(m => modelName.includes(m));

    // Build messages array - o1 and gpt-5 models don't support system messages
    const messages = usesCompletionTokens
      ? [
          {
            role: 'user',
            content: prompt
          }
        ]
      : [
          {
            role: 'system',
            content: 'You are an expert cybersecurity analyst specializing in Censys host data analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ];

    // Build request body
    const requestBody = {
      messages: messages,
      model: modelName
    };

    // o1 and gpt-5 models don't support temperature/top_p parameters
    if (!usesCompletionTokens) {
      requestBody.temperature = 0.1;
      requestBody.top_p = 1.0;
    }

    // Add the appropriate token limit parameter
    // Note: o1 and gpt-5 models use reasoning_tokens internally, so we need higher limits
    if (usesCompletionTokens) {
      requestBody.max_completion_tokens = 8000; // Higher limit for reasoning + output
    } else {
      requestBody.max_tokens = 2000;
    }

    const response = await axios.post(
      `${OPENAI_API_BASE}/chat/completions`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 300000 // 5 minute timeout for reasoning models (o1/gpt-5)
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else {
      console.error('Unexpected API response:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid response format from OpenAI API');
    }
  } catch (error) {
    if (error.response) {
      // API returned an error response
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY and ensure it has not expired.');
      } else if (status === 403) {
        throw new Error('Access denied. Please ensure your OpenAI API key has the required permissions.');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (status === 404) {
        throw new Error(`Model "${modelName}" not found. Please check the model name.`);
      } else {
        throw new Error(`OpenAI API error (${status}): ${data?.error?.message || 'Unknown error'}`);
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
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required for OpenAI API');
    }

    // Get model configuration - use requested model or fall back to env/default
    const modelKey = requestedModel || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const modelName = OPENAI_MODELS[modelKey] || modelKey; // Allow custom model names

    console.log(`🤖 Using OpenAI Model: ${modelName}`);

    // Process input data
    let processedData;
    if (typeof data === 'string') {
      processedData = data;
    } else {
      processedData = JSON.stringify(data, null, 2);
    }

    // Truncate large datasets
    if (processedData.length > 200000) {
      processedData = processedData.substring(0, 200000) + '\n\n[Data truncated for processing...]';
    }

    // Create the final prompt
    const prompt = SUMMARIZATION_PROMPT.replace('{data}', processedData);

    console.log(`📊 Processing data (${processedData.length} characters)`);

    // Call OpenAI API
    const summary = await callOpenAIModel(prompt, modelName, openaiApiKey);

    return summary;
  } catch (error) {
    console.error('Error in summarizeData:', error);

    // Re-throw with consistent error messages
    if (error.message.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI API key configuration error. Please check your environment variables.');
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