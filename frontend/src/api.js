// Relative URL works in both environments:
// - Dev:        Vite proxy forwards /api → http://localhost:5000
// - Production: Vercel routes /api → serverless function
const BASE_URL = '/api';

const headers = () => ({
  'Content-Type': 'application/json',
  'x-user-id': 'admin',
});

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: headers(),
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Request failed: ${res.status}`);
  return json;
}

export const api = {
  getPeople: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/people${q ? `?${q}` : ''}`);
  },

  getEPRs: (personId) => request(`/epr?personId=${personId}`),

  getEPR: (id) => request(`/epr/${id}`),

  getSummary: (personId) => request(`/epr/summary/${personId}`),

  createEPR: (body) =>
    request('/epr', { method: 'POST', body: JSON.stringify(body) }),

  updateEPR: (id, body) =>
    request(`/epr/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};
