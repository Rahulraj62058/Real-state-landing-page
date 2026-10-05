import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { FALLBACK_IMG, formatPrice } from '../util.js';

function ContactForm({ property }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', message: `Hi, I'm interested in "${property.title}". Is it still available?` });
  const [state, setState] = useState({ sending: false, done: false, error: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ sending: true, done: false, error: '' });
    try {
      await api(`/inquiries/${property._id}`, { method: 'POST', body: form });
      setState({ sending: false, done: true, error: '' });
    } catch (err) {
      setState({ sending: false, done: false, error: err.message });
    }
  };

  if (state.done) return <div className="panel success"><h3>Message sent</h3><p>{property.owner?.name || 'The owner'} will get your details and reply by email or phone.</p></div>;

  return (
    <form className="panel" onSubmit={submit}>
      <h3>Contact owner</h3>
      <label>Your name<input required value={form.name} onChange={set('name')} /></label>
      <label>Email<input required type="email" value={form.email} onChange={set('email')} /></label>
      <label>Phone (optional)<input value={form.phone} onChange={set('phone')} /></label>
      <label>Message<textarea required rows="4" maxLength="1000" value={form.message} onChange={set('message')} /></label>
      {state.error && <p className="error">{state.error}</p>}
      <button className="btn" disabled={state.sending}>{state.sending ? 'Sending…' : 'Send message'}</button>
    </form>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const { user, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [img, setImg] = useState(0);

  useEffect(() => { api(`/properties/${id}`).then(setP).catch((e) => setError(e.message)); }, [id]);

  if (error) return <p className="page-note error">{error}. <Link to="/">Back to listings</Link></p>;
  if (!p) return <p className="page-note">Loading…</p>;

  const images = p.images?.length ? p.images : [FALLBACK_IMG];
  const fav = user?.favorites?.includes(p._id);
  const approved = p.status === 'approved';

  return (
    <div className="detail">
      <div className="gallery">
        <img className="main" src={images[img]} alt={p.title} onError={(e) => (e.currentTarget.src = FALLBACK_IMG)} />
        {images.length > 1 && (
          <div className="thumbs">
            {images.map((src, i) => (
              <button key={i} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Show photo ${i + 1}`}>
                <img src={src} alt="" onError={(e) => (e.currentTarget.src = FALLBACK_IMG)} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="info">
        {!approved && <p className="notice">This listing is {p.status} and only visible to you and admins.</p>}
        <div className="head">
          <div>
            <div className="price big">{formatPrice(p.price, p.listingType)}</div>
            <h1>{p.title}</h1>
            <p className="loc">{[p.address, p.city].filter(Boolean).join(', ')}</p>
          </div>
          {approved && (
            <button className={`btn ${fav ? '' : 'ghost'}`} onClick={() => (user ? toggleFavorite(p._id) : navigate('/login'))} aria-pressed={!!fav}>
              {fav ? '♥ Saved' : '♡ Save'}
            </button>
          )}
        </div>

        <ul className="specs">
          <li><b>{p.propertyType}</b><span>Type</span></li>
          <li><b>{p.listingType === 'rent' ? 'Rent' : 'Sale'}</b><span>Listing</span></li>
          {p.bedrooms > 0 && <li><b>{p.bedrooms}</b><span>Bedrooms</span></li>}
          {p.bathrooms > 0 && <li><b>{p.bathrooms}</b><span>Bathrooms</span></li>}
          {p.areaSqft > 0 && <li><b>{p.areaSqft}</b><span>Sq ft</span></li>}
        </ul>

        <h2>About this property</h2>
        <p className="desc">{p.description}</p>

        {p.amenities?.length > 0 && (
          <>
            <h2>Amenities</h2>
            <ul className="chips">{p.amenities.map((a) => <li key={a}>{a}</li>)}</ul>
          </>
        )}
        <p className="listed-by">Listed by {p.owner?.name || 'owner'}</p>
      </div>

      {approved && <aside className="side"><ContactForm property={p} /></aside>}
    </div>
  );
}
