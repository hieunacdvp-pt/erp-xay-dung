import React, { useEffect, useState } from 'react';
import { LayoutDashboard, TrendingUp, TrendingDown, DollarSign, Users, Briefcase } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pnlData, setPnlData] = useState<any[]>([]);
  const [rawProjects, setRawProjects] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Giả sử API trả về số liệu tổng quan, hiện tại chúng ta sẽ call tạm PnL API để lấy data
      const res = await fetch('http://localhost:3000/reports/pnl');
      const rawData = await res.json();
      const data = rawData.projects || [];
      
      const totalRevenue = data.reduce((sum: number, p: any) => sum + p.revenue, 0);
      const totalCost = data.reduce((sum: number, p: any) => sum + p.costs.total, 0);
      const totalProfit = data.reduce((sum: number, p: any) => sum + p.grossProfit, 0);
      
      setStats({
        projectsCount: data.length,
        totalRevenue,
        totalCost,
        totalProfit
      });

      const formattedData = data.map((d: any) => ({
        name: d.project.name.substring(0, 15) + '...',
        DoanhThu: d.revenue,
        ChiPhi: d.costs.total,
        LoiNhuan: d.grossProfit
      }));
      setPnlData(formattedData);
      setRawProjects(data);

    } catch (e) {
      console.error(e);
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + ' Tỷ';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + ' Tr';
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  if (!stats) return <div className="loader" style={{ margin: 'auto', marginTop: '100px' }}></div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <LayoutDashboard /> Tổng quan Dự án & Tài chính
      </h2>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>SỐ LƯỢNG DỰ ÁN</span>
            <Briefcase size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.projectsCount}</div>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>TỔNG DOANH THU</span>
            <DollarSign size={20} color="var(--info)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--info)' }}>{formatCurrency(stats.totalRevenue)}</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>TỔNG CHI PHÍ</span>
            <TrendingDown size={20} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>{formatCurrency(stats.totalCost)}</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>LỢI NHUẬN GỘP</span>
            <TrendingUp size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stats.totalProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatCurrency(stats.totalProfit)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.1rem' }}>Biểu đồ Doanh thu & Chi phí theo Dự án</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={formatCurrency} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'}
                />
                <Legend />
                <Bar dataKey="DoanhThu" name="Doanh Thu" fill="var(--info)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ChiPhi" name="Chi Phí" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.1rem' }}>Biểu đồ Biên Lợi Nhuận</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorLoiNhuan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={formatCurrency} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'}
                />
                <Area type="monotone" dataKey="LoiNhuan" name="Lợi Nhuận" stroke="var(--success)" fillOpacity={1} fill="url(#colorLoiNhuan)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Projects Data Table */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
        <h3 style={{ marginBottom: '24px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={20} /> Chi tiết Tài chính theo Dự án
        </h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tên Dự án</th>
                <th style={{ textAlign: 'right' }}>Doanh Thu (511)</th>
                <th style={{ textAlign: 'right' }}>Đã Thanh Toán (Đợt)</th>
                <th style={{ textAlign: 'right' }}>Tổng Chi Phí</th>
                <th style={{ textAlign: 'right' }}>Lợi Nhuận Gộp</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rawProjects.map((p, idx) => {
                const profitColor = p.grossProfit >= 0 ? 'var(--success)' : 'var(--danger)';
                const paymentStatus = p.totalPaid >= p.revenue && p.revenue > 0 ? 'Hoàn tất' : (p.totalPaid > 0 ? 'Thanh toán một phần' : 'Chưa thanh toán');
                
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{p.project.name}</td>
                    <td style={{ textAlign: 'right', color: 'var(--info)' }}>{formatCurrency(p.revenue)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold' }}>{formatCurrency(p.totalPaid || 0)}</div>
                      {p.payments && p.payments.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Lần cuối: {new Date(p.payments[0].date).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatCurrency(p.costs.total)}</td>
                    <td style={{ textAlign: 'right', color: profitColor, fontWeight: 'bold' }}>
                      {formatCurrency(p.grossProfit)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge" style={{ 
                        background: paymentStatus === 'Hoàn tất' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                        color: paymentStatus === 'Hoàn tất' ? 'var(--success)' : 'var(--warning)'
                      }}>
                        {paymentStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
