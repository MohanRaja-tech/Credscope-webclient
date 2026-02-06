import { Outlet } from 'react-router-dom';
import './Layout.css';

const UserLayout = () => {
  return (
    <div className="user-layout">
      <header className="user-header">
        <div className="user-header-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">CredScope</span>
            <span className="brand-tagline">Credential Intelligence</span>
          </div>
        </div>
        <div className="header-accent"></div>
      </header>
      <main className="user-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
      <footer className="user-footer">
        <span>© 2024 CredScope • Secure File Analysis Platform</span>
      </footer>
    </div>
  );
};

export default UserLayout;
