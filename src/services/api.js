// API Service for Parser Engine

const getBaseUrl = () => {
  const config = JSON.parse(localStorage.getItem('apiConfig') || '{}');
  const useProxy = localStorage.getItem('useProxy') === 'true';
  
  // If using Vite proxy, use relative URLs
  if (useProxy) {
    return '/api';
  }
  
  return config.baseUrl || 'http://10.66.52.73:8000';
};

const getFetchOptions = (method = 'GET', body = null) => {
  const useProxy = localStorage.getItem('useProxy') === 'true';
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };
  
  // Only add CORS options if NOT using proxy
  if (!useProxy) {
    options.mode = 'cors';
    options.credentials = 'omit';
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return options;
};

const handleResponse = async (response) => {
  console.log('API Response:', response.status, response.statusText);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    console.error('API Error:', error);
    throw new Error(error.detail || error.error || 'Request failed');
  }
  
  const data = await response.json();
  console.log('API Data:', data);
  return data;
};

export const api = {
  // Health and Info
  async getHealth() {
    console.log('Fetching health from:', `${getBaseUrl()}/health`);
    const response = await fetch(`${getBaseUrl()}/health`, getFetchOptions());
    return handleResponse(response);
  },

  async getRoot() {
    const response = await fetch(`${getBaseUrl()}/`, getFetchOptions());
    return handleResponse(response);
  },

  // Statistics
  async getStats() {
    console.log('Fetching stats from:', `${getBaseUrl()}/stats`);
    const response = await fetch(`${getBaseUrl()}/stats`, getFetchOptions());
    return handleResponse(response);
  },

  // Files
  async getFiles(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    
    const response = await fetch(`${getBaseUrl()}/files?${queryParams}`, getFetchOptions());
    return handleResponse(response);
  },

  async getFile(id) {
    const response = await fetch(`${getBaseUrl()}/files/${id}`, getFetchOptions());
    return handleResponse(response);
  },

  async getFileContent(id) {
    const response = await fetch(`${getBaseUrl()}/files/${id}/content`, getFetchOptions());
    return handleResponse(response);
  },

  async getFilesByStatus(status, limit = 100) {
    const response = await fetch(`${getBaseUrl()}/files/by-status/${status}?limit=${limit}`, getFetchOptions());
    return handleResponse(response);
  },

  async getFilesByType(fileType, limit = 100) {
    const type = fileType.startsWith('.') ? fileType.substring(1) : fileType;
    const response = await fetch(`${getBaseUrl()}/files/by-type/${type}?limit=${limit}`, getFetchOptions());
    return handleResponse(response);
  },

  // Search
  async search(query, limit = 100) {
    const queryParams = new URLSearchParams({ query, limit });
    const response = await fetch(`${getBaseUrl()}/search?${queryParams}`, getFetchOptions());
    return handleResponse(response);
  },

  // Archives
  async getArchiveFiles(archiveId) {
    const response = await fetch(`${getBaseUrl()}/archives/${archiveId}/files`, getFetchOptions());
    return handleResponse(response);
  },

  // Processing
  async processAll() {
    const response = await fetch(`${getBaseUrl()}/process/all`, getFetchOptions('POST'));
    return handleResponse(response);
  },

  async processNew() {
    const response = await fetch(`${getBaseUrl()}/process/new`, getFetchOptions('POST'));
    return handleResponse(response);
  },
};
