import React, { useEffect, useState, useRef } from 'react';
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Printer, Presentation, List, PieChart as PieChartIcon } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PnLPrint } from '../components/print-templates/PnLPrint';
import { PnLPresentationPrint } from '../components/print-templates/PnLPresentationPrint';
import { ProjectPnLPrint } from '../components/print-templates/ProjectPnLPrint';
import { CashflowPrint } from '../components/print-templates/CashflowPrint';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

export default function PnLReport() {
  const [data, setData] = useState<{ projects: any[], overhead: any, cashflowWarning?: { totalCash: number, totalTaxPayable: number } }>({ projects: [], overhead: { total: 0, details: [] } });
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taxRate, setTaxRate] = useState(20);
  const [viewMode, setViewMode] = useState<'dashboard' | 'standard'>('dashboard');
  
  // Drill-down Modal State
  const [drillDown, setDrillDown] = useState<{ title: string, items: any[] } | null>(null);

  // Single Project Print State
  const [selectedPrintProject, setSelectedPrintProject] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);
      
      const res = await fetch(`http://localhost:3000/reports/pnl?${query.toString()}`);
      setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val || 0);

  const printFullRef = useRef<HTMLDivElement>(null);
  const handlePrintFull = useReactToPrint({
    contentRef: printFullRef,
    documentTitle: 'Bao_Cao_PnL_Chi_Tiet'
  });

  const printSlideRef = useRef<HTMLDivElement>(null);
  const handlePrintSlide = useReactToPrint({
    contentRef: printSlideRef,
    documentTitle: 'Bao_Cao_PnL_Trinh_Chieu'
  });

  const printProjectRef = useRef<HTMLDivElement>(null);
  const handlePrintProjectAction = useReactToPrint({
    contentRef: printProjectRef,
    documentTitle: selectedPrintProject ? `PnL_Du_An_${selectedPrintProject.project.name}` : 'PnL_Du_An'
  });

  const printCashflowRef = useRef<HTMLDivElement>(null);
  const handlePrintCashflow = useReactToPrint({
    contentRef: printCashflowRef,
    documentTitle: 'Bao_Cao_Dong_Tien_Va_Thue'
  });

  const handlePrintProject = (p: any) => {
    setSelectedPrintProject(p);
    setTimeout(() => {
      handlePrintProjectAction();
    }, 100);
  };

  // Derived Overall Data
  const projects = data.projects || [];
  const overallRevenue = projects.reduce((sum, r) => sum + r.revenue, 0);
  const overallCOGS = projects.reduce((sum, r) => sum + r.costs.total, 0);
  const overallGrossProfit = overallRevenue - overallCOGS;
  const overheadCosts = data.overhead?.total || 0;
  const ebt = overallGrossProfit - overheadCosts; // EBT = Earnings Before Tax
  const taxAmount = (ebt > 0) ? (ebt * taxRate / 100) : 0;
  const netIncome = ebt - taxAmount;
  
  const overallProfitMargin = overallRevenue > 0 ? (netIncome / overallRevenue) * 100 : 0;

  // Chart Data
  const barChartData = projects.map(p => ({
    name: p.project.name,
    DoanhThu: p.revenue,
    ChiPhi: p.costs.total,
    LoiNhuan: p.grossProfit
  }));

  const pieChartData = [
    { name: 'Chi phí Vật tư', value: projects.reduce((sum, r) => sum + r.costs.material, 0) },
    { name: 'Chi phí Nhân công', value: projects.reduce((sum, r) => sum + r.costs.labor, 0) },
    { name: 'Chi phí Máy TC', value: projects.reduce((sum, r) => sum + r.costs.asset, 0) },
    { name: 'Chi phí Khác', value: projects.reduce((sum, r) => sum + r.costs.other, 0) }
  ].filter(i => i.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const handleDrillDown = (title: string, items: any[]) => {
    setDrillDown({ title, items });
  };

  return (
    <div>
      <style>{`
        .toggle-group { display: flex; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 4px; }
        .toggle-btn { padding: 8px 16px; border-radius: 6px; border: none; background: transparent; color: var(--text-secondary); cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 8px; }
        .toggle-btn.active { background: rgba(255,255,255,0.1); color: white; }
        .clickable-cost { cursor: pointer; transition: background 0.2s; padding: 4px; border-radius: 4px; }
        .clickable-cost:hover { background: rgba(255,255,255,0.1); }
        .progress-bar-bg { background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px; }
        .progress-bar-fill { height: 100%; transition: width 0.3s; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Báo cáo Lãi / Lỗ (P&L)</h2>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="toggle-group">
            <button className={`toggle-btn ${viewMode === 'dashboard' ? 'active' : ''}`} onClick={() => setViewMode('dashboard')}>
              <PieChartIcon size={16} /> Biểu đồ & Dự án
            </button>
            <button className={`toggle-btn ${viewMode === 'standard' ? 'active' : ''}`} onClick={() => setViewMode('standard')}>
              <List size={16} /> P&L Chuẩn Kế toán
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.875rem' }}>Thuế TNDN (%):</span>
            <input type="number" className="form-input" style={{ width: '60px', padding: '4px 8px' }} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} />
          </div>

          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handlePrintFull}>
            <Printer size={16} /> Bản PDF Đầy đủ
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handlePrintSlide}>
            <Presentation size={16} /> Bản Slide (Infographic)
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Từ ngày:</span>
          <input type="date" className="form-input" style={{ padding: '6px 12px' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Đến ngày:</span>
          <input type="date" className="form-input" style={{ padding: '6px 12px' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={fetchData}>
          <BarChart2 size={18} /> Cập nhật Dữ liệu
        </button>
      </div>

      {loading ? <div className="loader"></div> : (
        <>
          {viewMode === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* KPIs */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--info)' }}>
                  <span className="text-muted">Doanh thu thuần</span>
                  <span className="stat-value" style={{ color: 'var(--info)' }}>{formatCurrency(overallRevenue)}</span>
                </div>
                <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--danger)' }}>
                  <span className="text-muted">Tổng Chi phí (Thi công + QLDN)</span>
                  <span className="stat-value" style={{ color: 'var(--danger)' }}>{formatCurrency(overallCOGS + overheadCosts)}</span>
                </div>
                <div className="stat-card glass-panel" style={{ borderTop: `4px solid ${netIncome >= 0 ? 'var(--success)' : 'var(--danger)'}` }}>
                  <span className="text-muted">Lợi nhuận thuần (Net Income)</span>
                  <span className="stat-value" style={{ color: netIncome >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {netIncome > 0 ? '+' : ''}{formatCurrency(netIncome)}
                  </span>
                </div>
                <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--accent)' }}>
                  <span className="text-muted">Tỷ suất Lợi nhuận Thuần</span>
                  <span className="stat-value" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {overallProfitMargin >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />} {overallProfitMargin.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* CASHFLOW WARNING */}
              {data.cashflowWarning && (
                <div style={{ background: data.cashflowWarning.totalTaxPayable > data.cashflowWarning.totalCash ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${data.cashflowWarning.totalTaxPayable > data.cashflowWarning.totalCash ? 'var(--danger)' : 'var(--success)'}`, padding: '24px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: data.cashflowWarning.totalTaxPayable > data.cashflowWarning.totalCash ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={24} /> Báo cáo Dòng tiền Ảo (Thuế phải nộp vs Quỹ tiền mặt)
                    </h3>
                    <button className="btn btn-primary" onClick={handlePrintCashflow}>
                      <Printer size={18} /> In Báo cáo Đối chiếu
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                    <div>
                      <span className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Tổng số dư Tiền mặt + Ngân hàng</span>
                      <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{formatCurrency(data.cashflowWarning.totalCash)}</strong>
                    </div>
                    <div>
                      <span className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Tổng thuế GTGT/TNDN phải nộp</span>
                      <strong style={{ fontSize: '1.5rem', color: 'var(--danger)' }}>{formatCurrency(data.cashflowWarning.totalTaxPayable)}</strong>
                    </div>
                    <div>
                      <span className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Trạng thái Dòng tiền</span>
                      {data.cashflowWarning.totalTaxPayable > data.cashflowWarning.totalCash ? (
                        <span style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          ⚠️ NGUY HIỂM: Thiếu hụt {formatCurrency(data.cashflowWarning.totalTaxPayable - data.cashflowWarning.totalCash)} để nộp thuế! Doanh nghiệp đang có nguy cơ rỗng két dù có lãi trên giấy.
                        </span>
                      ) : (
                        <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          ✅ AN TOÀN: Đủ quỹ tiền để nộp thuế theo quy định.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CHARTS */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Doanh thu vs Chi phí theo Dự án</h3>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" tickFormatter={(value) => (value / 1000000) + 'Tr'} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} formatter={(value: number) => formatCurrency(value) + ' VNĐ'} />
                        <Legend />
                        <Bar dataKey="DoanhThu" fill="var(--info)" name="Doanh thu" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="ChiPhi" fill="var(--danger)" name="Chi phí (Giá vốn)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Cơ cấu Giá vốn Thi công</h3>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none' }} formatter={(value: number) => formatCurrency(value) + ' VNĐ'} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* PROJECT CARDS */}
              <h3 style={{ margin: '8px 0', fontSize: '1.25rem', color: 'var(--accent-primary)' }}>Phân tích Chi tiết từng Dự án (Drill-down)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                {projects.map(p => {
                  const budgetProgress = p.project.totalBudget > 0 ? (p.costs.total / p.project.totalBudget) * 100 : 0;
                  const isOverBudget = budgetProgress > 100;
                  
                  return (
                    <div key={p.project.id} className="glass-panel" style={{ padding: '24px', borderTop: isOverBudget ? '4px solid var(--danger)' : '4px solid var(--success)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{p.project.name}</h4>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: p.grossProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            Lãi gộp: {formatCurrency(p.grossProfit)}
                          </span>
                          <button className="btn btn-sm btn-primary" onClick={() => handlePrintProject(p)}>
                            <Printer size={14} /> In Báo cáo Dự án
                          </button>
                        </div>
                      </div>

                      {/* Budget Progress */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                          <span className="text-muted">Ngân sách: {formatCurrency(p.project.totalBudget)}</span>
                          <span style={{ color: isOverBudget ? 'var(--danger)' : 'var(--text-secondary)' }}>{budgetProgress.toFixed(1)}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${Math.min(budgetProgress, 100)}%`, background: isOverBudget ? 'var(--danger)' : 'var(--success)' }}></div>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="clickable-cost" onClick={() => handleDrillDown(`Vật tư - ${p.project.name}`, p.details.materials)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Vật tư (621):</span>
                            <span>{formatCurrency(p.costs.material)}</span>
                          </div>
                        </div>
                        <div className="clickable-cost" onClick={() => handleDrillDown(`Nhân công - ${p.project.name}`, p.details.labor)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Nhân công (622):</span>
                            <span>{formatCurrency(p.costs.labor)}</span>
                          </div>
                        </div>
                        <div className="clickable-cost" onClick={() => handleDrillDown(`Máy TC - ${p.project.name}`, p.details.asset)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Máy thi công (627):</span>
                            <span>{formatCurrency(p.costs.asset)}</span>
                          </div>
                        </div>
                        <div className="clickable-cost" onClick={() => handleDrillDown(`Chi phí Khác - ${p.project.name}`, p.details.other)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Chi phí Khác:</span>
                            <span>{formatCurrency(p.costs.other)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'standard' && (
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent)' }}>BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH (P&L)</h2>
                <div className="text-muted" style={{ marginTop: '8px' }}>
                  (Dành cho Quản trị Nội bộ)
                </div>
              </div>

              <table className="table" style={{ fontSize: '1.1rem' }}>
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>Mã số</th>
                    <th style={{ width: '60%' }}>Chỉ tiêu</th>
                    <th style={{ textAlign: 'right', width: '30%' }}>Số tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <td style={{ color: 'var(--text-secondary)' }}>01</td>
                    <td style={{ fontWeight: 'bold' }}>1. Doanh thu bán hàng và cung cấp dịch vụ</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--info)' }}>{formatCurrency(overallRevenue)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>11</td>
                    <td style={{ fontWeight: 'bold' }}>2. Giá vốn hàng bán (Chi phí trực tiếp thi công)</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--danger)' }}>({formatCurrency(overallCOGS)})</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td style={{ paddingLeft: '32px', color: 'var(--text-secondary)' }}>- Chi phí Nguyên vật liệu trực tiếp (621)</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>({formatCurrency(projects.reduce((s,p) => s + p.costs.material, 0))})</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td style={{ paddingLeft: '32px', color: 'var(--text-secondary)' }}>- Chi phí Nhân công trực tiếp (622)</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>({formatCurrency(projects.reduce((s,p) => s + p.costs.labor, 0))})</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td style={{ paddingLeft: '32px', color: 'var(--text-secondary)' }}>- Chi phí Sản xuất chung & Máy TC (627)</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>({formatCurrency(projects.reduce((s,p) => s + p.costs.asset + p.costs.other, 0))})</td>
                  </tr>
                  <tr style={{ background: 'rgba(16,185,129,0.05)' }}>
                    <td style={{ color: 'var(--text-secondary)' }}>20</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>3. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ (01 - 11)</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>{formatCurrency(overallGrossProfit)}</td>
                  </tr>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <td style={{ color: 'var(--text-secondary)' }}>25</td>
                    <td style={{ fontWeight: 'bold' }}>4. Chi phí Quản lý doanh nghiệp (Overhead/Khác)</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--danger)' }}>
                      <span className="clickable-cost" onClick={() => handleDrillDown(`Chi phí QLDN`, data.overhead.details)}>
                        ({formatCurrency(overheadCosts)})
                      </span>
                    </td>
                  </tr>
                  <tr style={{ background: 'rgba(245,158,11,0.05)' }}>
                    <td style={{ color: 'var(--text-secondary)' }}>50</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--warning)' }}>5. Tổng Lợi nhuận kế toán trước thuế (20 - 25)</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--warning)' }}>{formatCurrency(ebt)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>51</td>
                    <td style={{ fontWeight: 'bold' }}>6. Chi phí Thuế TNDN tạm tính ({taxRate}%)</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--danger)' }}>({formatCurrency(taxAmount)})</td>
                  </tr>
                  <tr style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <td style={{ color: 'var(--success)' }}>60</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>7. LỢI NHUẬN SAU THUẾ THU NHẬP DOANH NGHIỆP (50 - 51)</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--success)', fontSize: '1.2rem' }}>{formatCurrency(netIncome)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Drill Down Modal */}
      {drillDown && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <h3 style={{ marginTop: 0 }}>Chi tiết: {drillDown.title}</h3>
            <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Nội dung / Tên</th>
                    {drillDown.items[0]?.quantity && <th style={{ textAlign: 'center' }}>SL</th>}
                    {drillDown.items[0]?.price && <th style={{ textAlign: 'right' }}>Đơn giá</th>}
                    <th style={{ textAlign: 'right' }}>Thành tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  {drillDown.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                      <td>{item.name || item.description || item.category || 'N/A'}</td>
                      {item.quantity && <td style={{ textAlign: 'center' }}>{item.quantity}</td>}
                      {item.price && <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>}
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.total || item.amount)}</td>
                    </tr>
                  ))}
                  {drillDown.items.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center' }}>Không có dữ liệu chi tiết.</td></tr>}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setDrillDown(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Containers */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <PnLPrint ref={printFullRef} data={data} startDate={startDate} endDate={endDate} taxRate={taxRate} />
        <PnLPresentationPrint ref={printSlideRef} data={data} startDate={startDate} endDate={endDate} taxRate={taxRate} />
        {selectedPrintProject && <ProjectPnLPrint ref={printProjectRef} data={selectedPrintProject} startDate={startDate} endDate={endDate} taxRate={taxRate} />}
        <CashflowPrint ref={printCashflowRef} data={data} />
      </div>
    </div>
  );
}
