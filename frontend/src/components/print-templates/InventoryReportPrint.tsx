import React, { forwardRef } from 'react';

interface Props {
  inventoryList: any[];
  dateString?: string;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val || 0);

export const InventoryReportPrint = forwardRef<HTMLDivElement, Props>(({ inventoryList, dateString }, ref) => {
  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
  const companyTaxId = settings?.companyTaxId || '';
  const companyAddress = settings?.companyAddress || '';
  const companyPhone = settings?.companyPhone || '';

  const reportDate = dateString || new Date().toLocaleDateString('vi-VN');

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
          <b>Mẫu số S10-DNN</b><br/>
          (Ban hành theo Thông tư số 133/2016/TT-BTC)
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '30px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '20pt', marginBottom: '5px' }}>BÁO CÁO TỔNG HỢP TỒN KHO</div>
        <div style={{ fontStyle: 'italic', fontSize: '11pt' }}>{reportDate}</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11pt' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>STT</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Tên Vật tư</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Đơn vị</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Đơn giá</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Số lượng Tồn</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Thành tiền (Vốn đọng)</th>
          </tr>
        </thead>
        <tbody>
          {inventoryList.map((inv, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{inv.name}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{inv.unit}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(inv.price)}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{inv.quantity}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(inv.value)}</td>
            </tr>
          ))}
          {inventoryList.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '8px' }}>Không có tồn kho vật tư nào.</td></tr>
          )}
          <tr style={{ fontWeight: 'bold' }}>
            <td colSpan={5} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>TỔNG CỘNG</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(inventoryList.reduce((s,i) => s + i.value, 0))}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', textAlign: 'center', fontSize: '11pt' }}>
        <div>
          <div style={{ fontWeight: 'bold' }}>Người lập biểu</div>
          <div style={{ fontStyle: 'italic', fontSize: '0.9em' }}>(Ký, họ tên)</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold' }}>Thủ kho</div>
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
