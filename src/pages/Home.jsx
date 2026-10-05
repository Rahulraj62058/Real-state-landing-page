import { useEffect, useState } from 'react';
import { api } from '../api.js';
import PropertyCard from '../components/PropertyCard.jsx';

const EMPTY = { q: '', city: '', listingType: '', propertyType: '', minPrice: '', maxPrice: '', beds: '', sort: 'new' };

export default function Home() {
  const [filters, setFilters] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [cities, setCities] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => { api('/properties/meta/cities').then(setCities).catch(() => {}); }, []);

  useEffect(() => {
    setStatus('loading');
    const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(applied).filter(([, v]) => v !== '')), page, limit: 9 });
    api(`/properties?${qs}`)
      .then((d) => { setData(d); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, [applied, page]);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const apply = (e) => { e?.preventDefault(); setPage(1); setApplied(filters); };
  const reset = () => { setFilters(EMPTY); setApplied(EMPTY); setPage(1); };

  return (
    <>
      <section className="hero">
        <h1>Find a home to buy or rent</h1>
        <p>Browse verified listings, save the ones you like, and message owners directly.</p>
        <form className="searchbar" onSubmit={apply}>
          <input value={filters.q} onChange={set('q')} placeholder="Search by title, area or city" aria-label="Search listings" />
          <button className="btn">Search</button>
        </form>
      </section>

      <div className="layout">
        <aside className="filters">
          <form onSubmit={apply}>
            <h2>Filters</h2>
            <label>City
              <select value={filters.city} onChange={set('city')}>
                <option value="">All cities</option>
                {cities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>Listing type
              <select value={filters.listingType} onChange={set('listingType')}>
                <option value="">Buy or rent</option>
                <option value="sale">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </label>
            <label>Property type
              <select value={filters.propertyType} onChange={set('propertyType')}>
                <option value="">Any</option>
                {['apartment', 'house', 'villa', 'plot', 'commercial'].map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
              </select>
            </label>
            <div className="two">
              <label>Min price (₹)<input type="number" min="0" value={filters.minPrice} onChange={set('minPrice')} /></label>
              <label>Max price (₹)<input type="number" min="0" value={filters.maxPrice} onChange={set('maxPrice')} /></label>
            </div>
            <label>Bedrooms
              <select value={filters.beds} onChange={set('beds')}>
                <option value="">Any</option>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </label>
            <label>Sort by
              <select value={filters.sort} onChange={set('sort')}>
                <option value="new">Newest</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
            <div className="row">
              <button className="btn">Apply filters</button>
              <button type="button" className="btn ghost" onClick={reset}>Clear</button>
            </div>
          </form>
        </aside>

        <section className="results" aria-live="polite">
          <p className="count">{status === 'ready' ? `${data.total} propert${data.total === 1 ? 'y' : 'ies'} found` : '\u00A0'}</p>
          {status === 'loading' && <p className="page-note">Loading listings…</p>}
          {status === 'error' && <p className="page-note error">Could not load listings. Check that the API server is running.</p>}
          {status === 'ready' && data.items.length === 0 && (
            <div className="empty"><h3>No properties match these filters</h3><p>Try a wider price range or clear the filters.</p><button className="btn" onClick={reset}>Clear filters</button></div>
          )}
          <div className="grid">{data.items.map((p) => <PropertyCard key={p._id} p={p} />)}</div>
          {data.pages > 1 && (
            <div className="pager">
              <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {data.pages}</span>
              <button className="btn ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
