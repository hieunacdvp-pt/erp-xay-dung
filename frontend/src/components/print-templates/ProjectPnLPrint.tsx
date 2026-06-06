import React, { forwardRef } from 'react';

interface Props {
  data: any;
  startDate?: string;
  endDate?: string;
  taxRate?: number;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val || 0);

export const ProjectPnLPrint = forwardRef<HTMLDivElement, Props>(({ data, startDate, endDate }, ref) => {
  const project = data;
  if (!project) return <div ref={ref}></div>;

  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG ...';
  const companyAddress = settings?.companyAddress || '.......................................';
  const companyTaxId = settings?.companyTaxId || '';
  const companyPhone = settings?.companyPhone || '';

  const budget = project.project.totalBudget || 0;
  const cost = project.costs.total;
  const progress = budget > 0 ? (cost / budget) * 100 : 0;
  
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
          <h4 style={{ margin: 0, fontSize: '14px' }}>Mẫu số: B02-DN</h4>
          <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic' }}>(Trích lục chi tiết theo Dự án)</p>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: '10px 0', fontSize: '20px', textTransform: 'uppercase' }}>BÁO CÁO KẾT QUẢ KINH DOANH DỰ ÁN</h2>
        <div style={{ fontStyle: 'italic', fontSize: '14px' }}>Dự án: {project.project.name}</div>
        <div style={{ fontStyle: 'italic', fontSize: '13px', marginTop: '4px' }}>
          {startDate && endDate ? `Từ ngày ${new Date(startDate).toLocaleDateString('vi-VN')} đến ${new Date(endDate).toLocaleDateString('vi-VN')}` : `Kỳ báo cáo đến ngày ${new Date().toLocaleDateString('vi-VN')}`}
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #000', background: '#f9f9f9' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><b>Ngân sách phê duyệt:</b> {formatCurrency(budget)} VNĐ</div>
          <div><b>Thực chi hiện tại:</b> {formatCurrency(cost)} VNĐ</div>
          <div><b>Tỷ lệ tiêu hao ngân sách:</b> {progress.toFixed(2)}%</div>
          <div><b>Tình trạng:</b> {progress > 100 ? 'VƯỢT NGÂN SÁCH' : 'TRONG NGÂN SÁCH'}</div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '14px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', width: '60%' }}>Chỉ tiêu</th>
            <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'right', width: '40%' }}>Số tiền (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>1. Doanh thu nghiệm thu</td>
            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(project.revenue)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>2. Giá vốn (Tổng chi phí trực tiếp)</td>
            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>({formatCurrency(project.costs.total)})</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', paddingLeft: '20px' }}>- Chi phí Nguyên vật liệu (621)</td>
            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(project.costs.material)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', paddingLeft: '20px' }}>- Chi phí Nhân công (622)</td>
            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(project.costs.labor)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', paddingLeft: '20px' }}>- Chi phí Máy thi công (627)</td>
            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(project.costs.asset)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', paddingLeft: '20px' }}>- Chi phí Khác</td>
            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(project.costs.other)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>3. Lợi nhuận gộp dự án (1 - 2)</td>
            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(project.grossProfit)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', marginTop: '40px', fontSize: '14px' }}>
        <div>
          <strong style={{ display: 'block', marginBottom: '5px' }}>Người lập biểu</strong>
          <span style={{ fontStyle: 'italic' }}>(Ký, họ tên)</span>
        </div>
        <div>
          <strong style={{ display: 'block', marginBottom: '5px' }}>Kế toán trưởng</strong>
          <span style={{ fontStyle: 'italic' }}>(Ký, họ tên)</span>
        </div>
        <div>
          <strong style={{ display: 'block', marginBottom: '5px' }}>Giám đốc Dự án / Tổng Giám đốc</strong>
          <span style={{ fontStyle: 'italic' }}>(Ký, họ tên, đóng dấu)</span>
        </div>
      </div>
    </div>
  );
});
