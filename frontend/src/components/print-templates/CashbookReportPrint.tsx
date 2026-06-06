import React, { forwardRef } from 'react';

interface Props {
  transactions: any[];
  startDate?: string;
  endDate?: string;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val || 0);

export const CashbookReportPrint = forwardRef<HTMLDivElement, Props>(({ transactions, startDate, endDate }, ref) => {
  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
  const companyTaxId = settings?.companyTaxId || '';
  const companyAddress = settings?.companyAddress || '';
  const companyPhone = settings?.companyPhone || '';

  const dateStr = (startDate && endDate) ? `Từ ${new Date(startDate).toLocaleDateString('vi-VN')} đến ${new Date(endDate).toLocaleDateString('vi-VN')}` : 'Tất cả thời gian';

  // Calculate running balance
  let currentBalance = 0;
  const sortedTrans = [...transactions].sort((a,b) => a.id - b.id);
  const rows = sortedTrans.map(t => {
    const income = t.type === 'INCOME' ? t.amount : 0;
    const expense = t.type === 'EXPENSE' ? t.amount : 0;
    currentBalance += (income - expense);
    return { ...t, income, expense, balance: currentBalance };
  });

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
          <b>Mẫu số S07-DNN</b><br/>
          (Ban hành theo Thông tư số 133/2016/TT-BTC)
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '30px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '20pt', marginBottom: '5px' }}>SỔ QUỸ TIỀN MẶT / SỔ CÁI</div>
        <div style={{ fontStyle: 'italic', fontSize: '11pt' }}>{dateStr}</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11pt' }}>
        <thead>
          <tr>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Ngày CT</th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Số CT</th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Diễn giải</th>
            <th colSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Số tiền (VNĐ)</th>
            <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Tồn quỹ</th>
          </tr>
          <tr>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Thu</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Chi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{new Date(r.date).toLocaleDateString('vi-VN')}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>PT/PC-{r.id}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{r.note || `Thanh toán ${r.category}`}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{r.income > 0 ? formatCurrency(r.income) : ''}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{r.expense > 0 ? formatCurrency(r.expense) : ''}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(r.balance)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '8px' }}>Chưa có giao dịch.</td></tr>
          )}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', textAlign: 'center', fontSize: '11pt' }}>
        <div>
          <div style={{ fontWeight: 'bold' }}>Người lập biểu</div>
          <div style={{ fontStyle: 'italic', fontSize: '0.9em' }}>(Ký, họ tên)</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold' }}>Thủ quỹ</div>
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
