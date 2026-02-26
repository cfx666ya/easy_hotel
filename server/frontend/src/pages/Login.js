import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { reconnectWebSocket } from '../hooks/useWebSocket';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      reconnectWebSocket(); // 登录后用新 token 重新建立 WebSocket 连接
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || '登录失败');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-text">酒店管理系统</div>
        <div className="auth-bg-sub">Hotel Management System</div>
      </div>
      <div className="auth-panel">
        <div className="auth-box">
          <div className="auth-logo">⛩</div>
          <h2>欢迎登录</h2>
          <p className="auth-sub">酒店信息管理平台</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>用户名</label>
              <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="请输入用户名" autoFocus />
            </div>
            <div className="form-group">
              <label>密码</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="请输入密码" />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? '登录中...' : '登 录'}
            </button>
          </form>

          <div className="auth-footer">
            还没有账号？<Link to="/register">立即注册</Link>
          </div>

          <div className="auth-hint">
            <strong>默认管理员账号：</strong>admin / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
