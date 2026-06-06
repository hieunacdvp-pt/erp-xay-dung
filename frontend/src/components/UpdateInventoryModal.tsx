import React, { useEffect, useState } from 'react';

interface Project {
  id: number;
  name: string;
}

interface Material {
  id: number;
  name: string;
  unit: string;
}

interface UpdateInventoryModalProps {
  onClose: () => void;
  onSuccess: () => void;
  existingItem?: {
    id: number;
    projectId: number;
    materialId: number;
    quantity: number;
  } | null;
}

export default function UpdateInventoryModal({ onClose, onSuccess, existingItem }: UpdateInventoryModalProps) {
  const [projectId, setProjectId] = useState(existingItem?.projectId || '');
  const [materialId, setMaterialId] = useState(existingItem?.materialId || '');
  
  const [actionType, setActionType] = useState<'add' | 'subtract' | 'set'>(existingItem ? 'add' : 'set');
  const [amount, setAmount] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/projects').then(r => r.json()).then(setProjects).catch(() => {});
    fetch('http://localhost:3000/materials').then(r => r.json()).then(setMaterials).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let finalQuantity = Number(amount);
    if (existingItem) {
      if (actionType === 'add') {
        finalQuantity = existingItem.quantity + finalQuantity;
      } else if (actionType === 'subtract') {
        finalQuantity = existingItem.quantity - finalQuantity;
        if (finalQuantity < 0) {
          setError('Số lượng xuất kho không thể lớn hơn số lượng tồn kho hiện tại!');
          setLoading(false);
          return;
        }
      }
    }

    const payload = {
      projectId: Number(projectId),
      materialId: Number(materialId),
      quantity: finalQuantity,
    };

    try {
      let res;
      if (existingItem) {
        res = await fetch(`http://localhost:3000/inventories/${existingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('http://localhost:3000/inventories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Lỗi khi cập nhật tồn kho (Có thể dữ liệu bị trùng lặp)');
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
          <h2>{existingItem ? 'Nhập / Xuất Kho' : 'Khởi tạo Tồn kho'}</h2>
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
            <label className="form-label">Dự án / Công trình</label>
            <select 
              className="form-select" 
              value={projectId} 
              onChange={(e) => setProjectId(e.target.value)}
              disabled={!!existingItem}
              required
            >
              <option value="" disabled>-- Chọn dự án --</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Vật tư</label>
            <select 
              className="form-select" 
              value={materialId} 
              onChange={(e) => setMaterialId(e.target.value)}
              disabled={!!existingItem}
              required
            >
              <option value="" disabled>-- Chọn vật tư --</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
            </select>
          </div>

          {existingItem && (
            <div className="form-group">
              <label className="form-label">Tồn kho hiện tại: <strong style={{ color: 'white', fontSize: '1rem' }}>{existingItem.quantity}</strong></label>
            </div>
          )}

          {existingItem && (
            <div className="form-group">
              <label className="form-label">Loại thao tác</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="action" checked={actionType === 'add'} onChange={() => setActionType('add')} /> Nhập thêm
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="action" checked={actionType === 'subtract'} onChange={() => setActionType('subtract')} /> Xuất kho
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="action" checked={actionType === 'set'} onChange={() => setActionType('set')} /> Đặt lại số lượng
                </label>
              </div>
            </div>
          )}
            
          <div className="form-group">
            <label className="form-label">
              {existingItem ? (actionType === 'set' ? 'Số lượng chốt mới' : 'Số lượng giao dịch') : 'Số lượng ban đầu'}
            </label>
            <input 
              type="number" 
              className="form-input" 
              required
              step="any"
              min="0"
              placeholder="Nhập số lượng..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)' }} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu Tồn kho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
