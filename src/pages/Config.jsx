import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { api } from '../services/api';
import './Config.css';

const Config = () => {
  const { config, updateConfig } = useConfig();
  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(config.port);
  // Default to true if not set
  const [useProxy, setUseProxy] = useState(
    localStorage.getItem('useProxy') !== 'false' &&
    (localStorage.getItem('useProxy') === 'true' || !localStorage.getItem('useProxy'))
  );
  const [message, setMessage] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    updateConfig(host, port);
    localStorage.setItem('useProxy', useProxy.toString());
    setMessage('Configuration saved successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleReset = () => {
    setHost('localhost');
    setPort('8000');
    updateConfig('localhost', '8000');
    setMessage('Configuration reset to defaults');
    setTimeout(() => setMessage(null), 3000);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    // Temporarily update config for testing
    const tempConfig = { host, port, baseUrl: `http://${host}:${port}` };
    localStorage.setItem('apiConfig', JSON.stringify(tempConfig));

    try {
      const health = await api.getHealth();
      setTestResult({
        success: true,
        message: `Connection successful! Server is ${health.status}`,
        details: health
      });
    } catch (err) {
      const errorMsg = err.message.includes('Failed to fetch')
        ? 'Cannot reach server. Is it running?'
        : err.message;
      setTestResult({
        success: false,
        message: 'Connection failed',
        error: errorMsg,
        help: 'Make sure the FastAPI server is running at this address. Start it with: uvicorn server:app --reload'
      });
    } finally {
      setTesting(false);
      // Restore original config
      localStorage.setItem('apiConfig', JSON.stringify(config));
    }
  };

  return (
    <div className="config-page">
      <div className="page-header">
        <h1>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          API Configuration
        </h1>
      </div>

      <div className="config-card">
        <div className="card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
          <h2>Server Settings</h2>
        </div>

        <div className="config-form">
          <div className="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
              Host / IP Address
            </label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="localhost or IP address"
              className="config-input"
            />
            <small>Enter the hostname or IP address of the FastAPI server</small>
          </div>

          <div className="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Port
            </label>
            <input
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="8000"
              className="config-input"
            />
            <small>Enter the port number where the FastAPI server is running</small>
          </div>

          <div className="form-group proxy-option">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useProxy}
                onChange={(e) => setUseProxy(e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              <span>Use Vite Proxy (Bypass CORS)</span>
            </label>
            <small>Enable this if you're getting CORS errors. The backend must be on localhost:8000</small>
          </div>

          <div className="current-config">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Current API URL
            </h3>
            <code>{useProxy ? '/api (via proxy to localhost:8000)' : `http://${host}:${port}`}</code>
          </div>

          <div className="button-group">
            <button onClick={handleSave} className="btn-save">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Configuration
            </button>
            <button onClick={testConnection} disabled={testing} className="btn-test">
              {testing ? (
                <>
                  <span className="spinner"></span>
                  Testing...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Test Connection
                </>
              )}
            </button>
            <button onClick={handleReset} className="btn-reset">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Reset to Defaults
            </button>
          </div>
        </div>

        {message && (
          <div className="message success-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {message}
          </div>
        )}

        {testResult && (
          <div className={`message ${testResult.success ? 'success-message' : 'error-message'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {testResult.success ? (
                <>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </>
              )}
            </svg>
            <div className="message-content">
              <span>{testResult.message}</span>
              {testResult.error && <div className="error-detail">{testResult.error}</div>}
              {testResult.help && <div className="help-text">{testResult.help}</div>}
              {testResult.details && (
                <div className="test-details">Database: {testResult.details.database}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="config-card">
        <div className="card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h2>Configuration Guide</h2>
        </div>
        <ul className="guide-list">
          <li>
            <span className="guide-label">Local Server</span>
            <span className="guide-value">Use <code>localhost</code> with port <code>8000</code></span>
          </li>
          <li>
            <span className="guide-label">Remote Server</span>
            <span className="guide-value">Enter the server's IP address (e.g., <code>192.168.1.100</code>)</span>
          </li>
          <li>
            <span className="guide-label">Custom Port</span>
            <span className="guide-value">If running on a different port, update accordingly</span>
          </li>
          <li>
            <span className="guide-label">Testing</span>
            <span className="guide-value">Use "Test Connection" to verify server accessibility</span>
          </li>
          <li>
            <span className="guide-label">Persistence</span>
            <span className="guide-value">Configuration is saved in browser local storage</span>
          </li>
        </ul>
      </div>

      <div className="examples-grid">
        <div className="example-card">
          <div className="example-icon local">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h4>Local Development</h4>
          <code>Host: localhost</code>
          <code>Port: 8000</code>
        </div>
        <div className="example-card">
          <div className="example-icon remote">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </div>
          <h4>Remote Server</h4>
          <code>Host: 192.168.1.100</code>
          <code>Port: 8000</code>
        </div>
        <div className="example-card">
          <div className="example-icon custom">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9" />
            </svg>
          </div>
          <h4>Custom Port</h4>
          <code>Host: localhost</code>
          <code>Port: 8080</code>
        </div>
      </div>
    </div>
  );
};

export default Config;
