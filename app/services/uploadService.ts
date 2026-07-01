/**
 * UploadService - Handles file uploads
 */
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const API_KEY = String(process.env.NEXT_PUBLIC_BACKEND_API_KEY || "");

export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string; markdown: string; filename: string }> {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (API_KEY) headers["x-api-key"] = API_KEY;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload/image`, { method: "POST", headers, body: formData });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Upload failed");
    return res.json();
  },

  async uploadImages(files: File[]): Promise<{ url: string; markdown: string; filename: string }[]> {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));

    const headers: Record<string, string> = {};
    if (API_KEY) headers["x-api-key"] = API_KEY;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload/images`, { method: "POST", headers, body: formData });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Upload failed");
    return res.json();
  },
};
