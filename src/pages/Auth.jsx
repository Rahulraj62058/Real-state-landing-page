import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const user = isLogin ? await login(form.email, form.password) : await register(form);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/dashboard' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel narrow" onSubmit={submit}>
      <h1>{isLogin ? 'Log in' : 'Create your account'}</h1>
      {!isLogin && <label>Full name<input required value={form.name} onChange={set('name')} /></label>}
      <label>Email<input required type="email" value={form.email} onChange={set('email')} /></label>
      <label>Password<input required type="password" minLength="6" value={form.password} onChange={set('password')} /></label>
      {!isLogin && (
        <fieldset>
          <legend>I want to</legend>
          <label className="radio"><input type="radio" name="role" checked={form.role === 'user'} onChange={() => setForm({ ...form, role: 'user' })} /> Find a property</label>
          <label className="radio"><input type="radio" name="role" checked={form.role === 'owner'} onChange={() => setForm({ ...form, role: 'owner' })} /> List my property</label>
        </fieldset>
      )}
      {error && <p className="error">{error}</p>}
      {isLogin && (
        <div className="demo">
          <small>Demo accounts (click to fill):</small>
          <div className="row">
            {[['Admin', 'admin@portal.test', 'admin123'], ['Owner', 'owner@portal.test', 'owner123'], ['User', 'user@portal.test', 'user123']].map(([label, email, password]) => (
              <button type="button" key={label} className="btn ghost sm" onClick={() => setForm({ ...form, email, password })}>{label}</button>
            ))}
          </div>
        </div>
      )}
      <button className="btn" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
      <p className="alt">{isLogin ? <>New here? <Link to="/register">Create an account</Link></> : <>Already registered? <Link to="/login">Log in</Link></>}</p>
    </form>
  );
}
