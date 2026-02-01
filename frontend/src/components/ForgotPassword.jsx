import { useState } from 'react';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/mywebapp/password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage('Error sending email.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              className="form-control" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email" 
            />
          </div>
          <button className="btn-submit" type="submit">Send Reset Link</button>
        </form>
        {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: '#2c3e50' }}>{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;