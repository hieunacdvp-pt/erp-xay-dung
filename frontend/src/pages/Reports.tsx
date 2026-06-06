import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { CashbookReportPrint } from '../components/print-templates/CashbookReportPrint';
import { InventoryReportPrint } from '../components/print-templates/InventoryReportPrint';
import { Printer } from 'lucide-react';

export default function Reports() {
  const [projects, setProjects] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [personnels, setPersonnels] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [user, setUser] = useState<any>(null);
  const [costings, setCostings] = useState<Record<number, any>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    Promise.all([
      fetch('http://localhost:3000/projects').then(res => res.json()),
      fetch('http://localhost:3000/transactions').then(res => res.json()),
      fetch('http://localhost:3000/inventories').then(res => res.json()),
      fetch('http://localhost:3000/materials').then(res => res.json()),
      fetch('http://localhost:3000/personnel').then(res => res.json()),
      fetch('http://localhost:3000/attendances').then(res => res.json())
    ]).then(async ([projData, transData, invData, matData, perData, attData]) => {
      const p = Array.isArray(projData) ? projData : [];
      setProjects(p);
      setTransactions(Array.isArray(transData) ? transData : []);
      setInventories(Array.isArray(invData) ? invData : []);
      setMaterials(Array.isArray(matData) ? matData : []);
      setPersonnels(Array.isArray(perData) ? perData : []);
      setAttendances(Array.isArray(attData) ? attData : []);

      // Fetch Costings for all projects
      const costingsMap: Record<number, any> = {};
      await Promise.all(p.map(async (pj: any) => {
        try {
          const res = await fetch(`http://localhost:3000/projects/${pj.id}/costing`);
          const data = await res.json();
          if (data && data.projectId) costingsMap[pj.id] = data;
        } catch(e) {}
      }));
      setCostings(costingsMap);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const printCashbookRef = useRef<HTMLDivElement>(null);
  const handlePrintCashbook = useReactToPrint({
    contentRef: printCashbookRef,
    documentTitle: 'So_Quy_Tong_Hop'
  });

  const printInventoryRef = useRef<HTMLDivElement>(null);
  const handlePrintInventory = useReactToPrint({
    contentRef: printInventoryRef,
    documentTitle: 'Bao_Cao_Ton_Kho'
  });

  if (loading) return <div className="loader"></div>;

  // Filter by Project
  const filteredTrans = selectedProjectId === 'all' ? transactions : transactions.filter(t => t.projectId === Number(selectedProjectId));
  const filteredInv = selectedProjectId === 'all' ? inventories : inventories.filter(i => i.projectId === Number(selectedProjectId));
  const filteredAtt = selectedProjectId === 'all' ? attendances : attendances.filter(a => a.projectId === Number(selectedProjectId));

  // --- 1. TÀI CHÍNH (FINANCIAL) ---
  const totalIncome = filteredTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const expenseByCategory: Record<string, number> = {};
  filteredTrans.filter(t => t.type === 'EXPENSE').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
  });
  const maxExpense = Math.max(...Object.values(expenseByCategory), 1); // For chart scaling

  // --- 2. NHÂN SỰ & QUỸ LƯONG ---
  let totalSalary = 0;
  const salaryByPersonnel: Record<number, { name: string, role: string, days: number, salary: number }> = {};
  filteredAtt.forEach(att => {
    if (att.status === 'ABSENT') return;
    const personnel = personnels.find(p => p.id === att.personnelId);
    if (personnel) {
      const multiplier = att.status === 'PRESENT' ? 1 : 0.5;
      const dailyEarned = (personnel.salaryPerDay || 0) * multiplier;
      
      if (!salaryByPersonnel[personnel.id]) {
        salaryByPersonnel[personnel.id] = { name: personnel.name, role: personnel.role, days: 0, salary: 0 };
      }
      salaryByPersonnel[personnel.id].days += multiplier;
      salaryByPersonnel[personnel.id].salary += dailyEarned;
      totalSalary += dailyEarned;
    }
  });

  // --- 3. TỒN KHO (INVENTORY) ---
  let totalInventoryValue = 0;
  const inventoryList = filteredInv.map(inv => {
    const mat = materials.find(m => m.id === inv.materialId);
    const value = inv.quantity * (mat?.price || 0);
    totalInventoryValue += value;
    return {
      name: mat?.name || 'Unknown',
      unit: mat?.unit || '',
      price: mat?.price || 0,
      quantity: inv.quantity,
      value
    };
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);



  const exportToExcelMISA = async () => {
    // @ts-ignore
    const ExcelJS = window.ExcelJS;
    // @ts-ignore
    const saveAs = window.saveAs;

    if (!ExcelJS || !saveAs) {
      alert("Đang tải thư viện xuất Excel, vui lòng thử lại sau vài giây.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const now = new Date();
    const dateString = `Ngày ${String(now.getDate()).padStart(2, '0')} tháng ${String(now.getMonth() + 1).padStart(2, '0')} năm ${now.getFullYear()}`;
    
    // ==========================================
    // SHEET 1: SỔ QUỸ TIỀN MẶT (CHỈ ADMIN/KẾ TOÁN)
    // ==========================================
    if (user?.role === 'ADMIN' || user?.role === 'KETOAN') {
      const sheet1 = workbook.addWorksheet('Sổ Quỹ Tiền Mặt');
      sheet1.columns = [
        { header: 'Ngày CT', key: 'date', width: 15 },
        { header: 'Số CT', key: 'id', width: 12 },
        { header: 'Diễn giải', key: 'note', width: 40 },
        { header: 'Thu (Nợ)', key: 'income', width: 20 },
        { header: 'Chi (Có)', key: 'expense', width: 20 },
        { header: 'Tồn quỹ', key: 'balance', width: 20 }
      ];

      sheet1.mergeCells('A1:F1');
      const titleCompany = sheet1.getCell('A1');
      titleCompany.value = 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
      titleCompany.font = { bold: true, size: 12 };

      sheet1.mergeCells('A2:F2');
      const titleReport = sheet1.getCell('A2');
      titleReport.value = 'SỔ CÁI / SỔ QUỸ TIỀN MẶT';
      titleReport.font = { bold: true, size: 16 };
      titleReport.alignment = { horizontal: 'center' };

      sheet1.mergeCells('A3:F3');
      const titleDate = sheet1.getCell('A3');
      titleDate.value = dateString;
      titleDate.font = { italic: true };
      titleDate.alignment = { horizontal: 'center' };

      sheet1.addRow([]); // Dòng trống 4

      const headerRow1 = sheet1.addRow(['Ngày CT', 'Số CT', 'Diễn giải', 'Thu (VNĐ)', 'Chi (VNĐ)', 'Tồn quỹ']);
      headerRow1.font = { bold: true };
      headerRow1.alignment = { horizontal: 'center' };
      
      let currentBalance = 0;
      const sortedTrans = [...filteredTrans].sort((a,b) => a.id - b.id);
      sortedTrans.forEach(t => {
        const income = t.type === 'INCOME' ? t.amount : 0;
        const expense = t.type === 'EXPENSE' ? t.amount : 0;
        currentBalance += (income - expense);
        
        const row = sheet1.addRow([
          new Date(t.date).toLocaleDateString('vi-VN'),
          `PT/PC-${t.id}`,
          t.note || `Thanh toán ${t.category}`,
          income,
          expense,
          currentBalance
        ]);
        row.getCell(4).numFmt = '#,##0';
        row.getCell(5).numFmt = '#,##0';
        row.getCell(6).numFmt = '#,##0';
      });

      sheet1.addRow([]);
      sheet1.addRow([]);
      const sig1 = sheet1.addRow(['Người lập biểu', '', 'Kế toán trưởng', '', '', 'Giám đốc']);
      sig1.font = { bold: true };
      sig1.alignment = { horizontal: 'center' };
      const sigSub1 = sheet1.addRow(['(Ký, họ tên)', '', '(Ký, họ tên)', '', '', '(Ký, họ tên, đóng dấu)']);
      sigSub1.font = { italic: true };
      sigSub1.alignment = { horizontal: 'center' };
      sheet1.mergeCells(`A${sig1.number}:B${sig1.number}`);
      sheet1.mergeCells(`A${sigSub1.number}:B${sigSub1.number}`);
      sheet1.mergeCells(`C${sig1.number}:D${sig1.number}`);
      sheet1.mergeCells(`C${sigSub1.number}:D${sigSub1.number}`);
      sheet1.mergeCells(`E${sig1.number}:F${sig1.number}`);
      sheet1.mergeCells(`E${sigSub1.number}:F${sigSub1.number}`);
    }

    // ==========================================
    // SHEET 2: BÁO CÁO TỒN KHO (ADMIN/KETOAN/KHO)
    // ==========================================
    if (user?.role === 'ADMIN' || user?.role === 'KETOAN' || user?.role === 'KHO') {
    const sheet2 = workbook.addWorksheet('Báo cáo Tồn Kho');
    sheet2.columns = [
      { header: 'Mã VT', key: 'id', width: 10 },
      { header: 'Tên Vật Tư', key: 'name', width: 30 },
      { header: 'Đơn vị tính', key: 'unit', width: 15 },
      { header: 'Số lượng Tồn', key: 'quantity', width: 15 },
      { header: 'Đơn giá', key: 'price', width: 20 },
      { header: 'Thành tiền', key: 'value', width: 20 }
    ];

    sheet2.mergeCells('A1:F1');
    const titleCompany2 = sheet2.getCell('A1');
    titleCompany2.value = 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
    titleCompany2.font = { bold: true, size: 12 };

    sheet2.mergeCells('A2:F2');
    const titleInv = sheet2.getCell('A2');
    titleInv.value = 'BÁO CÁO NHẬP XUẤT TỒN KHO - VẬT TƯ';
    titleInv.font = { bold: true, size: 16 };
    titleInv.alignment = { horizontal: 'center' };

    sheet2.mergeCells('A3:F3');
    const titleDate2 = sheet2.getCell('A3');
    titleDate2.value = dateString;
    titleDate2.font = { italic: true };
    titleDate2.alignment = { horizontal: 'center' };

    sheet2.addRow([]);

    const hRow2 = sheet2.addRow(['Mã VT', 'Tên Vật Tư', 'ĐVT', 'Số lượng Tồn', 'Đơn giá (VNĐ)', 'Thành tiền (VNĐ)']);
    hRow2.font = { bold: true };
    hRow2.alignment = { horizontal: 'center' };
    
    inventoryList.forEach((inv, idx) => {
      const row = sheet2.addRow([
        `VT-${String(idx + 1).padStart(3,'0')}`, 
        inv.name,
        inv.unit,
        inv.quantity,
        inv.price,
        inv.value
      ]);
      row.getCell(5).numFmt = '#,##0';
      row.getCell(6).numFmt = '#,##0';
    });

      sheet2.addRow([]);
      sheet2.addRow([]);
      const sig2 = sheet2.addRow(['Người lập biểu', '', 'Thủ kho', '', 'Kế toán trưởng', 'Giám đốc']);
      sig2.font = { bold: true };
      sig2.alignment = { horizontal: 'center' };
      const sigSub2 = sheet2.addRow(['(Ký, họ tên)', '', '(Ký, họ tên)', '', '(Ký, họ tên)', '(Ký, họ tên, đóng dấu)']);
      sigSub2.font = { italic: true };
      sigSub2.alignment = { horizontal: 'center' };
      sheet2.mergeCells(`A${sig2.number}:B${sig2.number}`);
      sheet2.mergeCells(`A${sigSub2.number}:B${sigSub2.number}`);
      sheet2.mergeCells(`C${sig2.number}:D${sig2.number}`);
      sheet2.mergeCells(`C${sigSub2.number}:D${sigSub2.number}`);
    }

    // ==========================================
    // SHEET 3: BẢNG LƯƠNG NHÂN SỰ (ADMIN/NHANSU)
    // ==========================================
    if (user?.role === 'ADMIN' || user?.role === 'NHANSU') {
      const sheet3 = workbook.addWorksheet('Bảng Lương Nhân Sự');
      sheet3.columns = [
        { header: 'STT', key: 'id', width: 10 },
        { header: 'Họ và Tên', key: 'name', width: 30 },
        { header: 'Chức vụ', key: 'role', width: 20 },
        { header: 'Số ngày công', key: 'days', width: 15 },
        { header: 'Mức lương/Ngày', key: 'salaryPerDay', width: 20 },
        { header: 'Lương Tạm tính', key: 'salary', width: 20 }
      ];

      sheet3.mergeCells('A1:F1');
      const titleCompany3 = sheet3.getCell('A1');
      titleCompany3.value = 'CÔNG TY TNHH XÂY DỰNG & KIẾN TRÚC ERP';
      titleCompany3.font = { bold: true, size: 12 };

      sheet3.mergeCells('A2:F2');
      const titleHR = sheet3.getCell('A2');
      titleHR.value = 'BẢNG THANH TOÁN TIỀN LƯƠNG';
      titleHR.font = { bold: true, size: 16 };
      titleHR.alignment = { horizontal: 'center' };

      sheet3.mergeCells('A3:F3');
      const titleDate3 = sheet3.getCell('A3');
      titleDate3.value = dateString;
      titleDate3.font = { italic: true };
      titleDate3.alignment = { horizontal: 'center' };

      sheet3.addRow([]);

      const hRow3 = sheet3.addRow(['STT', 'Họ và Tên', 'Chức vụ', 'Số ngày công', 'Mức lương/Ngày', 'Lương Tạm tính']);
      hRow3.font = { bold: true };
      hRow3.alignment = { horizontal: 'center' };
      
      let hrIndex = 1;
      let totalHrSalary = 0;
      Object.values(salaryByPersonnel).forEach(p => {
        const pData = personnels.find(per => per.name === p.name);
        const salPerDay = pData ? pData.salaryPerDay : 0;
        totalHrSalary += p.salary;
        const row = sheet3.addRow([
          hrIndex++, 
          p.name,
          p.role,
          p.days,
          salPerDay,
          p.salary
        ]);
        row.getCell(5).numFmt = '#,##0';
        row.getCell(6).numFmt = '#,##0';
      });

      // Tong cong luong
      const hrTotalRow = sheet3.addRow(['', 'TỔNG CỘNG', '', '', '', totalHrSalary]);
      hrTotalRow.font = { bold: true, color: { argb: 'FFFF0000' } };
      hrTotalRow.getCell(6).numFmt = '#,##0';

      sheet3.addRow([]);
      sheet3.addRow([]);
      const sig3 = sheet3.addRow(['Người lập biểu', '', 'Trưởng phòng Nhân sự', '', 'Kế toán trưởng', 'Giám đốc']);
      sig3.font = { bold: true };
      sig3.alignment = { horizontal: 'center' };
      const sigSub3 = sheet3.addRow(['(Ký, họ tên)', '', '(Ký, họ tên)', '', '(Ký, họ tên)', '(Ký, họ tên, đóng dấu)']);
      sigSub3.font = { italic: true };
      sigSub3.alignment = { horizontal: 'center' };
      sheet3.mergeCells(`A${sig3.number}:B${sig3.number}`);
      sheet3.mergeCells(`A${sigSub3.number}:B${sigSub3.number}`);
      sheet3.mergeCells(`C${sig3.number}:D${sig3.number}`);
      sheet3.mergeCells(`C${sigSub3.number}:D${sigSub3.number}`);
    }

    // Style borders for all sheets
    workbook.worksheets.forEach(sheet => {
      sheet.eachRow((row, rowNumber) => {
        // Chỉ bôi viền cho phần dữ liệu bảng (từ dòng 5 đến trước phần ký tên)
        if (rowNumber > 4 && !row.getCell(1).value?.toString().includes('Người lập biểu') && !row.getCell(1).value?.toString().includes('(Ký, họ tên)')) { 
          if (row.getCell(1).value !== null || row.getCell(2).value !== null) {
            row.eachCell(cell => {
              cell.border = {
                top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
              };
            });
          }
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Bao_Cao_MISA_Enterprise.xlsx');
  };

  return (
    <div>
      <style>{`
        .chart-bar {
          background: var(--accent-gradient);
          height: 24px;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .report-section {
          margin-top: 40px;
        }
        .toggle-group {
          display: flex;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 4px;
        }
        .toggle-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-weight: 500;
        }
        .toggle-btn.active {
          background: rgba(255,255,255,0.1);
          color: white;
        }
      `}</style>

      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontWeight: 500 }}>Bộ lọc dữ liệu:</span>
          <select 
            className="form-select" 
            value={selectedProjectId} 
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ width: '300px' }}
          >
            <option value="all">Tất cả Dự án (Tổng hợp toàn bộ)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="toggle-group">
            <button className={`toggle-btn ${viewMode === 'chart' ? 'active' : ''}`} onClick={() => setViewMode('chart')}>
              Biểu đồ (Chart)
            </button>
            <button className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
              Bảng số (Table)
            </button>
          </div>
          <button className="btn btn-primary" onClick={exportToExcelMISA}>
            Xuất Excel (CSV)
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS (ADMIN/KETOAN) */}
      {(user?.role === 'ADMIN' || user?.role === 'KETOAN') && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--success)' }}>
            <span className="text-muted">Tổng Thu (Giải ngân)</span>
            <span className="stat-value" style={{ color: 'var(--success)' }}>{formatCurrency(totalIncome)}</span>
          </div>
          <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--danger)' }}>
            <span className="text-muted">Tổng Chi phí</span>
            <span className="stat-value" style={{ color: 'var(--danger)' }}>{formatCurrency(totalExpense)}</span>
          </div>
          <div className="stat-card glass-panel" style={{ borderTop: `4px solid ${netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}` }}>
            <span className="text-muted">Lợi nhuận (Chênh lệch)</span>
            <span className="stat-value" style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {netProfit > 0 ? '+' : ''}{formatCurrency(netProfit)}
            </span>
          </div>
          <div className="stat-card glass-panel" style={{ borderTop: '4px solid var(--accent-primary)' }}>
            <span className="text-muted">Giá trị Tồn kho đọng</span>
            <span className="stat-value" style={{ color: 'var(--accent-primary)' }}>{formatCurrency(totalInventoryValue)}</span>
          </div>
        </div>
      )}

      {/* DETAILED REPORTS */}
      <div className="report-section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* CHI PHÍ THEO HẠNG MỤC (ADMIN/KETOAN) */}
          {(user?.role === 'ADMIN' || user?.role === 'KETOAN') && (
            <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--accent-primary)' }}>1. Báo cáo Giá thành & Lãi Lỗ Dự Án (Project P&L)</h3>
              
              <div className="table-container">
                <table className="table" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'rgba(255,255,255,0.05)' }}>Dự án</th>
                      <th style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'right' }}>Doanh thu (Nghiệm thu)</th>
                      <th style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'right' }}>Chi phí Vật tư</th>
                      <th style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'right' }}>Chi phí Máy TC</th>
                      <th style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'right' }}>Chi phí Nhân công</th>
                      <th style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'right' }}>Tổng Chi phí</th>
                      <th style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'right' }}>LÃI / LỖ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.filter(p => selectedProjectId === 'all' || p.id.toString() === selectedProjectId).map(p => {
                      const c = costings[p.id];
                      if (!c) return null;
                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 500 }}>{formatCurrency(c.revenue)}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(c.materialCost)}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(c.machineCost)}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(c.laborCost)}</td>
                          <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 500 }}>{formatCurrency(c.totalCost)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: c.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {formatCurrency(c.profit)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DÒNG TIỀN THEO HẠNG MỤC */}
          {(user?.role === 'ADMIN' || user?.role === 'KETOAN') && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>2. Phân bổ Chi phí & Sổ Quỹ</h3>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }} onClick={handlePrintCashbook}>
                  <Printer size={16} /> In Sổ Quỹ Tổng Hợp
                </button>
              </div>
              
              {viewMode === 'chart' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.entries(expenseByCategory).sort((a,b) => b[1] - a[1]).map(([cat, val]) => (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                        <span>{cat}</span>
                        <span style={{ fontWeight: 500, color: 'var(--danger)' }}>{formatCurrency(val)}</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div className="chart-bar" style={{ width: `${(val / maxExpense) * 100}%`, background: 'linear-gradient(90deg, #ef4444, #dc2626)' }}></div>
                      </div>
                    </div>
                  ))}
                  {Object.keys(expenseByCategory).length === 0 && <p className="text-muted">Chưa có chi phí nào được ghi nhận.</p>}
                </div>
              ) : (
                <table className="table">
                  <thead><tr><th>Hạng mục</th><th style={{ textAlign: 'right' }}>Tổng chi</th></tr></thead>
                  <tbody>
                    {Object.entries(expenseByCategory).sort((a,b) => b[1] - a[1]).map(([cat, val]) => (
                      <tr key={cat}><td>{cat}</td><td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatCurrency(val)}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* QUỸ LƯƠNG NHÂN SỰ (ADMIN/NHANSU) */}
          {(user?.role === 'ADMIN' || user?.role === 'NHANSU') && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--success)' }}>3. Báo cáo Quỹ lương (Tạm tính)</h3>
              <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span className="text-muted" style={{ display: 'block', fontSize: '0.875rem' }}>Dự chi quỹ lương:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(totalSalary)}</span>
              </div>

              {viewMode === 'chart' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.values(salaryByPersonnel).sort((a,b) => b.salary - a.salary).map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 500 }}>{p.name} <span className="text-muted" style={{ fontWeight: 400 }}>({p.role})</span></span>
                          <span style={{ color: 'var(--success)' }}>{formatCurrency(p.salary)}</span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Đã chấm: {p.days} ngày công</div>
                      </div>
                    </div>
                  ))}
                  {Object.keys(salaryByPersonnel).length === 0 && <p className="text-muted">Chưa có dữ liệu chấm công.</p>}
                </div>
              ) : (
                <table className="table">
                  <thead><tr><th>Nhân sự</th><th>Chức vụ</th><th style={{ textAlign: 'center' }}>Ngày công</th><th style={{ textAlign: 'right' }}>Lương tạm tính</th></tr></thead>
                  <tbody>
                    {Object.values(salaryByPersonnel).map((p, i) => (
                      <tr key={i}><td>{p.name}</td><td>{p.role}</td><td style={{ textAlign: 'center' }}>{p.days}</td><td style={{ textAlign: 'right', color: 'var(--success)' }}>{formatCurrency(p.salary)}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* GIÁ TRỊ TỒN KHO CHI TIẾT (ADMIN/KETOAN/KHO) */}
      {(user?.role === 'ADMIN' || user?.role === 'KETOAN' || user?.role === 'KHO') && (
        <div className="report-section glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, color: 'var(--accent-secondary)' }}>4. Báo cáo Tồn kho & Đọng vốn</h3>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }} onClick={handlePrintInventory}>
              <Printer size={16} /> In Sổ Kho Tổng Hợp
            </button>
          </div>
          
          {viewMode === 'chart' ? (
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {inventoryList.sort((a,b) => b.value - a.value).map((inv, i) => (
                <div key={i} style={{ flex: '1 1 calc(33.333% - 24px)', minWidth: '250px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>{inv.name}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="text-muted">Tồn kho:</span>
                    <span style={{ fontWeight: 600 }}>{inv.quantity} {inv.unit}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="text-muted">Đơn giá:</span>
                    <span>{formatCurrency(inv.price)}/{inv.unit}</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '12px 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-muted">Thành tiền:</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{formatCurrency(inv.value)}</span>
                  </div>
                </div>
              ))}
              {inventoryList.length === 0 && <p className="text-muted">Không có tồn kho vật tư nào.</p>}
            </div>
          ) : (
            <table className="table">
              <thead><tr><th>Tên Vật tư</th><th>Đơn vị</th><th style={{ textAlign: 'right' }}>Đơn giá</th><th style={{ textAlign: 'center' }}>Số lượng Tồn</th><th style={{ textAlign: 'right' }}>Thành tiền (Vốn đọng)</th></tr></thead>
              <tbody>
                {inventoryList.sort((a,b) => b.value - a.value).map((inv, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{inv.name}</td>
                    <td>{inv.unit}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(inv.price)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: inv.quantity < 10 ? 'var(--warning)' : 'white' }}>{inv.quantity}</span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--accent-secondary)' }}>{formatCurrency(inv.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Hidden Print Containers */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <CashbookReportPrint ref={printCashbookRef} transactions={filteredTrans} />
        <InventoryReportPrint ref={printInventoryRef} inventoryList={inventoryList} />
      </div>

    </div>
  );
}
