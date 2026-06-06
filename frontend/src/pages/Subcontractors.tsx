import React, { useState, useEffect } from 'react';
import { getSubcontractors, createSubcontractor, updateSubcontractor } from '../services/subcontractors.service';
import { getSubcontracts, createSubcontract, createAcceptance, updateSubcontract } from '../services/subcontracts.service';
import { Briefcase, UserPlus, FileSignature, CheckCircle2, Building2, Wallet, History, AlertCircle, Edit, Users } from 'lucide-react';

export default function Subcontractors() {
  const [subcontractors, setSubcontractors] = useState<any[]>([]);
  const [subcontracts, setSubcontracts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [showSubcontractorModal, setShowSubcontractorModal] = useState(false);
  const [showSubcontractModal, setShowSubcontractModal] = useState(false);
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  
  const [selectedSubcontract, setSelectedSubcontract] = useState<any>(null);
  const [editingSubcontractor, setEditingSubcontractor] = useState<any>(null);
  const [editingSubcontract, setEditingSubcontract] = useState<any>(null);
  
  const [newSubcontractor, setNewSubcontractor] = useState({ name: '', phone: '', taxCode: '' });
  const [newSubcontract, setNewSubcontract] = useState({ subcontractorId: '', projectId: '', name: '', code: '', totalValue: 0, startDate: '' });
  const [newAcceptance, setNewAcceptance] = useState({ date: '', acceptedValue: 0, note: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [subcRes, contRes, projRes] = await Promise.all([
      getSubcontractors(),
      getSubcontracts(),
      fetch('http://localhost:3000/projects').then(res => res.json())
    ]);
    setSubcontractors(subcRes);
    setSubcontracts(contRes);
    setProjects(projRes);
  };

  const handleCreateSubcontractor = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSubcontractor(newSubcontractor);
    setShowSubcontractorModal(false);
    loadData();
  };

  const handleCreateSubcontract = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSubcontract({
      ...newSubcontract,
      subcontractorId: Number(newSubcontract.subcontractorId),
      projectId: Number(newSubcontract.projectId),
      totalValue: Number(newSubcontract.totalValue)
    });
    setShowSubcontractModal(false);
    loadData();
  };

  const handleCreateAcceptance = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAcceptance(selectedSubcontract.id, {
      ...newAcceptance,
      acceptedValue: Number(newAcceptance.acceptedValue)
    });
    setShowAcceptanceModal(false);
    loadData();
  };

  const handleUpdateSubcontractorForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSubcontractor(editingSubcontractor.id, {
      name: editingSubcontractor.name,
      phone: editingSubcontractor.phone,
      taxCode: editingSubcontractor.taxCode
    });
    setEditingSubcontractor(null);
    loadData();
  };

  const handleUpdateSubcontractForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSubcontract(editingSubcontract.id, {
      name: editingSubcontract.name,
      code: editingSubcontract.code,
      totalValue: Number(editingSubcontract.totalValue),
      startDate: editingSubcontract.startDate
    });
    setEditingSubcontract(null);
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Briefcase size={28} style={{ color: 'var(--accent-primary)' }} />
            Quản lý Thầu phụ
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Giám sát hợp đồng khoán, tiến độ và thanh toán thầu phụ</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => setShowSubcontractorModal(true)}>
            <UserPlus size={18} /> Thêm Tổ đội
          </button>
          <button className="btn btn-primary" onClick={() => setShowSubcontractModal(true)}>
            <FileSignature size={18} /> Ký Hợp đồng khoán
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
            <Briefcase size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Tổng số hợp đồng</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{subcontracts.length}</h3>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Đã nghiệm thu (ước tính)</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
              {(subcontracts.reduce((acc, curr) => acc + (curr.acceptances?.reduce((a: any, c: any) => a + c.acceptedValue, 0) || 0), 0) / 1000000).toFixed(1)}M
            </h3>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '12px', color: 'var(--accent-secondary)' }}>
            <Building2 size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Tổ đội đối tác</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{subcontractors.length}</h3>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users style={{ color: 'var(--accent-primary)' }} /> Danh sách Tổ đội / Thầu phụ
        </h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tên Đối tác</th>
                <th>Số điện thoại</th>
                <th>Mã số thuế</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {subcontractors.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                    Chưa có đối tác thầu phụ.
                  </td>
                </tr>
              ) : subcontractors.map(subc => (
                <tr key={subc.id}>
                  <td style={{ fontWeight: 500 }}>{subc.name}</td>
                  <td>{subc.phone || '-'}</td>
                  <td>{subc.taxCode || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', padding: '6px' }} onClick={() => setEditingSubcontractor(subc)}>
                      <Edit size={16} /> Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Danh sách Hợp đồng Thầu phụ</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Tên Gói Thầu / Hạng mục</th>
                <th>Tổ đội / Đối tác</th>
                <th>Dự án</th>
                <th style={{ textAlign: 'right' }}>Giá trị HĐ (VNĐ)</th>
                <th style={{ textAlign: 'right' }}>Đã nghiệm thu</th>
                <th style={{ textAlign: 'right' }}>Khối lượng chờ</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {subcontracts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Chưa có dữ liệu hợp đồng thầu phụ.
                  </td>
                </tr>
              ) : subcontracts.map(contract => {
                const acceptedTotal = contract.acceptances ? contract.acceptances.reduce((acc: any, curr: any) => acc + curr.acceptedValue, 0) : 0;
                const remaining = contract.totalValue - acceptedTotal;
                
                return (
                  <tr key={contract.id}>
                    <td><span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>{contract.code}</span></td>
                    <td style={{ fontWeight: 500 }}>{contract.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{contract.subcontractor?.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{contract.project?.name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--accent-primary)' }}>{contract.totalValue.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>{acceptedTotal.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--warning)' }}>{remaining.toLocaleString()}</td>
                    <td style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="btn" 
                        style={{ background: 'rgba(255,255,255,0.1)', padding: '6px' }}
                        onClick={() => { 
                          setEditingSubcontract({
                            ...contract,
                            startDate: contract.startDate ? contract.startDate.substring(0, 10) : ''
                          }); 
                        }}
                        title="Sửa Hợp đồng"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn" 
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', fontSize: '0.875rem' }}
                        onClick={() => { setSelectedSubcontract(contract); setShowAcceptanceModal(true); }}
                      >
                        Nghiệm thu
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {showSubcontractorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UserPlus style={{ color: 'var(--accent-primary)' }} /> Thêm Tổ đội / Thầu phụ
            </h2>
            <form onSubmit={handleCreateSubcontractor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Tên Tổ đội / Công ty</label>
                <input required className="form-input" value={newSubcontractor.name} onChange={e => setNewSubcontractor({...newSubcontractor, name: e.target.value})} placeholder="VD: Đội trát tường..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Số điện thoại</label>
                  <input className="form-input" value={newSubcontractor.phone} onChange={e => setNewSubcontractor({...newSubcontractor, phone: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Mã số thuế</label>
                  <input className="form-input" value={newSubcontractor.taxCode} onChange={e => setNewSubcontractor({...newSubcontractor, taxCode: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn" onClick={() => setShowSubcontractorModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubcontractModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileSignature style={{ color: 'var(--accent-primary)' }} /> Ký Hợp Đồng Khoán
            </h2>
            <form onSubmit={handleCreateSubcontract} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Nhà thầu phụ</label>
                  <select required className="form-select" value={newSubcontract.subcontractorId} onChange={e => setNewSubcontract({...newSubcontract, subcontractorId: e.target.value})}>
                    <option value="">-- Chọn nhà thầu --</option>
                    {subcontractors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Dự án thi công</label>
                  <select required className="form-select" value={newSubcontract.projectId} onChange={e => setNewSubcontract({...newSubcontract, projectId: e.target.value})}>
                    <option value="">-- Chọn dự án --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Mã Hợp Đồng</label>
                  <input required className="form-input" value={newSubcontract.code} onChange={e => setNewSubcontract({...newSubcontract, code: e.target.value})} placeholder="VD: HDK-01" />
                </div>
                <div>
                  <label className="form-label">Ngày hiệu lực</label>
                  <input required type="date" className="form-input" value={newSubcontract.startDate} onChange={e => setNewSubcontract({...newSubcontract, startDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="form-label">Tên Hạng mục / Gói thầu</label>
                <input required className="form-input" value={newSubcontract.name} onChange={e => setNewSubcontract({...newSubcontract, name: e.target.value})} placeholder="VD: Thi công trát tường ngoài..." />
              </div>
              <div>
                <label className="form-label">Tổng giá trị Khoán (VNĐ)</label>
                <input required type="number" className="form-input" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)' }} value={newSubcontract.totalValue} onChange={e => setNewSubcontract({...newSubcontract, totalValue: Number(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn" onClick={() => setShowSubcontractModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary">Tạo Hợp Đồng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAcceptanceModal && selectedSubcontract && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 style={{ color: 'var(--success)' }} /> Nghiệm Thu Khối Lượng
            </h2>
            <p style={{ color: 'var(--accent-primary)', marginBottom: '24px' }}>Hợp đồng: {selectedSubcontract.code} - {selectedSubcontract.name}</p>
            
            <form onSubmit={handleCreateAcceptance} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Ngày nghiệm thu</label>
                <input required type="date" className="form-input" value={newAcceptance.date} onChange={e => setNewAcceptance({...newAcceptance, date: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Giá trị hoàn thành (VNĐ)</label>
                <input required type="number" className="form-input" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }} value={newAcceptance.acceptedValue} onChange={e => setNewAcceptance({...newAcceptance, acceptedValue: Number(e.target.value)})} />
              </div>
              <div>
                <label className="form-label">Ghi chú / Diễn giải</label>
                <input className="form-input" value={newAcceptance.note} onChange={e => setNewAcceptance({...newAcceptance, note: e.target.value})} placeholder="Nghiệm thu đợt..." />
              </div>
              
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--warning)', margin: 0, lineHeight: 1.5 }}>
                  <strong>Lưu ý Kế toán:</strong> Hệ thống sẽ tự động hạch toán ghi tăng Chi phí dự án (Nợ 154) và tăng công nợ thầu phụ (Có 331).
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn" onClick={() => setShowAcceptanceModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)' }}>Duyệt & Hạch toán</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingSubcontractor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Edit style={{ color: 'var(--accent-primary)' }} /> Cập nhật Tổ đội / Thầu phụ
            </h2>
            <form onSubmit={handleUpdateSubcontractorForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Tên Tổ đội / Công ty</label>
                <input required className="form-input" value={editingSubcontractor.name} onChange={e => setEditingSubcontractor({...editingSubcontractor, name: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Số điện thoại</label>
                  <input className="form-input" value={editingSubcontractor.phone || ''} onChange={e => setEditingSubcontractor({...editingSubcontractor, phone: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Mã số thuế</label>
                  <input className="form-input" value={editingSubcontractor.taxCode || ''} onChange={e => setEditingSubcontractor({...editingSubcontractor, taxCode: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn" onClick={() => setEditingSubcontractor(null)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingSubcontract && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Edit style={{ color: 'var(--accent-primary)' }} /> Cập nhật Hợp Đồng Khoán
            </h2>
            <form onSubmit={handleUpdateSubcontractForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Mã Hợp Đồng</label>
                  <input required className="form-input" value={editingSubcontract.code} onChange={e => setEditingSubcontract({...editingSubcontract, code: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Ngày hiệu lực</label>
                  <input required type="date" className="form-input" value={editingSubcontract.startDate} onChange={e => setEditingSubcontract({...editingSubcontract, startDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="form-label">Tên Hạng mục / Gói thầu</label>
                <input required className="form-input" value={editingSubcontract.name} onChange={e => setEditingSubcontract({...editingSubcontract, name: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Tổng giá trị Khoán (VNĐ)</label>
                <input required type="number" className="form-input" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)' }} value={editingSubcontract.totalValue} onChange={e => setEditingSubcontract({...editingSubcontract, totalValue: Number(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn" onClick={() => setEditingSubcontract(null)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
