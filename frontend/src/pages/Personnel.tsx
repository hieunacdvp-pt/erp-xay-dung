import React, { useEffect, useState, useRef } from 'react';
import CreatePersonnelModal from '../components/CreatePersonnelModal';
import { useReactToPrint } from 'react-to-print';
import { MasterDataPrint } from '../components/print-templates/MasterDataPrint';
import { Plus, Printer } from 'lucide-react';

interface Personnel {
  id: number;
  name: string;
  idCardNumber: string;
  idCardUrl: string;
  contractUrl: string;
  contractType: string;
  hasTaxCommitment: boolean;
  hometown: string;
  phone: string;
  role: string;
  salaryPerDay: number;
  status: string;
}

export default function Personnel() {
  const [personnels, setPersonnels] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Personnel | null>(null);

  const fetchPersonnels = async () => {
    try {
      const res = await fetch('http://localhost:3000/personnel');
      if (!res.ok) throw new Error('Failed to fetch personnel');
      const data = await res.json();
      setPersonnels(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu. (Có thể chưa chạy Migration Database)');
      setPersonnels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnels();
  }, []);

  const handleCreated = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    fetchPersonnels();
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Danh_Sach_Nhan_Su'
  });

  if (loading) return <div className="loader"></div>;

  const activeCount = personnels.filter(p => p.status === 'ACTIVE').length;
  const avgSalary = activeCount > 0 
    ? personnels.filter(p => p.status === 'ACTIVE').reduce((acc, curr) => acc + curr.salaryPerDay, 0) / activeCount 
    : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div>
      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <span className="text-muted">Tổng nhân sự</span>
          <span className="stat-value">{personnels.length}</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="text-muted">Đang làm việc</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>{activeCount}</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="text-muted">Lương trung bình / Ngày</span>
          <span className="stat-value" style={{ color: 'var(--accent-primary)' }}>
            {formatCurrency(avgSalary)}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Danh sách Nhân sự</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handlePrint}>
              <Printer size={18} /> In Danh sách
            </button>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
              <Plus size={18} /> Thêm Nhân sự
            </button>
          </div>
        </div>

        {error && <div style={{ marginBottom: '16px', color: 'var(--warning)', fontSize: '0.875rem' }}>Lưu ý: Không thể kết nối tới máy chủ ({error}). Vui lòng chạy lệnh npx prisma migrate dev.</div>}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Họ & Tên</th>
                <th>Chức vụ</th>
                <th>CCCD & Quê quán</th>
                <th>Số điện thoại</th>
                <th>Mức lương/ngày</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {personnels.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500, color: 'white' }}>{item.name}</td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                      {item.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.idCardNumber || 'Chưa có CCCD'}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.hometown || '-'}</div>
                    
                    {/* Legal Compliance Badges */}
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(!item.idCardUrl || !item.contractUrl || !item.hasTaxCommitment) ? (
                        <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '2px 6px', display: 'inline-block', width: 'max-content' }}>
                          ⚠️ THIẾU HỒ SƠ PHÁP LÝ
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 6px', display: 'inline-block', width: 'max-content' }}>
                          ✅ ĐỦ HỒ SƠ
                        </span>
                      )}
                      {item.hasTaxCommitment && <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.65rem', width: 'max-content' }}>Đã nộp CK08</span>}
                    </div>
                  </td>
                  <td>{item.phone || '-'}</td>
                  <td>{formatCurrency(item.salaryPerDay)}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        background: item.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                        color: item.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${item.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}
                    >
                      {item.status === 'ACTIVE' ? 'Đang làm' : 'Đã nghỉ'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', fontWeight: 500 }}>
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
              {personnels.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có nhân sự nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CreatePersonnelModal 
          existingItem={editingItem}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleCreated} 
        />
      )}

      {/* Hidden Print Container */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <MasterDataPrint 
          ref={printRef} 
          title="DANH SÁCH NHÂN SỰ"
          data={personnels}
          columns={[
            { header: 'Họ và tên', key: 'name' },
            { header: 'Chức vụ', key: 'role', align: 'center' },
            { header: 'Số điện thoại', key: 'phone', align: 'center' },
            { header: 'Mức lương (VNĐ/Ngày)', key: 'salaryPerDay', align: 'right', format: (val) => new Intl.NumberFormat('vi-VN').format(val) }
          ]}
        />
      </div>
    </div>
  );
}
