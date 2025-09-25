import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HealthPage() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        setBackendStatus('online');
        setErrorMessage('');
      } else {
        setBackendStatus('offline');
        setErrorMessage('Backend responded with error status');
      }
    } catch {
      setBackendStatus('offline');
      setErrorMessage('Cannot connect to backend server');
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    // Check immediately on mount
    checkBackendHealth();

    // Set up interval to check every 5 seconds
    const interval = setInterval(checkBackendHealth, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleBackClick = () => {
    navigate('/');
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online':
        return 'status-online';
      case 'offline':
        return 'status-offline';
      case 'checking':
        return 'status-checking';
      default:
        return 'status-unknown';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'online':
        return 'Backend is Online';
      case 'offline':
        return 'Backend is Offline';
      case 'checking':
        return 'Checking Backend Status...';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'online':
        return '🟢';
      case 'offline':
        return '🔴';
      case 'checking':
        return '🟡';
      default:
        return '⚪';
    }
  };

  return (
    <div className="page-container" data-testid="health-page">
      <div className="page-content">
        <h1 className="page-title" data-testid="health-title">Backend Health Monitor</h1>

        <main role="main" aria-label="Backend Health Monitoring Page" data-testid="health-main">
          <div 
            className="status-section"
            role="status"
            aria-live="polite"
            aria-label="Backend connection status"
            data-testid="health-status"
          >
            <div className="status-indicator">
              <span 
                className={`status-icon ${getStatusColor()}`}
                role="img"
                aria-label={`Status: ${getStatusText()}`}
                data-testid="status-icon"
              >
                {getStatusIcon()}
              </span>
              <span 
                className={`status-text ${getStatusColor()}`}
                role="text"
                data-testid="status-text"
              >
                {getStatusText()}
              </span>
            </div>

            {errorMessage && (
              <div 
                className="error-message"
                role="alert"
                aria-label="Error details"
                data-testid="health-error"
              >
                <span className="error-icon">⚠️</span>
                <span className="error-text">{errorMessage}</span>
              </div>
            )}

            {lastChecked && (
              <div 
                className="last-checked"
                role="text"
                aria-label="Last status check time"
                data-testid="last-checked"
              >
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="health-info">
            <h2 
              role="heading" 
              aria-level="2"
              className="info-title"
            >
              What this means:
            </h2>
            <ul 
              role="list"
              className="info-list"
            >
              <li role="listitem">
                <span role="text">🟢 Online: Backend is running and responding to requests</span>
              </li>
              <li role="listitem">
                <span role="text">🔴 Offline: Backend is not accessible or has stopped responding</span>
              </li>
              <li role="listitem">
                <span role="text">🟡 Checking: Currently verifying backend status</span>
              </li>
            </ul>
          </div>

          <button
            role="button"
            aria-label="Go back to home page"
            onClick={handleBackClick}
            className="back-button"
            data-testid="health-back"
          >
            ← Back to Home
          </button>
        </main>
      </div>
    </div>
  );
}

export default HealthPage;
