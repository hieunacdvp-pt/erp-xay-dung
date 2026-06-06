import React, { useState, useEffect } from 'react';
import { Package, FileText, Users, Plus, CheckCircle, Check, Truck, AlertCircle, XCircle, Trash2, Edit } from 'lucide-react';
import { getPRs, createPR, getPOs, createPO, approvePO, receivePO, approvePR, updatePR, deletePR, updatePO, deletePO } from '../services/procurement.service';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export default function Procurement() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isProcurementAdmin = user && ['ADMIN', 'GIAMDOC', 'KETOAN', 'KETOAN_VIEN', 'VATTU'].includes(user.role);
  const canViewPO = isProcurementAdmin || user?.role === 'KHO';
  const canReceiveGoods = user?.role === 'KHO' || user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'PO' | 'PR' | 'VENDORS'>(user?.role === 'KHO' ? 'PO' : (isProcurementAdmin ? 'PO' : 'PR'));
  const [prs, setPrs] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [isPROpen, setIsPROpen] = useState(false);
  const [isPOOpen, setIsPOOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPOForReceipt, setSelectedPOForReceipt] = useState<any>(null);
  const [receiptFormData, setReceiptFormData] = useState({ delivererName: '', delivererDept: '', delivererPhone: '', invoiceNumber: '' });
  
  const systemSettingsStr = localStorage.getItem('systemSettings');
  const systemSettings = systemSettingsStr ? JSON.parse(systemSettingsStr) : null;

  const [formData, setFormData] = useState({
    projectId: '',
    vendorId: '1',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    isDirectToSite: false,
    materialId: '',
    quantity: '1',
    unitPrice: '100000'
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const projRes = await fetch('http://localhost:3000/projects').then(res => {
        if (!res.ok) throw new Error("Failed to load projects");
        return res.json();
      });
      const matRes = await fetch('http://localhost:3000/materials').then(res => {
        if (!res.ok) return [];
        return res.json();
      });
      const venRes = await fetch('http://localhost:3000/enterprise/vendors').then(res => {
        if (!res.ok) return [];
        return res.json();
      });
      setProjects(projRes);
      setMaterials(matRes);
      setVendors(venRes);

      if (activeTab === 'PR') {
        const prData = await getPRs();
        setPrs(prData);
      } else {
        const poData = await getPOs();
        setPos(poData);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePO = async (id: number, level: string) => {
    try {
      await approvePO(id, level);
      loadData();
    } catch(err: any) { setError(err.message); }
  };

  const handleUpdatePO = async (po: any) => {
    const newNotes = prompt('Nhập ghi chú mới cho PO:', po.notes || '');
    if (newNotes !== null) {
      try {
        await updatePO(po.id, { notes: newNotes });
        loadData();
      } catch(err: any) { alert(err.message); }
    }
  };

  const handleDeletePO = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa Đơn đặt hàng này?')) {
      try {
        await deletePO(id);
        loadData();
      } catch(err: any) { alert(err.message); }
    }
  };

  const handleApprovePR = async (id: number, level: string) => {
    try {
      await approvePR(id, level);
      loadData();
    } catch(err: any) { setError(err.message); }
  };

  const handleUpdatePR = async (pr: any) => {
    const newNotes = prompt('Nhập ghi chú mới:', pr.notes || '');
    if (newNotes !== null) {
      try {
        await updatePR(pr.id, { projectId: pr.projectId, notes: newNotes });
        loadData();
      } catch(err: any) { alert(err.message); }
    }
  };

  const handleDeletePR = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa Yêu cầu này?')) {
      try {
        await deletePR(id);
        loadData();
      } catch(err: any) { alert(err.message); }
    }
  };

  const handleConfirmReceiveAndPrint = async () => {
    window.print();
    try {
      await receivePO(selectedPOForReceipt.id, receiptFormData.invoiceNumber);
      setIsReceiptModalOpen(false);
      loadData();
    } catch(err: any) { alert(err.message); }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>Chờ duyệt</span>;
      case 'PROCUREMENT_APPROVED': return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)' }}>Phòng VT đã duyệt</span>;
      case 'BUDGET_APPROVED': return <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>Đã duyệt (Ngân sách)</span>;
      case 'ACCOUNTANT_APPROVED': return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)' }}>KT Trưởng duyệt</span>;
      case 'DIRECTOR_APPROVED': return <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>GĐ Đã duyệt</span>;
      case 'RECEIVED': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>Đã nhận hàng</span>;
      case 'REJECTED': return <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>Từ chối</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <>
    <div className="page-container no-print">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Quản lý Mua sắm (Procurement)</h1>
          <p className="page-subtitle">Quản lý Yêu cầu mua sắm, Đơn đặt hàng và Công nợ phải trả NCC</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setIsPROpen(true)}>
            <Plus size={18} /> Yêu cầu mua sắm (PR)
          </button>
          {isProcurementAdmin && (
            <button className="btn btn-primary" onClick={() => setIsPOOpen(true)}>
              <Plus size={18} /> Đơn đặt hàng (PO)
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {canViewPO && (
          <button 
            className={`btn ${activeTab === 'PO' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('PO')}
          >
            <Package size={18} /> Đơn đặt hàng (PO)
          </button>
        )}
        {user?.role !== 'KHO' && (
          <button 
            className={`btn ${activeTab === 'PR' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('PR')}
          >
            <FileText size={18} /> Yêu cầu mua sắm (PR)
          </button>
        )}
        {isProcurementAdmin && (
          <button 
            className={`btn ${activeTab === 'VENDORS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('VENDORS')}
          >
            <Users size={18} /> Quản lý Nhà cung cấp
          </button>
        )}
      </div>

      {error && <div style={{ color: 'var(--warning)', marginBottom: '16px' }}>{error}</div>}

      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div>Đang tải dữ liệu...</div>
        ) : activeTab === 'PO' ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã PO</th>
                  <th>Dự án</th>
                  <th>Nhà cung cấp</th>
                  <th>Loại</th>
                  {user?.role !== 'KHO' && <th style={{ textAlign: 'right' }}>Tổng tiền</th>}
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pos.map(po => (
                  <tr key={po.id}>
                    <td style={{ fontWeight: 600 }}>{po.code}</td>
                    <td>{po.project?.name}</td>
                    <td>{po.vendor?.name}</td>
                    <td>
                      {po.isDirectToSite 
                        ? <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>Xuất thẳng (Nợ 154)</span>
                        : <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>Nhập kho (Nợ 152)</span>
                      }
                    </td>
                    {user?.role !== 'KHO' && <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(po.totalAmount)}</td>}
                    <td>{renderStatus(po.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {isProcurementAdmin && po.status === 'PENDING' && (
                          <button className="btn btn-sm btn-secondary" onClick={() => handleApprovePO(po.id, 'ACCOUNTANT')}>
                            Kế toán duyệt
                          </button>
                        )}
                        {isProcurementAdmin && po.status === 'ACCOUNTANT_APPROVED' && (
                          <button className="btn btn-sm btn-secondary" onClick={() => handleApprovePO(po.id, 'DIRECTOR')} style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                            Giám đốc duyệt
                          </button>
                        )}
                        {isProcurementAdmin && (po.status === 'PENDING' || po.status === 'ACCOUNTANT_APPROVED') && (
                          <button className="btn btn-sm" onClick={() => handleApprovePO(po.id, 'REJECT')} style={{ color: 'var(--danger)', background: 'transparent' }} title="Từ chối">
                            <XCircle size={16} />
                          </button>
                        )}
                        {canReceiveGoods && po.status === 'DIRECTOR_APPROVED' && (
                          <button className="btn btn-sm btn-primary" onClick={() => {
                            setSelectedPOForReceipt(po);
                            setIsReceiptModalOpen(true);
                          }} style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>
                            <Truck size={14} /> Nhận hàng
                          </button>
                        )}
                        {isProcurementAdmin && (po.status === 'PENDING' || po.status === 'REJECTED') && (
                          <>
                            <button className="btn btn-sm" onClick={() => handleUpdatePO(po)} style={{ color: 'var(--text-primary)', background: 'transparent' }} title="Sửa ghi chú">
                              <Edit size={16} />
                            </button>
                            <button className="btn btn-sm" onClick={() => handleDeletePO(po.id)} style={{ color: 'var(--danger)', background: 'transparent' }} title="Xóa PO">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {pos.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center' }}>Chưa có đơn đặt hàng nào.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'PR' ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Dự án</th>
                  <th>Chi tiết Yêu cầu</th>
                  <th>Ngày lập</th>
                  <th>Ghi chú</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {prs.map(pr => (
                  <tr key={pr.id}>
                    <td>PR-{pr.id.toString().padStart(4, '0')}</td>
                    <td>{pr.project?.name}</td>
                    <td>
                      {pr.items && pr.items.map((it: any, idx: number) => (
                        <div key={idx} style={{ fontSize: '0.85rem' }}>
                          • {it.material?.name}: <strong style={{ color: 'var(--accent)' }}>{it.quantity}</strong> {it.material?.unit}
                        </div>
                      ))}
                    </td>
                    <td>{new Date(pr.date).toLocaleDateString('vi-VN')}</td>
                    <td>{pr.notes}</td>
                    <td>{renderStatus(pr.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {isProcurementAdmin && pr.status === 'PENDING' && (
                          <button className="btn btn-sm btn-secondary" onClick={() => handleApprovePR(pr.id, 'PROCUREMENT')}>
                            Phòng VT duyệt
                          </button>
                        )}
                        {isProcurementAdmin && pr.status === 'PROCUREMENT_APPROVED' && (
                          <button className="btn btn-sm btn-secondary" onClick={() => handleApprovePR(pr.id, 'BUDGET')} style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                            Kế toán duyệt (Budget)
                          </button>
                        )}
                        {isProcurementAdmin && pr.status === 'BUDGET_APPROVED' && (
                          <button className="btn btn-sm btn-primary" onClick={() => {
                            setFormData({
                              ...formData,
                              projectId: pr.projectId.toString(),
                              materialId: pr.items && pr.items.length > 0 ? pr.items[0].materialId.toString() : '',
                              quantity: pr.items && pr.items.length > 0 ? pr.items[0].quantity.toString() : '1'
                            });
                            setIsPOOpen(true);
                          }} style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}>
                            <Package size={14} /> Lập PO
                          </button>
                        )}
                        {isProcurementAdmin && (pr.status === 'PENDING' || pr.status === 'PROCUREMENT_APPROVED') && (
                          <button className="btn btn-sm" onClick={() => handleApprovePR(pr.id, 'REJECT')} style={{ color: 'var(--danger)', background: 'transparent' }} title="Từ chối">
                            <XCircle size={16} />
                          </button>
                        )}
                        {isProcurementAdmin && pr.status === 'BUDGET_APPROVED' && (
                          <CheckCircle size={18} color="var(--success)" />
                        )}
                        {(pr.status === 'PENDING' || pr.status === 'REJECTED') && (
                          <>
                            <button className="btn btn-sm" onClick={() => handleUpdatePR(pr)} style={{ color: 'var(--text-primary)', background: 'transparent' }} title="Sửa ghi chú">
                              <Edit size={16} />
                            </button>
                            <button className="btn btn-sm" onClick={() => handleDeletePR(pr.id)} style={{ color: 'var(--danger)', background: 'transparent' }} title="Xóa">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {prs.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center' }}>Chưa có yêu cầu mua sắm nào.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Nhà cung cấp</th>
                  <th>Mã số thuế</th>
                  <th>Số điện thoại</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id}>
                    <td>NCC-{v.id}</td>
                    <td style={{ fontWeight: 600 }}>{v.name}</td>
                    <td>{v.taxId || '-'}</td>
                    <td>{v.phone || '-'}</td>
                    <td>{v.address || '-'}</td>
                  </tr>
                ))}
                {vendors.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center' }}>Chưa có nhà cung cấp nào.</td></tr>}
              </tbody>
            </table>
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                * Để thêm Nhà cung cấp mới, vui lòng vào tab <strong>Đối tác & Nhập/Xuất</strong> hoặc điền trực tiếp ở form tạo Đơn hàng (Đang phát triển).
              </p>
            </div>
          </div>
        )}
      </div>

      {isPROpen && (
        <div className="modal-overlay" onClick={() => setIsPROpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '500px' }}>
            <h2>Lập Yêu cầu mua sắm (PR)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Dự án</label>
                <select className="form-input" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                  <option value="">-- Chọn dự án --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ display: 'block' }}>Vật tư cần mua</label>
                  <button className="btn btn-sm btn-secondary" onClick={async () => {
                    const name = prompt('Nhập tên vật tư mới:');
                    const unit = prompt('Đơn vị tính (VD: cái, kg, m3):');
                    if (name && unit) {
                      try {
                        await fetch('http://localhost:3000/materials', {
                          method: 'POST', headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({ name, unit, price: 0 })
                        });
                        alert('Đã thêm vật tư mới!');
                        loadData();
                      } catch(e) { alert('Lỗi: ' + e); }
                    }
                  }}>+ Thêm mới</button>
                </div>
                <select className="form-input" value={formData.materialId} onChange={e => setFormData({...formData, materialId: e.target.value})}>
                  <option value="">-- Chọn vật tư --</option>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Số lượng</label>
                <input type="number" className="form-input" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Ghi chú</label>
                <input type="text" className="form-input" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setIsPROpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={async () => {
                try {
                  await createPR({
                    projectId: Number(formData.projectId),
                    date: formData.date,
                    notes: formData.notes,
                    items: [{ materialId: Number(formData.materialId), quantity: Number(formData.quantity) }]
                  });
                  alert('Tạo PR thành công!');
                  setIsPROpen(false);
                  loadData();
                } catch(err: any) { alert(err.message); }
              }}>Lưu Yêu cầu</button>
            </div>
          </div>
        </div>
      )}

      {isPOOpen && (
        <div className="modal-overlay" onClick={() => setIsPOOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '500px' }}>
            <h2>Lập Đơn đặt hàng (PO)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Dự án</label>
                <select className="form-input" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                  <option value="">-- Chọn dự án --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ display: 'block' }}>Nhà cung cấp</label>
                  <button className="btn btn-sm btn-secondary" onClick={async () => {
                    const name = prompt('Nhập tên Nhà cung cấp mới:');
                    if (name) {
                      try {
                        await fetch('http://localhost:3000/enterprise/vendors', {
                          method: 'POST', headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({ name })
                        });
                        alert('Đã thêm Nhà cung cấp mới!');
                        loadData();
                      } catch(e) { alert('Lỗi: ' + e); }
                    }
                  }}>+ Thêm mới</button>
                </div>
                <select className="form-input" value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})}>
                  <option value="">-- Chọn Nhà cung cấp --</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ display: 'block' }}>Vật tư</label>
                  <button className="btn btn-sm btn-secondary" onClick={async () => {
                    const name = prompt('Nhập tên vật tư mới:');
                    const unit = prompt('Đơn vị tính (VD: cái, kg, m3):');
                    if (name && unit) {
                      try {
                        await fetch('http://localhost:3000/materials', {
                          method: 'POST', headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({ name, unit, price: 0 })
                        });
                        alert('Đã thêm vật tư mới!');
                        loadData();
                      } catch(e) { alert('Lỗi: ' + e); }
                    }
                  }}>+ Thêm mới</button>
                </div>
                <select className="form-input" value={formData.materialId} onChange={e => setFormData({...formData, materialId: e.target.value})}>
                  <option value="">-- Chọn vật tư --</option>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Số lượng</label>
                  <input type="number" className="form-input" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Đơn giá</label>
                  <input type="number" className="form-input" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isDirectToSite} onChange={e => setFormData({...formData, isDirectToSite: e.target.checked})} />
                  Xuất thẳng công trình (Nợ 154 - Không qua nhập kho)
                </label>
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setIsPOOpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={async () => {
                try {
                  await createPO({
                    projectId: Number(formData.projectId),
                    vendorId: Number(formData.vendorId),
                    date: formData.date,
                    isDirectToSite: formData.isDirectToSite,
                    notes: formData.notes,
                    totalAmount: Number(formData.quantity) * Number(formData.unitPrice),
                    items: [{ materialId: Number(formData.materialId), quantity: Number(formData.quantity), unitPrice: Number(formData.unitPrice) }]
                  });
                  alert('Tạo PO thành công!');
                  setIsPOOpen(false);
                  loadData();
                } catch(err: any) { alert(err.message); }
              }}>Lưu Đơn hàng</button>
            </div>
          </div>
        </div>
      )}

      {isReceiptModalOpen && selectedPOForReceipt && (
        <div className="modal-overlay no-print" onClick={() => setIsReceiptModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '400px' }}>
            <h2>Thông tin Phiếu Nhập Kho</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Người giao hàng</label>
                <input type="text" className="form-input" value={receiptFormData.delivererName} onChange={e => setReceiptFormData({...receiptFormData, delivererName: e.target.value})} placeholder="Họ và tên..." />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Đơn vị / Bộ phận</label>
                <input type="text" className="form-input" value={receiptFormData.delivererDept} onChange={e => setReceiptFormData({...receiptFormData, delivererDept: e.target.value})} placeholder="Công ty/Phòng ban..." />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Số điện thoại</label>
                <input type="text" className="form-input" value={receiptFormData.delivererPhone} onChange={e => setReceiptFormData({...receiptFormData, delivererPhone: e.target.value})} placeholder="SĐT liên hệ..." />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Số Hóa Đơn GTGT (Nếu có)</label>
                <input type="text" className="form-input" value={receiptFormData.invoiceNumber} onChange={e => setReceiptFormData({...receiptFormData, invoiceNumber: e.target.value})} placeholder="VD: 0012345" />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setIsReceiptModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleConfirmReceiveAndPrint}>OK và In Phiếu</button>
            </div>
          </div>
        </div>
      )}
    </div>

    {selectedPOForReceipt && (
      <div className="print-only" style={{ display: 'none' }}>
        <div className="print-page-a4" style={{ padding: '40px', fontFamily: '"Times New Roman", Times, serif', color: 'black' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, textTransform: 'uppercase' }}>{systemSettings?.companyName || 'CÔNG TY TNHH XÂY DỰNG DEMO'}</h3>
              <p style={{ margin: 0 }}>Địa chỉ: {systemSettings?.companyAddress || 'Hà Nội'}</p>
            </div>
            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <p style={{ margin: 0 }}>Mẫu số 01 - VT</p>
              <p style={{ margin: 0, fontSize: '0.8rem', fontStyle: 'italic' }}>(Ban hành theo TT 200/2014/TT-BTC)</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <h1 style={{ margin: 0, fontSize: '24px', textTransform: 'uppercase', color: 'black' }}>PHIẾU NHẬP KHO</h1>
            <p style={{ margin: '5px 0', fontStyle: 'italic', color: 'black' }}>Ngày {new Date().getDate()} tháng {new Date().getMonth()+1} năm {new Date().getFullYear()}</p>
            <p style={{ margin: 0, color: 'black' }}>Số: {selectedPOForReceipt.code}-PNK</p>
          </div>

          <div style={{ marginBottom: '20px', lineHeight: '1.6' }}>
            <p style={{ margin: 0, color: 'black' }}>- Họ tên người giao hàng: <strong>{receiptFormData.delivererName}</strong> {receiptFormData.delivererPhone ? `(${receiptFormData.delivererPhone})` : ''}</p>
            <p style={{ margin: 0, color: 'black' }}>- Đơn vị / Công ty: <strong>{selectedPOForReceipt.vendor?.name} {receiptFormData.delivererDept ? ` - ${receiptFormData.delivererDept}` : ''}</strong></p>
            <p style={{ margin: 0, color: 'black' }}>- Theo đơn đặt hàng số: <strong>{selectedPOForReceipt.code}</strong></p>
            <p style={{ margin: 0, color: 'black' }}>- Nhập tại kho: Kho công trình {selectedPOForReceipt.project?.name}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', color: 'black' }} border={1}>
            <thead>
              <tr>
                <th style={{ padding: '8px', border: '1px solid black' }}>STT</th>
                <th style={{ padding: '8px', border: '1px solid black' }}>Tên, nhãn hiệu, quy cách vật tư</th>
                <th style={{ padding: '8px', border: '1px solid black' }}>Mã số</th>
                <th style={{ padding: '8px', border: '1px solid black' }}>Đơn vị tính</th>
                <th style={{ padding: '8px', border: '1px solid black' }}>S.lượng (CT)</th>
                <th style={{ padding: '8px', border: '1px solid black' }}>Thực nhập</th>
              </tr>
            </thead>
            <tbody>
              {selectedPOForReceipt.items?.map((it: any, index: number) => (
                <tr key={it.id}>
                  <td style={{ padding: '8px', border: '1px solid black', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ padding: '8px', border: '1px solid black' }}>{it.material?.name}</td>
                  <td style={{ padding: '8px', border: '1px solid black', textAlign: 'center' }}>VT-{it.materialId}</td>
                  <td style={{ padding: '8px', border: '1px solid black', textAlign: 'center' }}>{it.material?.unit}</td>
                  <td style={{ padding: '8px', border: '1px solid black', textAlign: 'center' }}>{it.quantity}</td>
                  <td style={{ padding: '8px', border: '1px solid black', textAlign: 'center' }}>{it.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginTop: '40px' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Người lập phiếu</p>
              <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.8rem' }}>(Ký, họ tên)</p>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Người giao hàng</p>
              <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.8rem' }}>(Ký, họ tên)</p>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Thủ kho</p>
              <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.8rem' }}>(Ký, họ tên)</p>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Kế toán trưởng</p>
              <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.8rem' }}>(Ký, họ tên)</p>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
