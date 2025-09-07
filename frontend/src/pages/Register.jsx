import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');

  async function onSubmit(e){
    e.preventDefault();
    setErr('');
    try{
      const res = await api('/api/auth/register',{method:'POST',body:{email,password,name}});
      login(res.token, res.user);
      nav('/dashboard');
    }catch(e){ setErr(e.message); }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Create your SkyShare account</h1>
        {err && <div className="bg-red-50 text-red-700 p-2 mb-3 rounded">{err}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded p-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="w-full border rounded p-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white rounded p-2">Register</button>
        </form>
        <p className="text-sm mt-3">Already have an account? <Link className="text-blue-600" to="/login">Login</Link></p>
      </div>
    </div>
  );
}
