import React, { forwardRef } from 'react';

interface LenhDieuDongPrintProps {
  dispatchData: any;
}

export const LenhDieuDongPrint = forwardRef<HTMLDivElement, LenhDieuDongPrintProps>(({ dispatchData }, ref) => {
  if (!dispatchData) return null;

  const today = new Date();
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '...';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG ERP';
  const companyAddress = settings?.companyAddress || '[Ô trống điền địa chỉ]';
  const companyPhone = settings?.companyPhone || '';

  return (
    <div ref={ref} className="print-page-a4" style={{ margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '10pt' }}>
        <div style={{ width: '45%' }}>
          <div className="print-company-name" style={{ fontSize: '11pt' }}>{companyName}</div>
          <div>Địa chỉ: {companyAddress}</div>
          {companyPhone && <div>Điện thoại: {companyPhone}</div>}
        </div>
        <div style={{ textAlign: 'center', width: '50%' }}>
          <h3 style={{ margin: 0, fontSize: '11pt' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
          <p style={{ margin: 0, fontSize: '11pt', fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <div className="print-title" style={{ margin: 0 }}>LỆNH ĐIỀU ĐỘNG THIẾT BỊ</div>
        <div className="print-subtitle">Ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}</div>
        <div style={{ margin: 0, fontStyle: 'italic', fontSize: '11pt' }}>Số: LĐĐ-{dispatchData.id}/{today.getFullYear()}</div>
      </div>

      <div style={{ marginBottom: '20px', lineHeight: '1.8', fontSize: '12pt' }}>
        <p style={{ margin: 0 }}>
          - Căn cứ vào yêu cầu tiến độ thi công của dự án: <strong>{dispatchData.project?.name}</strong>.
        </p>
        <p style={{ margin: 0 }}>
          - Căn cứ vào kế hoạch sử dụng thiết bị của Công ty.
        </p>
        <p style={{ margin: '20px 0 10px', fontWeight: 'bold' }}>
          GIÁM ĐỐC / TRƯỞNG PHÒNG KẾ HOẠCH YÊU CẦU:
        </p>
        
        <p style={{ margin: '10px 0' }}>
          <strong>Điều 1.</strong> Điều động thiết bị sau đây:
        </p>
        <table className="print-table" style={{ width: '100%', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px' }}>Tên thiết bị</th>
              <th style={{ padding: '8px' }}>Mã / Biển số</th>
              <th style={{ padding: '8px' }}>Loại máy</th>
              <th style={{ padding: '8px' }}>Sở hữu</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', textAlign: 'center' }}>{dispatchData.equipment?.name}</td>
              <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{dispatchData.equipment?.code}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{dispatchData.equipment?.type}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{dispatchData.equipment?.ownership === 'OWNED' ? 'Tự có' : 'Thuê ngoài'}</td>
            </tr>
          </tbody>
        </table>

        <p style={{ margin: '10px 0' }}>
          <strong>Điều 2.</strong> Tới địa điểm thi công: <strong>Dự án {dispatchData.project?.name}</strong>.
        </p>
        <p style={{ margin: '10px 0' }}>
          <strong>Điều 3.</strong> Thời gian điều động:
        </p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '40px', margin: '0 0 20px' }}>
          <li>Từ ngày: <strong>{formatDate(dispatchData.startDate)}</strong></li>
          <li>Đến ngày (dự kiến): <strong>{dispatchData.endDate ? formatDate(dispatchData.endDate) : 'Đến khi hoàn thành hạng mục'}</strong></li>
        </ul>
        <p style={{ margin: '10px 0' }}>
          <strong>Điều 4.</strong> Ghi chú đặc biệt: {dispatchData.notes || 'Không có'}.
        </p>
        <p style={{ margin: '10px 0' }}>
          <strong>Điều 5.</strong> Phòng Vật tư, Phòng Kế hoạch, Ban Chỉ huy công trường và thợ lái máy chịu trách nhiệm thi hành Lệnh này.
        </p>
      </div>

      {/* Signatures */}
      <div className="signatures" style={{ fontSize: '11pt', marginTop: '40px' }}>
        <div className="sig-col">
          <div className="sig-title">Phòng Vật tư/Quản lý Thiết bị</div>
          <div className="sig-sub">(Ký, họ tên)</div>
        </div>
        <div className="sig-col">
          <div className="sig-title">Chỉ huy trưởng</div>
          <div className="sig-sub">(Ký, họ tên)</div>
        </div>
        <div className="sig-col">
          <div className="sig-title">Giám đốc / Trưởng Phòng</div>
          <div className="sig-sub">(Ký, họ tên, đóng dấu)</div>
        </div>
      </div>
    </div>
  );
});
