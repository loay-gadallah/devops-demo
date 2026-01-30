import { NavLink } from 'react-router-dom';
import { FiGrid, FiCreditCard, FiBriefcase, FiSend, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/accounts', icon: FiBriefcase, label: 'Accounts' },
  { to: '/cards', icon: FiCreditCard, label: 'Cards' },
  { to: '/transfers', icon: FiSend, label: 'Transfers' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const initials = user
    ? (user.firstName?.[0] || '') + (user.lastName?.[0] || '')
    : 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">R</div>
        <span className="brand-name">RetailBank</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon"><item.icon /></span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.firstName} {user?.lastName}</div>
            <div className="user-role">{user?.role || 'Customer'}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout}>
          <FiLogOut /> Sign Out
        </button>
      </div>
    </aside>
  );
}
