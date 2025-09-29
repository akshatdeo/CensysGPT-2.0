const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <div className="loading-text">
        <h3>🤖 AI is analyzing your data...</h3>
        <p>This may take a few moments while we generate insights.</p>
      </div>
    </div>
  )
}

export default LoadingSpinner