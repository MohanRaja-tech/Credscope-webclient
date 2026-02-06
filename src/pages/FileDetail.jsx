import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import './FileDetail.css';

const FileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedContent, setExpandedContent] = useState({});

  // Determine if we're in user or admin context
  const isAdminRoute = location.pathname.startsWith('/admin');
  const backRoute = isAdminRoute ? '/admin/files' : '/';

  useEffect(() => {
    loadFileDetail();
  }, [id]);

  const loadFileDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFile(id);
      setFileData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading file details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!fileData) return <div className="error">File not found</div>;

  const { file, content } = fileData;

  const toggleContentExpansion = (index) => {
    setExpandedContent(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatContentForDisplay = (text, index, maxChars = 2000) => {
    if (!text) return '';
    
    const isExpanded = expandedContent[index];
    
    if (isExpanded || text.length <= maxChars) {
      return text;
    }
    
    return text.substring(0, maxChars);
  };

  return (
    <div className="file-detail">
      <button onClick={() => navigate(backRoute)} className="btn-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {isAdminRoute ? 'Back to Files' : 'Back to Search'}
      </button>

      <div className="page-header">
        <h1>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          File Details
        </h1>
      </div>

      <div className="detail-card">
        <div className="card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <h2>File Information</h2>
        </div>
        <div className="detail-grid">
          <div className="detail-row">
            <span className="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              ID
            </span>
            <span className="detail-value mono">{file.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Filename
            </span>
            <span className="detail-value mono">{file.filename}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Path
            </span>
            <span className="detail-value mono path">{file.file_path}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              Type
            </span>
            <span className="detail-value">
              <span className="type-badge">{file.file_type}</span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              MIME Type
            </span>
            <span className="detail-value mono">{file.mime_type}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="21" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="21" y1="18" x2="3" y2="18" />
              </svg>
              Size
            </span>
            <span className="detail-value">{formatBytes(file.file_size)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Status
            </span>
            <span className="detail-value">
              <span className={`status-badge ${file.status}`}>{file.status}</span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Created
            </span>
            <span className="detail-value">{new Date(file.created_at).toLocaleString()}</span>
          </div>
          {file.processed_at && (
            <div className="detail-row">
              <span className="detail-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Processed
              </span>
              <span className="detail-value">{new Date(file.processed_at).toLocaleString()}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" />
              </svg>
              From Archive
            </span>
            <span className="detail-value">
              {file.is_from_archive ? (
                <span className="badge-yes">Yes</span>
              ) : (
                <span className="badge-no">No</span>
              )}
            </span>
          </div>
          {file.parent_archive_id && (
            <div className="detail-row">
              <span className="detail-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
                Parent Archive
              </span>
              <span className="detail-value mono">{file.parent_archive_id}</span>
            </div>
          )}
        </div>
      </div>

      {content && content.length > 0 && (
        <div className="detail-card content-card">
          <div className="card-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h2>Content</h2>
          </div>
          {content.map((c, index) => (
            <div key={index} className="content-section">
              <div className="content-meta">
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  {c.content_type}
                </span>
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  {c.word_count} words
                </span>
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="9" x2="20" y2="9" />
                    <line x1="4" y1="15" x2="20" y2="15" />
                    <line x1="10" y1="3" x2="8" y2="21" />
                    <line x1="16" y1="3" x2="14" y2="21" />
                  </svg>
                  {c.char_count} chars
                </span>
              </div>
              <div className="content-text">
                <pre>
                  {formatContentForDisplay(c.content, index)}
                  {c.content.length > 2000 && !expandedContent[index] && '...'}
                </pre>
              </div>
              {c.content.length > 2000 && (
                <button
                  onClick={() => toggleContentExpansion(index)}
                  className="btn-toggle"
                >
                  {expandedContent[index] ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                      Show Less
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                      Show Full Content ({formatBytes(c.char_count)})
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default FileDetail;
