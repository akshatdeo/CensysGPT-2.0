import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const ASSISTANT_INSTRUCTIONS = `You are an expert cybersecurity analyst specializing in Censys host data analysis.
Your task is to analyze the provided dataset using Python code and provide comprehensive, actionable security insights.

Please analyze the data and provide:

1. **Overview**: Dataset size, scope, and overall risk level (Critical/High/Medium/Low)
2. **Critical Findings**: Immediate security threats requiring urgent attention
   - Active malware/C2 infrastructure
   - Critical vulnerabilities (CVSS ≥7.0) with CVE numbers
   - Known exploited vulnerabilities
3. **Geographic & Infrastructure Patterns**: Notable hosting providers, ASNs, and geographic clustering
4. **Service Analysis**: Exposed services, unusual ports, and authentication gaps
5. **Security Concerns**: Misconfigurations, outdated software, and suspicious indicators
6. **Immediate Actions**: Top 3 priority recommendations and key IOCs for blocking/monitoring

Use Python to analyze the data, create visualizations if helpful, and provide structured insights.
Format your response as clear, structured text with bullet points where appropriate.
Prioritize actionable insights over descriptive analysis. Include specific technical details (CVE IDs, CVSS scores, ports) when relevant.`;

// Store assistants and threads for potential reuse
let cachedAssistant = null;

/**
 * Get or create an OpenAI assistant with Code Interpreter enabled
 */
async function getOrCreateAssistant(client) {
  if (cachedAssistant) {
    return cachedAssistant;
  }

  try {
    const assistant = await client.beta.assistants.create({
      name: "Censys Data Analyzer",
      instructions: ASSISTANT_INSTRUCTIONS,
      model: process.env.OPENAI_MODEL || "gpt-4o",
      tools: [{ type: "code_interpreter" }]
    });

    cachedAssistant = assistant;
    console.log(`✅ Created assistant: ${assistant.id}`);
    return assistant;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw new Error(`Failed to create assistant: ${error.message}`);
  }
}

/**
 * Write data to a temporary file
 */
function writeTempFile(data) {
  const tempDir = path.join(process.cwd(), 'temp');

  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const timestamp = Date.now();
  const filename = `censys_data_${timestamp}.json`;
  const filepath = path.join(tempDir, filename);

  // Convert data to JSON string if it's an object
  const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  fs.writeFileSync(filepath, dataString, 'utf8');
  console.log(`📁 Created temp file: ${filepath}`);

  return filepath;
}

/**
 * Delete temporary file
 */
function deleteTempFile(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`🗑️  Deleted temp file: ${filepath}`);
    }
  } catch (error) {
    console.error('Error deleting temp file:', error);
  }
}

/**
 * Analyze data using OpenAI Code Interpreter
 */
export async function analyzeWithCodeInterpreter(data, requestedModel = null) {
  let tempFilePath = null;
  let uploadedFileId = null;
  let threadId = null;

  try {
    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    // Initialize OpenAI client
    const client = new OpenAI({ apiKey });

    // Get or create assistant
    const assistant = await getOrCreateAssistant(client);

    // Update assistant model if requested
    if (requestedModel && requestedModel !== assistant.model) {
      await client.beta.assistants.update(assistant.id, {
        model: requestedModel
      });
      console.log(`🔄 Updated assistant model to: ${requestedModel}`);
    }

    // Write data to temporary file
    tempFilePath = writeTempFile(data);

    // Upload file to OpenAI
    console.log('📤 Uploading file to OpenAI...');
    const file = await client.files.create({
      file: fs.createReadStream(tempFilePath),
      purpose: "assistants"
    });
    uploadedFileId = file.id;
    console.log(`✅ File uploaded: ${file.id}`);

    // Create a thread with the file
    console.log('🧵 Creating thread...');
    const thread = await client.beta.threads.create({
      messages: [{
        role: "user",
        content: "Analyze this Censys host dataset and provide comprehensive security insights. Use Python to process the data if needed.",
        attachments: [{
          file_id: file.id,
          tools: [{ type: "code_interpreter" }]
        }]
      }]
    });
    threadId = thread.id;
    console.log(`✅ Thread created: ${thread.id}`);

    // Run the assistant and poll for completion
    console.log('🤖 Running analysis...');
    const run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id
    });

    console.log(`✅ Run completed with status: ${run.status}`);

    // Handle different run statuses
    if (run.status === 'completed') {
      // Get the messages from the thread
      const messages = await client.beta.threads.messages.list(thread.id);

      // Find the assistant's response
      const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');

      if (assistantMessages.length === 0) {
        throw new Error('No response from assistant');
      }

      // Extract text content from the latest assistant message
      const latestMessage = assistantMessages[0];
      let responseText = '';

      for (const content of latestMessage.content) {
        if (content.type === 'text') {
          responseText += content.text.value + '\n';
        }
      }

      if (!responseText.trim()) {
        throw new Error('Empty response from assistant');
      }

      // Clean up: delete file from OpenAI
      try {
        await client.files.del(uploadedFileId);
        console.log(`🗑️  Deleted OpenAI file: ${uploadedFileId}`);
      } catch (error) {
        console.error('Error deleting OpenAI file:', error);
      }

      return responseText.trim();
    } else if (run.status === 'failed') {
      throw new Error(`Assistant run failed: ${run.last_error?.message || 'Unknown error'}`);
    } else if (run.status === 'cancelled') {
      throw new Error('Assistant run was cancelled');
    } else if (run.status === 'expired') {
      throw new Error('Assistant run expired');
    } else {
      throw new Error(`Unexpected run status: ${run.status}`);
    }

  } catch (error) {
    console.error('Error in analyzeWithCodeInterpreter:', error);

    // Clean up on error
    if (uploadedFileId) {
      try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        await client.files.del(uploadedFileId);
      } catch (cleanupError) {
        console.error('Error cleaning up OpenAI file:', cleanupError);
      }
    }

    // Provide user-friendly error messages
    if (error.message.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI API key configuration error. Please check your environment variables.');
    }

    if (error.message.includes('rate limit') || error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    }

    if (error.message.includes('insufficient_quota')) {
      throw new Error('OpenAI API quota exceeded. Please check your account billing.');
    }

    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
    }

    throw new Error(`Analysis failed: ${error.message}`);
  } finally {
    // Always clean up temp file
    if (tempFilePath) {
      deleteTempFile(tempFilePath);
    }
  }
}