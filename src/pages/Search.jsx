import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Search.css';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await api.search(query, 100);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewFileDetails = (fileId) => {
    navigate(`/details/${fileId}`);
  };

  return (
    <div className="search-page">
      {/* Decorative Elements */}
      <div className="deco-orb deco-orb-1"></div>
      <div className="deco-orb deco-orb-2"></div>
      <div className="deco-orb deco-orb-3"></div>

      {/* Hero Section */}
      <div className="search-hero">
        <div className="hero-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Secure Credential Analysis
        </div>
        <h1>Discover Your Data</h1>
        <p className="page-subtitle">
          Search through credentials, files, and sensitive data with powerful full-text analysis
        </p>
      </div>

      {/* Search Form */}
      <div className="search-form-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username, email, password, domain..."
              className="search-input"
            />
            {query && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setQuery('')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <button type="submit" className="btn-search" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search
              </>
            )}
          </button>
        </form>

        {/* Quick Tips */}
        <div className="search-tips">
          <span className="tip-label">Quick search:</span>
          <div className="tip-tags">
            <button type="button" className="tip-tag" onClick={() => setQuery('@gmail.com')}>@gmail.com</button>
            <button type="button" className="tip-tag" onClick={() => setQuery('admin')}>admin</button>
            <button type="button" className="tip-tag" onClick={() => setQuery('password123')}>password123</button>
          </div>
        </div>
      </div>

      {error && <div className="error">Error: {error}</div>}

      {searched && !loading && (
        <div className="search-results">
          <div className="results-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Analysis Results
            </h2>
            <span className="results-count">{results.length} matches</span>
          </div>
          {results.length === 0 ? (
            <div className="no-results">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <p>No credentials found for "<strong>{query}</strong>"</p>
              <span>Try different keywords or check your search terms</span>
            </div>
          ) : (
            <div className="results-list">
              {results.map((result) => (
                <div key={result.id} className="result-card">
                  <div className="result-header">
                    <div className="result-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <h3>{result.filename}</h3>
                    </div>
                    <span className="type-badge">{result.file_type}</span>
                  </div>
                  <div className="result-meta">
                    <span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Record #{result.id}
                    </span>
                    <span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      {result.mime_type}
                    </span>
                  </div>
                  {result.content_preview && (
                    <div className="result-preview">
                      <p>{result.content_preview}</p>
                    </div>
                  )}
                  <button
                    onClick={() => viewFileDetails(result.id)}
                    className="btn-view-result"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    View Full Record
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
