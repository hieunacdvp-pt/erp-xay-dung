import React, { useEffect, useState, useRef } from 'react';
import { FileBarChart, Printer, CheckCircle, CreditCard, Save } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { AttendancePrint } from '../components/print-templates/AttendancePrint';

export default function Attendance() {
  const [viewMode, setViewMode] = useState<'ATTENDANCE' | 'PAYROLL'>('ATTENDANCE');
  
  const [projects, setProjects] = useState<any[]>([]);
  const [personnels, setPersonnels] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<Record<number, any>>({});
  const [payslips, setPayslips] = useState<any[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<any[]>([]);
  
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [selectedBank, setSelectedBank] = useState<string>('1'); // Default bank account
  const [banks, setBanks] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch init
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3000/projects').then(res => res.json()),
      fetch('http://localhost:3000/personnel').then(res => res.json()),
      fetch('http://localhost:3000/bank-accounts').then(res => res.json())
    ]).then(([projData, persData, banksData]) => {
      setProjects(projData);
      setPersonnels(persData.filter((p: any) => p.status === 'ACTIVE'));
      setBanks(banksData);
      if (projData.length > 0) setSelectedProject(String(projData[0].id));
    }).catch(console.error);
  }, []);

  // Fetch Attendances
  useEffect(() => {
    if (viewMode !== 'ATTENDANCE' || !selectedProject || !selectedDate) return;
    setLoading(true);
    fetch(`http://localhost:3000/attendances?projectId=${selectedProject}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        const attMap: Record<number, any> = {};
        data.forEach((att: any) => { attMap[att.personnelId] = att; });
        setAttendances(attMap);
      })
      .finally(() => setLoading(false));
  }, [selectedProject, selectedDate, viewMode]);

  // Fetch Payroll
  const loadPayroll = () => {
    if (viewMode !== 'PAYROLL' || !selectedProject || !selectedMonth) return;
    setLoading(true);
    
    Promise.all([
      fetch(`http://localhost:3000/attendances/payroll?projectId=${selectedProject}&month=${selectedMonth}`).then(r => r.ok ? r.json() : []),
      fetch(`http://localhost:3000/attendances/payroll/summary?month=${selectedMonth}`).then(r => r.ok ? r.json() : [])
    ]).then(([projData, summaryData]) => {
      setPayslips(Array.isArray(projData) ? projData : []);
      setPayrollSummary(Array.isArray(summaryData) ? summaryData : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayroll();
  }, [selectedProject, selectedMonth, viewMode]);

  const handleStatusChange = async (personnelId: number, status: string) => {
    setAttendances(prev => ({ ...prev, [personnelId]: { ...prev[personnelId], status } }));
    setSaving(true);
    try {
      await fetch('http://localhost:3000/attendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personnelId, projectId: Number(selectedProject), date: new Date(selectedDate).toISOString(), status })
      });
      setMessage('Đã lưu.'); setTimeout(() => setMessage(''), 2000);
    } catch (err) { setMessage('Lỗi khi lưu.'); } finally { setSaving(false); }
  };

  const handleUpdatePayslip = async (id: number, field: string, value: string) => {
    const val = Number(value) || 0;
    const slip = payslips.find(p => p.id === id);
    if (!slip || slip.status !== 'DRAFT') return;

    const newData = { ...slip, [field]: val };
    
    // Optimistic update
    setPayslips(payslips.map(p => p.id === id ? { ...p, [field]: val, netPay: p.baseSalary + (field==='allowance'?val:p.allowance) + (field==='overtimePay'?val:p.overtimePay) + (field==='bonus'?val:p.bonus) - (field==='deduction'?val:p.deduction) - (field==='insurance'?val:p.insurance) - p.advance } : p));
    
    try {
      await fetch(`http://localhost:3000/attendances/payroll/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
    } catch (e) {
      console.error(e);
      loadPayroll(); // revert
    }
  };

  const handleAccountPayroll = async () => {
    // Kiem tra ho so phap ly (CMND, HD, CK08)
    const invalidPersonnel = payslips.filter(p => !p.personnel.idCardUrl || !p.personnel.contractUrl || !p.personnel.hasTaxCommitment);
    
    if (invalidPersonnel.length > 0) {
      const names = invalidPersonnel.map(p => p.personnel.name).join(', ');
      alert(`[CẢNH BÁO THUẾ] Tạm dừng chốt lương!\n\nCác nhân viên sau đang thiếu Hồ sơ pháp lý (CCCD / Hợp đồng / Cam kết 08):\n${names}\n\nVui lòng cập nhật đủ hồ sơ tại màn hình Quản lý Nhân sự để tránh rủi ro xuất toán chi phí Thuế TNDN.`);
      return;
    }

    if (!window.confirm('Chốt bảng lương và sinh Bút toán kế toán (Nợ 622 / Có 334)?')) return;
    setLoading(true);
    try {
      await fetch('http://localhost:3000/attendances/payroll/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: Number(selectedProject), month: selectedMonth })
      });
      loadPayroll();
    } finally { setLoading(false); }
  };

  const handlePayPayroll = async () => {
    if (!window.confirm('Tiến hành Thanh toán lương?')) return;
    setLoading(true);
    try {
      await fetch('http://localhost:3000/attendances/payroll/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: Number(selectedProject), month: selectedMonth, accountId: Number(selectedBank) })
      });
      loadPayroll();
    } finally { setLoading(false); }
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrintPayroll = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Bang_Luong'
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  return (
    <div>
      <style>{`
        .att-tab { padding: 12px 24px; background: rgba(255,255,255,0.05); border: none; color: var(--text-secondary); cursor: pointer; font-weight: 500; border-radius: 8px; margin-right: 16px; }
        .att-tab.active { background: var(--accent-gradient); color: white; }
        .edit-input { width: 80px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 4px 8px; border-radius: 4px; text-align: right; }
      `}</style>

      <div style={{ marginBottom: '32px' }}>
        <button className={`att-tab ${viewMode === 'ATTENDANCE' ? 'active' : ''}`} onClick={() => setViewMode('ATTENDANCE')}>Chấm công theo ngày</button>
        <button className={`att-tab ${viewMode === 'PAYROLL' ? 'active' : ''}`} onClick={() => setViewMode('PAYROLL')}>Bảng lương & Trả lương</button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label className="form-label">Dự án</label>
            <select className="form-select" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{ minWidth: '200px' }}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          
          {viewMode === 'ATTENDANCE' ? (
            <div>
              <label className="form-label">Ngày chấm công</label>
              <input type="date" className="form-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          ) : (
            <div>
              <label className="form-label">Tháng lương</label>
              <input type="month" className="form-input" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            </div>
          )}
          
          {viewMode === 'PAYROLL' && payslips.some(p => p.status === 'ACCOUNTED') && (
            <div>
              <label className="form-label">Tài khoản chi trả</label>
              <select className="form-select" value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} style={{ minWidth: '200px' }}>
                {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginLeft: 'auto', alignSelf: 'flex-end', paddingBottom: '10px' }}>
            {viewMode === 'PAYROLL' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" style={{}} onClick={handlePrintPayroll}>
                  <Printer size={18} /> In Bảng Lương
                </button>
                {payslips.some(p => p.status === 'DRAFT') && (
                  <button className="btn btn-primary" onClick={handleAccountPayroll}>
                    <CheckCircle size={18} /> Chốt & Hạch toán lương
                  </button>
                )}
                {payslips.some(p => p.status === 'ACCOUNTED') && (
                  <button className="btn btn-primary" style={{ background: 'var(--success)', color: 'white' }} onClick={handlePayPayroll}>
                    <CreditCard size={18} /> Thanh toán lương
                  </button>
                )}
              </div>
            )}
            {message && <span style={{ color: 'var(--success)' }}>{message}</span>}
          </div>
        </div>

        {loading ? <div className="loader"></div> : (
          <div className="table-container">
            {viewMode === 'ATTENDANCE' ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Họ & Tên</th>
                    <th>Chức vụ</th>
                    <th style={{ textAlign: 'center' }}>Giờ vào</th>
                    <th style={{ textAlign: 'center' }}>Giờ ra</th>
                    <th style={{ textAlign: 'center' }}>Vị trí (GPS)</th>
                    <th style={{ textAlign: 'center' }}>Hình ảnh</th>
                    <th style={{ textAlign: 'center' }}>Chấm công</th>
                  </tr>
                </thead>
                <tbody>
                  {personnels.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, color: 'white' }}>{p.name}</td>
                      <td><span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>{p.role}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        {attendances[p.id]?.timeIn ? new Date(attendances[p.id].timeIn).toLocaleTimeString('vi-VN') : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {attendances[p.id]?.timeOut ? new Date(attendances[p.id].timeOut).toLocaleTimeString('vi-VN') : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {attendances[p.id]?.latitude ? (
                          <a href={`https://www.google.com/maps?q=${attendances[p.id].latitude},${attendances[p.id].longitude}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                            Xem bản đồ
                          </a>
                        ) : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {attendances[p.id]?.photoUrl ? (
                          <img src={attendances[p.id].photoUrl} alt="Selfie" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        ) : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button className="btn" style={{ padding: '6px 12px', fontSize: '0.875rem', background: attendances[p.id]?.status === 'PRESENT' ? 'var(--success)' : 'rgba(16, 185, 129, 0.1)', color: attendances[p.id]?.status === 'PRESENT' ? 'white' : 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }} onClick={() => handleStatusChange(p.id, 'PRESENT')}>Đủ ngày</button>
                          <button className="btn" style={{ padding: '6px 12px', fontSize: '0.875rem', background: attendances[p.id]?.status === 'HALF_DAY' ? 'var(--warning)' : 'rgba(245, 158, 11, 0.1)', color: attendances[p.id]?.status === 'HALF_DAY' ? 'black' : 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }} onClick={() => handleStatusChange(p.id, 'HALF_DAY')}>Nửa ngày</button>
                          <button className="btn" style={{ padding: '6px 12px', fontSize: '0.875rem', background: attendances[p.id]?.status === 'ABSENT' ? 'var(--danger)' : 'rgba(239, 68, 68, 0.1)', color: attendances[p.id]?.status === 'ABSENT' ? 'white' : 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={() => handleStatusChange(p.id, 'ABSENT')}>Nghỉ phép</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="table" style={{ fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th rowSpan={2}>Họ Tên</th>
                    <th rowSpan={2}>Công</th>
                    <th rowSpan={2} style={{ textAlign: 'right' }}>Lương Cơ bản</th>
                    <th rowSpan={2} style={{ textAlign: 'right' }}>Phụ cấp</th>
                    <th colSpan={3} style={{ textAlign: 'center' }}>Điều chỉnh (+/-)</th>
                    <th rowSpan={2} style={{ textAlign: 'right' }}>Tạm ứng</th>
                    <th rowSpan={2} style={{ textAlign: 'right' }}>Thực lĩnh</th>
                    <th rowSpan={2} style={{ textAlign: 'center' }}>Trạng thái</th>
                  </tr>
                  <tr>
                    <th style={{ textAlign: 'right' }}>+ Làm thêm</th>
                    <th style={{ textAlign: 'right' }}>- Bảo hiểm</th>
                    <th style={{ textAlign: 'right' }}>- Phạt</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>
                        {p.personnel.name}
                        {(!p.personnel.idCardUrl || !p.personnel.contractUrl || !p.personnel.hasTaxCommitment) && (
                          <div style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '4px' }}>⚠️ Thiếu Hồ sơ</div>
                        )}
                      </td>
                      <td>{p.standardDays}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(p.baseSalary)}</td>
                      <td style={{ textAlign: 'right' }}>
                        {p.status === 'DRAFT' ? <input type="number" className="edit-input" value={p.allowance} onChange={e => handleUpdatePayslip(p.id, 'allowance', e.target.value)} /> : formatCurrency(p.allowance)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {p.status === 'DRAFT' ? <input type="number" className="edit-input" value={p.overtimePay} onChange={e => handleUpdatePayslip(p.id, 'overtimePay', e.target.value)} /> : formatCurrency(p.overtimePay)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--warning)' }}>
                        {p.status === 'DRAFT' ? <input type="number" className="edit-input" value={p.insurance} onChange={e => handleUpdatePayslip(p.id, 'insurance', e.target.value)} /> : formatCurrency(p.insurance)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {p.status === 'DRAFT' ? <input type="number" className="edit-input" value={p.deduction} onChange={e => handleUpdatePayslip(p.id, 'deduction', e.target.value)} /> : formatCurrency(p.deduction)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatCurrency(p.advance)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>{formatCurrency(p.netPay)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge" style={{ 
                          background: p.status === 'PAID' ? 'rgba(16,185,129,0.2)' : p.status === 'ACCOUNTED' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.1)',
                          color: p.status === 'PAID' ? 'var(--success)' : p.status === 'ACCOUNTED' ? 'var(--info)' : 'var(--text-secondary)'
                        }}>
                          {p.status === 'DRAFT' ? 'Bản Nháp' : p.status === 'ACCOUNTED' ? 'Đã Hạch Toán' : 'Đã Thanh Toán'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payslips.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center' }}>Chưa có dữ liệu bảng lương. Hãy chấm công trước.</td></tr>}
                </tbody>
              </table>
            )}

            {viewMode === 'PAYROLL' && payrollSummary.length > 0 && (
              <div style={{ marginTop: '48px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                  TỔNG HỢP LƯƠNG TOÀN CÔNG TY (Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]})
                </h3>
                <table className="table" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Họ Tên</th>
                      <th>Chức vụ</th>
                      <th>Dự án tham gia</th>
                      <th>Tổng Công</th>
                      <th style={{ textAlign: 'right' }}>Lương Cơ bản</th>
                      <th style={{ textAlign: 'right' }}>Tổng Phụ cấp</th>
                      <th style={{ textAlign: 'right' }}>Tổng Thưởng/Làm thêm</th>
                      <th style={{ textAlign: 'right', color: 'var(--warning)' }}>Tổng Bảo hiểm</th>
                      <th style={{ textAlign: 'right' }}>Tổng Phạt</th>
                      <th style={{ textAlign: 'right', color: 'var(--danger)' }}>Tổng Tạm ứng</th>
                      <th style={{ textAlign: 'right', color: 'var(--success)' }}>Tổng Thực lĩnh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollSummary.map(p => (
                      <tr key={p.personnel.id}>
                        <td style={{ fontWeight: 500 }}>{p.personnel.name}</td>
                        <td><span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>{p.personnel.role}</span></td>
                        <td style={{ color: 'var(--info)' }}>{p.projects.join(', ')}</td>
                        <td>{p.standardDays}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(p.baseSalary)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(p.allowance)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(p.bonus + p.overtimePay)}</td>
                        <td style={{ textAlign: 'right', color: 'var(--warning)' }}>{formatCurrency(p.insurance)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(p.deduction)}</td>
                        <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatCurrency(p.advance)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>{formatCurrency(p.netPay)}</td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
                      <td colSpan={3} style={{ textAlign: 'center' }}>TỔNG CỘNG TOÀN CÔNG TY</td>
                      <td>{payrollSummary.reduce((s, p) => s + p.standardDays, 0)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(payrollSummary.reduce((s, p) => s + p.baseSalary, 0))}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(payrollSummary.reduce((s, p) => s + p.allowance, 0))}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(payrollSummary.reduce((s, p) => s + p.bonus + p.overtimePay, 0))}</td>
                      <td style={{ textAlign: 'right', color: 'var(--warning)' }}>{formatCurrency(payrollSummary.reduce((s, p) => s + p.insurance, 0))}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(payrollSummary.reduce((s, p) => s + p.deduction, 0))}</td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatCurrency(payrollSummary.reduce((s, p) => s + p.advance, 0))}</td>
                      <td style={{ textAlign: 'right', color: 'var(--success)' }}>{formatCurrency(payrollSummary.reduce((s, p) => s + p.netPay, 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden Print Container */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <AttendancePrint 
          ref={printRef} 
          payslips={payslips} 
          selectedMonth={selectedMonth} 
        />
      </div>
    </div>
  );
}
