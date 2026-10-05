import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Home from './pages/Home.jsx';
import PropertyDetail from './pages/PropertyDetail.jsx';
import Auth from './pages/Auth.jsx';
import Favorites from './pages/Favorites.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Admin from './pages/Admin.jsx';

function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="page-note">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="topbar">
      <Link to="/" className="brand">Ghar<span>Khoj</span></Link>
      <nav>
        <NavLink to="/" end>Browse</NavLink>
        {user && <NavLink to="/favorites">Favorites{(user.favorites || []).length ? ` (${user.favorites.length})` : ''}</NavLink>}
        {user && ['owner', 'admin'].includes(user.role) && <NavLink to="/dashboard">My listings</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="auth-links">
        {user ? (
          <>
            <span className="who">{user.name} · {user.role}</span>
            <button className="btn ghost" onClick={() => { logout(); navigate('/'); }}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn ghost">Log in</Link>
            <Link to="/register" className="btn">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/favorites" element={<RequireRole roles={['user', 'owner', 'admin']}><Favorites /></RequireRole>} />
          <Route path="/dashboard" element={<RequireRole roles={['owner', 'admin']}><Dashboard /></RequireRole>} />
          <Route path="/admin" element={<RequireRole roles={['admin']}><Admin /></RequireRole>} />
          <Route path="*" element={<p className="page-note">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
