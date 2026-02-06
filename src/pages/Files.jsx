import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useConfig } from '../context/ConfigContext';
import './Files.css';

const Files = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: '', limit: 50, offset: 0 });
  const { config } = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    loadFiles();
  }, [filter, config]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFiles(filter);
      setFiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter({ ...filter, ...newFilter, offset: 0 });
  };

  const handlePagination = (direction) => {
    const newOffset = direction === 'next' ? filter.offset + filter.limit : Math.max(0, filter.offset - filter.limit);
    setFilter({ ...filter, offset: newOffset });
  };

  const viewFileDetails = (fileId) => {
    navigate(`/files/${fileId}`);
  };

  return (
    <div className="files-page">
      <div className="page-header">
        <h1>Files</h1>
      </div>

      <div className="filters-card">
        <div className="filter-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Status
          </label>
          <select
            value={filter.status}
            onChange={(e) => handleFilterChange({ status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
            Per Page
          </label>
          <select
            value={filter.limit}
            onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
          >
            <option value="25">25 items</option>
            <option value="50">50 items</option>
            <option value="100">100 items</option>
          </select>
        </div>

        <button onClick={loadFiles} className="btn-refresh-table">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>

      {loading && <div className="loading">Loading files...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          <div className="table-card">
            <table className="files-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Filename</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-table">
                      <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <p>No files found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr key={file.id}>
                      <td className="id-cell">{file.id}</td>
                      <td className="filename-cell">{file.filename}</td>
                      <td><span className="type-badge">{file.file_type}</span></td>
                      <td className="size-cell">{formatBytes(file.file_size)}</td>
                      <td>
                        <span className={`status-badge ${file.status}`}>
                          {file.status}
                        </span>
                      </td>
                      <td className="date-cell">{new Date(file.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => viewFileDetails(file.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-card">
            <button
              onClick={() => handlePagination('prev')}
              disabled={filter.offset === 0}
              className="btn-pagination"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Previous
            </button>
            <span className="pagination-info">
              Showing {filter.offset + 1} - {filter.offset + files.length}
            </span>
            <button
              onClick={() => handlePagination('next')}
              disabled={files.length < filter.limit}
              className="btn-pagination"
            >
              Next
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default Files;
