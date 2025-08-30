import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleListClick = () => {
    navigate('/list');
  };



  const handleHealthClick = () => {
    navigate('/health');
  };

  const handleBestPracticesClick = () => {
    navigate('/best-practices');
  };

  return (
    <header 
      role="banner" 
      aria-label="Application Navigation Header"
      className="header"
    >
              <nav role="navigation" aria-label="Main navigation">
        <div className="header-content">
          <h1 
            role="heading" 
            aria-level="1"
            className="header-title"
          >
            Training App
          </h1>
          
          <ul role="menubar" aria-label="Main Menu" className="nav-menu">
            <li role="none">
              <button
                role="menuitem"
                aria-label="Go to Home page"
                aria-current={location.pathname === '/' ? 'page' : undefined}
                onClick={handleHomeClick}
                className={`nav-button ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </button>
            </li>
            <li role="none">
              <button
                role="menuitem"
                aria-label="View Training Sessions List"
                aria-current={location.pathname === '/list' ? 'page' : undefined}
                onClick={handleListClick}
                className={`nav-button ${location.pathname === '/list' ? 'active' : ''}`}
              >
                Sessions
              </button>
            </li>

            <li role="none">
              <button
                role="menuitem"
                aria-label="Check Backend Health Status"
                aria-current={location.pathname === '/health' ? 'page' : undefined}
                onClick={handleHealthClick}
                className={`nav-button ${location.pathname === '/health' ? 'active' : ''}`}
              >
                Health
              </button>
            </li>
            <li role="none">
              <button
                role="menuitem"
                aria-label="View Testing Best Practices"
                aria-current={location.pathname === '/best-practices' ? 'page' : undefined}
                onClick={handleBestPracticesClick}
                className={`nav-button ${location.pathname === '/best-practices' ? 'active' : ''}`}
              >
                Best Practices
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
