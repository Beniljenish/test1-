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

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
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
          <div className="floating-icons">
            <div className="icon chat-icon">💬</div>
            <div className="icon check-icon">✓</div>
            <div className="icon menu-icon">☰</div>
          </div>
        </div>
        <div className="organizo-badge">
          <span>AZ</span>
        </div>
      </div>

      <div className="login-form">
        <div className="form-header">
          <h1>Organizo</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            Continue →
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;