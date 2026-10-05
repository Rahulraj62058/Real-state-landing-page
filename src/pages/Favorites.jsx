import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import PropertyCard from '../components/PropertyCard.jsx';

export default function Favorites() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => { api('/favorites').then(setItems).catch(() => setItems([])); }, []);

  // When a heart is un-clicked, drop the card from this page right away.
  const visible = items?.filter((p) => p && (user?.favorites || []).includes(p._id));

  return (
    <div className="page">
      <h1>Your favorites</h1>
      {!visible && <p className="page-note">Loading…</p>}
      {visible?.length === 0 && <div className="empty"><h3>No saved properties yet</h3><p>Tap the heart on any listing to keep it here.</p><Link to="/" className="btn">Browse listings</Link></div>}
      <div className="grid">{visible?.map((p) => <PropertyCard key={p._id} p={p} />)}</div>
    </div>
  );
}
