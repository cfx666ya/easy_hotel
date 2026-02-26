import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import ImageUploader from '../components/ImageUploader';
import './HotelForm.css';

const FACILITIES = ['停车场', '免费WiFi', '游泳池', '健身房', '餐厅', '酒吧', '会议室', '洗衣服务', 'SPA', '机场接送', '儿童设施', '24小时前台'];

const emptyRoom = () => ({ name: '', price: '', total_rooms: '', description: '', image: '' });

export default function HotelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const customFacilityRef = useRef(null);

  const [form, setForm] = useState({
    name: '', name_en: '', address: '', city: '', province: '',
    phone: '', email: '', website: '', open_date: '',
    star_level: 3, price_range_min: '', price_range_max: '',
    description: '', facilities: [], images: [],
    room_types: [], nearby_info: '', lat: '', lng: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      api.get(`/hotels/${id}`).then(res => {
        const data = res.data;
        setForm({
          ...data,
          room_types: data.room_types || [],
          facilities: data.facilities || [],
          images: data.images || [],
          nearby_info: data.nearby_info || ''
        });
        setPageLoading(false);
      }).catch(() => navigate('/hotels'));
    }
  }, [id]);

  // 设施
  const toggleFacility = (f) => {
    setForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter(x => x !== f)
        : [...prev.facilities, f]
    }));
  };

  const addCustomFacility = () => {
    const val = customFacilityRef.current?.value?.trim();
    if (val && !form.facilities.includes(val)) {
      setForm(prev => ({ ...prev, facilities: [...prev.facilities, val] }));
      customFacilityRef.current.value = '';
    }
  };

  // 房型
  const addRoom = () => setForm(prev => ({ ...prev, room_types: [...prev.room_types, emptyRoom()] }));

  const updateRoom = (idx, field, value) => {
    setForm(prev => {
      const rooms = [...prev.room_types];
      rooms[idx] = { ...rooms[idx], [field]: value };
      return { ...prev, room_types: rooms };
    });
  };

  const removeRoom = (idx) => setForm(prev => ({ ...prev, room_types: prev.room_types.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doSubmit(false);
  };

  const handleSaveDraft = async () => {
    await doSubmit(true);
  };

  const doSubmit = async (isDraft) => {
    setError(''); setLoading(true);
    try {
      const payload = { ...form, is_draft: isDraft };
      if (isEdit) {
        await api.put(`/hotels/${id}`, payload);
        alert(isDraft ? '草稿已保存！可随时继续编辑' : '更新成功！已重新提交审核，等待管理员审核');
      } else {
        await api.post('/hotels', payload);
        alert(isDraft ? '草稿已保存！可在"我的酒店"中继续编辑' : '提交成功，等待管理员审核');
      }
      navigate('/hotels');
    } catch (err) {
      setError(err.response?.data?.message || '操作失败');
    } finally { setLoading(false); }
  };

  if (pageLoading) return <div className="loading">加载中...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{isEdit ? '编辑酒店信息' : '新增酒店'}</h2>
          <p>{isEdit ? '修改后将重新提交审核' : '填写完整信息后提交审核'}</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/hotels')}>← 返回列表</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="hotel-form">

        {/* 基本信息 */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="section-title">基本信息</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="required">酒店中文名称</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="如：全季酒店" required />
            </div>
            <div className="form-group">
              <label className="required">酒店英文名称</label>
              <input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} placeholder="如：JI Hotel" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="required">省份</label>
              <input value={form.province} onChange={e => setForm({...form, province: e.target.value})} placeholder="如：广东省" required />
            </div>
            <div className="form-group">
              <label className="required">城市</label>
              <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="如：广州市" required />
            </div>
          </div>
          <div className="form-group">
            <label className="required">详细地址</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="请输入详细地址" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>联系电话</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="酒店联系电话" />
            </div>
            <div className="form-group">
              <label>邮箱</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="酒店邮箱" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>官网</label>
              <input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label>开业时间</label>
              <input value={form.open_date} onChange={e => setForm({...form, open_date: e.target.value})} placeholder="如：2015年8月" />
            </div>
          </div>
        </div>

        {/* 价格与星级 */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="section-title">价格与星级</h3>
          <div className="form-row-3">
            <div className="form-group">
              <label>星级</label>
              <select value={form.star_level} onChange={e => setForm({...form, star_level: parseInt(e.target.value)})}>
                <option value={0}>无星级</option>
                <option value={1}>⭐ 一星</option>
                <option value={2}>⭐⭐ 二星</option>
                <option value={3}>⭐⭐⭐ 三星</option>
                <option value={4}>⭐⭐⭐⭐ 四星</option>
                <option value={5}>⭐⭐⭐⭐⭐ 五星</option>
              </select>
            </div>
            <div className="form-group">
              <label>最低价格（元/晚）</label>
              <input type="number" value={form.price_range_min} onChange={e => setForm({...form, price_range_min: e.target.value})} placeholder="如：299" />
            </div>
            <div className="form-group">
              <label>最高价格（元/晚）</label>
              <input type="number" value={form.price_range_max} onChange={e => setForm({...form, price_range_max: e.target.value})} placeholder="如：999" />
            </div>
          </div>
        </div>

        {/* 酒店简介 */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="section-title">酒店简介</h3>
          <div className="form-group">
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="描述酒店特色、服务、位置优势等..." rows={4} />
          </div>
        </div>

        {/* 酒店图片 */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="section-title">酒店图片</h3>
          <p style={{ color: 'var(--stone)', fontSize: 12, marginBottom: 12 }}>
            支持点击上传或拖拽图片，最多10张，每张不超过5MB，支持 jpg/png/gif/webp
          </p>
          <ImageUploader
            images={form.images}
            onChange={urls => setForm(prev => ({ ...prev, images: urls }))}
            max={10}
          />
        </div>

        {/* 房型管理 */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>房型信息</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={addRoom}>＋ 添加房型</button>
          </div>

          {form.room_types.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--stone)', border: '1px dashed var(--cream-dark)', borderRadius: 6 }}>
              暂无房型，点击右上角"添加房型"
            </div>
          )}

          {form.room_types.map((room, idx) => (
            <div key={idx} className="room-card">
              <div className="room-card-header">
                <span className="room-index">🛏 房型 {idx + 1}</span>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeRoom(idx)}>删除此房型</button>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="required">房型名称</label>
                  <input value={room.name} onChange={e => updateRoom(idx, 'name', e.target.value)} placeholder="如：标准大床房" />
                </div>
                <div className="form-group">
                  <label className="required">价格（元/晚）</label>
                  <input type="number" value={room.price} onChange={e => updateRoom(idx, 'price', e.target.value)} placeholder="如：399" />
                </div>
                <div className="form-group">
                  <label>总房间数</label>
                  <input type="number" value={room.total_rooms} onChange={e => updateRoom(idx, 'total_rooms', e.target.value)} placeholder="如：20" min="1" />
                </div>
              </div>

              <div className="form-group">
                <label>房型描述</label>
                <input value={room.description} onChange={e => updateRoom(idx, 'description', e.target.value)} placeholder="如：40㎡，可住2人，含早餐，落地窗江景" />
              </div>

              <div className="form-group">
                <label>房型图片</label>
                <ImageUploader
                  images={room.image ? [room.image] : []}
                  onChange={urls => updateRoom(idx, 'image', urls[0] || '')}
                  max={1}
                  single={true}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 设施与配套 */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="section-title">设施与配套</h3>
          <div className="facilities-grid">
            {FACILITIES.map(f => (
              <label key={f} className={`facility-item ${form.facilities.includes(f) ? 'checked' : ''}`} onClick={() => toggleFacility(f)}>
                {form.facilities.includes(f) ? '✓ ' : ''}{f}
              </label>
            ))}
          </div>
          <div className="form-group" style={{ marginTop: 14 }}>
            <label>自定义设施（输入后点添加或按 Enter）</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={customFacilityRef}
                placeholder="输入自定义设施名称"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomFacility(); } }}
              />
              <button type="button" className="btn btn-outline" onClick={addCustomFacility}>添加</button>
            </div>
          </div>
          {form.facilities.filter(f => !FACILITIES.includes(f)).length > 0 && (
            <div className="chip-group" style={{ marginTop: 8 }}>
              {form.facilities.filter(f => !FACILITIES.includes(f)).map(f => (
                <span key={f} className="chip">
                  {f}
                  <button type="button" className="chip-remove" onClick={() => toggleFacility(f)}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 周边信息 */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="section-title">周边信息</h3>
          <div className="form-group">
            <label>附近景点、交通、商场等</label>
            <textarea
              value={form.nearby_info}
              onChange={e => setForm({...form, nearby_info: e.target.value})}
              placeholder="如：步行5分钟到地铁2号线人民广场站；附近有南京路步行街、外滩、豫园等景点..."
              rows={4}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>纬度（lat）</label>
              <input type="number" step="0.0000001" value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} placeholder="如：31.2304（可在高德地图拾取）" />
            </div>
            <div className="form-group">
              <label>经度（lng）</label>
              <input type="number" step="0.0000001" value={form.lng} onChange={e => setForm({...form, lng: e.target.value})} placeholder="如：121.4737（可在高德地图拾取）" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--stone)', marginTop: 4 }}>
            💡 经纬度可在 <a href="https://lbs.amap.com/tools/picker" target="_blank" rel="noreferrer">高德地图坐标拾取工具</a> 中获取，用于移动端地图定位功能
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/hotels')}>取消</button>
          <button type="button" className="btn btn-outline" onClick={handleSaveDraft} disabled={loading} style={{ borderColor: 'var(--gold)', color: 'var(--gold-dark)' }}>
            {loading ? '保存中...' : '💾 保存草稿'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '提交中...' : isEdit ? '保存并重新提交审核' : '提交审核'}
          </button>
        </div>
      </form>
    </div>
  );
}
