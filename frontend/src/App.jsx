import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './HomePage.jsx'
import ListPage from './ListPage.jsx'
import AddSessionPage from './AddSessionPage.jsx'
import HealthPage from './HealthPage.jsx'
import BestPracticesPage from './BestPracticesPage.jsx'
import Header from './Header.jsx'

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname !== '/';

  return (
          <div className={`App ${showHeader ? 'has-header' : ''}`} role="application" aria-label="Champions Training App">
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/add" element={<AddSessionPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/best-practices" element={<BestPracticesPage />} />
      </Routes>
    </div>
  )
}

function App() {
  return <AppContent />
}

export default App
