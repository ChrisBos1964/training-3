import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './HomePage.jsx'
import ListPage from './ListPage.jsx'
import AddSessionPage from './AddSessionPage.jsx'
import EditSessionPage from './EditSessionPage.jsx'
import HealthPage from './HealthPage.jsx'
import BestPracticesPage from './BestPracticesPage.jsx'
import ShadowDomPage from './ShadowDomPage.jsx'
import LoginPage from './LoginPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import Header from './Header.jsx'

function AppContent() {
  const location = useLocation();
  const showHeader = /^\/(list|add|edit\/[^/]+|health|best-practices|shadow-dom|login)$/.test(location.pathname);

  return (
          <div className={`App ${showHeader ? 'has-header' : ''}`} role="application" aria-label="Champions Training App" data-testid="app-root">
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/add" element={<AddSessionPage />} />
        <Route path="/edit/:id" element={<EditSessionPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/best-practices" element={<BestPracticesPage />} />
        <Route path="/shadow-dom" element={<ShadowDomPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

function App() {
  return <AppContent />
}

export default App
