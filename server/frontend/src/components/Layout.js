import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const merchantMenu = [
  { path: '/dashboard', icon: '🏠', label: '控制台' },
  { path: '/hotels', icon: '🏨', label: '我的酒店' },
  { path: '/hotels/new', icon: '➕', label: '新增酒店' },
];

const adminMenu = [
  { path: '/dashboard', icon: '🏠', label: '控制台' },
  { path: '/admin/hotels', icon: '🏨', label: '酒店审核列表' },
  { path: '/admin/hotels?status=pending', icon: '⏳', label: '待审核' },
  { path: '/admin/hotels?status=approved', icon: '✅', label: '已发布' },
  { path: '/admin/hotels?status=rejected', icon: '❌', label: '已拒绝' },
  { path: '/admin/hotels?status=offline', icon: '📴', label: '已下线' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const menu = user?.role === 'admin' ? adminMenu : merchantMenu;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path.includes('?')) {
      const [p, q] = path.split('?');
      return location.pathname === p && location.search === '?' + q;
    }
    return location.pathname === path;
  };

  return (
    <div className={`layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⛩</span>
            {sidebarOpen && <span className="logo-text">酒店管理系统</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menu.map(item => (
            <Link
              key={item.path + item.label}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            {sidebarOpen && (
              <div className="user-details">
                <div className="user-name">{user?.username}</div>
                <div className="user-role">{user?.role === 'admin' ? '管理员' : '商户'}</div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="退出登录">
            {sidebarOpen ? '退出' : '⬛'}
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
