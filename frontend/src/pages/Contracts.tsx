import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, CheckCircle, AlertCircle, Clock, ShieldAlert, CreditCard, DollarSign } from 'lucide-react';

export default function Contracts() {
  const [user, setUser] = useState<{ role?: string } | null>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const isKetoan = user?.role === 'KETOAN' || user?.role === 'ADMIN' || user?.role === 'GIAMDOC';
  const isKehoach = user?.role === 'KEHOACH' || user?.role === 'ADMIN' || user?.role === 'GIAMDOC';

  const [activeTab, setActiveTab] = useState<'CONTRACTS' | 'AR' | 'GUARANTEES'>('CONTRACTS');
  
  const [contracts, setContracts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [showContractModal, setShowContractModal] = useState(false);
  const [showGuaranteeModal, setShowGuaranteeModal] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [editingGuarantee, setEditingGuarantee] = useState<any>(null);

  // Contract Form State
  const [projectId, setProjectId] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [value, setValue] = useState(0);
  const [vatRate, setVatRate] = useState(10);
  const [status, setStatus] = useState('DRAFT');
  const [note, setNote] = useState('');
  const [milestones, setMilestones] = useState<any[]>([]);

  // Guarantee Letter Form State
  const [glContractId, setGlContractId] = useState('');
  const [glType, setGlType] = useState('ADVANCE');
  const [glValue, setGlValue] = useState(0);
  const [glIssueDate, setGlIssueDate] = useState('');
  const [glExpiryDate, setGlExpiryDate] = useState('');
  const [glBankName, setGlBankName] = useState('');
  const [glStatus, setGlStatus] = useState('ACTIVE');
  const [glNotes, setGlNotes] = useState('');

  useEffect(() => {
    fetchContracts();
    fetchProjects();
    fetchCustomers();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/contracts');
      setContracts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:3000/projects');
      setProjects(await res.json());
    } catch (e) {}
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://localhost:3000/customers');
      setCustomers(await res.json());
    } catch (e) {}
  };

  // --- CONTRACTS ---
  const resetContractForm = () => {
    setProjectId('');
    setContractNumber('');
    setCustomerId('');
    setStartDate('');
    setEndDate('');
    setValue(0);
    setVatRate(10);
    setStatus('DRAFT');
    setNote('');
    setMilestones([]);
    setEditingContract(null);
  };

  const handleEditContract = (c: any) => {
    setEditingContract(c);
    setProjectId(c.projectId.toString());
    setContractNumber(c.contractNumber);
    setCustomerId(c.customerId ? c.customerId.toString() : '');
    setStartDate(c.startDate ? c.startDate.split('T')[0] : '');
    setEndDate(c.endDate ? c.endDate.split('T')[0] : '');
    setValue(c.value);
    setVatRate(c.vatRate);
    setStatus(c.status);
    setNote(c.note || '');
    setMilestones(c.milestones || []);
    setShowContractModal(true);
  };

  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      projectId: Number(projectId),
      contractNumber,
      customerId: customerId ? Number(customerId) : null,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      value: Number(value),
      vatRate: Number(vatRate),
      status,
      note,
      milestones: milestones.map(m => ({
        name: m.name,
        amount: Number(m.amount),
        type: m.type,
        status: m.status,
        dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : undefined
      }))
    };

    try {
      if (editingContract) {
        await fetch(`http://localhost:3000/contracts/${editingContract.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('http://localhost:3000/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setShowContractModal(false);
      resetContractForm();
      fetchContracts();
    } catch (e) {
      alert('Lỗi lưu hợp đồng');
    }
  };

  const handleDeleteContract = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa hợp đồng này? Tất cả các mốc thanh toán và thư bảo lãnh liên quan sẽ bị xóa.')) return;
    try {
      await fetch(`http://localhost:3000/contracts/${id}`, { method: 'DELETE' });
      fetchContracts();
    } catch (e) {
      console.error(e);
      alert('Lỗi khi xóa hợp đồng');
    }
  };

  // --- AR MILESTONES ---
  const handleMilestoneAction = async (milestoneId: number, newStatus: string) => {
    if (!confirm(`Xác nhận chuyển trạng thái thành: ${newStatus}? Hệ thống sẽ tự động hạch toán kế toán cho giao dịch này.`)) return;
    try {
      await fetch(`http://localhost:3000/contracts/milestones/${milestoneId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, accountId: 1 }) // Default to cash fund
      });
      fetchContracts();
      alert('Đã cập nhật và hạch toán thành công!');
    } catch (e) {
      alert('Lỗi cập nhật');
    }
  };

  // --- GUARANTEE LETTERS ---
  const resetGuaranteeForm = () => {
    setGlContractId('');
    setGlType('ADVANCE');
    setGlValue(0);
    setGlIssueDate('');
    setGlExpiryDate('');
    setGlBankName('');
    setGlStatus('ACTIVE');
    setGlNotes('');
    setEditingGuarantee(null);
  };

  const handleEditGuarantee = (g: any, cId: number) => {
    setEditingGuarantee(g);
    setGlContractId(cId.toString());
    setGlType(g.type);
    setGlValue(g.value);
    setGlIssueDate(g.issueDate ? g.issueDate.split('T')[0] : '');
    setGlExpiryDate(g.expiryDate ? g.expiryDate.split('T')[0] : '');
    setGlBankName(g.bankName);
    setGlStatus(g.status);
    setGlNotes(g.notes || '');
    setShowGuaranteeModal(true);
  };

  const handleGuaranteeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: glType,
      value: Number(glValue),
      issueDate: glIssueDate ? new Date(glIssueDate).toISOString() : undefined,
      expiryDate: glExpiryDate ? new Date(glExpiryDate).toISOString() : undefined,
      bankName: glBankName,
      status: glStatus,
      notes: glNotes
    };

    try {
      if (editingGuarantee) {
        await fetch(`http://localhost:3000/contracts/guarantee-letters/${editingGuarantee.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`http://localhost:3000/contracts/${glContractId}/guarantee-letters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setShowGuaranteeModal(false);
      resetGuaranteeForm();
      fetchContracts();
    } catch (e) {
      alert('Lỗi lưu thư bảo lãnh');
    }
  };

  const handleDeleteGuarantee = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa thư bảo lãnh này?')) return;
    try {
      await fetch(`http://localhost:3000/contracts/guarantee-letters/${id}`, { method: 'DELETE' });
      fetchContracts();
    } catch(e) {
      alert('Lỗi khi xóa');
    }
  };

  // Utilities
  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val || 0);
  
  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };
  
  const daysUntilExpiry = (dateStr: string) => {
    if (!dateStr) return 999;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Flattened Data
  const allMilestones = contracts.flatMap(c => 
    c.milestones.map((m: any) => ({ ...m, contract: c }))
  );
  
  const allGuarantees = contracts.flatMap(c => 
    c.guaranteeLetters?.map((g: any) => ({ ...g, contract: c })) || []
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hợp đồng & Dòng tiền CĐT (AR)</h1>
          <p className="page-subtitle">Quản lý Hợp đồng, Công nợ phải thu và Thư bảo lãnh</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isKehoach && (
            <button className="btn btn-primary" onClick={() => { resetContractForm(); setShowContractModal(true); }}>
              <Plus size={18} /> Thêm Hợp đồng
            </button>
          )}
          <button className="btn" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'white' }} onClick={() => { resetGuaranteeForm(); setShowGuaranteeModal(true); }}>
            <ShieldAlert size={18} style={{ marginRight: '8px' }}/> Thêm Bảo lãnh
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
        <button className={`btn ${activeTab === 'CONTRACTS' ? 'btn-primary' : ''}`} style={activeTab !== 'CONTRACTS' ? { background: 'transparent', color: 'var(--text-secondary)' } : {}} onClick={() => setActiveTab('CONTRACTS')}>
          <FileText size={16} style={{ marginRight: '8px' }}/> Danh sách Hợp đồng
        </button>
        <button className={`btn ${activeTab === 'AR' ? 'btn-primary' : ''}`} style={activeTab !== 'AR' ? { background: 'transparent', color: 'var(--text-secondary)' } : {}} onClick={() => setActiveTab('AR')}>
          <DollarSign size={16} style={{ marginRight: '8px' }}/> Tiến độ Thanh toán (AR)
        </button>
        <button className={`btn ${activeTab === 'GUARANTEES' ? 'btn-primary' : ''}`} style={activeTab !== 'GUARANTEES' ? { background: 'transparent', color: 'var(--text-secondary)' } : {}} onClick={() => setActiveTab('GUARANTEES')}>
          <ShieldAlert size={16} style={{ marginRight: '8px' }}/> Thư bảo lãnh
        </button>
      </div>

      {loading ? <div className="loader"></div> : (
        <>
          {/* TAB 1: CONTRACTS */}
          {activeTab === 'CONTRACTS' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Số Hợp đồng</th>
                    <th>Chủ đầu tư</th>
                    <th>Dự án</th>
                    <th style={{ textAlign: 'right' }}>Giá trị (VNĐ)</th>
                    <th style={{ textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Đã thu</th>
                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(c => {
                    const totalInvoiced = c.milestones.filter((m: any) => m.status === 'PAID').reduce((sum: number, m: any) => sum + m.amount, 0);
                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 'bold' }}>{c.contractNumber}</td>
                        <td>{c.customer?.name || 'N/A'}</td>
                        <td>{c.project?.name}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--info)' }}>
                          {formatCurrency(c.value)}<br/>
                          <small style={{ color: 'var(--text-secondary)' }}>+ VAT {c.vatRate}%</small>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${c.status === 'COMPLETED' ? 'badge-success' : 'badge-active'}`}>{c.status}</span>
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--success)' }}>
                          {formatCurrency(totalInvoiced)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn btn-sm" onClick={() => handleEditContract(c)}>Sửa</button>
                            {isKehoach && (
                              <button className="btn btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteContract(c.id)}>Xóa</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: AR (ACCOUNTS RECEIVABLE) */}
          {activeTab === 'AR' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <style>
                {`
                  @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(14, 165, 233, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
                  }
                  .btn-glow {
                    background: linear-gradient(45deg, var(--info), #0ea5e9);
                    color: white;
                    border: 1px solid #38bdf8;
                    font-weight: bold;
                    animation: pulse-glow 2s infinite;
                  }
                `}
              </style>
              <table className="table">
                <thead>
                  <tr>
                    <th>Cột mốc thanh toán</th>
                    <th>Hợp đồng / Dự án</th>
                    <th>Hạn chót</th>
                    <th style={{ textAlign: 'right' }}>Số tiền (VNĐ)</th>
                    <th style={{ textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ textAlign: 'center' }}>Xử lý kế toán</th>
                  </tr>
                </thead>
                <tbody>
                  {allMilestones.map(m => {
                    const overdue = m.status === 'PENDING' && isOverdue(m.dueDate);
                    return (
                      <tr key={m.id} style={{ background: overdue ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                        <td>
                          <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {overdue && <AlertCircle size={14} color="var(--danger)" />}
                            {m.name}
                          </div>
                          <small className="text-muted">{m.type}</small>
                        </td>
                        <td>
                          <div>{m.contract.contractNumber}</div>
                          <small className="text-muted">{m.contract.project?.name}</small>
                        </td>
                        <td style={{ color: overdue ? 'var(--danger)' : 'inherit', fontWeight: overdue ? 'bold' : 'normal' }}>
                          {m.dueDate ? new Date(m.dueDate).toLocaleDateString('vi-VN') : 'N/A'}
                          {overdue && <div style={{ fontSize: '0.75rem' }}>Quá hạn!</div>}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(m.amount)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${m.status === 'PAID' ? 'badge-success' : m.status === 'INVOICED' ? 'badge-active' : 'badge-paused'}`}>
                            {m.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isKetoan ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              {m.status === 'PENDING' && (
                                <button className="btn btn-sm btn-glow" onClick={() => handleMilestoneAction(m.id, 'INVOICED')}>
                                  Xuất HĐ (Nợ 131)
                                </button>
                              )}
                              {m.status === 'INVOICED' && (
                                <button className="btn btn-sm btn-primary" onClick={() => handleMilestoneAction(m.id, 'PAID')}>
                                  Thu Tiền (Nợ 112)
                                </button>
                              )}
                              {m.status === 'PAID' && <span className="text-muted"><CheckCircle size={16} color="var(--success)"/> Đã thu</span>}
                            </div>
                          ) : (
                            <span className="text-muted">Không có quyền</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: GUARANTEE LETTERS */}
          {activeTab === 'GUARANTEES' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0 }}>Danh sách Thư Bảo Lãnh</h3>
                {isKetoan && (
                  <button className="btn btn-primary" onClick={() => { resetGuaranteeForm(); setShowGuaranteeModal(true); }}>
                    <Plus size={18} /> Thêm Thư bảo lãnh
                  </button>
                )}
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Loại bảo lãnh</th>
                    <th>Hợp đồng</th>
                    <th>Ngân hàng</th>
                    <th style={{ textAlign: 'right' }}>Giá trị (VNĐ)</th>
                    <th>Ngày hết hạn</th>
                    <th style={{ textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {allGuarantees.map(g => {
                    const daysLeft = daysUntilExpiry(g.expiryDate);
                    const expiringSoon = g.status === 'ACTIVE' && daysLeft <= 15;
                    const expired = g.status === 'ACTIVE' && daysLeft < 0;
                    
                    return (
                      <tr key={g.id} style={{ background: expired ? 'rgba(239, 68, 68, 0.05)' : expiringSoon ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
                        <td style={{ fontWeight: 'bold' }}>
                          {g.type === 'ADVANCE' ? 'B/L Tạm ứng' : g.type === 'WARRANTY' ? 'B/L Bảo hành' : 'B/L Thực hiện HĐ'}
                        </td>
                        <td>{g.contract.contractNumber}</td>
                        <td>{g.bankName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--warning)' }}>{formatCurrency(g.value)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {expired ? <AlertCircle size={14} color="var(--danger)" /> : expiringSoon ? <Clock size={14} color="var(--warning)" /> : null}
                            <span style={{ color: expired ? 'var(--danger)' : expiringSoon ? 'var(--warning)' : 'inherit', fontWeight: (expired || expiringSoon) ? 'bold' : 'normal' }}>
                              {new Date(g.expiryDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          {(expired || expiringSoon) && <div style={{ fontSize: '0.75rem', color: expired ? 'var(--danger)' : 'var(--warning)' }}>{expired ? 'Đã hết hạn!' : `Còn ${daysLeft} ngày`}</div>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${g.status === 'RELEASED' ? 'badge-success' : g.status === 'EXPIRED' ? 'badge-paused' : 'badge-active'}`}>{g.status}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn btn-sm" onClick={() => handleEditGuarantee(g, g.contract.id)}>Sửa</button>
                            {isKetoan && (
                              <button className="btn btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteGuarantee(g.id)}>Xóa</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {allGuarantees.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Chưa có thư bảo lãnh nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* CONTRACT MODAL */}
      {showContractModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{editingContract ? 'Sửa Hợp đồng' : 'Thêm Hợp đồng mới'}</h2>
            <form onSubmit={handleContractSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Dự án áp dụng</label>
                  <select className="form-input" value={projectId} onChange={e => setProjectId(e.target.value)} required>
                    <option value="">-- Chọn dự án --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Số Hợp đồng</label>
                  <input type="text" className="form-input" value={contractNumber} onChange={e => setContractNumber(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Chủ Đầu Tư</label>
                  <select className="form-input" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                    <option value="">-- Chọn CĐT --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="DRAFT">Dự thảo</option>
                    <option value="SIGNED">Đã ký</option>
                    <option value="IN_PROGRESS">Đang thực hiện</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="LIQUIDATED">Đã thanh lý</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Giá trị (Trước Thuế)</label>
                  <input type="number" className="form-input" value={value} onChange={e => setValue(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Thuế suất VAT (%)</label>
                  <input type="number" className="form-input" value={vatRate} onChange={e => setVatRate(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày bắt đầu</label>
                  <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày kết thúc</label>
                  <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <div style={{ marginTop: '32px', marginBottom: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>Giai đoạn Thanh toán / Tạm ứng (Milestones)</h3>
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => setMilestones([...milestones, { name: '', amount: 0, type: 'PAYMENT', status: 'PENDING', dueDate: '' }])}><Plus size={14}/> Thêm Giai đoạn</button>
                </div>
                {milestones.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Chưa có giai đoạn nào được định nghĩa.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {milestones.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                        <input type="text" className="form-input" placeholder="Tên giai đoạn" value={m.name} onChange={e => { const n = [...milestones]; n[idx].name = e.target.value; setMilestones(n); }} required style={{ flex: 2 }} />
                        <input type="number" className="form-input" placeholder="Số tiền" value={m.amount} onChange={e => { const n = [...milestones]; n[idx].amount = e.target.value; setMilestones(n); }} required style={{ flex: 1 }} />
                        <select className="form-input" value={m.type} onChange={e => { const n = [...milestones]; n[idx].type = e.target.value; setMilestones(n); }} style={{ width: '120px' }}>
                          <option value="ADVANCE">Tạm ứng</option>
                          <option value="PAYMENT">Thanh toán</option>
                          <option value="RETENTION">Bảo hành</option>
                        </select>
                        <select className="form-input" value={m.status} onChange={e => { const n = [...milestones]; n[idx].status = e.target.value; setMilestones(n); }} style={{ width: '120px' }}>
                          <option value="PENDING">Chờ xử lý</option>
                          <option value="INVOICED">Đã xuất HĐ</option>
                          <option value="PAID">Đã thu tiền</option>
                        </select>
                        <input type="date" className="form-input" value={m.dueDate ? m.dueDate.split('T')[0] : ''} onChange={e => { const n = [...milestones]; n[idx].dueDate = e.target.value; setMilestones(n); }} style={{ width: '130px' }} />
                        <button type="button" className="btn btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setMilestones(milestones.filter((_, i) => i !== idx))}><Trash2 size={16}/></button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '120px', marginTop: '8px' }}>
                      <span className="text-muted">Tổng: </span>
                      <span style={{ fontWeight: 'bold', marginLeft: '8px', color: milestones.reduce((s,m) => s + Number(m.amount), 0) > value ? 'var(--danger)' : 'var(--success)' }}>
                        {formatCurrency(milestones.reduce((s,m) => s + Number(m.amount), 0))} / {formatCurrency(value)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú thêm</label>
                <textarea className="form-input" value={note} onChange={e => setNote(e.target.value)} rows={3}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setShowContractModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Hợp đồng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GUARANTEE MODAL */}
      {showGuaranteeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingGuarantee ? 'Cập nhật Thư bảo lãnh' : 'Thêm Thư bảo lãnh mới'}</h2>
            <form onSubmit={handleGuaranteeSubmit}>
              <div className="form-group">
                <label className="form-label">Hợp đồng liên kết</label>
                <select className="form-input" value={glContractId} onChange={e => setGlContractId(e.target.value)} required disabled={!!editingGuarantee}>
                  <option value="">-- Chọn Hợp đồng --</option>
                  {contracts.map(c => <option key={c.id} value={c.id}>{c.contractNumber} ({c.customer?.name})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Loại Bảo lãnh</label>
                <select className="form-input" value={glType} onChange={e => setGlType(e.target.value)}>
                  <option value="ADVANCE">Bảo lãnh Tạm ứng</option>
                  <option value="PERFORMANCE">Bảo lãnh Thực hiện hợp đồng</option>
                  <option value="WARRANTY">Bảo lãnh Bảo hành</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ngân hàng phát hành</label>
                <input type="text" className="form-input" value={glBankName} onChange={e => setGlBankName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Giá trị Bảo lãnh (VNĐ)</label>
                <input type="number" className="form-input" value={glValue} onChange={e => setGlValue(Number(e.target.value))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Ngày phát hành</label>
                  <input type="date" className="form-input" value={glIssueDate} onChange={e => setGlIssueDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày hết hạn</label>
                  <input type="date" className="form-input" value={glExpiryDate} onChange={e => setGlExpiryDate(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select className="form-input" value={glStatus} onChange={e => setGlStatus(e.target.value)}>
                  <option value="ACTIVE">Đang hiệu lực</option>
                  <option value="EXPIRED">Đã hết hạn</option>
                  <option value="RELEASED">Đã giải tỏa</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setShowGuaranteeModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Bảo lãnh</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
