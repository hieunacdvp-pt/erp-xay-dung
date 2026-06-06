import React, { forwardRef } from 'react';
import { numberToWordsVN } from '../../utils/numberToWords';

interface Props {
  transaction: any;
  printDetails?: {
    name: string;
    company: string;
    address: string;
    phone: string;
  };
}

export const PhieuThuChiPrint = forwardRef<HTMLDivElement, Props>(({ transaction, printDetails }, ref) => {
  if (!transaction) transaction = { id: 0, date: new Date(), type: '' };

  const isPhieuThu = transaction.type === 'INCOME';
  const tenPhieu = isPhieuThu ? 'PHIẾU THU' : 'PHIẾU CHI';
  const mauSo = isPhieuThu ? '01-TT' : '02-TT';
  const nguoiNhanNopTitle = isPhieuThu ? 'Họ và tên người nộp tiền:' : 'Họ và tên người nhận tiền:';
  const lyDoTitle = isPhieuThu ? 'Lý do nộp:' : 'Lý do chi:';

  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
  const companyTaxId = settings?.companyTaxId || '';
  const companyAddress = settings?.companyAddress || '[Ô trống điền địa chỉ]';
  const companyPhone = settings?.companyPhone || '';

  const dateObj = new Date(transaction.date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  const printName = printDetails?.name || (transaction.personnel ? transaction.personnel.name : '...................................................');
  const printCompany = printDetails?.company ? ` - Đơn vị: ${printDetails.company}` : '';
  const printAddress = printDetails?.address ? printDetails.address : (transaction.personnel ? transaction.personnel.role : '...................................................');
  const printPhone = printDetails?.phone ? ` - SĐT: ${printDetails.phone}` : '';

  return (
    <div ref={ref} className="print-page-a5">
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
      <div className="print-meta-right">Số: {transaction.id.toString().padStart(5, '0')}</div>
      <div className="print-meta-right">Nợ: ....................</div>
      <div className="print-meta-right">Có: ....................</div>

      {/* Content */}
      <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
        <div>- {nguoiNhanNopTitle} <b>{printName}</b>{printCompany}</div>
        <div>- Địa chỉ / Bộ phận: {printAddress}{printPhone}</div>
        <div>- {lyDoTitle} {transaction.description}</div>
        <div>- Số tiền: <b>{new Intl.NumberFormat('vi-VN').format(transaction.amount)} VNĐ</b></div>
        <div>- Bằng chữ: <i>{numberToWordsVN(transaction.amount)}</i></div>
        <div>- Kèm theo: .............................................................. chứng từ gốc.</div>
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
          <div className="sig-title">{isPhieuThu ? 'Người nộp tiền' : 'Người nhận tiền'}</div>
          <div className="sig-sub">(Ký, họ tên)</div>
        </div>
        <div className="sig-col">
          <div className="sig-title">Thủ quỹ</div>
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

      <div style={{ marginTop: '60px', fontStyle: 'italic', fontSize: '11pt' }}>
        <div>+ Đã nhận đủ số tiền (viết bằng chữ): ........................................................................................</div>
        <div>+ Tỷ giá ngoại tệ (vàng bạc, đá quý): ..........................................................................................</div>
        <div>+ Số tiền quy đổi: .......................................................................................................................</div>
      </div>
    </div>
  );
});
