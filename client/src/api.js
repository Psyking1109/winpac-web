// Small fetch wrapper. The custom header lets the server reject cross-site requests.
const PREVIEW = !!import.meta.env.VITE_PREVIEW;
let mock = null;
async function request(method, url, body, isForm) {
  if (PREVIEW) { mock = mock || await import("./preview/mockApi.js"); return mock.mockRequest(method, url, body); }
  const headers = { "X-Requested-With": "winpac" };
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  const res = await fetch(url, { method, headers, credentials: "same-origin", body: body === undefined ? undefined : isForm ? body : JSON.stringify(body) });
  let data = null;
  try { data = await res.json(); } catch (e) { /* empty */ }
  if (!res.ok) { const err = new Error((data && data.error) || `Request failed (${res.status})`); err.status = res.status; throw err; }
  return data;
}
export const api = {
  get: url => request("GET", url),
  post: (url, body) => request("POST", url, body),
  put: (url, body) => request("PUT", url, body),
  del: url => request("DELETE", url),
  async upload(blob, name) { if (PREVIEW) { mock = mock || await import("./preview/mockApi.js"); return mock.mockUpload(blob); } const f = new FormData(); f.append("file", blob, name); return request("POST", "/api/admin/uploads", f, true); }
};
