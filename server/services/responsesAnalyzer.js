import axios from 'axios';

const ANALYSIS_PROMPT = `You are an expert cybersecurity analyst specializing in Censys host data analysis.

Analyze the provided Censys host dataset and provide a comprehensive, in-depth security assessment.

Your analysis should include:

1. **Overview**: Dataset size, scope, and overall risk level (Critical/High/Medium/Low)
2. **Critical Findings**: Immediate security threats requiring urgent attention
   - Active malware/C2 infrastructure
   - Critical vulnerabilities (CVSS ≥7.0) with CVE numbers
   - Known exploited vulnerabilities
3. **Geographic & Infrastructure Patterns**: Notable hosting providers, ASNs, and geographic clustering
4. **Service Analysis**: Exposed services, unusual ports, and authentication gaps
5. **Security Concerns**: Misconfigurations, outdated software, and suspicious indicators
6. **Immediate Actions**: Top 3 priority recommendations and key IOCs for blocking/monitoring

Analyze the data systematically:
- Inspect the data structure and identify key security indicators
- Calculate statistics for ports, services, and geographic distribution
- Identify high-risk patterns and anomalies
- Cross-reference findings with known vulnerability databases
- Provide evidence-based insights with specific examples from the data

Format your final response as clear, structured text with bullet points.
Prioritize actionable insights over descriptive analysis. Include specific technical details (CVE IDs, CVSS scores, ports, IPs) when relevant.

Dataset to analyze:
{data}`;

// OpenAI API configuration
const OPENAI_API_BASE = 'https://api.openai.com/v1';

// Available OpenAI models for Chat Completions
const OPENAI_MODELS = {
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
  'gpt-4-turbo': 'gpt-4-turbo',
  'gpt-4': 'gpt-4',
  'gpt-3.5-turbo': 'gpt-3.5-turbo',
  'o1-preview': 'o1-preview',
  'o1-mini': 'o1-mini'
};

/**
 * Call OpenAI Chat Completions API
 */
async function callOpenAIChat(prompt, modelName, apiKey) {
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
            content: 'You are an expert cybersecurity analyst specializing in Censys host data analysis. Provide detailed, evidence-based security insights with specific examples from the data.'
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

    // o1 and gpt-5 models don't support temperature parameter
    if (!usesCompletionTokens) {
      requestBody.temperature = 1;
    }

    // Add the appropriate token limit parameter
    // Note: o1 and gpt-5 models use reasoning_tokens internally, so we need higher limits
    if (usesCompletionTokens) {
      requestBody.max_completion_tokens = 16000; // Higher limit for reasoning + output
    } else {
      requestBody.max_tokens = 4000;
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
      throw new Error('Request timeout. The analysis is taking too long to complete.');
    } else {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

/**
 * Analyze data using OpenAI Chat Completions API
 */
export async function analyzeWithResponsesAPI(data, requestedModel = null) {
  try {
    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    // Get model configuration - use requested model or fall back to env/default
    const modelKey = requestedModel || process.env.OPENAI_MODEL || 'gpt-4o';
    const modelName = OPENAI_MODELS[modelKey] || modelKey;

    console.log(`🤖 Using OpenAI Model for comprehensive analysis: ${modelName}`);

    // Process input data
    let processedData;
    if (typeof data === 'string') {
      processedData = data;
    } else {
      processedData = JSON.stringify(data, null, 2);
    }

    // Truncate very large datasets (increased limit for deeper analysis)
    if (processedData.length > 200000) {
      processedData = processedData.substring(0, 200000) + '\n\n[Data truncated for processing...]';
    }

    console.log(`📊 Processing data for comprehensive analysis (${processedData.length} characters)`);

    // Create the final prompt
    const prompt = ANALYSIS_PROMPT.replace('{data}', processedData);

    // Call OpenAI API
    console.log('🔍 Running comprehensive security analysis...');
    const analysis = await callOpenAIChat(prompt, modelName, apiKey);

    console.log('✅ Comprehensive analysis completed successfully');
    return analysis;

  } catch (error) {
    console.error('Error in analyzeWithResponsesAPI:', error);

    // Provide user-friendly error messages
    if (error.message.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI API key configuration error. Please check your environment variables.');
    }

    if (error.message.includes('rate limit') || error.message.includes('429')) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    }

    if (error.message.includes('insufficient_quota')) {
      throw new Error('OpenAI API quota exceeded. Please check your account billing.');
    }

    if (error.message.includes('timeout')) {
      throw new Error('Analysis timeout. Please try with a smaller dataset or try again later.');
    }

    throw new Error(`Analysis failed: ${error.message}`);
  }
}