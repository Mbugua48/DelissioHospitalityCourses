import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CourseList from './components/CourseList';
import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    // Optional: Redirect to login page via window.location if needed
    // window.location.href = '/login'; 
  };

  return (
    <Router>
      <div className="App">
        <header>
          <h1>Delissio Hospitality Courses</h1>
          <nav>
            <Link to="/courses">Courses</Link> |{' '}
            {user ? (
              <>
                <span style={{ marginRight: '10px' }}>Welcome, {user.username}</span>
                <button onClick={handleLogout} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: 'inherit', color: 'inherit', textDecoration: 'underline' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link> |{' '}
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/courses" element={<CourseList />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLogin={() => {
              const savedUser = localStorage.getItem('user');
              if (savedUser) {
                setUser(JSON.parse(savedUser));
              }
            }} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route path="/" element={<CourseList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
