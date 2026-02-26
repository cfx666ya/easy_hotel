import React, { useRef, useState } from 'react';
import api from '../utils/api';
import './ImageUploader.css';

const BASE_URL = 'http://localhost:3001';

/**
 * 通用图片上传组件
 * Props:
 *   images: string[]         当前图片URL列表
 *   onChange: (urls) => void  更新回调
 *   max: number               最多上传几张（默认10）
 *   single: boolean           是否单张模式（默认false）
 */
export default function ImageUploader({ images = [], onChange, max = 10, single = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return BASE_URL + url;
  };

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    const remaining = single ? 1 : max - images.length;
    if (remaining <= 0) {
      alert(`最多上传 ${max} 张图片`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      if (single) {
        const formData = new FormData();
        formData.append('image', toUpload[0]);
        const res = await api.post('/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        onChange([res.data.url]);
      } else {
        const formData = new FormData();
        toUpload.forEach(f => formData.append('images', f));
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        onChange([...images, ...res.data.urls]);
      }
    } catch (err) {
      alert(err.response?.data?.message || '上传失败，请重试');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => uploadFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const removeImage = (url) => {
    onChange(images.filter(u => u !== url));
  };

  const currentImages = single ? (images.length > 0 ? [images[0]] : []) : images;
  const canAdd = single ? currentImages.length === 0 : currentImages.length < max;

  return (
    <div className="image-uploader">
      <div className="image-uploader-grid">
        {/* 已上传的图片 */}
        {currentImages.map((url, idx) => (
          <div key={idx} className="upload-item upload-item--preview">
            <img src={getFullUrl(url)} alt={`图片${idx + 1}`} onError={e => { e.target.src = 'https://via.placeholder.com/100x80?text=加载失败'; }} />
            <button type="button" className="upload-remove" onClick={() => removeImage(url)} title="删除">×</button>
            <div className="upload-item-overlay">
              <span>点击×删除</span>
            </div>
          </div>
        ))}

        {/* 上传按钮 */}
        {canAdd && (
          <div
            className={`upload-item upload-item--add ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="upload-loading">
                <div className="upload-spinner" />
                <span>上传中...</span>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📷</div>
                <div className="upload-text">点击上传</div>
                <div className="upload-hint">或拖拽图片到此处</div>
                {!single && <div className="upload-hint">支持jpg/png/gif，最大5MB</div>}
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple={!single}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {!single && images.length > 0 && (
        <div className="upload-count">{images.length}/{max} 张</div>
      )}
    </div>
  );
}
