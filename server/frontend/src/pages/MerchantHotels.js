import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import useWebSocket from '../hooks/useWebSocket';

export default function MerchantHotels() {
  const [hotels, setHotels] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => { loadHotels(); }, [page, statusFilter]);

  // WebSocket 实时接收管理员操作通知
  useWebSocket((msg) => {
    if (msg.type === 'hotel_status_changed') {
      // 刷新列表
      loadHotels();
      // 显示通知横幅
      setNotification(msg.message);
      setTimeout(() => setNotification(null), 5000);
    }
  });

  const loadHotels = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hotels?page=${page}&limit=10${statusFilter ? '&status=' + statusFilter : ''}`);
      setHotels(res.data.hotels);
      setTotal(res.data.total);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确认删除该酒店？')) return;
    try {
      await api.delete(`/hotels/${id}`);
      loadHotels();
    } catch (err) {
      alert(err.response?.data?.message || '删除失败');
    }
  };

  const totalPages = Math.ceil(total / 10);
  const statusLabel = { draft: '草稿', pending: '审核中', approved: '已发布', rejected: '未通过', offline: '已下线' };
  const stars = (n) => '⭐'.repeat(n) || '无';

  return (
    <div>
      {/* 实时通知横幅 */}
      {notification && (
        <div style={{
          background: 'linear-gradient(135deg, #c9a84c, #a07830)',
          color: 'white', padding: '12px 20px', borderRadius: 8,
          marginBottom: 16, display: 'flex', alignItems: 'center',
          gap: 10, fontWeight: 500, fontSize: 14,
          boxShadow: '0 2px 8px rgba(201,168,76,0.4)',
          animation: 'slideIn 0.3s ease'
        }}>
          🔔 {notification}
        </div>
      )}
      <div className="page-header">
        <div>
          <h2>我的酒店</h2>
          <p>共 {total} 条酒店信息</p>
        </div>
        <Link to="/hotels/new" className="btn btn-primary">＋ 新增酒店</Link>
      </div>

      <div className="filter-bar">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="pending">审核中</option>
          <option value="approved">已发布</option>
          <option value="rejected">未通过</option>
          <option value="offline">已下线</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : hotels.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏨</div>
            <p>暂无酒店信息</p>
            <Link to="/hotels/new" className="btn btn-primary" style={{ marginTop: 16 }}>新增酒店</Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>酒店名称</th>
                <th>地区</th>
                <th>星级</th>
                <th>价格区间</th>
                <th>房型数</th>
                <th>状态</th>
                <th>提交时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map(h => (
                <tr key={h.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{h.name}</div>
                    {h.name_en && <div style={{ fontSize: 12, color: 'var(--stone)' }}>{h.name_en}</div>}
                    {h.status === 'rejected' && h.reject_reason && (
                      <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 3 }}>
                        拒绝原因：{h.reject_reason}
                      </div>
                    )}
                    {h.status === 'draft' && (
                      <div style={{ fontSize: 11, color: 'var(--gold-dark)', marginTop: 2 }}>
                        💾 草稿，尚未提交审核
                      </div>
                    )}
                    {h.status === 'approved' && (
                      <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>
                        💡 已发布，修改后需重新审核
                      </div>
                    )}
                  </td>
                  <td>{h.province} {h.city}</td>
                  <td>{stars(h.star_level)}</td>
                  <td>
                    {h.price_range_min && h.price_range_max
                      ? `¥${h.price_range_min}~${h.price_range_max}`
                      : '—'}
                  </td>
                  <td>{h.room_types?.length || 0} 种</td>
                  <td><span className={`tag tag-${h.status}`}>{statusLabel[h.status]}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--stone)' }}>
                    {new Date(h.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Link to={`/hotels/${h.id}/edit`} className="btn btn-outline btn-sm">编辑</Link>
                      {h.status === 'draft' && (
                        <button className="btn btn-primary btn-sm" onClick={async () => {
                          if (!window.confirm('确认提交审核？提交后将由管理员审核')) return;
                          try {
                            await api.put(`/hotels/${h.id}`, { ...h, is_draft: false });
                            alert('已提交审核！');
                            loadHotels();
                          } catch { alert('提交失败'); }
                        }}>提交审核</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(h.id)}>删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => p-1)} disabled={page === 1}>上一页</button>
            {Array.from({length: totalPages}, (_, i) => i+1).map(p => (
              <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button onClick={() => setPage(p => p+1)} disabled={page === totalPages}>下一页</button>
          </div>
        )}
      </div>
    </div>
  );
}
