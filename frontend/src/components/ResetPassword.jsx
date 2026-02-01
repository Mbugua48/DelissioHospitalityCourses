import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Auth.css';

function ResetPassword() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/mywebapp/password-reset-confirm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid, token, password })
      });

      if (response.ok) {
        alert('Password reset successful! Please login with your new password.');
        navigate('/login');
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to reset password'));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Set New Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <div className="password-wrapper">
              <input 
                className="form-control" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Enter new password" 
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </span>
            </div>
          </div>
          <button className="btn-submit" type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;