import React, { forwardRef } from 'react';
import { numberToWordsVN } from '../../utils/numberToWords';

interface Props {
  movement: any; // InventoryMovement with material & project
  printDetails?: {
    name: string;
    company: string;
    address: string;
    phone: string;
  };
}

export const PhieuNhapXuatPrint = forwardRef<HTMLDivElement, Props>(({ movement, printDetails }, ref) => {
  if (!movement) movement = { id: 0, date: new Date(), type: '' };

  const isPhieuNhap = movement.type === 'IMPORT';
  const tenPhieu = isPhieuNhap ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO';
  const mauSo = isPhieuNhap ? '01-VT' : '02-VT';

  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
  const companyTaxId = settings?.companyTaxId || '';
  const companyAddress = settings?.companyAddress || '[Ô trống điền địa chỉ]';
  const companyPhone = settings?.companyPhone || '';

  const dateObj = new Date(movement.date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  const totalAmount = movement.quantity * movement.price;

  const printName = printDetails?.name || '........................................................................';
  const printCompany = printDetails?.company ? ` - Đơn vị: ${printDetails.company}` : '';
  const printAddress = printDetails?.address || '....................................................................................';
  const printPhone = printDetails?.phone ? ` - SĐT: ${printDetails.phone}` : '';

  return (
    <div ref={ref} className="print-page-a5">
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            .signatures {
              page-break-inside: avoid;
            }
          }
        `}
      </style>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div className="print-company-name">{companyName}</div>
          {companyTaxId && <div>Mã số thuế: {companyTaxId}</div>}
          <div>Địa chỉ: {companyAddress}</div>
          {companyPhone && <div>Điện thoại: {companyPhone}</div>}
        </div>
        <div style={{ textAlign: 'center' }}>
          <b>Mẫu số {mauSo}</b>
          <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>
            (Ban hành theo Thông tư số 133/2016/TT-BTC<br/>
            ngày 26/8/2016 của Bộ Tài chính)
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="print-title">{tenPhieu}</div>
      <div className="print-subtitle">Ngày {day} tháng {month} năm {year}</div>
      <div className="print-meta-right">Số: {movement.id.toString().padStart(5, '0')}</div>
      <div className="print-meta-right">Nợ: ....................</div>
      <div className="print-meta-right">Có: ....................</div>

      {/* Content */}
      <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
        <div>- Họ và tên người {isPhieuNhap ? 'giao' : 'nhận'}: <b>{printName}</b>{printCompany}</div>
        <div>- Địa chỉ (Bộ phận): {printAddress}{printPhone}</div>
        <div>- Lý do {isPhieuNhap ? 'nhập' : 'xuất'} kho: {movement.note || '.............................................................'}</div>
        <div>- {isPhieuNhap ? 'Nhập' : 'Xuất'} tại kho: <b>Công trình {movement.project?.name}</b></div>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th rowSpan={2}>STT</th>
            <th rowSpan={2}>Tên, nhãn hiệu, quy cách, phẩm chất vật tư</th>
            <th rowSpan={2}>Mã số</th>
            <th rowSpan={2}>ĐVT</th>
            <th colSpan={2}>Số lượng</th>
            <th rowSpan={2}>Đơn giá</th>
            <th rowSpan={2}>Thành tiền</th>
          </tr>
          <tr>
            <th>Yêu cầu</th>
            <th>Thực {isPhieuNhap ? 'nhập' : 'xuất'}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: 'center' }}>1</td>
            <td>{movement.material?.name}</td>
            <td style={{ textAlign: 'center' }}>VT{movement.materialId?.toString().padStart(3, '0')}</td>
            <td style={{ textAlign: 'center' }}>{movement.material?.unit}</td>
            <td style={{ textAlign: 'right' }}>{movement.quantity}</td>
            <td style={{ textAlign: 'right' }}>{movement.quantity}</td>
            <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(movement.price)}</td>
            <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(totalAmount)}</td>
          </tr>
          {/* Removed empty rows to save space */}
          <tr style={{ fontWeight: 'bold' }}>
            <td colSpan={4} style={{ textAlign: 'center' }}>Cộng</td>
            <td style={{ textAlign: 'right' }}>x</td>
            <td style={{ textAlign: 'right' }}>{movement.quantity}</td>
            <td style={{ textAlign: 'right' }}>x</td>
            <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(totalAmount)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '10px', fontStyle: 'italic' }}>
        - Tổng số tiền (viết bằng chữ): {numberToWordsVN(totalAmount)}<br/>
        - Số chứng từ gốc kèm theo: ..........................................................................
      </div>

      <div style={{ textAlign: 'right', marginTop: '10px', fontStyle: 'italic' }}>
        Ngày {day} tháng {month} năm {year}
      </div>

      {/* Signatures */}
      <div className="signatures" style={{ fontSize: '11pt' }}>
        <div className="sig-col">
          <div className="sig-title">Người lập phiếu</div>
          <div className="sig-sub">(Ký, họ tên)</div>
        </div>
        <div className="sig-col">
          <div className="sig-title">Người {isPhieuNhap ? 'giao' : 'nhận'} hàng</div>
          <div className="sig-sub">(Ký, họ tên)</div>
        </div>
        <div className="sig-col">
          <div className="sig-title">Thủ kho</div>
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
