export interface StatePayload {
    bookmarks: any[];
    categories: any[];
    adminPassword: string;
}

const BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:3001/api').replace(/\/$/, '');

export async function getState(): Promise<StatePayload> {
    const res = await fetch(`${BASE}/state`);
    if (!res.ok) throw new Error('Failed to fetch state');
    return res.json();
}

export async function addOrUpdateBookmark(b: any) {
    const res = await fetch(`${BASE}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b)
    });
    if (!res.ok) throw new Error('Failed to save bookmark');
    return res.json();
}

export async function deleteBookmark(id: string) {
    const res = await fetch(`${BASE}/bookmarks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete bookmark');
    return res.json();
}

export async function addCategory(cat: any) {
    const res = await fetch(`${BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat)
    });
    if (!res.ok) throw new Error('Failed to add category');
    return res.json();
}

export async function deleteCategory(id: string) {
    const res = await fetch(`${BASE}/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
}

export async function updatePassword(password: string) {
    const res = await fetch(`${BASE}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    if (!res.ok) throw new Error('Failed to update password');
    return res.json();
}

export async function exportData(): Promise<StatePayload> {
    const res = await fetch(`${BASE}/export`);
    if (!res.ok) throw new Error('Failed to export');
    return res.json();
}

export async function importData(payload: StatePayload) {
    const res = await fetch(`${BASE}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to import');
    return res.json();
}
