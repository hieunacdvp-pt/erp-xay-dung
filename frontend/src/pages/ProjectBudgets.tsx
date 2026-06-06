import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Printer, Building2, Package, HardHat, Wrench, Coins, ArrowRight, FolderOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectBudgets() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({ 
    companyName: 'CÔNG TY TNHH XÂY DỰNG MISA', 
    companyTaxId: '0101234567',
    companyAddress: 'Số 1, Đường ABC, Quận XYZ, TP. Hà Nội',
    companyPhone: '024.1234.5678'
  });

  useEffect(() => {
    fetch('http://localhost:3000/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(console.error);

    fetch('http://localhost:3000/system-settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.companyName) {
          setCompanyInfo(data);
        }
      })
      .catch(console.error);
  }, []);

  const loadBudgets = async (projectId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/projects/${projectId}/budgets`);
      const data = await res.json();
      setBudgets(data);
    } catch (error) {
      toast.error('Lỗi khi tải dự toán');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (p: any) => {
    setSelectedProject(p);
    loadBudgets(p.id);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i].split(',');
      const obj: any = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j] ? currentline[j].trim() : null;
      }
      result.push(obj);
    }
    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProject) {
      toast.error('Vui lòng chọn công trình trước khi Upload');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target?.result as string;
        const parsedData = parseCSV(csvText);
        
        const res = await fetch(`http://localhost:3000/projects/${selectedProject.id}/budgets/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ budgets: parsedData })
        });
        
        if (res.ok) {
          toast.success('Import dữ liệu dự toán thành công!');
          loadBudgets(selectedProject.id);
        } else {
          toast.error('Import dữ liệu thất bại, vui lòng kiểm tra lại định dạng file.');
        }
      } catch (error) {
        console.error(error);
        toast.error('Lỗi xử lý file CSV');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const csvContent = "\uFEFFcategory,internalCode,description,unit,quantity,unitPrice,note\nNVL,VT001,Thép xây dựng D10,Kg,5000,16000,Thép Hòa Phát\nNVL,VT002,Xi măng PC40,Bao,1000,75000,Xi măng Bỉm Sơn\nNHAN_CONG,NC001,Công thợ chính,Ngày,500,500000,Đội cai thầu A\nMAY_THI_CONG,MTC01,Ca máy xúc,Ca,20,2000000,Bao gồm cả dầu\nCHUNG,CP001,Lán trại tạm,Gói,1,15000000,Khoán gọn";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_Du_Toan_Cong_Trinh.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const groupedBudgets = budgets.reduce((acc: any, b: any) => {
    if (!acc[b.category]) acc[b.category] = [];
    acc[b.category].push(b);
    return acc;
  }, {});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const totalBudgetCost = budgets.reduce((sum, b) => sum + b.totalValue, 0);

  const getCategoryTheme = (cat: string) => {
    const map: any = {
      'NVL': { title: '1. CHI PHÍ NGUYÊN VẬT LIỆU TRỰC TIẾP (TK 152/154)', icon: <Package size={18} /> },
      'NHAN_CONG': { title: '2. CHI PHÍ NHÂN CÔNG TRỰC TIẾP (TK 334/154)', icon: <HardHat size={18} /> },
      'MAY_THI_CONG': { title: '3. CHI PHÍ MÁY THI CÔNG (TK 214/154)', icon: <Wrench size={18} /> },
      'CHUNG': { title: '4. CHI PHÍ SẢN XUẤT CHUNG (TK 154)', icon: <Coins size={18} /> }
    };
    return map[cat] || { title: cat, icon: <FolderOpen size={18} /> };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* -------------------------------------------
          UI DÀNH CHO MÀN HÌNH (Sẽ bị ẩn khi IN)
          ------------------------------------------- */}
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FolderOpen color="var(--primary)" /> Quản lý Dự toán & Định mức
        </h2>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Left Sidebar: Projects */}
          <div style={{ width: '300px', flexShrink: 0 }}>
            <div className="glass-panel">
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border-glass)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} color="var(--primary)" /> Danh sách Công trình
                </h3>
              </div>
              <div style={{ padding: '12px' }}>
                {projects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>Chưa có dữ liệu</div>
                ) : (
                  projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleProjectSelect(p)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 16px',
                        marginBottom: '8px',
                        borderRadius: '8px',
                        background: selectedProject?.id === p.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        border: selectedProject?.id === p.id ? '1px solid var(--primary)' : '1px solid transparent',
                        color: selectedProject?.id === p.id ? 'var(--primary)' : 'var(--text-primary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      className="hover:bg-slate-800"
                    >
                      <span style={{ fontWeight: selectedProject?.id === p.id ? '600' : '400' }}>{p.name}</span>
                      {selectedProject?.id === p.id && <ArrowRight size={16} />}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Content: Budgets */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!selectedProject ? (
              <div className="glass-panel" style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
                <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Chưa chọn Công trình</h3>
                <p>Vui lòng chọn công trình bên trái để xem dữ liệu dự toán.</p>
              </div>
            ) : (
              <div className="glass-panel">
                {/* Action Bar */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {selectedProject.name}
                    </h2>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mã dự án: #{selectedProject.id}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right', marginRight: '16px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng Ngân Sách</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{formatCurrency(totalBudgetCost)}</div>
                    </div>

                    <button className="btn" style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }} onClick={handleDownloadTemplate}>
                      <Download size={18} /> Tải Mẫu CSV
                    </button>
                    
                    <label className="btn btn-primary" style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isUploading ? 0.7 : 1 }}>
                      <Upload size={18} /> {isUploading ? 'Đang xử lý...' : 'Upload CSV'}
                      <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                    </label>

                    {budgets.length > 0 && (
                      <button className="btn" style={{ background: 'var(--info)', color: 'white' }} onClick={handlePrint}>
                        <Printer size={18} /> In Bảng Dự toán
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Table Data */}
                <div style={{ padding: '24px' }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</div>
                  ) : budgets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                      <FolderOpen size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                      <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Chưa có dự toán cho công trình này.</p>
                      <p style={{ fontSize: '0.9rem' }}>Vui lòng Tải mẫu CSV, điền số liệu và Upload lên hệ thống.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {['NVL', 'NHAN_CONG', 'MAY_THI_CONG', 'CHUNG'].map(category => {
                        if (!groupedBudgets[category]) return null;
                        const theme = getCategoryTheme(category);
                        const catTotal = groupedBudgets[category].reduce((sum: number, b: any) => sum + b.totalValue, 0);
                        
                        return (
                          <div key={category} style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                {theme.icon} {theme.title}
                              </div>
                              <div style={{ fontWeight: 'bold' }}>{formatCurrency(catTotal)}</div>
                            </div>
                            
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                              <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary)' }}>
                                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Mã VT</th>
                                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Tên Hạng Mục / Vật Tư</th>
                                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>ĐVT</th>
                                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Số lượng</th>
                                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Đơn giá</th>
                                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thành tiền</th>
                                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Ghi chú</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupedBudgets[category].map((b: any, idx: number) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 16px' }}>{b.internalCode || '-'}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{b.description}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{b.unit || '-'}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>{b.quantity.toLocaleString()}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(b.unitPrice)}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{formatCurrency(b.totalValue)}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{b.note || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* -------------------------------------------
          UI DÀNH CHO BẢN IN (Legal Document)
          Chỉ hiện khi bấm Ctrl+P hoặc window.print()
          ------------------------------------------- */}
      {selectedProject && budgets.length > 0 && (
        <div className="hidden print:block print-page-a4" style={{ backgroundColor: '#fff', color: '#000', padding: '20px', fontFamily: '"Times New Roman", Times, serif' }}>
          {/* Header Pháp lý */}
          <table style={{ width: '100%', marginBottom: '20px', fontSize: '13pt', border: 'none' }}>
            <tbody>
              <tr>
                <td style={{ width: '45%', textAlign: 'center', verticalAlign: 'top', border: 'none' }}>
                  <strong style={{ fontSize: '12pt', textTransform: 'uppercase' }}>{companyInfo.companyName}</strong><br/>
                  <span style={{ fontSize: '11pt' }}>Địa chỉ: {companyInfo.companyAddress}</span><br/>
                  <span style={{ fontSize: '11pt' }}>MST: {companyInfo.companyTaxId} | SĐT: {companyInfo.companyPhone}</span><br/>
                  <strong style={{ fontSize: '11pt' }}>-------***-------</strong>
                </td>
                <td style={{ width: '55%', textAlign: 'center', verticalAlign: 'top', border: 'none' }}>
                  <strong style={{ fontSize: '12pt' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
                  <strong style={{ fontSize: '12pt', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</strong><br/>
                  <span style={{ fontSize: '11pt', fontStyle: 'italic', display: 'block', marginTop: '10px' }}>
                    ........, ngày ...... tháng ...... năm 20......
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tiêu đề văn bản */}
          <div style={{ textAlign: 'center', margin: '30px 0 20px 0' }}>
            <div style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0 0 15px 0', textTransform: 'uppercase', WebkitTextFillColor: '#000', color: '#000' }}>
              BẢNG DỰ TOÁN CHI TIẾT CÔNG TRÌNH
            </div>
            <table style={{ width: '80%', margin: '0 auto', textAlign: 'left', fontSize: '12pt' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', width: '30%', fontWeight: 'bold' }}>Tên công trình:</td>
                  <td style={{ padding: '4px 0', width: '70%', fontWeight: 'bold', textTransform: 'uppercase' }}>{selectedProject.name}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Hạng mục:</td>
                  <td style={{ padding: '4px 0' }}>Toàn bộ công trình</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Địa điểm xây dựng:</td>
                  <td style={{ padding: '4px 0' }}>{selectedProject.location || '..........................................................'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Chủ đầu tư:</td>
                  <td style={{ padding: '4px 0' }}>..........................................................</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bảng số liệu chuẩn */}
          <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt', marginBottom: '30px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '5%', fontWeight: 'bold' }}>STT</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '8%', fontWeight: 'bold' }}>Mã VT</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '32%', fontWeight: 'bold' }}>Nội dung công việc / Diễn giải</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '5%', fontWeight: 'bold' }}>ĐVT</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '10%', fontWeight: 'bold' }}>Khối lượng</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '15%', fontWeight: 'bold' }}>Đơn giá</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '15%', fontWeight: 'bold' }}>Thành tiền</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '10%', fontWeight: 'bold' }}>Ghi chú</th>
              </tr>
              <tr style={{ fontStyle: 'italic', fontSize: '10pt', backgroundColor: '#f9f9f9' }}>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>(1)</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>(2)</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>(3)</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>(4)</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>(5)</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>(6)</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>(7)=(5)x(6)</td>
                <td style={{ border: '1px solid #000', textAlign: 'center' }}>(8)</td>
              </tr>
            </thead>
            <tbody>
              {['NVL', 'NHAN_CONG', 'MAY_THI_CONG', 'CHUNG'].map((category) => {
                if (!groupedBudgets[category]) return null;
                const theme = getCategoryTheme(category);
                const catTotal = groupedBudgets[category].reduce((sum: number, b: any) => sum + b.totalValue, 0);
                
                return (
                  <React.Fragment key={category}>
                    {/* Header Nhóm */}
                    <tr style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                      <td colSpan={6} style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>
                        {theme.title}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                        {formatCurrency(catTotal)}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                    </tr>
                    
                    {/* Chi tiết từng mục */}
                    {groupedBudgets[category].map((b: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{b.internalCode || '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'left' }}>{b.description}</td>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{b.unit || '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{b.quantity.toLocaleString()}</td>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(b.unitPrice)}</td>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(b.totalValue)}</td>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', fontSize: '10pt' }}>{b.note || '-'}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              {/* Tổng cộng */}
              <tr style={{ fontWeight: 'bold', fontSize: '12pt', backgroundColor: '#f0f0f0' }}>
                <td colSpan={6} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', textTransform: 'uppercase' }}>
                  TỔNG CỘNG DỰ TOÁN (TRƯỚC THUẾ)
                </td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>
                  {formatCurrency(totalBudgetCost)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Chữ ký pháp lý */}
          <table style={{ width: '100%', marginTop: '40px', pageBreakInside: 'avoid', border: 'none' }}>
            <tbody>
              <tr>
                <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'top', border: 'none' }}>
                  <strong style={{ fontSize: '12pt', display: 'block' }}>NGƯỜI LẬP BIỂU</strong>
                  <i style={{ fontSize: '11pt' }}>(Ký, ghi rõ họ tên)</i>
                  <div style={{ height: '120px' }}></div>
                  <div style={{ borderBottom: '1px dotted #000', width: '80%', margin: '0 auto' }}></div>
                </td>
                
                <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'top', border: 'none' }}>
                  <strong style={{ fontSize: '12pt', display: 'block' }}>KẾ TOÁN TRƯỞNG</strong>
                  <i style={{ fontSize: '11pt' }}>(Ký, ghi rõ họ tên)</i>
                  <div style={{ height: '120px' }}></div>
                  <div style={{ borderBottom: '1px dotted #000', width: '80%', margin: '0 auto' }}></div>
                </td>
                
                <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'top', border: 'none' }}>
                  <strong style={{ fontSize: '12pt', display: 'block' }}>GIÁM ĐỐC</strong>
                  <i style={{ fontSize: '11pt' }}>(Ký, đóng dấu, ghi rõ họ tên)</i>
                  <div style={{ height: '120px' }}></div>
                  <div style={{ borderBottom: '1px dotted #000', width: '80%', margin: '0 auto' }}></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Global Style overrides */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        
        @media print {
          /* Force display print block when printing */
          .print-page-a4 {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
