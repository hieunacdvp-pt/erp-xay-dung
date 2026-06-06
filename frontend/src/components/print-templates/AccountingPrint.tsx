import React, { forwardRef } from 'react';

interface Props {
  viewTab: 'TRIAL_BALANCE' | 'JOURNALS' | 'ACCOUNTS';
  trialBalance: any[];
  journals: any[];
  accounts: any[];
  totalDebit: number;
  totalCredit: number;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export const AccountingPrint = forwardRef<HTMLDivElement, Props>(({ viewTab, trialBalance, journals, accounts, totalDebit, totalCredit }, ref) => {
  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}

  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
  const companyTaxId = settings?.companyTaxId || '';
  const companyAddress = settings?.companyAddress || '';
  const companyPhone = settings?.companyPhone || '';

  if (viewTab === 'TRIAL_BALANCE') {
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
            <b>Mẫu số F01-DNN</b><br/>
            (Ban hành theo Thông tư số 133/2016/TT-BTC<br/>
            ngày 26/8/2016 của Bộ Tài chính)
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '20pt', marginBottom: '5px' }}>BẢNG CÂN ĐỐI TÀI KHOẢN</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11pt' }}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Số hiệu TK</th>
              <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Tên Tài khoản</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Số dư đầu kỳ</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Số phát sinh trong kỳ</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Số dư cuối kỳ</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Nợ</th>
              <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Có</th>
              <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Nợ</th>
              <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Có</th>
              <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Nợ</th>
              <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Có</th>
            </tr>
          </thead>
          <tbody>
            {trialBalance.map(row => (
              <tr key={row.code}>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}><b>{row.code}</b></td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{row.name}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>-</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>-</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{row.debit > 0 ? formatCurrency(row.debit) : '-'}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{row.credit > 0 ? formatCurrency(row.credit) : '-'}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>-</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>-</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 'bold' }}>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>TỔNG CỘNG</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>-</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>-</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(totalDebit)}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(totalCredit)}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>-</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>-</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', textAlign: 'center', fontSize: '11pt' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Người lập biểu</div>
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
  }

  if (viewTab === 'JOURNALS') {
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
            <b>Mẫu số S03a-DNN</b><br/>
            (Ban hành theo Thông tư số 133/2016/TT-BTC<br/>
            ngày 26/8/2016 của Bộ Tài chính)
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '20pt', marginBottom: '5px' }}>SỔ NHẬT KÝ CHUNG</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11pt' }}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Ngày tháng<br/>ghi sổ</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Chứng từ</th>
              <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Diễn giải</th>
              <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>TK Đối ứng</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Số tiền</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Số hiệu</th>
              <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Ngày tháng</th>
              <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Nợ</th>
              <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Có</th>
            </tr>
          </thead>
          <tbody>
            {journals.map(j => {
              return j.lines.map((l: any, idx: number) => (
                <tr key={l.id}>
                  {idx === 0 && <td rowSpan={j.lines.length} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', verticalAlign: 'top' }}>{new Date(j.date).toLocaleDateString('vi-VN')}</td>}
                  <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                  {idx === 0 && <td rowSpan={j.lines.length} style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>{j.description}</td>}
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{l.debit > 0 || l.credit > 0 ? l.accountCode : ''}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{l.debit > 0 ? formatCurrency(l.debit) : ''}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{l.credit > 0 ? formatCurrency(l.credit) : ''}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', textAlign: 'center', fontSize: '11pt' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Người ghi sổ</div>
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
  }

  // viewTab === 'ACCOUNTS'
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
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '20pt', marginBottom: '5px' }}>HỆ THỐNG TÀI KHOẢN KẾ TOÁN</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11pt' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Mã TK</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Tên Tài khoản</th>
            <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f0f0f0' }}>Loại Tài khoản</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(acc => {
            const firstDigit = acc.code.charAt(0);
            let label = '';
            switch(firstDigit) {
              case '1': label = 'Tài sản ngắn hạn (Loại 1)'; break;
              case '2': label = 'Tài sản dài hạn (Loại 2)'; break;
              case '3': label = 'Nợ phải trả (Loại 3)'; break;
              case '4': label = 'Vốn chủ sở hữu (Loại 4)'; break;
              case '5': label = 'Doanh thu thuần (Loại 5)'; break;
              case '6': label = 'Chi phí SXKD (Loại 6)'; break;
              case '7': label = 'Thu nhập khác (Loại 7)'; break;
              case '8': label = 'Chi phí khác (Loại 8)'; break;
              case '9': label = 'Xác định KQKD (Loại 9)'; break;
              case '0': label = 'Tài khoản ngoài bảng (Loại 0)'; break;
              default: label = acc.type;
            }
            return (
            <tr key={acc.code}>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}><b>{acc.code}</b></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{acc.name}</td>
              <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                <div>{acc.type}</div>
                <div style={{ fontStyle: 'italic', fontSize: '0.9em', color: '#555' }}>({label})</div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
