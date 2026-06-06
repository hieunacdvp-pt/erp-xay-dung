import React, { forwardRef } from 'react';
import { numberToWordsVN } from '../../utils/numberToWords';

interface Props {
  invoice: any; 
}

export const PhieuNghiemThuPrint = forwardRef<HTMLDivElement, Props>(({ invoice }, ref) => {
  if (!invoice) invoice = { id: 0, date: new Date() };

  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
  const companyTaxId = settings?.companyTaxId || '';
  const companyAddress = settings?.companyAddress || '[Ô trống điền địa chỉ]';
  const companyPhone = settings?.companyPhone || '';

  const dateObj = new Date(invoice.date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return (
    <div ref={ref} className="print-page-a4">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div className="print-company-name">{companyName}</div>
          {companyTaxId && <div>Mã số thuế: {companyTaxId}</div>}
          <div>Địa chỉ: {companyAddress}</div>
          {companyPhone && <div>Điện thoại: {companyPhone}</div>}
        </div>
        <div style={{ textAlign: 'center' }}>
          <b>Mẫu Hóa đơn / Biên bản nghiệm thu</b>
        </div>
      </div>

      {/* Title */}
      <div className="print-title" style={{ marginTop: '30px' }}>BIÊN BẢN NGHIỆM THU VÀ BÀN GIAO</div>
      <div className="print-subtitle">Ngày {day} tháng {month} năm {year}</div>
      <div className="print-meta-right">Số: HD-{invoice.id.toString().padStart(4, '0')}</div>

      {/* Content */}
      <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
        <div style={{ fontWeight: 'bold' }}>BÊN A (Chủ đầu tư / Khách hàng): {invoice.customer?.name}</div>
        <div>- Địa chỉ: ..............................................................................................................</div>
        <div>- Người đại diện: ................................................. Chức vụ: ..................................</div>
        
        <div style={{ fontWeight: 'bold', marginTop: '10px' }}>BÊN B (Đơn vị thi công): {companyName}</div>
        <div>- Địa chỉ: {companyAddress}</div>
        <div>- Người đại diện: ................................................. Chức vụ: Giám đốc</div>

        <div style={{ marginTop: '15px' }}>
          Hai bên cùng thống nhất nghiệm thu hạng mục/công trình: <b>{invoice.project?.name}</b>
        </div>
        <div>Nội dung nghiệm thu: {invoice.description}</div>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Nội dung công việc / Hạng mục</th>
            <th>ĐVT</th>
            <th>Khối lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: 'center' }}>1</td>
            <td>{invoice.description}</td>
            <td style={{ textAlign: 'center' }}>Gói</td>
            <td style={{ textAlign: 'center' }}>1</td>
            <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(invoice.amount)}</td>
            <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(invoice.amount)}</td>
          </tr>
          <tr>
            <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>Cộng tiền hạng mục (Trước thuế):</td>
            <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(invoice.amount)}</td>
          </tr>
          <tr>
            <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>Thuế suất GTGT ({invoice.vatRate}%):</td>
            <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(invoice.vatAmount)}</td>
          </tr>
          <tr>
            <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>Tổng cộng tiền thanh toán:</td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(invoice.totalAmount)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '10px', fontStyle: 'italic' }}>
        Số tiền bằng chữ: {numberToWordsVN(invoice.totalAmount)}
      </div>

      <div style={{ marginTop: '20px' }}>
        Biên bản được lập thành 04 bản có giá trị pháp lý như nhau, mỗi bên giữ 02 bản làm cơ sở thanh quyết toán.
      </div>

      {/* Signatures */}
      <div className="signatures" style={{ fontSize: '11pt', marginTop: '40px' }}>
        <div className="sig-col">
          <div className="sig-title">Người lập phiếu</div>
          <div className="sig-sub">(Ký, họ tên)</div>
        </div>
        <div className="sig-col">
          <div className="sig-title">Phụ trách thi công</div>
          <div className="sig-sub">(Ký, họ tên)</div>
        </div>
        <div className="sig-col">
          <div className="sig-title">ĐẠI DIỆN BÊN B (Giám đốc)</div>
          <div className="sig-sub">(Ký, họ tên, đóng dấu)</div>
        </div>
        <div className="sig-col">
          <div className="sig-title">ĐẠI DIỆN BÊN A (CĐT)</div>
          <div className="sig-sub">(Ký, họ tên, đóng dấu)</div>
        </div>
      </div>
    </div>
  );
});
