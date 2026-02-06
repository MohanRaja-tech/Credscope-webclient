import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useConfig } from '../context/ConfigContext';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { config } = useConfig();

  useEffect(() => {
    loadDashboardData();
  }, [config]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, healthData] = await Promise.all([
        api.getStats(),
        api.getHealth()
      ]);
      setStats(statsData);
      setHealth(healthData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2>Connection Error</h2>
        <p className="error-message">{error}</p>
        <div className="error-help">
          <h4>Troubleshooting</h4>
          <ul>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Start server: <code>uvicorn server:app --reload</code>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3" />
              </svg>
              Check Config page settings
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
              Current URL: <code>{config.baseUrl}</code>
            </li>
          </ul>
        </div>
        <button onClick={loadDashboardData} className="btn-retry">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <button className="btn-refresh" onClick={loadDashboardData}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card status-card">
          <div className="stat-icon status-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Server Status</h3>
            <div className="status-indicator">
              <span className={`status-dot ${health?.status === 'healthy' ? 'healthy' : 'unhealthy'}`}></span>
              <span className="status-text">{health?.status || 'Unknown'}</span>
            </div>
            <p className="status-meta">
              <span>Database: {health?.database}</span>
              <span>Last: {new Date(health?.timestamp).toLocaleTimeString()}</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon files-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Files</h3>
            <div className="stat-number">{stats?.total_files || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon archive-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Archives</h3>
            <div className="stat-number">{stats?.files_from_archives || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon size-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Size</h3>
            <div className="stat-number">{formatBytes(stats?.total_size || 0)}</div>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            <h3>Files by Status</h3>
          </div>
          <div className="stat-list">
            {stats?.by_status && Object.entries(stats.by_status).map(([status, count]) => (
              <div key={status} className="stat-row">
                <span className={`status-badge ${status}`}>{status}</span>
                <span className="stat-value">{count}</span>
              </div>
            ))}
            {(!stats?.by_status || Object.keys(stats.by_status).length === 0) && (
              <div className="empty-state">No status data available</div>
            )}
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h3>Files by Type</h3>
          </div>
          <div className="stat-list">
            {stats?.by_type && Object.entries(stats.by_type).map(([type, count]) => (
              <div key={type} className="stat-row">
                <span className="type-badge">{type}</span>
                <span className="stat-value">{count}</span>
              </div>
            ))}
            {(!stats?.by_type || Object.keys(stats.by_type).length === 0) && (
              <div className="empty-state">No type data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default Dashboard;
