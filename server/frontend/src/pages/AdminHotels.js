import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import './AdminHotels.css';

const STATUS_LABELS = { pending: '审核中', approved: '已发布', rejected: '未通过', offline: '已下线' };

const BASE_URL = 'http://localhost:3001';
const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return BASE_URL + url;
};

export default function AdminHotels() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const [hotels, setHotels] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  const loadHotels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hotels?page=${page}&limit=10${statusFilter ? '&status=' + statusFilter : ''}`);
      setHotels(res.data.hotels);
      setTotal(res.data.total);
    } catch {}
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { loadHotels(); }, [loadHotels]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const openReview = (hotel, action) => {
    setReviewModal(hotel);
    setReviewAction(action);
    setRejectReason('');
  };

  const submitReview = async () => {
    try {
      if (reviewAction === 'offline') {
        await api.patch(`/hotels/${reviewModal.id}/offline`);
      } else if (reviewAction === 'restore') {
        await api.patch(`/hotels/${reviewModal.id}/restore`);
      } else {
        await api.patch(`/hotels/${reviewModal.id}/review`, { action: reviewAction, reject_reason: rejectReason });
      }
      setReviewModal(null);
      loadHotels();
    } catch (err) {
      alert(err.response?.data?.message || '操作失败');
    }
  };

  const totalPages = Math.ceil(total / 10);
  const stars = (n) => n ? '⭐'.repeat(n) : '无星级';

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>酒店审核管理</h2>
          <p>共 {total} 条记录</p>
        </div>
      </div>

      <div className="filter-bar">
        <select value={statusFilter} onChange={e => setSearchParams(e.target.value ? { status: e.target.value } : {})}>
          <option value="">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已发布</option>
          <option value="rejected">已拒绝</option>
          <option value="offline">已下线</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : hotels.length === 0 ? (
          <div className="empty-state"><div className="icon">📋</div><p>暂无数据</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>酒店名称</th>
                <th>商户</th>
                <th>地区</th>
                <th>星级/价格</th>
                <th>状态</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map(h => (
                <tr key={h.id}>
                  <td>
                    <button className="hotel-name-link" onClick={() => setDetailModal(h)}>
                      <div>{h.name}</div>
                      {h.name_en && <div style={{ fontSize: 11, color: 'var(--stone)', fontWeight: 400 }}>{h.name_en}</div>}
                    </button>
                    {h.status === 'rejected' && h.reject_reason && (
                      <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 3 }}>理由：{h.reject_reason}</div>
                    )}
                  </td>
                  <td style={{ color: 'var(--stone)', fontSize: 13 }}>{h.merchant_name}</td>
                  <td>{h.province} {h.city}</td>
                  <td>
                    <div style={{ fontSize: 13 }}>{stars(h.star_level)}</div>
                    {h.price_range_min && <div style={{ fontSize: 12, color: 'var(--stone)' }}>¥{h.price_range_min}~{h.price_range_max}</div>}
                  </td>
                  <td><span className={`tag tag-${h.status}`}>{STATUS_LABELS[h.status]}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--stone)' }}>{new Date(h.updated_at).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setDetailModal(h)}>查看详情</button>
                      {h.status === 'pending' && (<>
                        <button className="btn btn-success btn-sm" onClick={() => openReview(h, 'approve')}>通过</button>
                        <button className="btn btn-danger btn-sm" onClick={() => openReview(h, 'reject')}>拒绝</button>
                      </>)}
                      {h.status === 'approved' && (
                        <button className="btn btn-outline btn-sm" onClick={() => openReview(h, 'offline')}>下线</button>
                      )}
                      {h.status === 'offline' && (
                        <button className="btn btn-success btn-sm" onClick={() => openReview(h, 'restore')}>恢复</button>
                      )}
                      {h.status === 'rejected' && (
                        <button className="btn btn-outline btn-sm" onClick={() => openReview(h, 'approve')}>重新通过</button>
                      )}
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

      {/* 审核弹窗 */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{{approve:'✅ 审核通过', reject:'❌ 拒绝审核', offline:'📴 下线确认', restore:'🔄 恢复发布'}[reviewAction]}</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>×</button>
            </div>
            <p style={{ color: 'var(--stone)', marginBottom: 16 }}>
              操作对象：<strong style={{ color: 'var(--ink)' }}>{reviewModal.name}</strong>
              {reviewModal.name_en && <span style={{ color: 'var(--stone)', fontSize: 13 }}> / {reviewModal.name_en}</span>}
            </p>
            {reviewAction === 'reject' && (
              <div className="form-group">
                <label className="required">拒绝原因</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="请填写拒绝原因，商户可以看到此原因并修改重新提交" rows={3} />
              </div>
            )}
            {reviewAction === 'approve' && <div className="alert alert-success">通过后该酒店信息将对外发布。</div>}
            {reviewAction === 'offline' && <div className="alert alert-info">下线后可随时恢复，数据不会删除。</div>}
            {reviewAction === 'restore' && <div className="alert alert-success">恢复后该酒店信息将重新对外发布。</div>}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setReviewModal(null)}>取消</button>
              <button
                className={`btn ${reviewAction === 'reject' || reviewAction === 'offline' ? 'btn-danger' : 'btn-success'}`}
                onClick={submitReview}
                disabled={reviewAction === 'reject' && !rejectReason.trim()}
              >确认</button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>🏨 {detailModal.name}</h3>
                {detailModal.name_en && <div style={{ color: 'var(--stone)', fontSize: 13, marginTop: 2 }}>{detailModal.name_en}</div>}
              </div>
              <button className="modal-close" onClick={() => setDetailModal(null)}>×</button>
            </div>

            <div className="detail-section">
              <div className="detail-grid">
                <div className="detail-row"><span>状态</span><span><span className={`tag tag-${detailModal.status}`}>{STATUS_LABELS[detailModal.status]}</span></span></div>
                <div className="detail-row"><span>商户</span><span>{detailModal.merchant_name}</span></div>
                <div className="detail-row"><span>地址</span><span>{detailModal.province} {detailModal.city} {detailModal.address}</span></div>
                <div className="detail-row"><span>星级</span><span>{'⭐'.repeat(detailModal.star_level) || '无'}</span></div>
                <div className="detail-row"><span>开业时间</span><span>{detailModal.open_date || '—'}</span></div>
                <div className="detail-row"><span>价格区间</span><span>{detailModal.price_range_min ? `¥${detailModal.price_range_min} ~ ¥${detailModal.price_range_max}` : '未设置'}</span></div>
                <div className="detail-row"><span>电话</span><span>{detailModal.phone || '—'}</span></div>
                <div className="detail-row"><span>邮箱</span><span>{detailModal.email || '—'}</span></div>
                <div className="detail-row"><span>官网</span><span>{detailModal.website ? <a href={detailModal.website} target="_blank" rel="noreferrer">{detailModal.website}</a> : '—'}</span></div>
              </div>
            </div>

            {detailModal.description && (
              <div className="detail-section">
                <div className="detail-section-title">酒店简介</div>
                <p style={{ color: 'var(--stone)', fontSize: 13, lineHeight: 1.8 }}>{detailModal.description}</p>
              </div>
            )}

            {detailModal.room_types?.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">房型信息（{detailModal.room_types.length}种）</div>
                <div className="room-list">
                  {detailModal.room_types.map((room, idx) => (
                    <div key={idx} className="room-item">
                      <div className="room-item-header">
                        <span className="room-item-name">{room.name}</span>
                        <span className="room-item-price">¥{room.price}/晚</span>
                      </div>
                      {room.description && <div className="room-item-desc">{room.description}</div>}
                      {room.total_rooms && <div style={{ fontSize: 12, color: "var(--stone)", marginBottom: 6 }}>共 {room.total_rooms} 间</div>}
                      {room.image && <img src={room.image.startsWith("http") ? room.image : `http://localhost:3001${room.image}`} alt={room.name} className="room-item-img" onError={e => e.target.style.display="none"} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailModal.facilities?.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">设施配套</div>
                <div className="chip-group" style={{ marginTop: 8 }}>
                  {detailModal.facilities.map(f => <span key={f} className="chip">{f}</span>)}
                </div>
              </div>
            )}

            {detailModal.nearby_info && (
              <div className="detail-section">
                <div className="detail-section-title">周边信息</div>
                <p style={{ color: 'var(--stone)', fontSize: 13, lineHeight: 1.8 }}>{detailModal.nearby_info}</p>
              </div>
            )}

            {detailModal.images?.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">酒店图片</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {detailModal.images.map(url => (
                    <img key={url} src={url.startsWith("http") ? url : `http://localhost:3001${url}`} alt="" style={{ height: 90, borderRadius: 6, objectFit: "cover" }} onError={e => e.target.style.display="none"} />
                  ))}
                </div>
              </div>
            )}

            {detailModal.status === 'rejected' && detailModal.reject_reason && (
              <div className="alert alert-error" style={{ marginTop: 12 }}>
                <strong>拒绝原因：</strong>{detailModal.reject_reason}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDetailModal(null)}>关闭</button>
              {detailModal.status === 'pending' && (<>
                <button className="btn btn-success" onClick={() => { setDetailModal(null); openReview(detailModal, 'approve'); }}>通过</button>
                <button className="btn btn-danger" onClick={() => { setDetailModal(null); openReview(detailModal, 'reject'); }}>拒绝</button>
              </>)}
              {detailModal.status === 'approved' && (
                <button className="btn btn-outline" onClick={() => { setDetailModal(null); openReview(detailModal, 'offline'); }}>下线</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
