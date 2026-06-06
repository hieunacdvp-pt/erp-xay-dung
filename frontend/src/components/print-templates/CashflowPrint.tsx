import React, { forwardRef } from 'react';

export const CashflowPrint = forwardRef<HTMLDivElement, { data: any }>((props, ref) => {
  const { data } = props;
  
  if (!data || !data.cashflowWarning) return <div ref={ref}></div>;
  const { totalCash, totalTaxPayable } = data.cashflowWarning;
  
  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG ...';
  const companyAddress = settings?.companyAddress || '.......................................';
  const companyTaxId = settings?.companyTaxId || '';
  const companyPhone = settings?.companyPhone || '';

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  
  const dateObj = new Date();

  return (
    <div ref={ref} style={{ padding: '40px', fontFamily: '"Times New Roman", Times, serif', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box' }}>
      <style type="text/css" media="print">
        {`
          @page { size: portrait; margin: 10mm; }
          html, body { height: auto !important; overflow: hidden !important; }
        `}
      </style>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase' }}>{companyName}</h4>
          {companyTaxId && <p style={{ margin: 0, fontSize: '13px' }}>Mã số thuế: {companyTaxId}</p>}
          <p style={{ margin: 0, fontSize: '13px' }}>Địa chỉ: {companyAddress}</p>
          {companyPhone && <p style={{ margin: 0, fontSize: '13px' }}>Điện thoại: {companyPhone}</p>}
        </div>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '14px' }}>Mẫu số: B03-DN</h4>
          <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic' }}>(Ban hành theo TT số 200/2014/TT-BTC)</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: '10px 0', fontSize: '20px', textTransform: 'uppercase' }}>BÁO CÁO ĐỐI CHIẾU DÒNG TIỀN VÀ THUẾ PHẢI NỘP</h2>
        <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic' }}>Ngày {dateObj.getDate()} tháng {dateObj.getMonth() + 1} năm {dateObj.getFullYear()}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '14px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>STT</th>
            <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'left' }}>Chỉ tiêu</th>
            <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>Số tiền (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>1</td>
            <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>I. TỔNG SỐ DƯ QUỸ (Tiền mặt + Ngân hàng)</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(totalCash)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>2</td>
            <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold', color: 'red' }}>II. TỔNG THUẾ PHẢI NỘP NHÀ NƯỚC (GTGT + TNDN)</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold', color: 'red' }}>{formatCurrency(totalTaxPayable)}</td>
          </tr>
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '10px' }}></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>3</td>
            <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>III. KẾT QUẢ ĐỐI CHIẾU DÒNG TIỀN (I - II)</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold', fontStyle: 'italic' }}>
              {formatCurrency(totalCash - totalTaxPayable)}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginBottom: '40px', fontSize: '14px' }}>
        <strong>Kết luận từ hệ thống:</strong><br/>
        {totalTaxPayable > totalCash ? (
           <span>
             Doanh nghiệp đang <b>thiếu hụt {formatCurrency(totalTaxPayable - totalCash)}</b> so với số thuế phải nộp. 
             Đề nghị Giám đốc và Kế toán trưởng có phương án huy động vốn hoặc thu hồi công nợ để đảm bảo nghĩa vụ thuế.
           </span>
        ) : (
           <span>
             Doanh nghiệp <b>đảm bảo đủ năng lực dòng tiền</b> để hoàn thành nghĩa vụ Thuế.
           </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', marginTop: '40px', fontSize: '14px' }}>
        <div>
          <strong style={{ display: 'block', marginBottom: '5px' }}>Kế toán lập biểu</strong>
          <span style={{ fontStyle: 'italic' }}>(Ký, họ tên)</span>
        </div>
        <div>
          <strong style={{ display: 'block', marginBottom: '5px' }}>Kế toán trưởng</strong>
          <span style={{ fontStyle: 'italic' }}>(Ký, họ tên)</span>
        </div>
        <div>
          <strong style={{ display: 'block', marginBottom: '5px' }}>Giám đốc</strong>
          <span style={{ fontStyle: 'italic' }}>(Ký, họ tên, đóng dấu)</span>
        </div>
      </div>
    </div>
  );
});

CashflowPrint.displayName = 'CashflowPrint';
