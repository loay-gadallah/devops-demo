import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Transfer from './pages/Transfer';

function App() {
  return (
    <Router>
      <div className="app">
        <header>
          <h1>Enterprise Banking Portal</h1>
          <nav>
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/account">Account</NavLink>
            <NavLink to="/transfer">Transfer</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/account" element={<Account />} />
            <Route path="/transfer" element={<Transfer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
