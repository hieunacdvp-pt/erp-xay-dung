import React, { useEffect, useState, useRef } from 'react';
import { Package, AlertTriangle, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PhieuNhapXuatPrint } from '../components/print-templates/PhieuNhapXuatPrint';

interface InventoryItem {
  id: number;
  projectId: number;
  materialId: number;
  quantity: number;
  updatedAt: string;
  project: { id: number; name: string };
  material: { id: number; name: string; unit: string };
}

export default function Inventory() {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'STOCK' | 'MOVEMENTS'>('STOCK');
  
  const [printingMov, setPrintingMov] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupBy, setGroupBy] = useState<'project' | 'material'>('project');

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDetails, setPrintDetails] = useState({ name: '', company: '', address: '', phone: '' });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Phieu_Nhap_Xuat'
  });

  const onPrintClick = (mov: any) => {
    setPrintingMov(mov);
    setPrintDetails({ name: '', company: '', address: '', phone: '' });
    setShowPrintModal(true);
  };

  const fetchInventories = async () => {
    try {
      const res = await fetch('http://localhost:3000/inventories');
      if (!res.ok) throw new Error('Failed to fetch inventories');
      const data = await res.json();
      setInventories(data);
      
      const resMov = await fetch('http://localhost:3000/inventories/movements');
      if (resMov.ok) {
        const movData = await resMov.json();
        setMovements(movData);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
      setInventories([]);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchInventories();
  }, []);

  if (loading) return <div className="loader"></div>;

  // Grouping Logic
  let groupedData: Record<string, InventoryItem[]> = {};
  inventories.forEach(inv => {
    const key = groupBy === 'project' ? inv.project.name : inv.material.name;
    if (!groupedData[key]) groupedData[key] = [];
    groupedData[key].push(inv);
  });

  return (
    <div>
      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>Tổng số mã lưu kho</span>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--accent-primary)' }}>
              <Package size={20} />
            </div>
          </div>
          <span className="stat-value">{inventories.length}</span>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>Đang cảnh báo (&lt; 10)</span>
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--danger)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <span className="stat-value" style={{ color: 'var(--danger)' }}>
            {inventories.filter(i => i.quantity < 10).length}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <button 
                className={`btn ${activeTab === 'STOCK' ? 'btn-primary' : ''}`}
                style={{ background: activeTab === 'STOCK' ? '' : 'rgba(255,255,255,0.05)', color: activeTab === 'STOCK' ? '#fff' : '#ccc' }}
                onClick={() => setActiveTab('STOCK')}
              >
                Tồn kho hiện tại
              </button>
              <button 
                className={`btn ${activeTab === 'MOVEMENTS' ? 'btn-primary' : ''}`}
                style={{ background: activeTab === 'MOVEMENTS' ? '' : 'rgba(255,255,255,0.05)', color: activeTab === 'MOVEMENTS' ? '#fff' : '#ccc' }}
                onClick={() => setActiveTab('MOVEMENTS')}
              >
                Lịch sử Nhập/Xuất
              </button>
            </div>
            {activeTab === 'STOCK' && (
              <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                <button 
                  onClick={() => setGroupBy('project')}
                  style={{ 
                    background: groupBy === 'project' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none', color: groupBy === 'project' ? 'white' : 'var(--text-secondary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s'
                  }}>Theo Dự án</button>
                <button 
                  onClick={() => setGroupBy('material')}
                  style={{ 
                    background: groupBy === 'material' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none', color: groupBy === 'material' ? 'white' : 'var(--text-secondary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s'
                  }}>Theo Vật tư</button>
              </div>
            )}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            * Tồn kho được tự động tính toán qua Phiếu Nhập/Xuất
          </div>
        </div>

        {error && <div style={{ marginBottom: '16px', color: 'var(--warning)', fontSize: '0.875rem' }}>Lưu ý: Không thể kết nối tới máy chủ ({error}).</div>}

        <div className="table-container">
          {activeTab === 'STOCK' ? (
            <table className="table">
              <thead>
                <tr>
                  <th>{groupBy === 'project' ? 'Vật tư' : 'Dự án'}</th>
                  <th>Số lượng</th>
                  <th>Đơn vị</th>
                  <th>Cập nhật cuối</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedData).map(groupName => (
                  <React.Fragment key={groupName}>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <td colSpan={5} style={{ fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                        {groupBy === 'project' ? '🏢 Dự án:' : '📦 Vật tư:'} {groupName}
                      </td>
                    </tr>
                    {groupedData[groupName].map((inv: InventoryItem) => (
                      <tr key={inv.id}>
                        <td style={{ paddingLeft: '40px' }}>{groupBy === 'project' ? inv.material.name : inv.project.name}</td>
                        <td>
                          <span style={{ 
                            color: inv.quantity < 10 ? 'var(--danger)' : 'white',
                            fontWeight: inv.quantity < 10 ? 700 : 400
                          }}>
                            {inv.quantity} {inv.quantity < 10 && '⚠️'}
                          </span>
                        </td>
                        <td>{inv.material.unit}</td>
                        <td>{new Date(inv.updatedAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <span className="text-muted">Tự động cập nhật</span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                {inventories.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có dữ liệu tồn kho.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Loại phiếu</th>
                  <th>Dự án</th>
                  <th>Vật tư</th>
                  <th style={{ textAlign: 'right' }}>Số lượng</th>
                  <th style={{ textAlign: 'right' }}>Đơn giá</th>
                  <th>Ghi chú</th>
                  <th>In Phiếu</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((mov: any) => (
                  <tr key={mov.id}>
                    <td>{new Date(mov.date).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className="badge" style={{ background: mov.type === 'IMPORT' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: mov.type === 'IMPORT' ? 'var(--success)' : 'var(--danger)' }}>
                        {mov.type === 'IMPORT' ? 'NHẬP KHO' : 'XUẤT KHO'}
                      </span>
                    </td>
                    <td>{mov.project?.name}</td>
                    <td>{mov.material?.name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{mov.quantity} {mov.material?.unit}</td>
                    <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(mov.price)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {(() => {
                        try {
                          const n = JSON.parse(mov.note);
                          return n.note || '-';
                        } catch(e) {
                          return mov.note || '-';
                        }
                      })()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn btn-sm btn-primary" onClick={() => onPrintClick(mov)} title="In Phiếu">
                        <Printer size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có lịch sử nhập xuất.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Print Info Modal */}
      {showPrintModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '20px' }}>Thông tin người {printingMov?.type === 'IMPORT' ? 'Giao hàng' : 'Nhận hàng'}</h3>
            
            <div className="form-group">
              <label>Họ và tên</label>
              <input type="text" className="form-control" value={printDetails.name} onChange={e => setPrintDetails({...printDetails, name: e.target.value})} placeholder="Nhập họ tên đầy đủ" />
            </div>
            
            <div className="form-group">
              <label>Đơn vị / Công ty</label>
              <input type="text" className="form-control" value={printDetails.company} onChange={e => setPrintDetails({...printDetails, company: e.target.value})} placeholder="Tên đơn vị, phòng ban (nếu có)" />
            </div>
            
            <div className="form-group">
              <label>Địa chỉ / Bộ phận</label>
              <input type="text" className="form-control" value={printDetails.address} onChange={e => setPrintDetails({...printDetails, address: e.target.value})} placeholder="Địa chỉ chi tiết hoặc Bộ phận" />
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

      {/* Hidden Print Container */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <PhieuNhapXuatPrint ref={printRef} movement={printingMov} printDetails={printDetails} />
      </div>
    </div>
  );
}
