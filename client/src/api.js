const API = "https://mernloginjwtmail-1.onrender.com";

export async function apiFetch(path, opts = {}) {
  const headers = opts.headers || {};
  if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  return res.json();
}
