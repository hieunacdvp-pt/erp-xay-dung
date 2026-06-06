import React, { useEffect, useState, useRef } from 'react';
import { Plus, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { MasterDataPrint } from '../components/print-templates/MasterDataPrint';

interface BankAccount {
  id: number;
  name: string;
  type: string;
  accountNumber: string | null;
  bankName: string | null;
  openingBalance: number;
  balance: number;
}

export default function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState('CASH');
  const [formName, setFormName] = useState('');
  const [formAccNumber, setFormAccNumber] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formOpeningBalance, setFormOpeningBalance] = useState('');

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    fee: '0',
    description: ''
  });

  const fetchAccounts = async () => {
    try {
      const res = await fetch('http://localhost:3000/bank-accounts');
      if (!res.ok) throw new Error('Failed to fetch bank accounts');
      const data = await res.json();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          type: formType,
          accountNumber: formAccNumber,
          bankName: formBankName,
          openingBalance: Number(formOpeningBalance || 0)
        }),
      });
      if (!res.ok) throw new Error('Failed to create account');
      setIsModalOpen(false);
      setFormName('');
      setFormAccNumber('');
      setFormBankName('');
      setFormOpeningBalance('');
      fetchAccounts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferData.fromAccountId === transferData.toAccountId) {
      alert('Tài khoản nguồn và đích phải khác nhau');
      return;
    }
    if (Number(transferData.amount) <= 0) {
      alert('Số tiền chuyển phải lớn hơn 0');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/bank-accounts/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transferData,
          amount: Number(transferData.amount),
          fee: Number(transferData.fee || 0)
        }),
      });
      if (!res.ok) throw new Error('Failed to transfer');
      setIsTransferModalOpen(false);
      setTransferData({ fromAccountId: '', toAccountId: '', amount: '', fee: '0', description: '' });
      fetchAccounts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Danh_Sach_Tai_Khoan_Ngan_Hang'
  });

  if (loading) return <div className="loader"></div>;

  const totalCash = accounts.filter(a => a.type === 'CASH').reduce((s, a) => s + (a.balance || 0), 0);
  const totalBank = accounts.filter(a => a.type === 'BANK').reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div>
      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <span className="text-muted">Tổng Tiền Mặt</span>
          <span className="stat-value" style={{ color: 'var(--accent-secondary)' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCash)}
          </span>
        </div>
        <div className="stat-card glass-panel">
          <span className="text-muted">Tổng Tiền Gửi (Ngân hàng)</span>
          <span className="stat-value" style={{ color: 'var(--accent)' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalBank)}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Danh sách Tài khoản Ngân hàng</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => setIsTransferModalOpen(true)}>
              Điều chuyển tiền nội bộ
            </button>
            <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)' }} onClick={handlePrint}>
              <Printer size={18} /> In Danh sách
            </button>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Thêm Tài Khoản / Quỹ
            </button>
          </div>
        </div>

        {error && <div style={{ marginBottom: '16px', color: 'var(--warning)', fontSize: '0.875rem' }}>Lưu ý: {error}</div>}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                <th>Tên Tài Khoản / Quỹ</th>
                <th>Loại</th>
                <th>Ngân hàng</th>
                <th>Số tài khoản</th>
                <th style={{ textAlign: 'right' }}>Số dư Đầu kỳ</th>
                <th style={{ textAlign: 'right' }}>Số dư Hiện tại</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{index + 1}</td>
                  <td style={{ fontWeight: 500, color: 'white' }}>{item.name}</td>
                  <td>
                    <span className="badge" style={{ background: item.type === 'CASH' ? 'rgba(232, 184, 114, 0.2)' : 'rgba(92, 157, 245, 0.2)', color: item.type === 'CASH' ? 'var(--accent-secondary)' : 'var(--accent)' }}>
                      {item.type === 'CASH' ? 'Tiền Mặt' : 'Ngân hàng'}
                    </span>
                  </td>
                  <td>{item.bankName || '-'}</td>
                  <td>{item.accountNumber || '-'}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.openingBalance || 0)}
                  </td>
                  <td style={{ fontWeight: 'bold', textAlign: 'right', color: 'var(--success)' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.balance || 0)}
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có dữ liệu.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm Tài Khoản / Quỹ</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Loại</label>
                <select className="form-input" value={formType} onChange={(e) => setFormType(e.target.value)}>
                  <option value="CASH">Quỹ Tiền Mặt</option>
                  <option value="BANK">Tài Khoản Ngân Hàng</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tên hiển thị (VD: Quỹ Hà Nội, BIDV Cty...)</label>
                <input type="text" className="form-input" required value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              
              {formType === 'BANK' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Tên Ngân hàng</label>
                    <input type="text" className="form-input" required={formType === 'BANK'} value={formBankName} onChange={(e) => setFormBankName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số tài khoản</label>
                    <input type="text" className="form-input" required={formType === 'BANK'} value={formAccNumber} onChange={(e) => setFormAccNumber(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Số dư đầu kỳ (Tùy chọn)</label>
                <input type="number" className="form-input" value={formOpeningBalance} onChange={(e) => setFormOpeningBalance(e.target.value)} placeholder="Nhập số dư hiện có..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTransferModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Điều chuyển tiền nội bộ</h2>
            <form onSubmit={handleTransferSubmit} style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Chuyển TỪ (Nguồn)</label>
                  <select className="form-input" required value={transferData.fromAccountId} onChange={e => setTransferData({...transferData, fromAccountId: e.target.value})}>
                    <option value="">-- Chọn Nguồn --</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({new Intl.NumberFormat('vi-VN').format(a.balance)}đ)</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Chuyển ĐẾN (Đích)</label>
                  <select className="form-input" required value={transferData.toAccountId} onChange={e => setTransferData({...transferData, toAccountId: e.target.value})}>
                    <option value="">-- Chọn Đích --</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({new Intl.NumberFormat('vi-VN').format(a.balance)}đ)</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Số tiền chuyển khoản</label>
                  <input type="number" className="form-input" required min="1" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phí Ngân hàng (642)</label>
                  <input type="number" className="form-input" min="0" value={transferData.fee} onChange={e => setTransferData({...transferData, fee: e.target.value})} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Diễn giải</label>
                <input type="text" className="form-input" required value={transferData.description} onChange={e => setTransferData({...transferData, description: e.target.value})} placeholder="VD: Rút tiền Vietcombank về Quỹ mặt..." />
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '0.85rem' }}>
                Hệ thống sẽ tự động hạch toán đối ứng: Giảm Tiền Nguồn (Có) và Tăng Tiền Đích (Nợ). Phí ngân hàng hạch toán vào 642.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setIsTransferModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Xác nhận Chuyển</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Print Container */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <MasterDataPrint 
          ref={printRef} 
          title="DANH SÁCH TÀI KHOẢN NGÂN HÀNG"
          data={accounts}
          columns={[
            { header: 'Ngân hàng', key: 'bankName' },
            { header: 'Tên Tài khoản', key: 'accountName' },
            { header: 'Số Tài khoản', key: 'accountNumber', align: 'center' },
            { header: 'Chi nhánh', key: 'branch' }
          ]}
        />
      </div>
    </div>
  );
}
