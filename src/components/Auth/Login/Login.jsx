import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user, getAllUsers } = useAuth();
  const navigate = useNavigate();

  // Get available users for quick login
  const availableUsers = getAllUsers();

  // Debug logging
  console.log('Login component - User:', user ? 'logged in' : 'not logged in');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('User found, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);
      if (result.success) {
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-illustration">
        <div className="character">
          <div className="character-head">
            <div className="character-eyes">
              <div className="eye"></div>
              <div className="eye"></div>
            </div>
          </div>
          <div className="character-body">
            <div className="arm-left"></div>
            <div className="arm-right"></div>
          </div>
        </div>
        <div className="floating-icons">
          <div className="icon chat-icon">💬</div>
          <div className="icon check-icon">✓</div>
          <div className="icon menu-icon">☰</div>
        </div>
        <div className="organizo-badge"><span>AZ</span></div>
      </div>

      <div className="login-form">
        <div className="form-header"><h1>Organizo</h1></div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          
          {/* Quick login buttons for testing */}
          <div className="quick-login" style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Quick Login (Testing):</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {availableUsers.map(userItem => (
                <button
                  key={userItem.id}
                  type="button"
                  onClick={() => {
                    setEmail(userItem.email);
                    setPassword('123');
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '10px',
                    background: '#e5e7eb',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {userItem.name}
                </button>
              ))}
            </div>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            className="primary-button"
          >
            Continue →
          </Button>
          
          {/* Debug button - remove in production */}
          <button 
            type="button" 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              marginTop: '10px',
              padding: '8px',
              background: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear Storage & Reload (Debug)
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
