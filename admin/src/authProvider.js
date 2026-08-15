// JWT auth against the DRF admin token endpoints.
const API = 'http://localhost:8000/api/admin'

export const authProvider = {
  login: async ({ username, password }) => {
    const res = await fetch(`${API}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Invalid username or password')
    const { access, refresh } = await res.json()
    localStorage.setItem('access', access)
    localStorage.setItem('refresh', refresh)
    localStorage.setItem('username', username)
  },
  logout: () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('username')
    return Promise.resolve()
  },
  checkAuth: () => (localStorage.getItem('access') ? Promise.resolve() : Promise.reject()),
  checkError: (error) => {
    if (error && (error.status === 401 || error.status === 403)) {
      localStorage.removeItem('access')
      return Promise.reject()
    }
    return Promise.resolve()
  },
  getPermissions: () => Promise.resolve(),
  getIdentity: () => Promise.resolve({ id: 'admin', fullName: localStorage.getItem('username') || 'Admin' }),
}
