import ReactMarkdown from 'react-markdown'

const SummaryDisplay = ({ summary, metadata, onClear }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary).then(() => {
      alert('Summary copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy: ', err)
    })
  }

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `censys-summary-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="summary-display">
      <div className="summary-header">
        <h2>📊 AI-Generated Summary</h2>
        <div className="summary-actions">
          <button onClick={copyToClipboard} className="action-button">
            📋 Copy
          </button>
          <button onClick={downloadSummary} className="action-button">
            💾 Download
          </button>
          <button onClick={onClear} className="action-button clear">
            🗑️ Clear
          </button>
        </div>
      </div>

      {metadata && (
        <div className="summary-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Data Type:</span>
            <span className="metadata-value">{metadata.dataType}</span>
          </div>
          {metadata.recordCount && (
            <div className="metadata-item">
              <span className="metadata-label">Records Processed:</span>
              <span className="metadata-value">{metadata.recordCount}</span>
            </div>
          )}
          <div className="metadata-item">
            <span className="metadata-label">Processed At:</span>
            <span className="metadata-value">
              {new Date(metadata.processedAt).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="summary-content">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  )
}

export default SummaryDisplay