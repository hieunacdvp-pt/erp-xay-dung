import React, { forwardRef } from 'react';
import { numberToWordsVN } from '../../utils/numberToWords';

interface Props {
  allocations: any[]; // AssetAllocations list for the month
  month: string; // e.g. "2026-05"
}

export const BangKhauHaoPrint = forwardRef<HTMLDivElement, Props>(({ allocations, month }, ref) => {
  if (!allocations) allocations = [];

  const [y, m] = month.split('-');
  let totalAmount = 0;
  allocations.forEach(a => totalAmount += a.amount);

  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
  const companyTaxId = settings?.companyTaxId || '';
  const companyAddress = settings?.companyAddress || '[Ô trống điền địa chỉ]';
  const companyPhone = settings?.companyPhone || '';

  return (
    <div ref={ref} className="print-page-a4" style={{ margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div className="print-company-name">{companyName}</div>
          {companyTaxId && <div>Mã số thuế: {companyTaxId}</div>}
          <div>Địa chỉ: {companyAddress}</div>
          {companyPhone && <div>Điện thoại: {companyPhone}</div>}
        </div>
        <div style={{ textAlign: 'center' }}>
          <b>Mẫu số 06-TSCĐ</b>
          <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>
            (Ban hành theo Thông tư số 133/2016/TT-BTC<br/>
            ngày 26/8/2016 của Bộ Tài chính)
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="print-title" style={{ marginTop: '20px' }}>BẢNG TÍNH VÀ PHÂN BỔ KHẤU HAO TÀI SẢN CỐ ĐỊNH</div>
      <div className="print-subtitle">Tháng {m} năm {y}</div>
      
      <table className="print-table" style={{ marginTop: '30px' }}>
        <thead>
          <tr>
            <th rowSpan={2}>STT</th>
            <th rowSpan={2}>Tên Tài sản cố định</th>
            <th colSpan={3}>Khấu hao trong tháng</th>
            <th colSpan={2}>Phân bổ cho các đối tượng sử dụng</th>
          </tr>
          <tr>
            <th>Nguyên giá TSCĐ</th>
            <th>Thời gian KH (tháng)</th>
            <th>Mức KH kỳ này</th>
            <th>Mã Dự án/Công trình</th>
            <th>Số tiền phân bổ</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((alloc, index) => (
            <tr key={alloc.id}>
              <td style={{ textAlign: 'center' }}>{index + 1}</td>
              <td>{alloc.asset?.name}</td>
              <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(alloc.asset?.purchasePrice)}</td>
              <td style={{ textAlign: 'center' }}>{alloc.asset?.depreciationMonths}</td>
              <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(alloc.amount)}</td>
              <td>{alloc.project?.name}</td>
              <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(alloc.amount)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 'bold' }}>
            <td colSpan={6} style={{ textAlign: 'center' }}>TỔNG CỘNG</td>
            <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(totalAmount)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '10px', fontStyle: 'italic' }}>
        Tổng số tiền khấu hao phân bổ (viết bằng chữ): {numberToWordsVN(totalAmount)}
      </div>

      <div style={{ textAlign: 'right', marginTop: '20px', fontStyle: 'italic' }}>
        Ngày ...... tháng ...... năm 20......
      </div>

      {/* Signatures */}
      <div className="signatures" style={{ fontSize: '11pt', marginTop: '40px' }}>
        <div className="sig-col">
          <div className="sig-title">Người lập biểu</div>
          <div className="sig-sub">(Ký, họ tên)</div>
        </div>
        <div className="sig-col">
          <div className="sig-title">Phụ trách máy thi công</div>
          <div className="sig-sub">(Ký, họ tên)</div>
        </div>
        <div className="sig-col">
          <div className="sig-title">Kế toán trưởng</div>
          <div className="sig-sub">(Ký, họ tên)</div>
        </div>
        <div className="sig-col">
          <div className="sig-title">Giám đốc</div>
          <div className="sig-sub">(Ký, họ tên, đóng dấu)</div>
        </div>
      </div>
    </div>
  );
});
