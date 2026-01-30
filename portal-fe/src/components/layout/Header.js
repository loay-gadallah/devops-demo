import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const pageTitles = {
  '/': 'Dashboard',
  '/accounts': 'Accounts',
  '/cards': 'Cards',
  '/transfers': 'Transfers',
  '/transfers/new': 'New Transfer',
};

export default function Header() {
  const location = useLocation();
  const { user } = useAuth();

  const getTitle = () => {
    if (pageTitles[location.pathname]) return pageTitles[location.pathname];
    if (location.pathname.startsWith('/accounts/')) return 'Account Details';
    if (location.pathname.startsWith('/cards/')) return 'Card Details';
    return 'Banking Portal';
  };

  const initials = user
    ? (user.firstName?.[0] || '') + (user.lastName?.[0] || '')
    : 'U';

  return (
    <header className="header">
      <div className="header-title">
        <h2>{getTitle()}</h2>
      </div>
      <div className="header-right">
        <div className="header-user">
          <div className="user-details">
            <div className="name">{user?.firstName} {user?.lastName}</div>
            <div className="role">{user?.role || 'Customer'}</div>
          </div>
          <div className="avatar">{initials}</div>
        </div>
      </div>
    </header>
  );
}
