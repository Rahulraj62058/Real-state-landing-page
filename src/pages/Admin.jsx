import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { formatPrice } from '../util.js';

function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/admin/stats').then(setS).catch(() => {}); }, []);
  if (!s) return <p className="page-note">Loading…</p>;
  const items = [['Users', s.users], ['Owners', s.owners], ['Live listings', s.approved], ['Awaiting review', s.pending], ['Rejected', s.rejected], ['Messages sent', s.inquiries]];
  return <>{s.pending > 0 && <p className="notice">{s.pending} listing{s.pending === 1 ? '' : 's'} waiting for your review. Open the Listings tab to approve or reject.</p>}<div className="stats">{items.map(([label, n]) => <div className="stat" key={label}><b>{n}</b><span>{label}</span></div>)}</div></>;
}

function Listings() {
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState(null);
  const load = () => api(`/admin/properties?status=${status}`).then(setItems).catch(() => setItems([]));
  useEffect(() => { setItems(null); load(); }, [status]);

  const setState = async (id, next) => { await api(`/admin/properties/${id}/status`, { method: 'PATCH', body: { status: next } }); load(); };
  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}" permanently?`)) return;
    await api(`/properties/${p._id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <div className="tabs sub">
        {['pending', 'approved', 'rejected', 'all'].map((s) => <button key={s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>{s[0].toUpperCase() + s.slice(1)}</button>)}
      </div>
      {items?.length === 0 && <div className="empty"><h3>Nothing here</h3><p>{status === 'all' ? 'No listings yet.' : `No ${status} listings right now.`}</p></div>}
      <div className="table">
        {items?.map((p) => (
          <div className="trow" key={p._id}>
            <div><Link to={`/property/${p._id}`}><b>{p.title}</b></Link><br /><small>{p.city} · {formatPrice(p.price, p.listingType)} · by {p.owner?.name} ({p.owner?.email})</small></div>
            <span className={`badge ${p.status}`}>{p.status}</span>
            <div className="row">
              {p.status !== 'approved' && <button className="btn sm" onClick={() => setState(p._id, 'approved')}>Approve</button>}
              {p.status !== 'rejected' && <button className="btn ghost sm" onClick={() => setState(p._id, 'rejected')}>Reject</button>}
              <button className="btn danger sm" onClick={() => remove(p)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Users() {
  const { user: me } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const load = () => api('/admin/users').then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    setError('');
    try { await api(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } }); load(); } catch (e) { setError(e.message); }
  };
  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? Their listings and messages are removed too.`)) return;
    setError('');
    try { await api(`/admin/users/${u._id}`, { method: 'DELETE' }); load(); } catch (e) { setError(e.message); }
  };

  return (
    <>
      {error && <p className="error">{error}</p>}
      <div className="table">
        {items?.map((u) => (
          <div className="trow" key={u._id}>
            <div><b>{u.name}</b><br /><small>{u.email}</small></div>
            <select value={u.role} disabled={u._id === me?.id || u._id === me?._id} onChange={(e) => changeRole(u._id, e.target.value)} aria-label={`Role for ${u.name}`}>
              <option value="user">user</option><option value="owner">owner</option><option value="admin">admin</option>
            </select>
            <div className="row"><button className="btn danger sm" disabled={u._id === me?.id || u._id === me?._id} onClick={() => remove(u)}>Delete</button></div>
          </div>
        ))}
      </div>
    </>
  );
}

function Messages() {
  const [items, setItems] = useState(null);
  useEffect(() => { api('/inquiries/received/list').then(setItems).catch(() => setItems([])); }, []);
  if (!items) return <p className="page-note">Loading…</p>;
  if (items.length === 0) return <div className="empty"><h3>No messages yet</h3><p>Enquiries sent to owners appear here.</p></div>;
  return (
    <div className="table">
      {items.map((m) => (
        <div className="msg" key={m._id}>
          <div className="msg-head"><b>{m.name}</b><small>{new Date(m.createdAt).toLocaleString()}</small></div>
          <p className="msg-about">About: {m.property?.title || 'Deleted listing'}</p>
          <p>{m.message}</p>
          <p className="msg-contact"><a href={`mailto:${m.email}`}>{m.email}</a>{m.phone && <> · <a href={`tel:${m.phone}`}>{m.phone}</a></>}</p>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('overview');
  return (
    <div className="page">
      <h1>Admin panel</h1>
      <div className="tabs" role="tablist">
        {[['overview', 'Overview'], ['listings', 'Listings'], ['users', 'Users'], ['messages', 'Messages']].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {tab === 'overview' && <Overview />}
      {tab === 'listings' && <Listings />}
      {tab === 'users' && <Users />}
      {tab === 'messages' && <Messages />}
    </div>
  );
}
