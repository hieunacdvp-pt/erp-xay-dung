import React, { forwardRef } from 'react';

interface Column {
  header: string;
  key: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (val: any) => string;
}

interface Props {
  title: string;
  data: any[];
  columns: Column[];
}

export const MasterDataPrint = forwardRef<HTMLDivElement, Props>(({ title, data, columns }, ref) => {
  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
  const companyTaxId = settings?.companyTaxId || '';
  const companyAddress = settings?.companyAddress || '';
  const companyPhone = settings?.companyPhone || '';

  const reportDate = new Date().toLocaleDateString('vi-VN');

  return (
    <div ref={ref} className="print-page-a4" style={{ padding: '40px', color: '#000', fontFamily: '"Times New Roman", serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div className="print-company-name" style={{ fontWeight: 'bold', fontSize: '14pt' }}>{companyName}</div>
          {companyTaxId && <div>Mã số thuế: {companyTaxId}</div>}
          {companyAddress && <div>Địa chỉ: {companyAddress}</div>}
          {companyPhone && <div>Điện thoại: {companyPhone}</div>}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '30px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '20pt', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontStyle: 'italic', fontSize: '11pt' }}>Ngày lập biểu: {reportDate}</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11pt' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0', width: '50px' }}>STT</th>
            {columns.map((c, idx) => (
              <th key={idx} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0', width: c.width }}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
              {columns.map((c, colIdx) => {
                const val = row[c.key];
                const displayVal = c.format ? c.format(val) : val;
                return (
                  <td key={colIdx} style={{ border: '1px solid #000', padding: '6px', textAlign: c.align || 'left' }}>
                    {displayVal}
                  </td>
                );
              })}
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '8px' }}>Không có dữ liệu.</td></tr>
          )}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', textAlign: 'center', fontSize: '11pt' }}>
        <div>
          <div style={{ fontWeight: 'bold' }}>Người lập biểu</div>
          <div style={{ fontStyle: 'italic', fontSize: '0.9em' }}>(Ký, họ tên)</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold' }}>Người phụ trách</div>
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
