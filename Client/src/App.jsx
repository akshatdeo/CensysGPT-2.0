import { useState, useEffect } from 'react'
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
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

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
        <div className="header-top">
          <h1>🔍 CensysGPT 2.0 Beta</h1>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <p style={{ marginTop: '0.5rem' }}>CensysGPT beta simplifies building queries and empowers users to conduct efficient and effective reconnaissance operations. The tool enables users to quickly and easily gain insights into hosts on the internet, streamlining the process and allowing for more proactive threat hunting and attack surface management.</p>
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

      <footer className="app-footer">
        <p>Built with React and GitHub Models API | CensysGPT 2.0 Beta | Built by Akshat Deo</p>
      </footer>
    </div>
  )
}

export default App
