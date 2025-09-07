import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

export default function Dashboard(){
  const { user, token, logout } = useAuth();
  const [files,setFiles]=useState([]);
  const [err,setErr]=useState('');
  const [creating,setCreating]=useState(false);
  const [shareInfo,setShareInfo]=useState(null);

  async function load(){
    try{
      const data = await api('/api/files',{token});
      setFiles(data);
    }catch(e){ setErr(e.message); }
  }
  useEffect(()=>{ load(); },[]);

  async function onUpload(e){
    const f = e.target.files?.[0];
    if(!f) return;
    setErr('');
    const fd = new FormData();
    fd.append('file', f);
    try{
      await api('/api/files/upload',{method:'POST',token,formData:fd});
      await load();
    }catch(e){ setErr(e.message); }
  }

  async function createShare(id){
    setCreating(true); setErr(''); setShareInfo(null);
    try{
      const result = await api(`/api/share/${id}`,{
        method:'POST',
        token,
        body:{ expiresInHours: 1, maxDownloads: 3, password: 'abc123' }
      });
      setShareInfo({ path: result.link, token: result.token, expiresAt: result.expires_at });
    }catch(e){ setErr(e.message); }
    finally{ setCreating(false); }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">SkyShare</h1>
        <div className="text-sm">Hello, <b>{user?.name || user?.email}</b> <button className="ml-3 text-blue-600" onClick={logout}>Logout</button></div>
      </header>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-2">Upload a file</h2>
        <input type="file" onChange={onUpload} />
        <p className="text-xs text-slate-500 mt-1">Links default to 1 hour expiry, max 3 downloads, password: <code>abc123</code></p>
      </section>

      {err && <div className="bg-red-50 text-red-700 p-2 rounded">{err}</div>}

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">Your files</h2>
        {files.length===0 && <p className="text-sm text-slate-500">No files yet. Upload above.</p>}
        <ul className="space-y-2">
          {files.map(f=>(
            <li key={f.id} className="flex items-center justify-between border rounded p-2">
              <div>
                <div className="font-medium">{f.original_name}</div>
                <div className="text-xs text-slate-500">{(f.size_bytes/1024).toFixed(1)} KB • {new Date(f.created_at).toLocaleString()}</div>
              </div>
              <button
                onClick={()=>createShare(f.id)}
                disabled={creating}
                className="bg-blue-600 text-white rounded px-3 py-1 disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create link'}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {shareInfo && (
        <section className="bg-green-50 border border-green-200 rounded-xl p-3">
          <div className="text-green-800">Share link created!</div>
          <div className="text-sm mt-1">Password: <code>abc123</code> • Expires: {new Date(shareInfo.expiresAt).toLocaleString()}</div>
          <div className="text-sm break-all mt-1">
            Download URL: <code>http://localhost:4000{shareInfo.path}?password=abc123</code>
          </div>
        </section>
      )}
    </div>
  );
}
