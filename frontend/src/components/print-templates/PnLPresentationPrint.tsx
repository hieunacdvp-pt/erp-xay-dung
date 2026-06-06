import React, { forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, ComposedChart, LineChart, Line, Area } from 'recharts';

interface Props {
  data: { projects: any[], overhead: any };
  startDate?: string;
  endDate?: string;
  taxRate?: number;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val || 0);
const formatShort = (val: number) => {
  if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'Tỷ';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'Tr';
  return formatCurrency(val);
};

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

export const PnLPresentationPrint = forwardRef<HTMLDivElement, Props>(({ data, startDate, endDate, taxRate = 20 }, ref) => {
  const projects = data?.projects || [];
  const overheadCosts = data?.overhead?.total || 0;

  let settings: any = {};
  try {
    const raw = localStorage.getItem('systemSettings');
    if (raw) settings = JSON.parse(raw);
  } catch(e) {}
  const companyName = settings?.companyName || 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC';

  const dateStr = (startDate && endDate) ? `Từ ${new Date(startDate).toLocaleDateString('vi-VN')} đến ${new Date(endDate).toLocaleDateString('vi-VN')}` : 'Toàn thời gian';

  // --- I. NỘI DUNG P&L ---
  const overallRevenue = projects.reduce((sum, r) => sum + r.revenue, 0); // 1
  const overallCOGS = projects.reduce((sum, r) => sum + r.costs.total, 0); // 2
  const overallGrossProfit = overallRevenue - overallCOGS; // 3
  const ebt = overallGrossProfit - overheadCosts; // 5
  const taxAmount = (ebt > 0) ? (ebt * taxRate / 100) : 0; // 6
  const netIncome = ebt - taxAmount; // 7

  const grossMargin = overallRevenue > 0 ? (overallGrossProfit / overallRevenue) * 100 : 0;
  const netMargin = overallRevenue > 0 ? (netIncome / overallRevenue) * 100 : 0;

  // --- II. BIỂU ĐỒ TRỰC QUAN ---
  // 1. Cost Structure (Pie Chart)
  const costBreakdown = [
    { name: 'Vật tư (621)', value: projects.reduce((sum, r) => sum + r.costs.material, 0) },
    { name: 'Nhân công (622)', value: projects.reduce((sum, r) => sum + r.costs.labor, 0) },
    { name: 'Máy thi công (627)', value: projects.reduce((sum, r) => sum + r.costs.asset, 0) },
    { name: 'Chi phí DA khác', value: projects.reduce((sum, r) => sum + r.costs.other, 0) }
  ].filter(i => i.value > 0);

  // 2. Bar Chart (Revenue vs Cost by Project)
  const projectChartData = projects.map(p => {
    return {
      name: p.project.name.length > 15 ? p.project.name.substring(0, 15) + '...' : p.project.name,
      DoanhThu: p.revenue,
      ChiPhi: p.costs.total,
      LoiNhuan: p.grossProfit
    };
  }).sort((a, b) => b.DoanhThu - a.DoanhThu);

  // 3. Line Chart (Profit Trend over time)
  // Aggregate all timeline events from project details
  const timeSeriesData: Record<string, { revenue: number, cost: number }> = {};
  
  // Helper to process items into timeline
  const processTimeline = (items: any[], isRevenue: boolean) => {
    if (!Array.isArray(items)) return;
    items.forEach(item => {
      if (item.date) {
        const d = new Date(item.date);
        const monthKey = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
        if (!timeSeriesData[monthKey]) timeSeriesData[monthKey] = { revenue: 0, cost: 0 };
        const amount = item.total || item.amount || (item.quantity && item.price ? item.quantity * item.price : 0);
        if (isRevenue) timeSeriesData[monthKey].revenue += amount;
        else timeSeriesData[monthKey].cost += amount;
      }
    });
  };

  projects.forEach(p => {
    // We don't have direct revenue dates in standard detail object without explicit fetching, 
    // but if we do, we map them. For demonstration of the trend, we map costs which we definitely have in details.
    if (p.details) {
      processTimeline(p.details.materials, false);
      processTimeline(p.details.labor, false);
      processTimeline(p.details.asset, false);
      processTimeline(p.details.other, false);
    }
    // We approximate revenue if explicit dates are missing (just distribute revenue into the latest month of costs)
    if (p.revenue > 0) {
      const d = new Date();
      const monthKey = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
      if (!timeSeriesData[monthKey]) timeSeriesData[monthKey] = { revenue: 0, cost: 0 };
      timeSeriesData[monthKey].revenue += p.revenue;
    }
  });

  // Also include overhead in timeline
  if (data?.overhead?.details) {
    processTimeline(data.overhead.details, false);
  }

  const trendChartData = Object.keys(timeSeriesData).sort((a, b) => {
    // Sort logic for MM/YY
    const [ma, ya] = a.replace('T','').split('/');
    const [mb, yb] = b.replace('T','').split('/');
    if (ya !== yb) return parseInt(ya) - parseInt(yb);
    return parseInt(ma) - parseInt(mb);
  }).map(k => ({
    name: k,
    LoiNhuan: timeSeriesData[k].revenue - timeSeriesData[k].cost,
    DoanhThu: timeSeriesData[k].revenue
  }));

  // Render
  return (
    <div ref={ref} className="print-page-a4 landscape" style={{ 
      padding: '0', 
      fontFamily: '"Segoe UI", Roboto, sans-serif', 
      color: '#0f172a',
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      width: '297mm',
      height: '209mm', // A4 Landscape roughly
      overflow: 'hidden'
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', 
        padding: '20px 30px', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100px'
      }}>
        <div>
          <div style={{ fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '2px', color: '#93c5fd', fontWeight: '600' }}>
            {companyName}
          </div>
          <h1 style={{ margin: '5px 0 0 0', fontSize: '22pt', fontWeight: '800', letterSpacing: '-0.5px' }}>
            BÁO CÁO KẾT QUẢ KINH DOANH QUẢN TRỊ (P&L)
          </h1>
          <div style={{ fontSize: '11pt', color: '#cbd5e1', marginTop: '4px' }}>
            Phân tích chuyên sâu & Trực quan hóa dữ liệu | {dateStr}
          </div>
        </div>
        <div style={{ textAlign: 'right', paddingLeft: '20px' }}>
          <div style={{ fontSize: '28pt', fontWeight: '800', color: netIncome >= 0 ? '#34d399' : '#f87171', lineHeight: '1' }}>
            {netIncome > 0 ? '+' : ''}{formatShort(netIncome)}
          </div>
          <div style={{ fontSize: '10pt', color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase', fontWeight: 600 }}>LỢI NHUẬN THUẦN (NET INCOME)</div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, padding: '20px' }}>
        
        {/* LEFT COLUMN: I. P&L DETAIL & III. BUDGET VARIANCE */}
        <div style={{ width: '35%', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '20px', borderRight: '1px solid #e2e8f0' }}>
          
          {/* I. NỘI DUNG */}
          <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '12pt', color: '#1e3a8a', margin: '0 0 15px 0', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              I. Báo cáo Kết quả (P&L)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '10pt' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>1. Doanh thu thuần</span>
                <span style={{ color: '#2563eb' }}>{formatCurrency(overallRevenue)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>2. Giá vốn (COGS)</span>
                <span style={{ color: '#ef4444' }}>({formatCurrency(overallCOGS)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, padding: '5px 0', borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', background: 'rgba(16, 185, 129, 0.05)' }}>
                <span>3. Lợi nhuận gộp (1 - 2)</span>
                <span style={{ color: '#059669' }}>{formatCurrency(overallGrossProfit)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>4. Chi phí QLDN (Overhead)</span>
                <span style={{ color: '#f59e0b' }}>({formatCurrency(overheadCosts)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px solid #e2e8f0', paddingTop: '5px' }}>
                <span>5. Lợi nhuận trước thuế (EBT)</span>
                <span>{formatCurrency(ebt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>6. Thuế TNDN ({taxRate}%)</span>
                <span style={{ color: '#ef4444' }}>({formatCurrency(taxAmount)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '12pt', marginTop: '5px', color: netIncome >= 0 ? '#15803d' : '#dc2626', background: netIncome >= 0 ? '#f0fdf4' : '#fef2f2', padding: '8px', borderRadius: '4px' }}>
                <span>7. Lợi nhuận thuần</span>
                <span>{formatCurrency(netIncome)}</span>
              </div>
            </div>
          </div>

          {/* III. QUẢN TRỊ NGÂN SÁCH (BUDGET VARIANCE) */}
          <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', flex: 1 }}>
            <h2 style={{ fontSize: '12pt', color: '#1e3a8a', margin: '0 0 15px 0', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              III. Quản trị Ngân sách (Budget Variance)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'hidden' }}>
              {projects.slice(0, 4).map((p, idx) => {
                const budget = p.project.totalBudget || 0;
                const cost = p.costs.total;
                const progress = budget > 0 ? (cost / budget) * 100 : 0;
                const isDanger = progress >= 90;
                
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{p.project.name.length > 20 ? p.project.name.substring(0,20)+'...' : p.project.name}</span>
                      <span style={{ color: isDanger ? '#dc2626' : '#059669', fontWeight: 600 }}>
                        {progress.toFixed(1)}% {isDanger && ' (⚠️)'}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${Math.min(progress, 100)}%`, 
                        background: isDanger ? '#dc2626' : '#10b981' 
                      }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt', color: '#64748b', marginTop: '2px' }}>
                      <span>Thực chi: {formatShort(cost)}</span>
                      <span>Ngân sách: {formatShort(budget)}</span>
                    </div>
                  </div>
                );
              })}
              {projects.length === 0 && <div style={{ fontSize: '9pt', color: '#64748b' }}>Không có dữ liệu dự án.</div>}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: II. TRỰC QUAN HÓA BIỂU ĐỒ */}
        <div style={{ width: '65%', display: 'flex', flexDirection: 'column', gap: '15px', paddingLeft: '20px' }}>
          
          <h2 style={{ fontSize: '12pt', color: '#1e3a8a', margin: '0', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
            II. Trực quan hóa Dữ liệu (Visual Analytics)
          </h2>

          <div style={{ display: 'flex', gap: '15px', height: '220px' }}>
            {/* PIE CHART: COST STRUCTURE */}
            <div style={{ width: '40%', background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '10pt', fontWeight: 600, textAlign: 'center', marginBottom: '5px' }}>Cơ cấu Chi phí Thi công</div>
                <PieChart width={250} height={170}>
                  <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value" isAnimationActive={false}>
                    {costBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend wrapperStyle={{ fontSize: '8px' }} layout="horizontal" verticalAlign="bottom" />
                </PieChart>
            </div>

            {/* LINE CHART: TREND */}
            <div style={{ width: '60%', background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '10pt', fontWeight: 600, textAlign: 'center', marginBottom: '5px' }}>Xu hướng Doanh thu & Lợi nhuận (Theo tháng)</div>
                <ComposedChart width={400} height={170} data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tickFormatter={(val) => formatShort(val)} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend wrapperStyle={{ fontSize: '9px' }} verticalAlign="top" />
                  <Bar dataKey="DoanhThu" name="Doanh Thu" fill="#93c5fd" radius={[2, 2, 0, 0]} barSize={20} isAnimationActive={false} />
                  <Line type="monotone" dataKey="LoiNhuan" name="Lợi nhuận" stroke="#059669" strokeWidth={3} dot={{ r: 3 }} isAnimationActive={false} />
                </ComposedChart>
            </div>
          </div>

          {/* BAR CHART: REVENUE VS COST BY PROJECT */}
          <div style={{ flex: 1, background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '10pt', fontWeight: 600, textAlign: 'center', marginBottom: '10px' }}>So sánh Doanh thu & Chi phí theo Dự án</div>
              <BarChart width={680} height={200} data={projectChartData.slice(0, 8)} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tickFormatter={(val) => formatShort(val)} tick={{ fontSize: 9 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: '9px' }} verticalAlign="top" />
                <Bar dataKey="DoanhThu" name="Doanh thu" fill="#2563eb" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="ChiPhi" name="Chi phí" fill="#ef4444" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div style={{ 
        background: '#1e293b', 
        padding: '10px 30px', 
        color: '#94a3b8', 
        fontSize: '8pt', 
        display: 'flex', 
        justifyContent: 'space-between',
        height: '40px'
      }}>
        <div>BÁO CÁO NỘI BỘ BẢO MẬT (CONFIDENTIAL) | Biểu đồ Recharts Rendering Engine</div>
        <div>Ngày xuất báo cáo: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}</div>
      </div>

    </div>
  );
});
