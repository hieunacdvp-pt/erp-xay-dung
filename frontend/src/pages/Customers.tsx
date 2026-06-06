import React, { useEffect, useState, useRef } from 'react';
import { Plus, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { MasterDataPrint } from '../components/print-templates/MasterDataPrint';

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  taxCode: string | null;
  debts: any[];
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  
  // Forms
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  
  const [selectedCustomer, setSelectedCustomer] = useState<number>(0);
  const [salesAmount, setSalesAmount] = useState('');
  const [salesNote, setSalesNote] = useState('');

  // Collect money form
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [bankFee, setBankFee] = useState('0');
  const [accountId, setAccountId] = useState('');

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Danh_Sach_Khach_Hang'
  });

  const fetchCustomers = async () => {
    try {
      const [cusRes, bankRes] = await Promise.all([
        fetch('http://localhost:3000/customers').then(r => r.json()),
        fetch('http://localhost:3000/bank-accounts').then(r => r.json())
      ]);
      setCustomers(cusRes);
      setBankAccounts(bankRes);
      if (bankRes.length > 0) setAccountId(bankRes[0].id.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3000/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address, taxCode }),
      });
      setIsCustomerModalOpen(false);
      setName(''); setPhone(''); setAddress(''); setTaxCode('');
      fetchCustomers();
    } catch (err) {
      alert('Lỗi tạo khách hàng');
    }
  };

  const handleRecordSales = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3000/enterprise/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: Number(selectedCustomer), amount: Number(salesAmount), note: salesNote }),
      });
      setIsSalesModalOpen(false);
      setSalesAmount(''); setSalesNote('');
      fetchCustomers();
      alert('Ghi nhận doanh thu (Nghiệm thu) thành công!');
    } catch (err) {
      alert('Lỗi ghi nhận doanh thu');
    }
  };

  const handleCollectMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDebt) {
      try {
        await fetch(`http://localhost:3000/enterprise/debts/${selectedDebt.id}/pay`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: Number(collectAmount),
            accountId: Number(accountId),
            bankFee: Number(bankFee)
          })
        });
        setIsCollectModalOpen(false);
        setCollectAmount(''); setBankFee('0');
        fetchCustomers();
        alert('Thu tiền thành công!');
      } catch (err) {
        alert('Lỗi khi thu tiền');
      }
    }
  };

  const openCollectModal = (c: Customer) => {
    const activeDebt = c.debts.find(d => d.status !== 'PAID' && d.type === 'RECEIVABLE');
    if (activeDebt) {
      setSelectedDebt(activeDebt);
      setCollectAmount(activeDebt.amount.toString());
      setBankFee('0');
      setIsCollectModalOpen(true);
    } else {
      alert('Khách hàng này không có dư nợ cần thu.');
    }
  };

  const exportInvoiceToExcel = async (customer: Customer) => {
    // @ts-ignore
    const ExcelJS = window.ExcelJS;
    // @ts-ignore
    const saveAs = window.saveAs;

    if (!ExcelJS || !saveAs) {
      alert("Đang tải thư viện xuất Excel, vui lòng thử lại sau vài giây.");
      return;
    }

    const totalDebt = customer.debts.filter(d => d.status !== 'PAID' && d.type === 'RECEIVABLE').reduce((sum, d) => sum + d.amount, 0);
    if (totalDebt <= 0) {
      alert('Khách hàng không có dư nợ cần thanh toán!');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Phieu Yeu Cau Thanh Toan');
    const now = new Date();
    
    // Config Columns
    sheet.columns = [
      { width: 5 }, { width: 30 }, { width: 15 }, { width: 20 }, { width: 20 }
    ];

    sheet.mergeCells('B1:E1');
    sheet.getCell('B1').value = 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
    sheet.getCell('B1').font = { bold: true, size: 12 };

    sheet.mergeCells('B2:E2');
    sheet.getCell('B2').value = 'PHIẾU YÊU CẦU THANH TOÁN';
    sheet.getCell('B2').font = { bold: true, size: 18 };
    sheet.getCell('B2').alignment = { horizontal: 'center' };

    sheet.mergeCells('B3:E3');
    sheet.getCell('B3').value = `Ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
    sheet.getCell('B3').font = { italic: true };
    sheet.getCell('B3').alignment = { horizontal: 'center' };

    sheet.addRow([]);
    sheet.mergeCells('B5:E5');
    sheet.getCell('B5').value = `Kính gửi: ${customer.name}`;
    sheet.getCell('B5').font = { bold: true };
    
    sheet.mergeCells('B6:E6');
    sheet.getCell('B6').value = `Địa chỉ: ${customer.address || '...................................................'}`;
    sheet.mergeCells('B7:E7');
    sheet.getCell('B7').value = `Mã số thuế: ${customer.taxCode || '...................................................'}`;
    
    sheet.addRow([]);
    sheet.mergeCells('B9:E9');
    sheet.getCell('B9').value = 'Chúng tôi xin gửi tới Quý khách hàng chi tiết công nợ cần thanh toán như sau:';
    
    sheet.addRow([]);
    const headerRow = sheet.addRow(['', 'Nội dung nghiệm thu / bán hàng', '', '', 'Thành tiền (VNĐ)']);
    headerRow.font = { bold: true };
    sheet.mergeCells(`B${headerRow.number}:D${headerRow.number}`);
    headerRow.getCell(2).alignment = { horizontal: 'center' };
    headerRow.getCell(5).alignment = { horizontal: 'center' };
    
    const dataRow = sheet.addRow(['', 'Thanh toán đợt nghiệm thu công trình', '', '', totalDebt]);
    sheet.mergeCells(`B${dataRow.number}:D${dataRow.number}`);
    dataRow.getCell(5).numFmt = '#,##0';
    dataRow.getCell(5).alignment = { horizontal: 'right' };
    
    const sumRow = sheet.addRow(['', 'TỔNG CỘNG PHẢI THANH TOÁN', '', '', totalDebt]);
    sumRow.font = { bold: true };
    sheet.mergeCells(`B${sumRow.number}:D${sumRow.number}`);
    sumRow.getCell(5).numFmt = '#,##0';
    sumRow.getCell(5).alignment = { horizontal: 'right' };
    
    // Styling
    [headerRow.number, dataRow.number, sumRow.number].forEach(rIdx => {
      sheet.getRow(rIdx).eachCell(cell => {
        if (cell.col >= 2) {
          cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        }
      });
    });

    sheet.addRow([]);
    sheet.addRow([]);
    
    const sigRow = sheet.addRow(['', 'Người lập phiếu', '', 'Kế toán trưởng', 'Giám đốc']);
    sigRow.font = { bold: true };
    sigRow.alignment = { horizontal: 'center' };
    
    const sigSubRow = sheet.addRow(['', '(Ký, họ tên)', '', '(Ký, họ tên)', '(Ký, họ tên, đóng dấu)']);
    sigSubRow.font = { italic: true };
    sigSubRow.alignment = { horizontal: 'center' };
    
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Yeu_Cau_Thanh_Toan_${customer.name.replace(/\s+/g, '_')}.xlsx`);
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Danh sách Đối tác / Khách hàng</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handlePrint}>
              <Printer size={18} /> In Danh sách
            </button>
            <button className="btn btn-primary" onClick={() => setIsCustomerModalOpen(true)}>
              <Plus size={18} /> Thêm Khách Hàng
            </button>
            <button className="btn" style={{ background: 'var(--accent)', color: 'black' }} onClick={() => setIsSalesModalOpen(true)}>
              Ghi nhận Doanh Thu
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tên Khách Hàng</th>
                <th>Số Điện Thoại</th>
                <th>Mã Số Thuế</th>
                <th>Tổng Phải Thu (Công nợ)</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const totalDebt = c.debts.filter(d => d.status !== 'PAID' && d.type === 'RECEIVABLE').reduce((sum, d) => sum + d.amount, 0);
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500, color: 'white' }}>{c.name}</td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.taxCode || '-'}</td>
                    <td style={{ color: totalDebt > 0 ? 'var(--warning)' : 'inherit', fontWeight: 'bold' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalDebt)}
                    </td>
                    <td>
                      {totalDebt > 0 && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn" style={{ padding: '4px 12px', fontSize: '0.875rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }} onClick={() => openCollectModal(c)}>
                            Thu tiền
                          </button>
                          <button className="btn" style={{ padding: '4px 12px', fontSize: '0.875rem', background: 'rgba(92, 157, 245, 0.2)', color: 'var(--accent)' }} onClick={() => exportInvoiceToExcel(c)}>
                            Xuất Hóa Đơn (YCTT)
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có khách hàng.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCustomerModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm Khách Hàng (Chủ đầu tư)</h2>
            <form onSubmit={handleCreateCustomer} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Tên khách hàng</label>
                <input type="text" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mã số thuế</label>
                  <input type="text" className="form-input" value={taxCode} onChange={(e) => setTaxCode(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ</label>
                <input type="text" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setIsCustomerModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sales Modal */}
      {isSalesModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSalesModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Ghi nhận Doanh Thu (Nghiệm thu)</h2>
            <p className="text-muted" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
              Nghiệp vụ này sẽ làm tăng Doanh Thu và sinh ra một khoản <strong>Công nợ Phải Thu</strong> đối với Khách hàng tương ứng.
            </p>
            <form onSubmit={handleRecordSales}>
              <div className="form-group">
                <label className="form-label">Khách hàng (Chủ đầu tư)</label>
                <select className="form-input" required value={selectedCustomer} onChange={(e) => setSelectedCustomer(Number(e.target.value))}>
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Số tiền nghiệm thu (VNĐ)</label>
                <input type="number" className="form-input" required min="0" value={salesAmount} onChange={(e) => setSalesAmount(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú (Hạng mục nghiệm thu)</label>
                <input type="text" className="form-input" value={salesNote} onChange={(e) => setSalesNote(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setIsSalesModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Xác nhận Nghiệm Thu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Modal */}
      {isCollectModalOpen && selectedDebt && (
        <div className="modal-overlay" onClick={() => setIsCollectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thu Tiền Khách Hàng</h2>
            <p className="text-muted" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
              Dư nợ hiện tại: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedDebt.amount)}</strong>
            </p>
            <form onSubmit={handleCollectMoney}>
              <div className="form-group">
                <label className="form-label">Thu vào Tài khoản / Quỹ</label>
                <select className="form-input" required value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.type === 'CASH' ? 'Tiền mặt' : 'Ngân hàng'})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Số tiền thu được (VNĐ)</label>
                <input type="number" className="form-input" required max={selectedDebt.amount} value={collectAmount} onChange={(e) => setCollectAmount(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phí chuyển khoản (VNĐ) (Bị trừ vào số dư, nếu có)</label>
                <input type="number" className="form-input" required value={bankFee} onChange={(e) => setBankFee(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setIsCollectModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn" style={{ background: 'var(--success)', color: 'white' }}>Xác nhận Thu tiền</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Print Container */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <MasterDataPrint 
          ref={printRef} 
          title="DANH SÁCH ĐỐI TÁC / KHÁCH HÀNG"
          data={customers}
          columns={[
            { header: 'Tên Đối tác', key: 'name' },
            { header: 'Số điện thoại', key: 'phone', align: 'center' },
            { header: 'Địa chỉ', key: 'address' },
            { header: 'Ghi chú', key: 'note' }
          ]}
        />
      </div>
    </div>
  );
}
