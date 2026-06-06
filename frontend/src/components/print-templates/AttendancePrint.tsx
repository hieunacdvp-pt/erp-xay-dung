import React, { forwardRef } from 'react';

interface Props {
  payslips: any[];
  selectedMonth: string;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

export const AttendancePrint = forwardRef<HTMLDivElement, Props>(({ payslips, selectedMonth }, ref) => {
  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
  const companyTaxId = settings?.companyTaxId || '';
  const companyAddress = settings?.companyAddress || '';
  const companyPhone = settings?.companyPhone || '';

  const monthParts = selectedMonth.split('-');
  const displayMonth = monthParts.length === 2 ? `Tháng ${monthParts[1]} Năm ${monthParts[0]}` : selectedMonth;

  return (
    <div ref={ref} className="print-page-a4" style={{ padding: '40px', color: '#000', fontFamily: '"Times New Roman", serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div className="print-company-name" style={{ fontWeight: 'bold', fontSize: '14pt' }}>{companyName}</div>
          {companyTaxId && <div>Mã số thuế: {companyTaxId}</div>}
          {companyAddress && <div>Địa chỉ: {companyAddress}</div>}
          {companyPhone && <div>Điện thoại: {companyPhone}</div>}
        </div>
        <div style={{ textAlign: 'right', fontStyle: 'italic' }}>
          <b>Mẫu số 02-LĐTL</b><br/>
          (Ban hành theo Thông tư 133/2016/TT-BTC)
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '30px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '20pt', marginBottom: '5px' }}>BẢNG THANH TOÁN TIỀN LƯƠNG</div>
        <div style={{ fontStyle: 'italic', fontSize: '11pt' }}>{displayMonth}</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11pt' }}>
        <thead>
          <tr>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>STT</th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Họ & Tên</th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Bậc lương<br/>(Đơn giá)</th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Số công</th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Lương<br/>Cơ bản</th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Phụ cấp</th>
            <th colSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Khoản cộng thêm</th>
            <th colSpan={3} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Khoản trừ</th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Thực lĩnh</th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Ký nhận</th>
          </tr>
          <tr>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Làm thêm</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Thưởng</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Bảo hiểm</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Phạt</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Tạm ứng</th>
          </tr>
        </thead>
        <tbody>
          {payslips.map((p, i) => (
            <tr key={p.id}>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{i + 1}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{p.personnel.name}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(p.personnel.salaryPerDay)}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{p.standardDays}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(p.baseSalary)}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{p.allowance ? formatCurrency(p.allowance) : '-'}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{p.overtimePay ? formatCurrency(p.overtimePay) : '-'}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{p.bonus ? formatCurrency(p.bonus) : '-'}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{p.insurance ? formatCurrency(p.insurance) : '-'}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{p.deduction ? formatCurrency(p.deduction) : '-'}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{p.advance ? formatCurrency(p.advance) : '-'}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(p.netPay)}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            </tr>
          ))}
          <tr style={{ fontWeight: 'bold' }}>
            <td colSpan={4} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>TỔNG CỘNG</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(payslips.reduce((s, p) => s + p.baseSalary, 0))}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(payslips.reduce((s, p) => s + p.allowance, 0))}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(payslips.reduce((s, p) => s + p.overtimePay, 0))}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(payslips.reduce((s, p) => s + p.bonus, 0))}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(payslips.reduce((s, p) => s + p.insurance, 0))}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(payslips.reduce((s, p) => s + p.deduction, 0))}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(payslips.reduce((s, p) => s + p.advance, 0))}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(payslips.reduce((s, p) => s + p.netPay, 0))}</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', textAlign: 'center', fontSize: '11pt' }}>
        <div>
          <div style={{ fontWeight: 'bold' }}>Người lập bảng</div>
          <div style={{ fontStyle: 'italic', fontSize: '0.9em' }}>(Ký, họ tên)</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold' }}>Phụ trách nhân sự</div>
          <div style={{ fontStyle: 'italic', fontSize: '0.9em' }}>(Ký, họ tên)</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold' }}>Kế toán trưởng</div>
          <div style={{ fontStyle: 'italic', fontSize: '0.9em' }}>(Ký, họ tên)</div>
        </div>
        <div>
          <div style={{ marginBottom: '4px', fontStyle: 'italic' }}>Ngày .... tháng .... năm 20...</div>
          <div style={{ fontWeight: 'bold' }}>Giám đốc</div>
          <div style={{ fontStyle: 'italic', fontSize: '0.9em' }}>(Ký, họ tên, đóng dấu)</div>
        </div>
      </div>
    </div>
  );
});
