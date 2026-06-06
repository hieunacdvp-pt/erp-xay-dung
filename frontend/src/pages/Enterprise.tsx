import React, { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PhieuNhapXuatPrint } from '../components/print-templates/PhieuNhapXuatPrint';

export default function Enterprise() {
  const [activeSubTab, setActiveSubTab] = useState<'MOVEMENTS' | 'DEBTS' | 'VENDORS'>('MOVEMENTS');
  const [movements, setMovements] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  // New Print State
  const [printingMov, setPrintingMov] = useState<any>(null);
  
  // Vendor Edit State
  const [editingVendor, setEditingVendor] = useState<any>(null);
  
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Phieu_Nhap_Xuat'
  });

  // Form states for creating Movement
  const [newMovement, setNewMovement] = useState({ type: 'IMPORT', projectId: '', materialId: '', quantity: '', price: '', vendorId: '', vatRate: '0', note: '', deliverer: '', vehiclePlate: '', hasInvoice: true, invoiceNumber: '' });
  
  // Payment Modal States
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [bankFee, setBankFee] = useState('0');
  const [accountId, setAccountId] = useState('');

  // Settings
  const [valuationMethod, setValuationMethod] = useState<'AVERAGE' | 'FIFO'>('AVERAGE');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [movRes, debRes, venRes, matRes, projRes, bankRes] = await Promise.all([
        fetch('http://localhost:3000/enterprise/movements').then(r => r.json()),
        fetch('http://localhost:3000/enterprise/debts').then(r => r.json()),
        fetch('http://localhost:3000/enterprise/vendors').then(r => r.json()),
        fetch('http://localhost:3000/materials').then(r => r.json()),
        fetch('http://localhost:3000/projects').then(r => r.json()),
        fetch('http://localhost:3000/bank-accounts').then(r => r.json()),
        fetch('http://localhost:3000/enterprise/settings').then(r => r.json()),
      ]);
      setMovements(movRes);
      setDebts(debRes);
      setVendors(venRes);
      setMaterials(matRes);
      setProjects(projRes);
      setBankAccounts(bankRes);
      setValuationMethod(arguments[0][6]?.valuationMethod || 'AVERAGE'); // Destructure the 7th promise result
      
      if (projRes.length > 0) setNewMovement(m => ({ ...m, projectId: projRes[0].id.toString() }));
      if (matRes.length > 0) setNewMovement(m => ({ ...m, materialId: matRes[0].id.toString() }));
      if (venRes.length > 0) setNewMovement(m => ({ ...m, vendorId: venRes[0].id.toString() }));
      if (bankRes.length > 0) setAccountId(bankRes[0].id.toString());

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/enterprise/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newMovement.type,
          projectId: Number(newMovement.projectId),
          materialId: Number(newMovement.materialId),
          quantity: Number(newMovement.quantity),
          price: Number(newMovement.price),
          vendorId: newMovement.type === 'IMPORT' ? Number(newMovement.vendorId) : undefined,
          vatRate: newMovement.type === 'IMPORT' ? Number(newMovement.vatRate) : 0,
          hasInvoice: newMovement.type === 'IMPORT' ? newMovement.hasInvoice : undefined,
          invoiceNumber: newMovement.type === 'IMPORT' ? newMovement.invoiceNumber : undefined,
          note: JSON.stringify({ note: newMovement.note, deliverer: newMovement.deliverer, vehiclePlate: newMovement.vehiclePlate })
        })
      });
      if (!res.ok) throw new Error('API Error');
      alert('Đã tạo phiếu kho và hạch toán thành công!');
      setNewMovement({ ...newMovement, quantity: '', price: '', note: '', deliverer: '', vehiclePlate: '', invoiceNumber: '' });
      fetchData();
    } catch (e) {
      alert('Có lỗi xảy ra, vui lòng kiểm tra lại!');
    }
  };

  const openPayModal = (debt: any) => {
    setSelectedDebt(debt);
    setPayAmount(debt.amount.toString());
    setBankFee('0');
    setPayModalOpen(true);
  };

  const handlePayDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDebt && payAmount && Number(payAmount) > 0) {
      try {
        const res = await fetch(`http://localhost:3000/enterprise/debts/${selectedDebt.id}/pay`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: Number(payAmount),
            accountId: Number(accountId),
            bankFee: Number(bankFee)
          })
        });
        if (!res.ok) throw new Error('API Error');
        alert('Đã thanh toán công nợ và ghi nhận Phiếu chi/thu!');
        setPayModalOpen(false);
        fetchData();
      } catch (e) {
        alert('Có lỗi xảy ra, vui lòng kiểm tra lại!');
      }
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3000/enterprise/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valuationMethod })
      });
      alert('Đã lưu cấu hình hệ thống!');
      setSettingsModalOpen(false);
    } catch(e) { alert('Lỗi lưu cấu hình'); }
  };

  const handlePrintMovement = (movement: any) => {
    const proj = projects.find(p => p.id === movement.projectId);
    const mat = materials.find(m => m.id === movement.materialId);
    const fullMovement = { 
      ...movement, 
      project: movement.project || proj, 
      material: movement.material || mat 
    };
    
    setPrintingMov(fullMovement);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const handleCreateVendor = async () => {
    const name = prompt('Nhập tên Nhà cung cấp mới:');
    if (name) {
      await fetch('http://localhost:3000/enterprise/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      fetchData();
    }
  };

  const handleUpdateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;
    try {
      await fetch(`http://localhost:3000/enterprise/vendors/${editingVendor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxId: editingVendor.taxId,
          phone: editingVendor.phone,
          address: editingVendor.address
        })
      });
      setEditingVendor(null);
      fetchData();
    } catch(err) { alert(err); }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const formatDate = (date: string) => new Date(date).toLocaleString('vi-VN');

  if (loading) return <div className="loader"></div>;

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className={`btn ${activeSubTab === 'MOVEMENTS' ? 'btn-primary' : ''}`} style={activeSubTab !== 'MOVEMENTS' ? {background: 'rgba(255,255,255,0.05)', color: 'white'} : {}} onClick={() => setActiveSubTab('MOVEMENTS')}>Lịch sử Nhập/Xuất (Kho)</button>
          <button className={`btn ${activeSubTab === 'DEBTS' ? 'btn-primary' : ''}`} style={activeSubTab !== 'DEBTS' ? {background: 'rgba(255,255,255,0.05)', color: 'white'} : {}} onClick={() => setActiveSubTab('DEBTS')}>Quản lý Công nợ</button>
          <button className={`btn ${activeSubTab === 'VENDORS' ? 'btn-primary' : ''}`} style={activeSubTab !== 'VENDORS' ? {background: 'rgba(255,255,255,0.05)', color: 'white'} : {}} onClick={() => setActiveSubTab('VENDORS')}>Nhà Cung Cấp</button>
        </div>
        <button className="btn btn-primary" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setSettingsModalOpen(true)}>
          <Settings size={18} /> Cài đặt Thuật toán
        </button>
      </div>

      {activeSubTab === 'MOVEMENTS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Lập Phiếu Kho</h3>
            <form onSubmit={handleCreateMovement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Loại phiếu</label>
                <select className="form-select" value={newMovement.type} onChange={e => setNewMovement({...newMovement, type: e.target.value})}>
                  <option value="IMPORT">Phiếu Nhập (Mua hàng)</option>
                  <option value="EXPORT">Phiếu Xuất (Sử dụng)</option>
                </select>
              </div>
              
              {newMovement.type === 'IMPORT' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label">Nhà cung cấp (Ghi nợ)</label>
                    <select className="form-select" value={newMovement.vendorId} onChange={e => setNewMovement({...newMovement, vendorId: e.target.value})}>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Thuế GTGT (VAT %)</label>
                    <select className="form-select" value={newMovement.vatRate} onChange={(e) => setNewMovement({...newMovement, vatRate: e.target.value})}>
                      <option value="0">0% (Không chịu thuế)</option>
                      <option value="5">5%</option>
                      <option value="8">8% (Giảm thuế)</option>
                      <option value="10">10%</option>
                    </select>
                  </div>
                </div>
              )}

              {newMovement.type === 'IMPORT' && (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <input type="checkbox" id="hasInvoice" checked={newMovement.hasInvoice} onChange={e => setNewMovement({...newMovement, hasInvoice: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    <label htmlFor="hasInvoice" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Đã có hóa đơn (Ghi nhận VAT)
                    </label>
                  </div>
                  {!newMovement.hasInvoice && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--warning)', margin: '0 0 12px 0' }}>* Hàng về trước hóa đơn về sau: Hệ thống sẽ nhập kho Tạm tính và không ghi nhận Thuế GTGT được khấu trừ (1331).</p>
                  )}
                  {newMovement.hasInvoice && (
                    <div style={{ marginTop: '8px' }}>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Số Hóa đơn</label>
                      <input type="text" className="form-input" placeholder="VD: 0001234" value={newMovement.invoiceNumber} onChange={e => setNewMovement({...newMovement, invoiceNumber: e.target.value})} />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="form-label">Vật tư</label>
                <select className="form-select" value={newMovement.materialId} onChange={e => setNewMovement({...newMovement, materialId: e.target.value})}>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Số lượng</label>
                  <input type="number" className="form-input" required value={newMovement.quantity} onChange={e => setNewMovement({...newMovement, quantity: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Đơn giá</label>
                  {newMovement.type === 'EXPORT' ? (
                    <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', border: '1px solid var(--border-glass)' }}>
                      Tính tự động ({valuationMethod === 'AVERAGE' ? 'Bình quân' : 'FIFO'})
                    </div>
                  ) : (
                    <input type="number" className="form-input" required value={newMovement.price} onChange={e => setNewMovement({...newMovement, price: e.target.value})} />
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Dự án</label>
                <select className="form-select" value={newMovement.projectId} onChange={e => setNewMovement({...newMovement, projectId: e.target.value})}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {newMovement.type === 'IMPORT' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label">Người giao hàng</label>
                    <input type="text" className="form-input" placeholder="VD: Nguyễn Văn A" value={newMovement.deliverer} onChange={e => setNewMovement({...newMovement, deliverer: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Biển số xe</label>
                    <input type="text" className="form-input" placeholder="VD: 29H-123.45" value={newMovement.vehiclePlate} onChange={e => setNewMovement({...newMovement, vehiclePlate: e.target.value})} />
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">Ghi chú thêm</label>
                <input type="text" className="form-input" placeholder="Nhập ghi chú diễn giải" value={newMovement.note} onChange={e => setNewMovement({...newMovement, note: e.target.value})} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Lưu Chứng từ
              </button>
            </form>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Sổ chi tiết Vật tư (Data Grid)</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Ngày CT</th>
                  <th>Loại CT</th>
                  <th>Vật tư</th>
                  <th style={{ textAlign: 'right' }}>Số lượng</th>
                  <th style={{ textAlign: 'right' }}>Đơn giá</th>
                  <th style={{ textAlign: 'right' }}>Thành tiền</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {movements.sort((a,b) => b.id - a.id).map(m => (
                  <tr key={m.id}>
                    <td className="text-muted">{formatDate(m.date)}</td>
                    <td>
                      <span className="badge" style={{ background: m.type === 'IMPORT' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: m.type === 'IMPORT' ? 'var(--success)' : 'var(--danger)' }}>
                        {m.type === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{m.material?.name}</td>
                    <td style={{ textAlign: 'right' }}>{m.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(m.price)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(m.quantity * m.price)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        onClick={() => handlePrintMovement(m)}
                      >
                        In Phiếu
                      </button>
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center' }}>Chưa có phát sinh.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'DEBTS' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Sổ Chi Tiết Công Nợ Phải Trả (Nhà Cung Cấp)</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Mã Nợ</th>
                <th>Nhà cung cấp</th>
                <th style={{ textAlign: 'right' }}>Số tiền (Dư nợ)</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {debts.filter(d => d.type === 'PAYABLE').map(d => (
                <tr key={d.id}>
                  <td>CN-{d.id.toString().padStart(4, '0')}</td>
                  <td style={{ fontWeight: 500 }}>{d.vendor?.name}</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>{formatCurrency(d.amount)}</td>
                  <td>
                    <span className="badge" style={{ background: d.status === 'PAID' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: d.status === 'PAID' ? 'var(--success)' : 'var(--warning)' }}>
                      {d.status === 'PAID' ? 'Đã thanh toán' : (d.status === 'PARTIAL' ? 'Thanh toán 1 phần' : 'Chưa thanh toán')}
                    </span>
                  </td>
                  <td>
                    {d.amount > 0 && (
                      <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.875rem' }} onClick={() => openPayModal(d)}>
                        Lập Phiếu Chi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {debts.filter(d => d.type === 'PAYABLE').length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center' }}>Không có công nợ.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'VENDORS' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Danh mục Nhà Cung Cấp</h3>
            <button className="btn btn-primary" onClick={handleCreateVendor}>+ Thêm NCC</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Mã NCC</th>
                <th>Tên Nhà Cung Cấp</th>
                <th>Mã số thuế</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ / Ghi chú</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id}>
                  <td className="text-muted">NCC-{v.id.toString().padStart(4, '0')}</td>
                  <td style={{ fontWeight: 500 }}>{v.name}</td>
                  <td>{v.taxId || '-'}</td>
                  <td>{v.phone || '-'}</td>
                  <td>{v.address || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingVendor(v)}>Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {payModalOpen && selectedDebt && (
        <div className="modal-overlay" onClick={() => setPayModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Lập Phiếu Chi Thanh Toán</h2>
            <p className="text-muted" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
              Thanh toán cho: <strong>{selectedDebt.vendor?.name}</strong><br/>
              Dư nợ hiện tại: <strong>{formatCurrency(selectedDebt.amount)}</strong>
            </p>
            <form onSubmit={handlePayDebt}>
              <div className="form-group">
                <label className="form-label">Chi từ Tài khoản / Quỹ</label>
                <select className="form-input" required value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.type === 'CASH' ? 'Tiền mặt' : 'Ngân hàng'}) - Số dư: {formatCurrency(b.balance)}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Số tiền chi trả (VNĐ)</label>
                <input type="number" className="form-input" required max={selectedDebt.amount} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Phí chuyển khoản (VNĐ) (Nếu có)</label>
                <input type="number" className="form-input" required value={bankFee} onChange={(e) => setBankFee(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setPayModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Xác nhận Thanh toán</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <div className="modal-overlay" onClick={() => setSettingsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={24}/> Cài đặt Thuật toán Kho</h2>
            <p className="text-muted" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
              Chọn thuật toán tính giá vốn xuất kho. Hệ thống sẽ tự động quét lịch sử và tính toán theo phương pháp này mỗi khi xuất kho.
            </p>
            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label">Phương pháp tính Giá Xuất Kho</label>
                <select className="form-input" value={valuationMethod} onChange={(e) => setValuationMethod(e.target.value as any)}>
                  <option value="AVERAGE">Bình quân gia quyền (Đề xuất cho Xây dựng)</option>
                  <option value="FIFO">Nhập trước - Xuất trước (FIFO)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setSettingsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Cài Đặt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <div className="modal-overlay" onClick={() => setEditingVendor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Sửa thông tin Nhà Cung Cấp</h2>
            <p className="text-muted" style={{ marginBottom: '20px' }}>{editingVendor.name}</p>
            <form onSubmit={handleUpdateVendor}>
              <div className="form-group">
                <label className="form-label">Mã số thuế</label>
                <input type="text" className="form-input" value={editingVendor.taxId || ''} onChange={e => setEditingVendor({...editingVendor, taxId: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input type="text" className="form-input" value={editingVendor.phone || ''} onChange={e => setEditingVendor({...editingVendor, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ / Ghi chú</label>
                <input type="text" className="form-input" value={editingVendor.address || ''} onChange={e => setEditingVendor({...editingVendor, address: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setEditingVendor(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Print Container */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <PhieuNhapXuatPrint ref={printRef} movement={printingMov} />
      </div>

    </div>
  );
}
