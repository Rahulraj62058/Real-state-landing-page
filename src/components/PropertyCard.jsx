import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { FALLBACK_IMG, formatPrice } from '../util.js';

export default function PropertyCard({ p }) {
  const { user, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const fav = user?.favorites?.includes(p._id);

  const onHeart = (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    toggleFavorite(p._id);
  };

  return (
    <Link to={`/property/${p._id}`} className="card">
      <div className="card-img">
        <img src={p.images?.[0] || FALLBACK_IMG} alt={p.title} loading="lazy" onError={(e) => (e.currentTarget.src = FALLBACK_IMG)} />
        <span className={`tag ${p.listingType}`}>{p.listingType === 'rent' ? 'For rent' : 'For sale'}</span>
        <button className={`heart ${fav ? 'on' : ''}`} onClick={onHeart} aria-label={fav ? 'Remove from favorites' : 'Save to favorites'} aria-pressed={!!fav}>
          {fav ? '♥' : '♡'}
        </button>
      </div>
      <div className="card-body">
        <div className="price">{formatPrice(p.price, p.listingType)}</div>
        <h3>{p.title}</h3>
        <p className="loc">{[p.address, p.city].filter(Boolean).join(', ')}</p>
        <p className="facts">
          {p.bedrooms > 0 && <span>{p.bedrooms} bed</span>}
          {p.bathrooms > 0 && <span>{p.bathrooms} bath</span>}
          {p.areaSqft > 0 && <span>{p.areaSqft} sq ft</span>}
          <span className="type">{p.propertyType}</span>
        </p>
      </div>
    </Link>
  );
}
