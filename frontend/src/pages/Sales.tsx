import React, { useEffect, useState, useRef } from 'react';
import { Plus, CheckCircle, Receipt, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PhieuNghiemThuPrint } from '../components/print-templates/PhieuNghiemThuPrint';

export default function Sales() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    projectId: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    vatRate: '10',
    costTransferPercentage: '100',
    retentionPercentage: '0'
  });

  const [loading, setLoading] = useState(false);
  const [printingInv, setPrintingInv] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Phieu_Nghiem_Thu'
  });

  const onPrintClick = (inv: any) => {
    setPrintingInv(inv);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, projRes, custRes] = await Promise.all([
        fetch('http://localhost:3000/sales/invoices'),
        fetch('http://localhost:3000/projects'),
        fetch('http://localhost:3000/customers') // assume we have /customers endpoint
      ]);
      setInvoices(await invRes.json());
      
      const projs = await projRes.json();
      setProjects(projs);
      
      const custs = await custRes.json();
      setCustomers(custs);

      if (projs.length > 0) setNewInvoice(p => ({ ...p, projectId: String(projs[0].id) }));
      if (custs.length > 0) setNewInvoice(p => ({ ...p, customerId: String(custs[0].id) }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.projectId || !newInvoice.customerId || !newInvoice.amount) return;

    try {
      await fetch('http://localhost:3000/sales/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
      setShowModal(false);
      setNewInvoice({ ...newInvoice, description: '', amount: '', vatRate: '10', costTransferPercentage: '100', retentionPercentage: '0' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val || 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Quản lý Bán hàng & Nghiệm thu</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Lập Phiếu Nghiệm Thu (Hóa đơn)
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? <div className="loader"></div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Số HĐ</th>
                <th>Dự án</th>
                <th>Khách hàng</th>
                <th>Diễn giải</th>
                <th style={{ textAlign: 'right' }}>Trước Thuế (511)</th>
                <th style={{ textAlign: 'right' }}>Thuế GTGT (3331)</th>
                <th style={{ textAlign: 'right' }}>Tổng Phải Thu (131)</th>
                <th style={{ textAlign: 'right', color: 'var(--warning)' }}>Giữ lại BH</th>
                <th>Trạng thái</th>
                <th>In Phiếu</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td>{new Date(inv.date).toLocaleDateString('vi-VN')}</td>
                  <td style={{ fontWeight: 'bold' }}>HD-{inv.id.toString().padStart(4, '0')}</td>
                  <td>{inv.project?.name}</td>
                  <td>{inv.customer?.name}</td>
                  <td>{inv.description}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(inv.amount)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--warning)' }}>{formatCurrency(inv.vatAmount)} ({inv.vatRate}%)</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>{formatCurrency(inv.totalAmount)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--warning)' }}>
                    {inv.retentionAmount > 0 ? `${formatCurrency(inv.retentionAmount)} (${inv.retentionPercentage}%)` : '-'}
                  </td>
                  <td>
                    <span className="badge" style={{ background: inv.status === 'PAID' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: inv.status === 'PAID' ? 'var(--success)' : 'var(--warning)' }}>
                      {inv.status === 'PAID' ? 'Đã thu tiền' : 'Chưa thu tiền'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-sm btn-primary" onClick={() => onPrintClick(inv)} title="In Phiếu Nghiệm Thu">
                      <Printer size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center' }}>Chưa có dữ liệu nghiệm thu.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={24} color="var(--primary)" /> Lập Phiếu Nghiệm Thu (Xuất Hóa đơn)
            </h3>
            
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Dự án thi công</label>
                  <select className="form-select" value={newInvoice.projectId} onChange={e => setNewInvoice({...newInvoice, projectId: e.target.value})} required>
                    <option value="">-- Chọn dự án --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Chủ đầu tư (Khách hàng)</label>
                  <select className="form-select" value={newInvoice.customerId} onChange={e => setNewInvoice({...newInvoice, customerId: e.target.value})} required>
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Ngày nghiệm thu</label>
                  <input type="date" className="form-input" value={newInvoice.date} onChange={e => setNewInvoice({...newInvoice, date: e.target.value})} required />
                </div>
                <div>
                  <label className="form-label">Giá trị (Trước Thuế)</label>
                  <input type="number" className="form-input" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} placeholder="VND" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label className="form-label">Diễn giải nghiệm thu</label>
                  <input type="text" className="form-input" value={newInvoice.description} onChange={e => setNewInvoice({...newInvoice, description: e.target.value})} placeholder="VD: Nghiệm thu giai đoạn 1..." required />
                </div>
                <div>
                  <label className="form-label">% Thuế GTGT (VAT)</label>
                  <select className="form-select" value={newInvoice.vatRate} onChange={e => setNewInvoice({...newInvoice, vatRate: e.target.value})}>
                    <option value="0">0%</option>
                    <option value="8">8%</option>
                    <option value="10">10%</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Tổng phải thu (Sau thuế)</label>
                  <input type="text" className="form-input" disabled value={formatCurrency(Number(newInvoice.amount || 0) * (1 + Number(newInvoice.vatRate) / 100))} style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--info)', fontSize: '0.9rem' }}>Kết chuyển Giá vốn (Nợ 632 / Có 154)</h4>
                <div>
                  <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Tỷ lệ % hoàn thành công việc</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="number" className="form-input" value={newInvoice.costTransferPercentage} onChange={e => setNewInvoice({...newInvoice, costTransferPercentage: e.target.value})} min="0" max="100" required style={{ width: '100px' }} />
                    <span className="text-muted">%</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>Hệ thống sẽ tự động quét Dư Nợ 154 hiện hành của công trình này và kết chuyển đúng {newInvoice.costTransferPercentage || 0}% sang Giá vốn hàng bán (632).</p>
                </div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--warning)', fontSize: '0.9rem' }}>Giữ lại Bảo hành (Retentions)</h4>
                <div>
                  <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Tỷ lệ % Tiền bị giữ lại bảo hành</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="number" className="form-input" value={newInvoice.retentionPercentage} onChange={e => setNewInvoice({...newInvoice, retentionPercentage: e.target.value})} min="0" max="100" style={{ width: '100px' }} />
                    <span className="text-muted">%</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>Sẽ ghi nhận tách biệt công nợ và tự động trích trước chi phí bảo hành (Nợ 627 / Có 352).</p>
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
                <CheckCircle size={16} color="var(--success)" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                Hệ thống tự động hạch toán:<br/>
                - <b>Nợ 131</b> (Tổng tiền), <b>Có 511</b> (Trước thuế), <b>Có 3331</b> (Thuế GTGT).<br/>
                - <b>Nợ 632</b>, <b>Có 154</b> (Giá vốn tương ứng tỷ lệ).
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Xác nhận Nghiệm Thu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Print Container */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <PhieuNghiemThuPrint ref={printRef} invoice={printingInv} />
      </div>
    </div>
  );
}
