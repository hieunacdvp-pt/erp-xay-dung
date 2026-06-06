import React, { useState, useEffect } from 'react';

export default function Accounting() {
  const [activeTab, setActiveTab] = useState<'TRIAL_BALANCE' | 'GENERAL_LEDGER' | 'PNL'>('PNL');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [trialBalance, setTrialBalance] = useState<any[]>([]);
  const [pnlData, setPnlData] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  
  // Filters
  const [selectedAccount, setSelectedAccount] = useState('1111');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'TRIAL_BALANCE') {
        const res = await fetch('http://localhost:3000/accounting/trial-balance');
        const data = await res.json();
        setTrialBalance(data);
      } else if (activeTab === 'PNL') {
        const res = await fetch('http://localhost:3000/accounting/pnl');
        const data = await res.json();
        setPnlData(data);
      } else if (activeTab === 'GENERAL_LEDGER') {
        const res = await fetch(`http://localhost:3000/accounting/general-ledger?accountCode=${selectedAccount}`);
        const data = await res.json();
        setLedger(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAccountChange = (e: any) => {
    setSelectedAccount(e.target.value);
    setActiveTab('GENERAL_LEDGER');
  };

  const handleDownloadTaxExcel = () => {
    const d = new Date();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    window.open(`http://localhost:3000/reports/tax-excel?month=${month}&year=${year}`, '_blank');
  };

  useEffect(() => {
    if (activeTab === 'GENERAL_LEDGER') {
      fetchData();
    }
  }, [selectedAccount]);

  return (
    <div className="page-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title">Kế toán Tổng hợp</h1>
        <div className="tabs" style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`btn ${activeTab === 'PNL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('PNL')}
          >
            Báo cáo Lãi/Lỗ
          </button>
          <button 
            className={`btn ${activeTab === 'TRIAL_BALANCE' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('TRIAL_BALANCE')}
          >
            Cân đối phát sinh
          </button>
          <button 
            className={`btn ${activeTab === 'GENERAL_LEDGER' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('GENERAL_LEDGER')}
          >
            Sổ chi tiết
          </button>
          <button 
            className={`btn ${activeTab === 'TAX_REPORT' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('TAX_REPORT' as any)}
          >
            Báo cáo Thuế
          </button>
        </div>
      </div>

      {loading && <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</div>}

      {!loading && activeTab === 'TAX_REPORT' as any && (
        <div className="card fade-in" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'white', marginBottom: '15px' }}>Kết xuất Bảng kê Thuế GTGT Mua vào / Bán ra</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
            Hệ thống sẽ tự động tổng hợp số liệu từ các Hóa đơn Mua vào (Phiếu nhập kho, Chi phí) và Bán ra (Doanh thu) trong tháng hiện tại. File xuất ra có định dạng Excel tương thích với phần mềm HTKK của Tổng cục Thuế.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleDownloadTaxExcel} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', padding: '12px 24px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Xuất File Excel (.xlsx)
            </button>
          </div>
        </div>
      )}

      {!loading && activeTab === 'PNL' && (
        <div className="card fade-in">
          <h3 style={{ color: 'white', marginBottom: '15px' }}>Báo cáo Kết quả Kinh doanh theo Công trình</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Dự án</th>
                  <th>Chủ đầu tư</th>
                  <th style={{ textAlign: 'right' }}>Doanh thu (511)</th>
                  <th style={{ textAlign: 'right' }}>Chi phí NVL (621/154)</th>
                  <th style={{ textAlign: 'right' }}>Chi phí Nhân công (622)</th>
                  <th style={{ textAlign: 'right' }}>Chi phí Máy (623)</th>
                  <th style={{ textAlign: 'right' }}>Chi phí Thầu phụ</th>
                  <th style={{ textAlign: 'right' }}>Chi phí Khác (627)</th>
                  <th style={{ textAlign: 'right' }}>Lợi nhuận Gộp</th>
                </tr>
              </thead>
              <tbody>
                {pnlData.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'white', fontWeight: 'bold' }}>{row.project.name}</td>
                    <td>{row.project.contract?.customer?.name || '-'}</td>
                    <td style={{ textAlign: 'right', color: '#4ade80' }}>
                      {new Intl.NumberFormat('vi-VN').format(row.revenue)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#f87171' }}>
                      {new Intl.NumberFormat('vi-VN').format(row.costMaterial)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#f87171' }}>
                      {new Intl.NumberFormat('vi-VN').format(row.costLabor)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#f87171' }}>
                      {new Intl.NumberFormat('vi-VN').format(row.costEquipment)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#f87171' }}>
                      {new Intl.NumberFormat('vi-VN').format(row.costSubcontractor || 0)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#f87171' }}>
                      {new Intl.NumberFormat('vi-VN').format(row.costGeneral)}
                    </td>
                    <td style={{ textAlign: 'right', color: row.grossProfit >= 0 ? '#4ade80' : '#f87171', fontWeight: 'bold', fontSize: '1.1em' }}>
                      {new Intl.NumberFormat('vi-VN').format(row.grossProfit)}
                    </td>
                  </tr>
                ))}
                {pnlData.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>Chưa có phát sinh Lãi/Lỗ nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && activeTab === 'TRIAL_BALANCE' && (
        <div className="card fade-in">
          <h3 style={{ color: 'white', marginBottom: '15px' }}>Bảng Cân đối Số phát sinh</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã TK</th>
                  <th>Tên Tài khoản</th>
                  <th style={{ textAlign: 'right' }}>Phát sinh Nợ</th>
                  <th style={{ textAlign: 'right' }}>Phát sinh Có</th>
                  <th style={{ textAlign: 'right' }}>Dư Cuối kỳ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {trialBalance.map((acc) => (
                  <tr key={acc.code}>
                    <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{acc.code}</td>
                    <td>{acc.name}</td>
                    <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(acc.debit)}</td>
                    <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(acc.credit)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: acc.finalBalance > 0 ? '#4ade80' : (acc.finalBalance < 0 ? '#f87171' : 'white') }}>
                      {new Intl.NumberFormat('vi-VN').format(acc.finalBalance)}
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedAccount(acc.code);
                          setActiveTab('GENERAL_LEDGER');
                        }}
                      >
                        Sổ chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && activeTab === 'GENERAL_LEDGER' && (
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: 'white' }}>Sổ chi tiết tài khoản: {selectedAccount}</h3>
            <div className="form-group" style={{ width: '250px' }}>
              <select className="form-control" value={selectedAccount} onChange={handleAccountChange}>
                <option value="111">111 - Tiền mặt</option>
                <option value="112">112 - Tiền gửi NH</option>
                <option value="131">131 - Phải thu KH</option>
                <option value="152">152 - Nguyên vật liệu</option>
                <option value="154">154 - CP SXKD dở dang</option>
                <option value="214">214 - Khấu hao TSCĐ</option>
                <option value="331">331 - Phải trả NCC</option>
                <option value="3331">3331 - Thuế GTGT</option>
                <option value="334">334 - Phải trả NLĐ</option>
                <option value="3383">3383 - Bảo hiểm XH</option>
                <option value="511">511 - Doanh thu</option>
                <option value="621">621 - Chi phí NVL</option>
                <option value="622">622 - Chi phí NC</option>
                <option value="623">623 - Chi phí MTC</option>
                <option value="627">627 - Chi phí chung</option>
                <option value="632">632 - Giá vốn hàng bán</option>
                <option value="642">642 - CP Quản lý DV</option>
              </select>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Dự án</th>
                  <th>Diễn giải</th>
                  <th style={{ textAlign: 'right' }}>Nợ</th>
                  <th style={{ textAlign: 'right' }}>Có</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((line) => (
                  <tr key={line.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(line.date).toLocaleDateString('vi-VN')}</td>
                    <td>{line.project ? <span className="badge badge-info">{line.project}</span> : '-'}</td>
                    <td>{line.description}</td>
                    <td style={{ textAlign: 'right', color: line.debit > 0 ? '#4ade80' : 'inherit' }}>
                      {line.debit > 0 ? new Intl.NumberFormat('vi-VN').format(line.debit) : '-'}
                    </td>
                    <td style={{ textAlign: 'right', color: line.credit > 0 ? '#f87171' : 'inherit' }}>
                      {line.credit > 0 ? new Intl.NumberFormat('vi-VN').format(line.credit) : '-'}
                    </td>
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Không có bút toán phát sinh cho tài khoản này</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
