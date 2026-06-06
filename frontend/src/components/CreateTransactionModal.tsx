import React, { useEffect, useState } from 'react';

interface Project {
  id: number;
  name: string;
}

interface CreateTransactionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Vật tư', 'Nhân công', 'Tạm ứng lương', 'Máy móc', 'Vận chuyển', 
  'Thiết bị', 'Quản lý', 'Mặt bằng', 'Điện nước', 
  'Nghiệm thu', 'Thanh toán công nợ', 'Khác'
];

export default function CreateTransactionModal({ onClose, onSuccess }: CreateTransactionModalProps) {
  const [projectId, setProjectId] = useState('');
  const [type, setType] = useState('EXPENSE'); // INCOME, EXPENSE
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Vật tư');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [vatRate, setVatRate] = useState('0');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [personnels, setPersonnels] = useState<any[]>([]);
  const [personnelId, setPersonnelId] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3000/projects').then(r => r.json()),
      fetch('http://localhost:3000/personnel').then(r => r.json())
    ]).then(([projData, persData]) => {
      setProjects(projData);
      setPersonnels(persData.filter((p: any) => p.status === 'ACTIVE'));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload: any = {
      projectId: Number(projectId),
      type,
      amount: Number(amount),
      category,
      date: new Date(date).toISOString(),
      description,
      vatRate: Number(vatRate),
      invoiceNumber: invoiceNumber.trim() || undefined
    };

    if (category === 'Tạm ứng lương' && personnelId) {
      payload.personnelId = Number(personnelId);
    }

    try {
      const res = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Lỗi khi tạo giao dịch');
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
          <h2>Ghi nhận Giao dịch mới</h2>
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
            <label className="form-label">Dự án</label>
            <select 
              className="form-select" 
              value={projectId} 
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="" disabled>-- Chọn dự án --</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Loại giao dịch</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="EXPENSE">Phiếu Chi (Tiền ra)</option>
                <option value="INCOME">Phiếu Thu (Tiền vào)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Hạng mục</label>
              <select className="form-select" value={category} onChange={(e) => {
                setCategory(e.target.value);
                if (e.target.value === 'Tạm ứng lương') setType('EXPENSE');
              }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {category === 'Tạm ứng lương' && (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Nhân sự tạm ứng</label>
              <select 
                className="form-select" 
                value={personnelId} 
                onChange={(e) => setPersonnelId(e.target.value)}
                required
              >
                <option value="" disabled>-- Chọn nhân sự --</option>
                {personnels.map(p => <option key={p.id} value={p.id}>{p.name} - {p.role}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Số tiền (VNĐ)</label>
              <input 
                type="number" 
                className="form-input" 
                required
                min="0"
                placeholder="VD: 5000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ngày ghi nhận</label>
              <input 
                type="date" 
                className="form-input" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Thuế GTGT (VAT %)</label>
              <select className="form-select" value={vatRate} onChange={(e) => setVatRate(e.target.value)}>
                <option value="0">0% (Không chịu thuế)</option>
                <option value="5">5%</option>
                <option value="8">8% (Giảm thuế)</option>
                <option value="10">10%</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Số Hóa Đơn GTGT (Nếu có)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="VD: 0012345"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Diễn giải / Ghi chú</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="VD: Thanh toán tiền cát tháng 5..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)' }} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu Giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
