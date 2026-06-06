import React, { useEffect, useState, useRef } from 'react';
import CreateTransactionModal from '../components/CreateTransactionModal'; 
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PhieuThuChiPrint } from '../components/print-templates/PhieuThuChiPrint';

interface Transaction {
  id: number;
  projectId: number;
  type: string;
  amount: number;
  category: string;
  date: string;
  description: string | null;
  project: { id: number; name: string };
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printingTx, setPrintingTx] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDetails, setPrintDetails] = useState({ name: '', company: '', address: '', phone: '' });
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Phieu_Thu_Chi'
  });

  const onPrintClick = (tx: Transaction) => {
    setPrintingTx(tx);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('http://localhost:3000/transactions');
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCreated = () => {
    setIsModalOpen(false);
    fetchTransactions();
  };

  if (loading) return <div className="loader"></div>;

  // Analytics
  let totalIncome = 0;
  let totalExpense = 0;
  
  transactions.forEach(t => {
    if (t.type === 'INCOME') totalIncome += t.amount;
    else if (t.type === 'EXPENSE') totalExpense += t.amount;
  });

  const netBalance = totalIncome - totalExpense;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div>
      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <span className="text-muted">Tổng Thu (INCOME)</span>
          <span className="stat-value" style={{ color: 'var(--success)', marginTop: '8px', fontSize: '1.75rem' }}>
            {formatCurrency(totalIncome)}
          </span>
        </div>
        <div className="stat-card glass-panel">
          <span className="text-muted">Tổng Chi (EXPENSE)</span>
          <span className="stat-value" style={{ color: 'var(--danger)', marginTop: '8px', fontSize: '1.75rem' }}>
            {formatCurrency(totalExpense)}
          </span>
        </div>
        <div className="stat-card glass-panel">
          <span className="text-muted">Cân đối Lợi nhuận</span>
          <span className="stat-value" style={{ color: netBalance >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '8px', fontSize: '1.75rem' }}>
            {formatCurrency(netBalance)}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Sổ cái Giao dịch</h2>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Tạo Phiếu Mới
          </button>
        </div>

        {error && <div style={{ marginBottom: '16px', color: 'var(--warning)', fontSize: '0.875rem' }}>Lưu ý: Không thể kết nối tới máy chủ ({error}).</div>}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Dự án</th>
                <th>Phân loại</th>
                <th>Hạng mục</th>
                <th>Diễn giải</th>
                <th style={{ textAlign: 'right' }}>Số tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item) => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                  <td style={{ fontWeight: 500, color: 'white' }}>{item.project?.name || 'Văn phòng / Chung'}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        background: item.type === 'INCOME' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                        color: item.type === 'INCOME' ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${item.type === 'INCOME' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}
                    >
                      {item.type === 'INCOME' ? 'THU' : 'CHI'}
                    </span>
                  </td>
                  <td>{item.category}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.description || '-'}</td>
                  <td style={{ 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: item.type === 'INCOME' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-sm btn-primary" onClick={() => {
                      setPrintingTx(item);
                      setShowPrintModal(true);
                      setPrintDetails({ name: '', company: '', address: '', phone: '' });
                    }} title="In Phiếu Thu/Chi">
                      <Printer size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có giao dịch nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Info Modal */}
      {showPrintModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '20px' }}>Thông tin người {printingTx?.type === 'INCOME' ? 'Nộp tiền' : 'Nhận tiền'}</h3>
            
            <div className="form-group">
              <label>Họ và tên</label>
              <input type="text" className="form-control" value={printDetails.name} onChange={e => setPrintDetails({...printDetails, name: e.target.value})} placeholder="Nhập họ tên đầy đủ" />
            </div>
            
            <div className="form-group">
              <label>Đơn vị / Công ty</label>
              <input type="text" className="form-control" value={printDetails.company} onChange={e => setPrintDetails({...printDetails, company: e.target.value})} placeholder="Tên đơn vị, phòng ban (nếu có)" />
            </div>
            
            <div className="form-group">
              <label>Địa chỉ</label>
              <input type="text" className="form-control" value={printDetails.address} onChange={e => setPrintDetails({...printDetails, address: e.target.value})} placeholder="Địa chỉ chi tiết" />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="text" className="form-control" value={printDetails.phone} onChange={e => setPrintDetails({...printDetails, phone: e.target.value})} placeholder="Số điện thoại liên hệ" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
              <button className="btn btn-secondary" onClick={() => setShowPrintModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={() => {
                setShowPrintModal(false);
                setTimeout(() => handlePrint(), 100);
              }}>
                Xác nhận In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CreateTransactionModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleCreated} 
        />
      )}

      {/* Hidden Print Container */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <PhieuThuChiPrint ref={printRef} transaction={printingTx} printDetails={printDetails} />
      </div>
    </div>
  );
}
