import React, { useState, useEffect, useRef } from 'react';
import { Truck, Calendar, Activity, FileText, Plus, Check, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { LenhDieuDongPrint } from '../components/print-templates/LenhDieuDongPrint';

export default function Equipment() {
  const [activeTab, setActiveTab] = useState<'EQUIPMENT' | 'DISPATCH' | 'USAGE' | 'REPORT'>('EQUIPMENT');
  
  const [equipments, setEquipments] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [usages, setUsages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User info for roles
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canDispatch = currentUser.role === 'ADMIN' || currentUser.role === 'GIAMDOC' || currentUser.role === 'KEHOACH';
  const canApproveUsage = canDispatch; // KEHOACH is the main approver

  const [editingEq, setEditingEq] = useState<any>(null);
  const [editingUsage, setEditingUsage] = useState<any>(null);
  const [newEq, setNewEq] = useState({ code: '', name: '', type: 'EXCAVATOR', ownership: 'OWNED', dailyCost: '' });
  const [newDispatch, setNewDispatch] = useState({ equipmentId: '', projectId: '', startDate: '', endDate: '', notes: '' });
  const [newUsage, setNewUsage] = useState({ equipmentId: '', projectId: '', date: '', shifts: '1', costPerShift: '', notes: '' });

  // Print state
  const printRef = useRef<HTMLDivElement>(null);
  const [printingDispatch, setPrintingDispatch] = useState<any>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Lenh_Dieu_Dong'
  });

  const onPrintClick = (disp: any) => {
    setPrintingDispatch(disp);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const fetchData = async () => {
    try {
      const [eqRes, dispRes, usgRes, projRes] = await Promise.all([
        fetch('http://localhost:3000/equipment').then(r => r.json()),
        fetch('http://localhost:3000/equipment/dispatches').then(r => r.json()),
        fetch('http://localhost:3000/equipment/usages').then(r => r.json()),
        fetch('http://localhost:3000/projects').then(r => r.json())
      ]);
      setEquipments(eqRes);
      setDispatches(dispRes);
      setUsages(usgRes);
      setProjects(projRes);
      
      if (eqRes.length > 0) {
        setNewDispatch(d => ({ ...d, equipmentId: eqRes[0].id.toString() }));
        setNewUsage(u => ({ ...u, equipmentId: eqRes[0].id.toString(), costPerShift: eqRes[0].dailyCost.toString() }));
      }
      if (projRes.length > 0) {
        setNewDispatch(d => ({ ...d, projectId: projRes[0].id.toString() }));
        setNewUsage(u => ({ ...u, projectId: projRes[0].id.toString() }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Sync default cost
  useEffect(() => {
    if (newUsage.equipmentId) {
      const eq = equipments.find(e => e.id.toString() === newUsage.equipmentId);
      if (eq) setNewUsage(u => ({ ...u, costPerShift: eq.dailyCost.toString() }));
    }
  }, [newUsage.equipmentId, equipments]);

  const handleCreateEq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEq) {
      await fetch(`http://localhost:3000/equipment/${editingEq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEq, dailyCost: Number(newEq.dailyCost) })
      });
      setEditingEq(null);
    } else {
      await fetch('http://localhost:3000/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEq, dailyCost: Number(newEq.dailyCost) })
      });
    }
    setNewEq({ code: '', name: '', type: 'EXCAVATOR', ownership: 'OWNED', dailyCost: '' });
    fetchData();
  };

  const handleDeleteEq = async (id: number) => {
    if (!confirm('Xóa máy móc này sẽ xóa luôn các dữ liệu điều động và ca máy liên quan. Bạn chắc chứ?')) return;
    try {
      await fetch(`http://localhost:3000/equipment/${id}`, { method: 'DELETE' });
      fetchData();
    } catch(e) { alert(e); }
  };

  const handleEditEq = (eq: any) => {
    setEditingEq(eq);
    setNewEq({ code: eq.code, name: eq.name, type: eq.type, ownership: eq.ownership, dailyCost: eq.dailyCost.toString() });
  };

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:3000/equipment/dispatches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...newDispatch, 
        equipmentId: Number(newDispatch.equipmentId),
        projectId: Number(newDispatch.projectId)
      })
    });

    // Send notification
    const eq = equipments.find(e => e.id.toString() === newDispatch.equipmentId);
    const proj = projects.find(p => p.id.toString() === newDispatch.projectId);
    if (eq && proj) {
      await fetch('http://localhost:3000/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUser.username,
          receiverRoles: JSON.stringify(['VATTU', 'KHO', 'CHIHUYTRUONG']),
          content: `Vừa phát hành lệnh điều động máy: [${eq.code}] ${eq.name} tới dự án ${proj.name} từ ngày ${new Date(newDispatch.startDate).toLocaleDateString('vi-VN')}.`
        })
      });
    }

    setNewDispatch(d => ({ ...d, startDate: '', endDate: '', notes: '' }));
    fetchData();
  };

  const handleCreateUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      ...newUsage, 
      equipmentId: Number(newUsage.equipmentId),
      projectId: Number(newUsage.projectId),
      shifts: Number(newUsage.shifts),
      costPerShift: Number(newUsage.costPerShift)
    };

    if (editingUsage) {
      await fetch(`http://localhost:3000/equipment/usages/${editingUsage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setEditingUsage(null);
    } else {
      await fetch('http://localhost:3000/equipment/usages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setNewUsage(u => ({ ...u, date: '', notes: '' }));
    fetchData();
  };

  const handleDeleteUsage = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa nhật ký này? (Chỉ xóa được khi chưa duyệt)')) return;
    try {
      const res = await fetch(`http://localhost:3000/equipment/usages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      fetchData();
    } catch(e: any) { alert(e.message); }
  };

  const handleEditUsage = (u: any) => {
    if (u.status === 'APPROVED') {
      alert('Nhật ký đã duyệt, không thể sửa!');
      return;
    }
    setEditingUsage(u);
    setNewUsage({
      equipmentId: u.equipmentId.toString(),
      projectId: u.projectId.toString(),
      date: u.date ? u.date.split('T')[0] : '',
      shifts: u.shifts.toString(),
      costPerShift: u.costPerShift.toString(),
      notes: u.notes || ''
    });
  };

  const handleApproveUsage = async (id: number) => {
    if (!confirm('Duyệt nhật ký ca máy này và sinh bút toán Nợ 154 / Có 214?')) return;
    try {
      const res = await fetch(`http://localhost:3000/equipment/usages/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: currentUser.username })
      });
      if (res.ok) {
        alert('Đã duyệt và sinh bút toán thành công!');
        fetchData();
      } else {
        alert('Lỗi: ' + await res.text());
      }
    } catch(e) { alert(e); }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (loading) return <div className="loader"></div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Máy móc & Thiết bị thi công</h1>
          <p className="page-subtitle">Quản lý điều động, nhật ký ca máy và khấu hao</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button className={`btn ${activeTab === 'EQUIPMENT' ? 'btn-primary' : ''}`} style={activeTab !== 'EQUIPMENT' ? {background: 'rgba(255,255,255,0.05)', color: 'white'} : {}} onClick={() => setActiveTab('EQUIPMENT')}>
          <Truck size={18} /> Danh mục Máy
        </button>
        <button className={`btn ${activeTab === 'DISPATCH' ? 'btn-primary' : ''}`} style={activeTab !== 'DISPATCH' ? {background: 'rgba(255,255,255,0.05)', color: 'white'} : {}} onClick={() => setActiveTab('DISPATCH')}>
          <Calendar size={18} /> Lịch Điều Động
        </button>
        <button className={`btn ${activeTab === 'USAGE' ? 'btn-primary' : ''}`} style={activeTab !== 'USAGE' ? {background: 'rgba(255,255,255,0.05)', color: 'white'} : {}} onClick={() => setActiveTab('USAGE')}>
          <Activity size={18} /> Nhật Ký Ca Máy
        </button>
        <button className={`btn ${activeTab === 'REPORT' ? 'btn-primary' : ''}`} style={activeTab !== 'REPORT' ? {background: 'rgba(255,255,255,0.05)', color: 'white'} : {}} onClick={() => setActiveTab('REPORT')}>
          <FileText size={18} /> Báo cáo Chi phí
        </button>
      </div>

      {/* EQUIPMENT TAB */}
      {activeTab === 'EQUIPMENT' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
          {canDispatch && (
            <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
              <h3 style={{ marginTop: 0 }}>{editingEq ? 'Sửa thông tin Máy' : 'Thêm máy móc mới'}</h3>
              <form onSubmit={handleCreateEq} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Mã máy</label>
                  <input required className="form-input" placeholder="VD: M-XUC-01" value={newEq.code} onChange={e => setNewEq({...newEq, code: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Tên máy</label>
                  <input required className="form-input" placeholder="VD: Máy xúc Komatsu" value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Loại máy</label>
                  <select className="form-select" value={newEq.type} onChange={e => setNewEq({...newEq, type: e.target.value})}>
                    <option value="EXCAVATOR">Máy xúc</option>
                    <option value="CRANE">Cần cẩu</option>
                    <option value="TRUCK">Xe tải/Ben</option>
                    <option value="ROLLER">Xe lu</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Sở hữu</label>
                  <select className="form-select" value={newEq.ownership} onChange={e => setNewEq({...newEq, ownership: e.target.value})}>
                    <option value="OWNED">Máy tự có (Khấu hao 214)</option>
                    <option value="RENTED">Máy thuê ngoài (Phải trả 331)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Giá ca máy dự kiến (VNĐ)</label>
                  <input required type="number" className="form-input" value={newEq.dailyCost} onChange={e => setNewEq({...newEq, dailyCost: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {editingEq && (
                    <button type="button" className="btn" style={{ flex: 1 }} onClick={() => { setEditingEq(null); setNewEq({ code: '', name: '', type: 'EXCAVATOR', ownership: 'OWNED', dailyCost: '' }); }}>Hủy</button>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                    {editingEq ? 'Cập nhật' : 'Thêm Máy Móc'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã máy</th>
                    <th>Tên máy</th>
                    <th>Loại</th>
                    <th>Sở hữu</th>
                    <th>Giá ca máy</th>
                    <th>Trạng thái</th>
                    {canDispatch && <th style={{ textAlign: 'center' }}>Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {equipments.map(eq => (
                    <tr key={eq.id}>
                      <td style={{ fontWeight: 600 }}>{eq.code}</td>
                      <td>{eq.name}</td>
                      <td>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>
                          {eq.type}
                        </span>
                      </td>
                      <td>{eq.ownership === 'OWNED' ? 'Tự có' : 'Thuê ngoài'}</td>
                      <td>{formatCurrency(eq.dailyCost)}</td>
                      <td>
                        <span style={{ color: 'var(--success)' }}>{eq.status}</span>
                      </td>
                      {canDispatch && (
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn btn-sm" onClick={() => handleEditEq(eq)}>Sửa</button>
                            <button className="btn btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteEq(eq.id)}>Xóa</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {equipments.length === 0 && <tr><td colSpan={6} style={{textAlign: 'center'}}>Chưa có máy móc</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH TAB */}
      {activeTab === 'DISPATCH' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
          {canDispatch && (
            <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
              <h3 style={{ marginTop: 0 }}>Điều động Máy</h3>
              <form onSubmit={handleCreateDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Máy móc</label>
                  <select className="form-select" required value={newDispatch.equipmentId} onChange={e => setNewDispatch({...newDispatch, equipmentId: e.target.value})}>
                    {equipments.map(e => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tới Dự án</label>
                  <select className="form-select" required value={newDispatch.projectId} onChange={e => setNewDispatch({...newDispatch, projectId: e.target.value})}>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Từ ngày</label>
                  <input type="date" required className="form-input" value={newDispatch.startDate} onChange={e => setNewDispatch({...newDispatch, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Đến ngày (Dự kiến)</label>
                  <input type="date" className="form-input" value={newDispatch.endDate} onChange={e => setNewDispatch({...newDispatch, endDate: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Ghi chú điều động</label>
                  <textarea className="form-input" value={newDispatch.notes} onChange={e => setNewDispatch({...newDispatch, notes: e.target.value})}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Lưu Điều Động</button>
              </form>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Lịch sử Điều động</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Máy móc</th>
                    <th>Dự án</th>
                    <th>Thời gian</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatches.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{d.equipment.name}</td>
                      <td>{d.project.name}</td>
                      <td>
                        {new Date(d.startDate).toLocaleDateString('vi-VN')} - 
                        {d.endDate ? new Date(d.endDate).toLocaleDateString('vi-VN') : ' Chưa xác định'}
                      </td>
                      <td>{d.notes}</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => onPrintClick(d)}>
                          <Printer size={14} style={{ marginRight: '4px' }} /> In Lệnh
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dispatches.length === 0 && <tr><td colSpan={5} style={{textAlign: 'center'}}>Chưa có lịch điều động</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USAGE TAB */}
      {activeTab === 'USAGE' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
          {canDispatch && (
            <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
              <h3 style={{ marginTop: 0 }}>{editingUsage ? 'Sửa Ca máy' : 'Ghi nhận Ca máy'}</h3>
              <form onSubmit={handleCreateUsage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Máy móc</label>
                <select className="form-select" required value={newUsage.equipmentId} onChange={e => setNewUsage({...newUsage, equipmentId: e.target.value})}>
                  {equipments.map(e => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Dự án thi công</label>
                <select className="form-select" required value={newUsage.projectId} onChange={e => setNewUsage({...newUsage, projectId: e.target.value})}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="form-label">Ngày thực hiện</label>
                  <input type="date" required className="form-input" value={newUsage.date} onChange={e => setNewUsage({...newUsage, date: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Số ca (shifts)</label>
                  <input type="number" step="0.1" required className="form-input" value={newUsage.shifts} onChange={e => setNewUsage({...newUsage, shifts: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="form-label">Chi phí 1 ca (Gồm lương + dầu)</label>
                <input type="number" required className="form-input" value={newUsage.costPerShift} onChange={e => setNewUsage({...newUsage, costPerShift: e.target.value})} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Thành tiền: {formatCurrency((Number(newUsage.shifts)||0) * (Number(newUsage.costPerShift)||0))}</span>
              </div>
              <div>
                <label className="form-label">Ghi chú công việc</label>
                <textarea className="form-input" value={newUsage.notes} onChange={e => setNewUsage({...newUsage, notes: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {editingUsage && (
                  <button type="button" className="btn" style={{ flex: 1 }} onClick={() => { setEditingUsage(null); setNewUsage(u => ({ ...u, date: '', notes: '' })); }}>Hủy</button>
                )}
                <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {editingUsage ? 'Cập nhật' : 'Lưu Nhật Ký'}
                </button>
              </div>
            </form>
          </div>
          )}

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Nhật ký thi công máy</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Máy móc</th>
                    <th>Dự án</th>
                    <th>Số ca</th>
                    <th>Tổng chi phí</th>
                    <th>Ghi chú</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {usages.map(u => (
                    <tr key={u.id}>
                      <td>{new Date(u.date).toLocaleDateString('vi-VN')}</td>
                      <td style={{ fontWeight: 600 }}>{u.equipment.name}</td>
                      <td>{u.project.name}</td>
                      <td style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{u.shifts}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(u.totalCost)}</td>
                      <td>{u.notes}</td>
                      <td>
                        {u.status === 'PENDING' ? (
                          <span style={{ color: 'var(--warning)' }}>Chờ duyệt</span>
                        ) : (
                          <span style={{ color: 'var(--success)' }}>Đã duyệt</span>
                        )}
                      </td>
                      <td>
                        {u.status === 'PENDING' && canApproveUsage ? (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleApproveUsage(u.id)}>
                              <Check size={14} style={{ marginRight: '4px' }}/> Duyệt & Hạch toán
                            </button>
                            <button className="btn btn-sm" onClick={() => handleEditUsage(u)}>Sửa</button>
                            <button className="btn btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteUsage(u.id)}>Xóa</button>
                          </div>
                        ) : (
                          <span className="text-muted">{u.approvedBy}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {usages.length === 0 && <tr><td colSpan={8} style={{textAlign: 'center'}}>Chưa có nhật ký ca máy</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TAB */}
      {activeTab === 'REPORT' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Chi phí Máy móc phân bổ theo Dự án</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Dự án</th>
                  <th>Tổng chi phí máy (Đã duyệt)</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => {
                  // Tính tổng chi phí cho dự án
                  const projectUsages = usages.filter(u => u.projectId === p.id && u.status === 'APPROVED');
                  const total = projectUsages.reduce((sum, u) => sum + u.totalCost, 0);
                  if (total === 0) return null;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{p.name}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hidden Print Container */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <LenhDieuDongPrint ref={printRef} dispatchData={printingDispatch} />
      </div>
    </div>
  );
}
