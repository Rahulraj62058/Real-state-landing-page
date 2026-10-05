import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatPrice } from '../util.js';

const BLANK = { title: '', description: '', listingType: 'sale', propertyType: 'apartment', price: '', bedrooms: 0, bathrooms: 0, areaSqft: '', city: '', address: '', images: '', amenities: '' };

function PropertyForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(
    initial ? { ...initial, images: (initial.images || []).join('\n'), amenities: (initial.amenities || []).join(', ') } : BLANK
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const body = {
      ...form,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      areaSqft: Number(form.areaSqft) || 0,
      images: (typeof form.images === 'string' ? form.images.split('\n') : (form.images || [])).map((s) => String(s).trim()).filter(Boolean),
      amenities: (typeof form.amenities === 'string' ? form.amenities.split(',') : (form.amenities || [])).map((s) => String(s).trim()).filter(Boolean),
    };
    try {
      await (initial ? api(`/properties/${initial._id}`, { method: 'PUT', body }) : api('/properties', { method: 'POST', body }));
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h2>{initial ? 'Edit listing' : 'Add a listing'}</h2>
      <label>Title<input required value={form.title} onChange={set('title')} placeholder="3 BHK apartment near metro" /></label>
      <label>Description<textarea required rows="4" value={form.description} onChange={set('description')} /></label>
      <div className="two">
        <label>Listing type<select value={form.listingType} onChange={set('listingType')}><option value="sale">For sale</option><option value="rent">For rent</option></select></label>
        <label>Property type<select value={form.propertyType} onChange={set('propertyType')}>{['apartment', 'house', 'villa', 'plot', 'commercial'].map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
      </div>
      <div className="two">
        <label>Price (₹){form.listingType === 'rent' ? ' per month' : ''}<input required type="number" min="0" value={form.price} onChange={set('price')} /></label>
        <label>Area (sq ft)<input type="number" min="0" value={form.areaSqft} onChange={set('areaSqft')} /></label>
      </div>
      <div className="two">
        <label>Bedrooms<input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} /></label>
        <label>Bathrooms<input type="number" min="0" value={form.bathrooms} onChange={set('bathrooms')} /></label>
      </div>
      <div className="two">
        <label>City<input required value={form.city} onChange={set('city')} /></label>
        <label>Area / address<input value={form.address} onChange={set('address')} /></label>
      </div>
      <label>Image URLs (one per line)<textarea rows="3" value={form.images} onChange={set('images')} placeholder="https://…" /></label>
      <label>Amenities (comma separated)<input value={form.amenities} onChange={set('amenities')} placeholder="Parking, Lift, Power backup" /></label>
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : 'Submit for review'}</button>
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}
      </div>
      {!initial && <p className="hint">New listings appear publicly after an admin approves them.</p>}
    </form>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState('listings');
  const [mine, setMine] = useState(null);
  const [inbox, setInbox] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = () => {
    api('/properties/mine/list').then(setMine).catch(() => setMine([]));
    api('/inquiries/received/list').then(setInbox).catch(() => setInbox([]));
  };
  useEffect(load, []);

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This also removes its messages.`)) return;
    try {
      await api(`/properties/${p._id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      alert(e.message || 'Failed to delete listing');
    }
  };

  const saved = () => { setEditing(null); setTab('listings'); load(); };

  return (
    <div className="page">
      <h1>My listings</h1>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'listings'} className={tab === 'listings' ? 'on' : ''} onClick={() => { setTab('listings'); setEditing(null); }}>Listings</button>
        <button role="tab" aria-selected={tab === 'add'} className={tab === 'add' ? 'on' : ''} onClick={() => { setTab('add'); setEditing(null); }}>Add listing</button>
        <button role="tab" aria-selected={tab === 'inbox'} className={tab === 'inbox' ? 'on' : ''} onClick={() => setTab('inbox')}>Messages{inbox?.length ? ` (${inbox.length})` : ''}</button>
      </div>

      {tab === 'add' && !editing && <PropertyForm onSaved={saved} />}
      {editing && <PropertyForm initial={editing} onSaved={saved} onCancel={() => setEditing(null)} />}

      {tab === 'listings' && !editing && (
        <>
          {mine?.length === 0 && <div className="empty"><h3>You haven't listed anything yet</h3><p>Add your first property and an admin will review it.</p><button className="btn" onClick={() => setTab('add')}>Add listing</button></div>}
          <div className="table">
            {mine?.map((p) => (
              <div className="trow" key={p._id}>
                <div><Link to={`/property/${p._id}`}><b>{p.title}</b></Link><br /><small>{p.city} · {formatPrice(p.price, p.listingType)}</small></div>
                <span className={`badge ${p.status}`}>{p.status}</span>
                <div className="row">
                  <button className="btn ghost sm" onClick={() => setEditing(p)}>Edit</button>
                  <button className="btn danger sm" onClick={() => remove(p)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'inbox' && (
        <div className="table">
          {inbox?.length === 0 && <div className="empty"><h3>No messages yet</h3><p>When someone contacts you about a listing, it shows up here.</p></div>}
          {inbox?.map((m) => (
            <div className="msg" key={m._id}>
              <div className="msg-head"><b>{m.name}</b><small>{new Date(m.createdAt).toLocaleString()}</small></div>
              <p className="msg-about">About: {m.property?.title || 'Deleted listing'}</p>
              <p>{m.message}</p>
              <p className="msg-contact"><a href={`mailto:${m.email}`}>{m.email}</a>{m.phone && <> · <a href={`tel:${m.phone}`}>{m.phone}</a></>}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
