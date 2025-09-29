import { useState } from 'react'

const DataInput = ({ onSummarize, loading, selectedModel, onModelChange }) => {
  const [inputMethod, setInputMethod] = useState('text')
  const [textData, setTextData] = useState('')
  const [file, setFile] = useState(null)

  // Available GitHub Models (Expanded list based on GitHub Models API)
  const availableModels = [
    // OpenAI Models
    { value: 'gpt-4o-mini', label: '🚀 GPT-4o Mini (Fast & Cost-effective)', description: 'OpenAI GPT-4o Mini - Recommended' },
    { value: 'gpt-4o', label: '🧠 GPT-4o (Most Capable)', description: 'OpenAI GPT-4o - Best performance' },
    { value: 'gpt-3.5-turbo', label: '⚡ GPT-3.5 Turbo (Fast)', description: 'OpenAI GPT-3.5 Turbo - Fast and reliable' },
    { value: 'o1-mini', label: '🔬 O1 Mini (Reasoning)', description: 'OpenAI O1 Mini - Advanced reasoning' },

    // Meta Llama Models
    { value: 'Meta-Llama-3.1-8B-Instruct', label: '🦙 Llama 3.1 8B', description: 'Meta Llama 3.1 8B Instruct' },
    { value: 'Meta-Llama-3.1-70B-Instruct', label: '🦙 Llama 3.1 70B', description: 'Meta Llama 3.1 70B Instruct' },
    { value: 'Llama-3.2-11B-Vision-Instruct', label: '🦙 Llama 3.2 11B Vision', description: 'Meta Llama 3.2 11B Vision Instruct' },

    // Mistral Models
    { value: 'Mistral-Large-2407', label: '🌟 Mistral Large', description: 'Mistral Large 24.07' },
    { value: 'Mistral-Nemo-Instruct-2407', label: '🌊 Mistral Nemo', description: 'Mistral Nemo Instruct' },
    { value: 'Ministral-3B', label: '⭐ Ministral 3B', description: 'Ministral 3B - Edge optimized' },

    // Cohere Models
    { value: 'Cohere-command-r-plus', label: '💎 Command R+', description: 'Cohere Command R+ - Enterprise RAG' },
    { value: 'Cohere-command-r', label: '💫 Command R', description: 'Cohere Command R - Scalable RAG' }
  ]

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    setFile(selectedFile)

    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target.result
          if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json')) {
            JSON.parse(content)
          }
        } catch (error) {
          alert('Invalid JSON file. Please check the file format.')
          setFile(null)
          event.target.value = ''
        }
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    let dataToSummarize = null

    if (inputMethod === 'text') {
      if (!textData.trim()) {
        alert('Please enter some data to summarize.')
        return
      }

      try {
        dataToSummarize = JSON.parse(textData)
      } catch (error) {
        dataToSummarize = textData
      }
    } else if (inputMethod === 'file') {
      if (!file) {
        alert('Please select a file to upload.')
        return
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const content = e.target.result
          if (file.type === 'application/json' || file.name.endsWith('.json')) {
            dataToSummarize = JSON.parse(content)
          } else {
            dataToSummarize = content
          }
          await onSummarize(dataToSummarize, selectedModel)
        } catch (error) {
          alert('Error reading file: ' + error.message)
        }
      }
      reader.readAsText(file)
      return
    }

    await onSummarize(dataToSummarize, selectedModel)
  }

  const loadSampleData = () => {
    const sampleData = {
      hosts: [
        {
          ip: "192.168.1.100",
          location: { country: "US", city: "San Francisco" },
          services: [
            { port: 80, service: "http", banner: "nginx/1.20.1" },
            { port: 443, service: "https", banner: "nginx/1.20.1" }
          ],
          autonomous_system: { name: "Example Corp", asn: 12345 }
        },
        {
          ip: "10.0.0.50",
          location: { country: "CA", city: "Toronto" },
          services: [
            { port: 22, service: "ssh", banner: "OpenSSH_8.0" },
            { port: 3306, service: "mysql", banner: "MySQL 8.0.25" }
          ],
          autonomous_system: { name: "Test Networks", asn: 67890 }
        }
      ],
      metadata: {
        scan_date: "2024-01-15",
        total_hosts: 2,
        scan_type: "full_port_scan"
      }
    }
    setTextData(JSON.stringify(sampleData, null, 2))
    setInputMethod('text')
  }

  return (
    <div className="data-input">
      <div className="input-tabs">
        <button
          className={`tab ${inputMethod === 'text' ? 'active' : ''}`}
          onClick={() => setInputMethod('text')}
        >
          📝 Text Input
        </button>
        <button
          className={`tab ${inputMethod === 'file' ? 'active' : ''}`}
          onClick={() => setInputMethod('file')}
        >
          📁 File Upload
        </button>
      </div>

      <div className="model-selection">
        <label htmlFor="modelSelect">🤖 AI Model:</label>
        <select
          id="modelSelect"
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="model-select"
        >
          {availableModels.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
        <div className="model-description">
          {availableModels.find(m => m.value === selectedModel)?.description}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {inputMethod === 'text' && (
          <div className="text-input-section">
            <div className="input-header">
              <label htmlFor="textData">Paste your Censys data (JSON or text):</label>
              <button
                type="button"
                onClick={loadSampleData}
                className="sample-button"
              >
                Load Sample Data
              </button>
            </div>
            <textarea
              id="textData"
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
              placeholder="Paste your Censys host data here..."
              rows={12}
              className="data-textarea"
            />
          </div>
        )}

        {inputMethod === 'file' && (
          <div className="file-input-section">
            <label htmlFor="fileInput">Select a file (JSON, TXT, CSV):</label>
            <input
              id="fileInput"
              type="file"
              accept=".json,.txt,.csv"
              onChange={handleFileChange}
              className="file-input"
            />
            {file && (
              <div className="file-info">
                <span>📄 {file.name}</span>
                <span>({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="summarize-button"
        >
          {loading ? '🔄 Generating Summary...' : '🚀 Generate AI Summary'}
        </button>
      </form>
    </div>
  )
}

export default DataInput