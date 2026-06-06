import React, { useState } from 'react';

interface CreatePersonnelModalProps {
  onClose: () => void;
  onSuccess: () => void;
  existingItem?: {
    id: number;
    name: string;
    idCardNumber: string;
    idCardUrl: string;
    contractUrl: string;
    contractType: string;
    hasTaxCommitment: boolean;
  } | null;
}

export default function CreatePersonnelModal({ onClose, onSuccess, existingItem }: CreatePersonnelModalProps) {
  const [name, setName] = useState(existingItem?.name || '');
  const [cccd, setCccd] = useState(existingItem?.cccd || '');
  const [hometown, setHometown] = useState(existingItem?.hometown || '');
  const [phone, setPhone] = useState(existingItem?.phone || '');
  const [role, setRole] = useState(existingItem?.role || 'Kỹ sư');
  const [salaryPerDay, setSalaryPerDay] = useState(existingItem?.salaryPerDay || '');
  const [status, setStatus] = useState(existingItem?.status || 'ACTIVE');
  
  const [idCardNumber, setIdCardNumber] = useState(existingItem?.idCardNumber || '');
  const [idCardUrl, setIdCardUrl] = useState(existingItem?.idCardUrl || '');
  const [contractUrl, setContractUrl] = useState(existingItem?.contractUrl || '');
  const [contractType, setContractType] = useState(existingItem?.contractType || 'THOI_VU');
  const [hasTaxCommitment, setHasTaxCommitment] = useState(existingItem?.hasTaxCommitment || false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name,
      cccd,
      hometown,
      phone,
      role,
      salaryPerDay: Number(salaryPerDay),
      status,
      idCardNumber,
      idCardUrl,
      contractUrl,
      contractType,
      hasTaxCommitment,
    };

    try {
      let res;
      if (existingItem) {
        res = await fetch(`http://localhost:3000/personnel/${existingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('http://localhost:3000/personnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        throw new Error('Lỗi khi lưu nhân sự');
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>{existingItem ? 'Cập nhật Hồ sơ' : 'Thêm Nhân sự mới'}</h2>
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
            <label className="form-label">Họ và Tên</label>
            <input 
              type="text" 
              className="form-input" 
              required
              placeholder="VD: Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Chức vụ</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Kỹ sư">Kỹ sư</option>
                <option value="Công nhân">Công nhân</option>
                <option value="Giám sát">Giám sát</option>
                <option value="Quản lý">Quản lý</option>
                <option value="Kế toán">Kế toán</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ACTIVE">Đang làm việc</option>
                <option value="INACTIVE">Đã nghỉ việc</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Số CCCD</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nhập 12 số CCCD..."
                value={idCardNumber}
                onChange={(e) => setIdCardNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quê quán</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="VD: Hà Nội"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="VD: 0987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lương cơ bản (VNĐ/ngày)</label>
              <input 
                type="number" 
                className="form-input" 
                min="0"
                placeholder="VD: 500000"
                value={salaryPerDay}
                onChange={(e) => setSalaryPerDay(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Loại hợp đồng</label>
              <select className="form-select" value={contractType} onChange={(e) => setContractType(e.target.value)}>
                <option value="THOI_VU">Thời vụ (Dưới 3 tháng)</option>
                <option value="CHINH_THUC">Chính thức (Trên 3 tháng)</option>
                <option value="KHOAN">Khoán việc</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cam kết Thuế TNCN (Bản 08)</label>
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={hasTaxCommitment} onChange={(e) => setHasTaxCommitment(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                  <span>Đã nộp Bản cam kết 08 (Không trừ 10%)</span>
                </label>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--danger)', fontSize: '0.9rem' }}>Hồ sơ pháp lý (Bắt buộc để Kế toán tính lương)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Link Ảnh CCCD</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Dán link ảnh CCCD..."
                  value={idCardUrl}
                  onChange={(e) => setIdCardUrl(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.2)' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Link Hợp đồng</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Dán link Hợp đồng..."
                  value={contractUrl}
                  onChange={(e) => setContractUrl(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.2)' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)' }} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu Hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
