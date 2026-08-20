const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ApiClientError extends Error {
  constructor(message, status, details = undefined) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new ApiClientError(
      'Network error: Unable to connect to server. Please check if the back-end is running on port 4000.',
      0
    );
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const errorMsg = body?.error?.message || `Request failed with status ${res.status}`;
    const errorDetails = body?.error?.details || null;
    throw new ApiClientError(errorMsg, res.status, errorDetails);
  }

  return body;
}

export const api = {                                  //obj 
  getListings: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    return request(`/listings${qs ? `?${qs}` : ''}`);
  },
  getListing: (id) => request(`/listings/${id}`),
  createListing: (payload) =>
    request('/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteListing: (id) =>
    request(`/listings/${id}`, {
      method: 'DELETE',
    }),
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (username, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  getMe: () => request('/auth/me'),
};