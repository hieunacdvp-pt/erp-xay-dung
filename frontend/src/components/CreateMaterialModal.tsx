import React, { useState, useEffect } from 'react';

interface CreateMaterialModalProps {
  material?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMaterialModal({ material, onClose, onSuccess }: CreateMaterialModalProps) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (material) {
      setName(material.name);
      setUnit(material.unit);
      setPrice(material.price ? material.price.toString() : '');
      setDescription(material.description || '');
    }
  }, [material]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = material ? `http://localhost:3000/materials/${material.id}` : 'http://localhost:3000/materials';
      const method = material ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, unit, price: Number(price), description }),
      });

      if (!res.ok) {
        throw new Error(`Lỗi khi ${material ? 'cập nhật' : 'tạo'} danh mục vật tư`);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>{material ? 'Cập nhật Vật tư' : 'Tạo Danh mục Vật tư Mới'}</h2>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
          >
            &times;
          </button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên Vật tư</label>
            <input 
              type="text" 
              className="form-input" 
              required
              placeholder="VD: Cát xây tô, Xi măng Hà Tiên..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Đơn vị tính</label>
              <input 
                type="text" 
                className="form-input" 
                required
                placeholder="VD: kg, m3, bao, tấn..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Đơn giá (VNĐ)</label>
              <input 
                type="number" 
                className="form-input" 
                min="0"
                placeholder="VD: 50000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
            
          <div className="form-group">
            <label className="form-label">Mô tả (Tùy chọn)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ghi chú thêm..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)' }} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu Vật Tư'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
