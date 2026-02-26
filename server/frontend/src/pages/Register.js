import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'merchant' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('注册成功！即将跳转到登录页...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || '注册失败');
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
          <h2>注册账号</h2>
          <p className="auth-sub">创建您的管理平台账号</p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="required">用户名</label>
              <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="请输入用户名" required autoFocus />
            </div>
            <div className="form-group">
              <label className="required">邮箱</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="请输入邮箱" required />
            </div>
            <div className="form-group">
              <label className="required">密码</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="请设置密码" required />
            </div>
            <div className="form-group">
              <label>注册角色</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="merchant">商户（上传/编辑酒店信息）</option>
                <option value="admin">管理员（审核/发布/下线）</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? '注册中...' : '立即注册'}
            </button>
          </form>
          <div className="auth-footer">
            已有账号？<Link to="/login">去登录</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
