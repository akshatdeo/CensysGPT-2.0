import { useState } from 'react'
import DataInput from './components/DataInput'
import SummaryDisplay from './components/SummaryDisplay'
import LoadingSpinner from './components/LoadingSpinner'
import './App.css'

const API_BASE_URL = 'http://localhost:3001'

function App() {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [metadata, setMetadata] = useState(null)
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')

  const handleSummarize = async (data, model) => {
    setLoading(true)
    setError('')
    setSummary('')
    setMetadata(null)

    try {
      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, model }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate summary')
      }

      const result = await response.json()
      setSummary(result.summary)
      setMetadata(result.metadata)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSummary('')
    setError('')
    setMetadata(null)
  }

  const handleModelChange = (model) => {
    setSelectedModel(model)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔍 Censys AI Data Summarizer</h1>
        <p>Upload or paste your Censys host data to generate AI-powered insights</p>
      </header>

      <main className="app-main">
        <DataInput
          onSummarize={handleSummarize}
          loading={loading}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />

        {loading && <LoadingSpinner />}

        {error && (
          <div className="error-display">
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}

        {summary && (
          <SummaryDisplay
            summary={summary}
            metadata={metadata}
            onClear={handleClear}
          />
        )}
      </main>
    </div>
  )
}

export default App
