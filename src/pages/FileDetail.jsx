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

  // Smart content formatter
  const formatContentForDisplay = (text, contentType, index, maxChars = 2000) => {
    if (!text) return null;

    const isExpanded = expandedContent[index];
    const displayText = isExpanded || text.length <= maxChars ? text : text.substring(0, maxChars);

    // Try to detect and format the content type
    const formattedContent = detectAndFormatContent(displayText, contentType);

    return formattedContent;
  };

  // Detect content type and format accordingly
  const detectAndFormatContent = (text, contentType) => {
    // Replace literal \n with actual line breaks first
    let processedText = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

    // Try JSON formatting
    if (contentType?.includes('json') || isValidJSON(processedText)) {
      return formatJSON(processedText);
    }

    // Try CSV formatting
    if (contentType?.includes('csv') || isCSVLike(processedText)) {
      return formatCSV(processedText);
    }

    // Check for credential format (email:password or user:pass)
    if (isCredentialFormat(processedText)) {
      return formatCredentials(processedText);
    }

    // Check for key:value format
    if (isKeyValueFormat(processedText)) {
      return formatKeyValue(processedText);
    }

    // Default: format as plain text with proper line breaks
    return formatPlainText(processedText);
  };

  // Check if text is valid JSON
  const isValidJSON = (text) => {
    try {
      const trimmed = text.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        JSON.parse(trimmed);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  // Format JSON content
  const formatJSON = (text) => {
    try {
      const parsed = JSON.parse(text.trim());
      return (
        <div className="formatted-json">
          <div className="format-badge json-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 16V4H8v12h12z M4 8v12h12" />
            </svg>
            JSON
          </div>
          <div className="json-content">
            {renderJSONValue(parsed, 0)}
          </div>
        </div>
      );
    } catch (e) {
      return formatPlainText(text);
    }
  };

  // Render JSON value recursively
  const renderJSONValue = (value, depth = 0) => {
    if (value === null) return <span className="json-null">null</span>;
    if (typeof value === 'boolean') return <span className="json-boolean">{value.toString()}</span>;
    if (typeof value === 'number') return <span className="json-number">{value}</span>;
    if (typeof value === 'string') return <span className="json-string">"{value}"</span>;

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="json-bracket">[]</span>;
      return (
        <div className="json-array" style={{ marginLeft: depth > 0 ? '1rem' : 0 }}>
          <span className="json-bracket">[</span>
          {value.map((item, i) => (
            <div key={i} className="json-array-item">
              {renderJSONValue(item, depth + 1)}
              {i < value.length - 1 && <span className="json-comma">,</span>}
            </div>
          ))}
          <span className="json-bracket">]</span>
        </div>
      );
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) return <span className="json-bracket">{'{}'}</span>;
      return (
        <div className="json-object" style={{ marginLeft: depth > 0 ? '1rem' : 0 }}>
          <span className="json-bracket">{'{'}</span>
          {entries.map(([key, val], i) => (
            <div key={key} className="json-property">
              <span className="json-key">"{key}"</span>
              <span className="json-colon">: </span>
              {renderJSONValue(val, depth + 1)}
              {i < entries.length - 1 && <span className="json-comma">,</span>}
            </div>
          ))}
          <span className="json-bracket">{'}'}</span>
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  // Detect the best delimiter for CSV-like data
  const detectDelimiter = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 1) return null;

    const firstLine = lines[0];
    const delimiters = [
      { char: ',', name: 'comma' },
      { char: ';', name: 'semicolon' },
      { char: '\t', name: 'tab' },
      { char: '|', name: 'pipe' }
    ];

    let bestDelimiter = null;
    let maxCount = 0;

    for (const del of delimiters) {
      const count = (firstLine.match(new RegExp(del.char === '|' ? '\\|' : del.char, 'g')) || []).length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = del.char;
      }
    }

    // Need at least 2 columns
    return maxCount >= 1 ? bestDelimiter : null;
  };

  // Check if text is CSV-like
  const isCSVLike = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return false;

    const delimiter = detectDelimiter(text);
    if (!delimiter) return false;

    const delimRegex = new RegExp(delimiter === '|' ? '\\|' : delimiter, 'g');
    const firstLineCount = (lines[0].match(delimRegex) || []).length;
    const secondLineCount = (lines[1].match(delimRegex) || []).length;

    // Similar column counts across lines
    return firstLineCount >= 1 && Math.abs(firstLineCount - secondLineCount) <= 2;
  };

  // Parse a CSV line with the given delimiter
  const parseCSVLine = (line, delimiter) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Format CSV content as a paginated table
  const formatCSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return formatPlainText(text);

    const delimiter = detectDelimiter(text) || ',';
    const allRows = lines.map(line => parseCSVLine(line, delimiter));

    // Determine max columns
    const maxCols = Math.max(...allRows.map(r => r.length));

    // Normalize rows to have same column count
    const normalizedRows = allRows.map(row => {
      while (row.length < maxCols) row.push('');
      return row;
    });

    const headers = normalizedRows[0];
    const dataRows = normalizedRows.slice(1);

    // Return paginated table component
    return <PaginatedCSVTable headers={headers} dataRows={dataRows} />;
  };

  // Paginated CSV Table Component
  const PaginatedCSVTable = ({ headers, dataRows }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 50;

    const totalPages = Math.ceil(dataRows.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentRows = dataRows.slice(startIndex, endIndex);

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

    return (
      <div className="formatted-csv">
        <div className="format-badge csv-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
          TABLE DATA ({dataRows.length} rows × {headers.length} cols)
        </div>

        {/* Pagination Controls - Top */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ««
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              «
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages} • Rows {startIndex + 1}-{Math.min(endIndex, dataRows.length)} of {dataRows.length}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              »
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              »»
            </button>
          </div>
        )}

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="row-num">#</th>
                {headers.map((h, i) => (
                  <th key={i} title={h}>{h || `Col ${i + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="row-num">{startIndex + rowIndex + 1}</td>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} title={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Bottom */}
        {totalPages > 1 && (
          <div className="pagination-controls pagination-bottom">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ««
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              «
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              »
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              »»
            </button>
          </div>
        )}
      </div>
    );
  };

  // Check if text is credential format (email:password, user:pass)
  const isCredentialFormat = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 1) return false;
    const credPattern = /^[^\s:]+:[^\s:]+$/;
    const matchCount = lines.filter(l => credPattern.test(l.trim())).length;
    return matchCount > lines.length * 0.5; // More than 50% match
  };

  // Format credentials as a structured list
  const formatCredentials = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    const credentials = lines.map(line => {
      const parts = line.trim().split(':');
      if (parts.length >= 2) {
        return {
          identifier: parts[0],
          secret: parts.slice(1).join(':')
        };
      }
      return { identifier: line, secret: '' };
    }).filter(c => c.identifier);

    return (
      <div className="formatted-credentials">
        <div className="format-badge cred-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          CREDENTIALS ({credentials.length} entries)
        </div>
        <div className="credentials-list">
          {credentials.map((cred, i) => (
            <div key={i} className="credential-item">
              <span className="cred-index">{i + 1}</span>
              <div className="cred-data">
                <span className="cred-identifier">{cred.identifier}</span>
                {cred.secret && (
                  <>
                    <span className="cred-separator">:</span>
                    <span className="cred-secret">{cred.secret}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Check for key:value format
  const isKeyValueFormat = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return false;
    const kvPattern = /^["']?[\w\s_-]+["']?\s*[:=]\s*.+/;
    const matchCount = lines.filter(l => kvPattern.test(l.trim())).length;
    return matchCount > lines.length * 0.6;
  };

  // Format key:value pairs
  const formatKeyValue = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    const pairs = lines.map(line => {
      const match = line.match(/^["']?([\w\s_-]+)["']?\s*[:=]\s*(.+)/);
      if (match) {
        return { key: match[1].trim(), value: match[2].trim() };
      }
      return null;
    }).filter(Boolean);

    return (
      <div className="formatted-keyvalue">
        <div className="format-badge kv-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="16" y1="3" x2="16" y2="21" />
            <line x1="8" y1="3" x2="8" y2="21" />
            <line x1="3" y1="8" x2="21" y2="8" />
            <line x1="3" y1="16" x2="21" y2="16" />
          </svg>
          STRUCTURED DATA ({pairs.length} fields)
        </div>
        <div className="keyvalue-list">
          {pairs.map((pair, i) => (
            <div key={i} className="kv-item">
              <span className="kv-key">{pair.key}</span>
              <span className="kv-value">{pair.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Format plain text with proper line breaks
  const formatPlainText = (text) => {
    const lines = text.split('\n');

    return (
      <div className="formatted-text">
        <div className="format-badge text-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="17" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
          TEXT CONTENT ({lines.length} lines)
        </div>
        <div className="text-content">
          {lines.map((line, i) => (
            <div key={i} className="text-line">
              <span className="line-number">{i + 1}</span>
              <span className="line-content">{line || '\u00A0'}</span>
            </div>
          ))}
        </div>
      </div>
    );
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


      {/* File Information section hidden per user request */}
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
              {/* Content metadata hidden per user request */}
              <div className="content-text">
                {formatContentForDisplay(c.content, c.content_type, index)}
                {c.content.length > 2000 && !expandedContent[index] && (
                  <div className="content-truncated">
                    Content truncated...
                  </div>
                )}
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
