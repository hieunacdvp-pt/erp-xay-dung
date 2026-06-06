import React, { forwardRef } from 'react';
import { numberToWordsVN } from '../../utils/numberToWords';

interface Props {
  data: { projects: any[], overhead: any };
  startDate?: string;
  endDate?: string;
  taxRate?: number;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val || 0);

export const PnLPrint = forwardRef<HTMLDivElement, Props>(({ data, startDate, endDate, taxRate = 20 }, ref) => {
  const projects = data?.projects || [];
  const overheadCosts = data?.overhead?.total || 0;

  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
  const companyTaxId = settings?.companyTaxId || '';
  const companyAddress = settings?.companyAddress || '';
  const companyPhone = settings?.companyPhone || '';

  const dateStr = (startDate && endDate) ? `Từ ${new Date(startDate).toLocaleDateString('vi-VN')} đến ${new Date(endDate).toLocaleDateString('vi-VN')}` : 'Kỳ Báo Cáo';

  const overallRevenue = projects.reduce((sum, r) => sum + r.revenue, 0);
  const overallCOGS = projects.reduce((sum, r) => sum + r.costs.total, 0);
  const overallGrossProfit = overallRevenue - overallCOGS;
  const ebt = overallGrossProfit - overheadCosts; 
  const taxAmount = (ebt > 0) ? (ebt * taxRate / 100) : 0;
  const netIncome = ebt - taxAmount;

  return (
    <div ref={ref} className="print-page-a4" style={{ padding: '40px', color: '#000', fontFamily: '"Times New Roman", serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div className="print-company-name" style={{ fontWeight: 'bold', fontSize: '14pt' }}>{companyName}</div>
          {companyTaxId && <div>Mã số thuế: {companyTaxId}</div>}
          {companyAddress && <div>Địa chỉ: {companyAddress}</div>}
          {companyPhone && <div>Điện thoại: {companyPhone}</div>}
        </div>
        <div style={{ textAlign: 'right', fontStyle: 'italic' }}>
          <b>Mẫu số B02-DNN</b><br/>
          (Ban hành theo Thông tư số 133/2016/TT-BTC)
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '30px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '18pt', marginBottom: '5px' }}>BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH</div>
        <div style={{ fontStyle: 'italic', fontSize: '11pt' }}>{dateStr}</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '12pt', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#f0f0f0', width: '70%' }}>CHỈ TIÊU</th>
            <th style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#f0f0f0', width: '10%' }}>Mã số</th>
            <th style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#f0f0f0', width: '20%' }}>Số tiền (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>1. Doanh thu bán hàng và cung cấp dịch vụ</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>01</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(overallRevenue)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>2. Giá vốn hàng bán (Chi phí trực tiếp thi công)</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>11</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>({formatCurrency(overallCOGS)})</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', paddingLeft: '30px', fontStyle: 'italic' }}>- Chi phí NVL trực tiếp (621)</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>({formatCurrency(projects.reduce((s,p) => s + p.costs.material, 0))})</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', paddingLeft: '30px', fontStyle: 'italic' }}>- Chi phí Nhân công trực tiếp (622)</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>({formatCurrency(projects.reduce((s,p) => s + p.costs.labor, 0))})</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', paddingLeft: '30px', fontStyle: 'italic' }}>- Chi phí Sản xuất chung / Máy TC (627)</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>({formatCurrency(projects.reduce((s,p) => s + p.costs.asset + p.costs.other, 0))})</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>3. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ (01 - 11)</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>20</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(overallGrossProfit)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>4. Chi phí Quản lý doanh nghiệp</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>25</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>({formatCurrency(overheadCosts)})</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>5. Tổng Lợi nhuận kế toán trước thuế (20 - 25)</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>50</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(ebt)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>6. Chi phí Thuế TNDN tạm tính ({taxRate}%)</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>51</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>({formatCurrency(taxAmount)})</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>7. LỢI NHUẬN SAU THUẾ THU NHẬP DOANH NGHIỆP (50 - 51)</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>60</td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold', fontSize: '14pt' }}>{formatCurrency(netIncome)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '20px', fontStyle: 'italic', fontSize: '11pt' }}>
        Tổng lợi nhuận sau thuế viết bằng chữ: <b>{netIncome >= 0 ? numberToWordsVN(Math.round(netIncome)) : 'Âm ' + numberToWordsVN(Math.abs(Math.round(netIncome)))}</b>
      </div>

      {/* Signatures */}
      <div className="signatures" style={{ fontSize: '11pt', marginTop: '60px' }}>
        <div className="sig-col">
          <div className="sig-title">Người lập biểu</div>
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
