// Minimal react-admin data provider for our DRF admin API.
// Handles DRF pagination ({count, results}), JWT auth, and multipart image upload.
const API = 'http://localhost:8000/api/admin'

const token = () => localStorage.getItem('access')

async function http(url, opts = {}) {
  const headers = { ...(opts.headers || {}) }
  const t = token()
  if (t) headers.Authorization = `Bearer ${t}`
  const res = await fetch(url, { ...opts, headers })
  if (res.status === 204) return null
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = body.detail || JSON.stringify(body)
    return Promise.reject({ message: msg, status: res.status, body })
  }
  return body
}

// Build a request body: multipart when a File is present, else JSON.
// Skips image fields that hold an existing URL/object (no new upload) so we
// don't clobber the stored image with a string.
function buildBody(data) {
  const isImageObj = (v) => v && typeof v === 'object' && ('rawFile' in v || 'src' in v)
  const hasFile = Object.values(data).some((v) => isImageObj(v) && v.rawFile instanceof File)

  if (!hasFile) {
    const clean = {}
    for (const [k, v] of Object.entries(data)) {
      if (isImageObj(v)) continue // no new file → leave image untouched
      if (v !== undefined) clean[k] = v
    }
    return { body: JSON.stringify(clean), headers: { 'Content-Type': 'application/json' } }
  }
  const fd = new FormData()
  for (const [k, v] of Object.entries(data)) {
    if (isImageObj(v)) {
      if (v.rawFile instanceof File) fd.append(k, v.rawFile)
    } else if (v !== undefined && v !== null) {
      fd.append(k, v)
    }
  }
  return { body: fd, headers: {} } // let browser set multipart boundary
}

export const dataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination
    const { field, order } = params.sort || {}
    const q = new URLSearchParams({ page, page_size: perPage })
    if (field) q.set('ordering', (order === 'DESC' ? '-' : '') + field)
    if (params.filter && params.filter.q) q.set('search', params.filter.q)
    const data = await http(`${API}/${resource}/?${q}`)
    return { data: data.results, total: data.count }
  },
  getOne: async (resource, params) => ({ data: await http(`${API}/${resource}/${params.id}/`) }),
  getMany: async (resource, params) => {
    const rows = await Promise.all(params.ids.map((id) => http(`${API}/${resource}/${id}/`)))
    return { data: rows }
  },
  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination
    const q = new URLSearchParams({ page, page_size: perPage, [params.target]: params.id })
    const data = await http(`${API}/${resource}/?${q}`)
    return { data: data.results, total: data.count }
  },
  create: async (resource, params) => {
    const { body, headers } = buildBody(params.data)
    return { data: await http(`${API}/${resource}/`, { method: 'POST', body, headers }) }
  },
  update: async (resource, params) => {
    const { body, headers } = buildBody(params.data)
    return { data: await http(`${API}/${resource}/${params.id}/`, { method: 'PATCH', body, headers }) }
  },
  updateMany: async (resource, params) => {
    await Promise.all(params.ids.map((id) => {
      const { body, headers } = buildBody(params.data)
      return http(`${API}/${resource}/${id}/`, { method: 'PATCH', body, headers })
    }))
    return { data: params.ids }
  },
  delete: async (resource, params) => {
    await http(`${API}/${resource}/${params.id}/`, { method: 'DELETE' })
    return { data: params.previousData || { id: params.id } }
  },
  deleteMany: async (resource, params) => {
    await Promise.all(params.ids.map((id) => http(`${API}/${resource}/${id}/`, { method: 'DELETE' })))
    return { data: params.ids }
  },
}
