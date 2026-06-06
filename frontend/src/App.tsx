import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import Personnel from './pages/Personnel';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Assets from './pages/Assets';
import Login from './pages/Login';
import Enterprise from './pages/Enterprise';
import Customers from './pages/Customers';
import BankAccounts from './pages/BankAccounts';
import Accounting from './pages/Accounting';
import Sales from './pages/Sales';
import Procurement from './pages/Procurement';
import PnLReport from './pages/PnLReport';
import Settings from './pages/Settings';
import Contracts from './pages/Contracts';
import SystemLogs from './pages/SystemLogs';
import SiteOperations from './pages/SiteOperations';
import Requisitions from './pages/Requisitions';
import InternalMessages from './pages/InternalMessages';
import WorkerPortal from './pages/WorkerPortal';
import ProjectBudgets from './pages/ProjectBudgets';
import Subcontractors from './pages/Subcontractors';
import Equipment from './pages/Equipment';
import NotificationBell from './components/NotificationBell';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import LicenseLocked from './pages/LicenseLocked';
import './index.css';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Package, 
  Box, 
  Truck, 
  UserSquare2, 
  CalendarCheck, 
  PieChart, 
  LogOut,
  FileBarChart,
  ShoppingCart,
  BarChart2,
  BookOpen,
  Settings as SettingsIcon,
  Building2,
  FileSignature,
  ShieldAlert,
  FileText,
  MessageSquare,
  HardHat,
  Briefcase,
  Wrench
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<{ id: number, username: string, role: string } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logoUrl, setLogoUrl] = useState('');
  const [companyName, setCompanyName] = useState('Construction ERP');
  const [companyTaxId, setCompanyTaxId] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<any>(null);

  useEffect(() => {
    // Cài đặt bẫy đánh chặn lỗi Bản quyền (Global Interceptor)
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 402) {
          setIsLocked(true);
        }
        return Promise.reject(error);
      }
    );

    // Kiểm tra trạng thái License khi mở App
    axios.get('http://localhost:3000/license/status')
      .then(res => {
        setLicenseStatus(res.data);
        if (res.data.isExpired) {
          setIsLocked(true);
        } else if (res.data.shouldWarn) {
          setTimeout(() => {
            toast((t) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span>{res.data.warningMessage}</span>
                <button 
                  onClick={() => {
                    toast.dismiss(t.id);
                    alert("Liên hệ nhà sáng lập phần mềm Nguyễn Anh Hiểu sđt 0917555622 để mua License key");
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#fcd34d', // Màu vàng sáng nổi bật
                    color: '#9a3412', // Chữ nâu cam đậm
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase'
                  }}
                >
                  📞 Liên hệ mua bản quyền
                </button>
              </div>
            ), { 
              id: 'license-warning', 
              duration: 15000, // Tăng thời gian hiển thị lên 15 giây để kịp bấm
              style: { 
                background: '#ea580c', 
                border: '1px solid #f97316', 
                padding: '16px', 
                color: '#ffffff', 
                fontWeight: 'bold',
                maxWidth: '400px'
              }
            });
          }, 2000); 
        }
      })
      .catch(err => {
        if (err.response?.status === 402) {
          setIsLocked(true);
        }
      });

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    // Check login
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    
    // Restore active tab
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
    
    // Load Settings
    fetch('http://localhost:3000/system-settings')
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('systemSettings', JSON.stringify(data));
        if (data.companyLogo) setLogoUrl(data.companyLogo);
        if (data.companyName !== undefined) setCompanyName(data.companyName);
        if (data.companyTaxId) setCompanyTaxId(data.companyTaxId);
        if (data.companyAddress) setCompanyAddress(data.companyAddress);
        if (data.companyPhone) setCompanyPhone(data.companyPhone);
      }).catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('dashboard');
  };

  // RBAC Configuration
  const roleAccess = {
    dashboard: ['ADMIN', 'GIAMDOC'],
    messages: ['ADMIN', 'GIAMDOC', 'CHIHUYTRUONG', 'KYSUTRUONG', 'GIAMSAT', 'KHO', 'KETOAN', 'KETOAN_VIEN', 'THUQUY', 'NHANSU', 'HANHCHINH'],
    
    // Tài chính
    banks: ['ADMIN', 'GIAMDOC', 'KETOAN', 'KETOAN_VIEN', 'THUQUY'],
    transactions: ['ADMIN', 'GIAMDOC', 'KETOAN', 'KETOAN_VIEN', 'THUQUY'],
    customers: ['ADMIN', 'GIAMDOC', 'KETOAN', 'KETOAN_VIEN', 'THUQUY', 'KEHOACH'],

    // Vật tư
    requisitions: ['ADMIN', 'GIAMDOC', 'CHIHUYTRUONG', 'KYSUTRUONG', 'GIAMSAT', 'KYTHUAT', 'KEHOACH', 'KHO', 'HANHCHINH'],
    procurement: ['ADMIN', 'GIAMDOC', 'KETOAN', 'VATTU', 'CHIHUYTRUONG', 'KYSUTRUONG', 'GIAMSAT', 'KYTHUAT', 'KEHOACH', 'KHO'],
    materials: ['ADMIN', 'GIAMDOC', 'VATTU', 'CHIHUYTRUONG', 'KYSUTRUONG', 'GIAMSAT', 'KYTHUAT', 'KHO'],
    inventory: ['ADMIN', 'GIAMDOC', 'CHIHUYTRUONG', 'KYSUTRUONG', 'GIAMSAT', 'KYTHUAT', 'KHO', 'KETOAN_VIEN'], 
    enterprise: ['ADMIN', 'GIAMDOC', 'VATTU', 'CHIHUYTRUONG', 'KYSUTRUONG', 'GIAMSAT', 'KYTHUAT', 'KETOAN_VIEN'],
    subcontractors: ['ADMIN', 'GIAMDOC', 'CHIHUYTRUONG', 'KEHOACH', 'KETOAN'],
    equipment: ['ADMIN', 'GIAMDOC', 'KEHOACH', 'CHIHUYTRUONG', 'KYSUTRUONG', 'KETOAN'],

    // Bán hàng & Tài sản
    contracts: ['ADMIN', 'GIAMDOC', 'KETOAN', 'CHIHUYTRUONG', 'KEHOACH', 'VATTU'], 
    sales: ['ADMIN', 'GIAMDOC', 'KETOAN', 'KETOAN_VIEN'],
    assets: ['ADMIN', 'GIAMDOC', 'KETOAN', 'KETOAN_VIEN'],

    // Nhân sự
    'site-ops': ['ADMIN', 'GIAMDOC', 'CHIHUYTRUONG', 'KYSUTRUONG', 'GIAMSAT', 'KYTHUAT', 'KEHOACH'],
    personnel: ['ADMIN', 'GIAMDOC', 'NHANSU', 'HANHCHINH', 'CHIHUYTRUONG'],
    attendance: ['ADMIN', 'GIAMDOC', 'NHANSU', 'HANHCHINH', 'CHIHUYTRUONG'],

    // Kế toán & Báo cáo
    pnl: ['ADMIN', 'GIAMDOC', 'KETOAN'],
    reports: ['ADMIN', 'GIAMDOC', 'KETOAN'],
    accounting: ['ADMIN', 'GIAMDOC', 'KETOAN'],
    budgets: ['ADMIN', 'GIAMDOC', 'KETOAN', 'CHIHUYTRUONG', 'KEHOACH'],

    // Quản trị
    settings: ['ADMIN'],
    logs: ['ADMIN']
  };

  const hasAccess = (tab: string) => {
    if (!user) return false;
    const allowedRoles = roleAccess[tab as keyof typeof roleAccess] || ['ADMIN'];
    return allowedRoles.includes(user.role);
  };

  const getDefaultTab = (role: string) => {
    if (['ADMIN', 'GIAMDOC'].includes(role)) return 'dashboard';
    if (['NHANSU', 'HANHCHINH'].includes(role)) return 'personnel';
    if (['CHIHUYTRUONG', 'KYSUTRUONG', 'GIAMSAT', 'KYTHUAT'].includes(role)) return 'site-ops';
    if (role === 'KHO') return 'inventory';
    if (role === 'VATTU') return 'procurement';
    if (role === 'KEHOACH') return 'budgets';
    if (['KETOAN', 'KETOAN_VIEN', 'THUQUY'].includes(role)) return 'transactions';
    return 'messages';
  };

  const renderContent = () => {
    if (!hasAccess(activeTab)) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2>Truy cập bị từ chối</h2>
          <p>Bạn không có quyền xem chức năng này.</p>
        </div>
      );
    }

    if (activeTab === 'dashboard') return <Dashboard />;
    if (activeTab === 'materials') return <Materials />;
    if (activeTab === 'inventory') return <Inventory />;
    if (activeTab === 'transactions') return <Transactions />;
    if (activeTab === 'personnel') return <Personnel />;
    if (activeTab === 'attendance') return <Attendance />;
    if (activeTab === 'enterprise') return <Enterprise />;
    if (activeTab === 'subcontractors') return <Subcontractors />;
    if (activeTab === 'assets') return <Assets />;
    if (activeTab === 'reports') return <Reports />;
    if (activeTab === 'customers') return <Customers />;
    if (activeTab === 'banks') return <BankAccounts />;
    if (activeTab === 'accounting') return <Accounting />;
    if (activeTab === 'sales') return <Sales />;
    if (activeTab === 'procurement') return <Procurement />;
    if (activeTab === 'pnl') return <PnLReport />;
    if (activeTab === 'contracts') return <Contracts />;
    if (activeTab === 'equipment') return <Equipment />;
    if (activeTab === 'budgets') return <ProjectBudgets />;
    if (activeTab === 'requisitions') return <Requisitions />;
    if (activeTab === 'messages') return <InternalMessages user={user} />;
    if (activeTab === 'logs') return <SystemLogs />;
    if (activeTab === 'site-ops') return <SiteOperations />;
    if (activeTab === 'settings') return <Settings />;
    return <div>Content Not Found</div>;
  };

  if (!user) {
    return <Login onLoginSuccess={(u) => {
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      const defaultTab = getDefaultTab(u.role);
      setActiveTab(defaultTab);
      localStorage.setItem('activeTab', defaultTab);
    }} />;
  }

  // Intercept setActiveTab to also save to localStorage
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };

  if (isLocked) {
    return <LicenseLocked status={licenseStatus} onActivated={() => window.location.reload()} />;
  }

  // Worker view
  if (user?.role === 'WORKER') {
    return (
      <>
        <Toaster position="top-center" />
        <WorkerPortal user={user} onLogout={handleLogout} />
      </>
    );
  }

  return (
    <div className="app-container">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo" style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain', background: 'rgba(255,255,255,0.9)', borderRadius: '8px', padding: '8px' }} />
          ) : (
            <div style={{ width: '48px', height: '48px', background: 'var(--accent-gradient)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)' }}>
              <Building2 color="#fff" size={24} />
            </div>
          )}
          {companyName && (
            <span style={{ fontSize: '1.25rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.3 }}>
              {companyName}
            </span>
          )}
          {(companyTaxId || companyPhone) && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {companyTaxId && <div>MST: {companyTaxId}</div>}
              {companyPhone && <div>SĐT: {companyPhone}</div>}
            </div>
          )}
        </div>
        
        <nav className="nav-menu">
          {hasAccess('dashboard') && (
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabChange('dashboard')}>
              <LayoutDashboard size={20} /> Tổng quan
            </button>
          )}

          {hasAccess('messages') && (
            <>
              <div className="nav-header">ĐIỀU HÀNH & GIAO VIỆC</div>
              <button className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => handleTabChange('messages')}>
                <MessageSquare size={20} /> Nhắn tin & Giao việc
              </button>
            </>
          )}
          
          {(hasAccess('banks') || hasAccess('transactions') || hasAccess('customers')) && (
            <>
              <div className="nav-header">DÒNG TIỀN & DOANH THU</div>
              {hasAccess('banks') && (
                <button className={`nav-item ${activeTab === 'banks' ? 'active' : ''}`} onClick={() => handleTabChange('banks')}>
                  <Wallet size={20} /> Ngân hàng & Quỹ
                </button>
              )}
              {hasAccess('transactions') && (
                <button className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => handleTabChange('transactions')}>
                  <Wallet size={20} /> Giao dịch (Sổ Quỹ)
                </button>
              )}
              {hasAccess('customers') && (
                <button className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => handleTabChange('customers')}>
                  <Users size={20} /> Khách hàng & Bán ra
                </button>
              )}
            </>
          )}

          {(hasAccess('requisitions') || hasAccess('materials') || hasAccess('inventory') || hasAccess('enterprise') || hasAccess('budgets') || hasAccess('subcontractors') || hasAccess('equipment')) && (
            <>
              <div className="nav-header">KHO BÃI & THI CÔNG</div>
              {hasAccess('equipment') && (
                <button className={`nav-item ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => handleTabChange('equipment')}>
                  <Wrench size={20} /> Máy móc & Điều động
                </button>
              )}
              {hasAccess('budgets') && (
                <button className={`nav-item ${activeTab === 'budgets' ? 'active' : ''}`} onClick={() => handleTabChange('budgets')}>
                  <FileText size={20} /> Quản lý Dự toán
                </button>
              )}
              {hasAccess('requisitions') && (
                <button className={`nav-item ${activeTab === 'requisitions' ? 'active' : ''}`} onClick={() => handleTabChange('requisitions')}>
                  <FileText size={20} /> Phê duyệt Vật tư
                </button>
              )}
              {hasAccess('procurement') && (
                <button className={`nav-item ${activeTab === 'procurement' ? 'active' : ''}`} onClick={() => handleTabChange('procurement')}>
                  <ShoppingCart size={20} /> Mua sắm (Procurement)
                </button>
              )}
              {hasAccess('materials') && (
                <button className={`nav-item ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => handleTabChange('materials')}>
                  <Box size={20} /> Danh mục Vật tư
                </button>
              )}
              {hasAccess('inventory') && (
                <button className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => handleTabChange('inventory')}>
                  <Package size={20} /> Tồn kho
                </button>
              )}
              {hasAccess('enterprise') && (
                <button className={`nav-item ${activeTab === 'enterprise' ? 'active' : ''}`} onClick={() => handleTabChange('enterprise')}>
                  <Truck size={20} /> Đối tác & Nhập/Xuất
                </button>
              )}
              {hasAccess('subcontractors') && (
                <button className={`nav-item ${activeTab === 'subcontractors' ? 'active' : ''}`} onClick={() => handleTabChange('subcontractors')}>
                  <Briefcase size={20} /> Thầu phụ
                </button>
              )}
            </>
          )}

          {(hasAccess('contracts') || hasAccess('sales') || hasAccess('assets')) && (
            <>
              <div className="nav-header">BÁN HÀNG & TÀI SẢN</div>
              {hasAccess('contracts') && (
                <button className={`nav-item ${activeTab === 'contracts' ? 'active' : ''}`} onClick={() => handleTabChange('contracts')}>
                  <FileSignature size={20} /> Quản lý Hợp đồng
                </button>
              )}
              {hasAccess('sales') && (
                <button className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => handleTabChange('sales')}>
                  <ShoppingCart size={20} /> Nghiệm thu & Hóa đơn
                </button>
              )}
              {hasAccess('assets') && (
                <button className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => handleTabChange('assets')}>
                  <Truck size={20} /> Máy thi công & Khấu hao
                </button>
              )}
            </>
          )}

          {(hasAccess('site-ops') || hasAccess('personnel') || hasAccess('attendance')) && (
            <>
              <div className="nav-header">THI CÔNG & NHÂN SỰ</div>
              {hasAccess('site-ops') && (
                <button className={`nav-item ${activeTab === 'site-ops' ? 'active' : ''}`} onClick={() => handleTabChange('site-ops')}>
                  <HardHat size={20} /> Quản lý Thi công
                </button>
              )}
              {hasAccess('personnel') && (
                <button className={`nav-item ${activeTab === 'personnel' ? 'active' : ''}`} onClick={() => handleTabChange('personnel')}>
                  <UserSquare2 size={20} /> Quản lý Nhân sự
                </button>
              )}
              {hasAccess('attendance') && (
                <button className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => handleTabChange('attendance')}>
                  <CalendarCheck size={20} /> Chấm công & Lương
                </button>
              )}
            </>
          )}

          {(hasAccess('accounting') || hasAccess('reports') || hasAccess('pnl') || hasAccess('settings') || hasAccess('logs')) && (
            <>
              <div className="nav-header">KẾ TOÁN & QUẢN TRỊ</div>
              {hasAccess('accounting') && (
                <button className={`nav-item ${activeTab === 'accounting' ? 'active' : ''}`} onClick={() => handleTabChange('accounting')}>
                  <BookOpen size={20} /> Kế toán Tổng hợp
                </button>
              )}
              {hasAccess('reports') && (
                <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => handleTabChange('reports')}>
                  <PieChart size={20} /> Báo cáo Quản trị
                </button>
              )}
              {hasAccess('pnl') && (
                <button className={`nav-item ${activeTab === 'pnl' ? 'active' : ''}`} onClick={() => handleTabChange('pnl')}>
                  <FileBarChart size={20} /> Lãi Lỗ (P&L)
                </button>
              )}
              {hasAccess('settings') && (
                <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabChange('settings')}>
                  <SettingsIcon size={20} /> Cài đặt Hệ thống
                </button>
              )}
              {hasAccess('logs') && (
                <button className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => handleTabChange('logs')}>
                  <ShieldAlert size={20} /> Nhật ký hệ thống
                </button>
              )}
            </>
          )}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h1>
            {activeTab === 'dashboard' ? 'Tổng quan' :
             activeTab === 'banks' ? 'Ngân hàng & Quỹ' :
             activeTab === 'customers' ? 'Khách hàng & Bán ra' :
             activeTab === 'materials' ? 'Danh mục Vật tư' :
             activeTab === 'inventory' ? 'Tồn kho' :
             activeTab === 'enterprise' ? 'Đối tác & Nhập/Xuất' :
             activeTab === 'assets' ? 'Tài sản & Khấu hao' :
             activeTab === 'personnel' ? 'Quản lý Nhân sự' :
             activeTab === 'attendance' ? 'Chấm công & Lương' :
             activeTab === 'transactions' ? 'Giao dịch' :
             activeTab === 'sales' ? 'Nghiệm thu & Hóa đơn' :
             activeTab === 'contracts' ? 'Quản lý Hợp đồng' :
             activeTab === 'pnl' ? 'Báo cáo Lãi Lỗ (P&L)' :
             activeTab === 'reports' ? 'Báo cáo Quản trị' :
             activeTab === 'settings' ? 'Cài đặt' :
             activeTab === 'logs' ? 'Nhật ký Hệ thống' :
             activeTab === 'accounting' ? 'Kế toán Tổng hợp' : 'Hệ thống'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Đăng nhập với vai trò:</div>
                <div style={{ fontWeight: 600, color: 'white' }}>
                  {{
                    'ADMIN': 'QUẢN TRỊ VIÊN',
                    'GIAMDOC': 'GIÁM ĐỐC',
                    'CHIHUYTRUONG': 'CHỈ HUY TRƯỞNG',
                    'KYSUTRUONG': 'KỸ SƯ HIỆN TRƯỜNG',
                    'GIAMSAT': 'GIÁM SÁT',
                    'KHO': 'THỦ KHO',
                    'KETOAN': 'KẾ TOÁN TRƯỞNG',
                    'KETOAN_VIEN': 'KẾ TOÁN VIÊN',
                    'THUQUY': 'THỦ QUỸ',
                    'VATTU': 'PHÒNG VẬT TƯ',
                    'KEHOACH': 'KẾ HOẠCH',
                    'KYTHUAT': 'KỸ THUẬT',
                    'HANHCHINH': 'HÀNH CHÍNH',
                    'NHANSU': 'NHÂN SỰ'
                  }[user.role as string] || 'NHÂN SỰ'} ({user.username})
                </div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)' }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'var(--border-glass)' }}></div>
            <NotificationBell user={user} />
            <button className="btn" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '8px 16px' }} onClick={handleLogout} title="Đăng xuất">
              <LogOut size={18} style={{ marginRight: '8px' }} /> Thoát
            </button>
          </div>
        </header>
        
        <div style={{ padding: '40px' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
