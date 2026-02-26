import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import useWebSocket from '../hooks/useWebSocket';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  // WebSocket 实时更新统计数据
  useWebSocket((msg) => {
    if (msg.type === 'hotel_status_changed' || msg.type === 'new_hotel_pending') {
      loadStats();
    }
  });

  const loadStats = async () => {
    try {
      const res = await api.get('/hotels?limit=1000');
      const hotels = res.data.hotels;
      const s = {
        total: hotels.length,
        pending: hotels.filter(h => h.status === 'pending').length,
        approved: hotels.filter(h => h.status === 'approved').length,
        rejected: hotels.filter(h => h.status === 'rejected').length,
        offline: hotels.filter(h => h.status === 'offline').length,
      };
      setStats(s);
    } catch {}
    setLoading(false);
  };

  const statCards = user?.role === 'admin' ? [
    { label: '全部酒店', value: stats.total || 0, icon: '🏨', color: '#C9A84C' },
    { label: '待审核', value: stats.pending || 0, icon: '⏳', color: '#D97706' },
    { label: '已发布', value: stats.approved || 0, icon: '✅', color: '#059669' },
    { label: '已拒绝', value: stats.rejected || 0, icon: '❌', color: '#DC2626' },
    { label: '已下线', value: stats.offline || 0, icon: '📴', color: '#6B7280' },
  ] : [
    { label: '我的酒店', value: stats.total || 0, icon: '🏨', color: '#C9A84C' },
    { label: '审核中', value: stats.pending || 0, icon: '⏳', color: '#D97706' },
    { label: '已发布', value: stats.approved || 0, icon: '✅', color: '#059669' },
    { label: '未通过', value: stats.rejected || 0, icon: '❌', color: '#DC2626' },
    { label: '已下线', value: stats.offline || 0, icon: '📴', color: '#6B7280' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>控制台</h2>
          <p>欢迎回来，{user?.username}（{user?.role === 'admin' ? '管理员' : '商户'}）</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="stat-grid">
          {statCards.map(s => (
            <div className="stat-card card" key={s.label}>
              <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
              <div className="stat-info">
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-tip card" style={{ marginTop: 24 }}>
        <h3>使用说明</h3>
        {user?.role === 'admin' ? (
          <ul style={{ marginTop: 10, paddingLeft: 18, color: 'var(--stone)', lineHeight: 2 }}>
            <li>在"酒店审核列表"中查看所有商户提交的酒店信息</li>
            <li>可按状态筛选：待审核、已发布、已拒绝、已下线</li>
            <li>点击"通过"发布酒店，点击"拒绝"并填写原因</li>
            <li>可对已发布酒店执行"下线"操作，也可将下线酒店恢复发布</li>
          </ul>
        ) : (
          <ul style={{ marginTop: 10, paddingLeft: 18, color: 'var(--stone)', lineHeight: 2 }}>
            <li>在"我的酒店"中查看已提交的酒店信息</li>
            <li>点击"新增酒店"填写并提交酒店信息等待审核</li>
            <li>审核通过后信息将对外发布</li>
            <li>审核未通过可查看拒绝原因并修改重新提交</li>
          </ul>
        )}
      </div>
    </div>
  );
}
