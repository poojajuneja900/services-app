import { useState } from 'react';
import { authApi } from '../api';

export default function RegisterPage({ onRegistered, onGoToLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', userType: 'customer' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authApi.register(form);
      onRegistered(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-glow auth-glow--left" />
      <div className="auth-glow auth-glow--right" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">⚡</span>
          <span className="auth-logo-text">ServiceApp</span>
        </div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join thousands of users on ServiceApp</p>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-userType">Account Type</label>
            <select
              id="reg-userType"
              name="userType"
              value={form.userType}
              onChange={handleChange}
            >
              <option value="customer">Customer</option>
              <option value="provider">Service Provider</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            id="btn-register"
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? <span className="spinner-sm" /> : '✨'}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button className="auth-link" onClick={onGoToLogin}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
