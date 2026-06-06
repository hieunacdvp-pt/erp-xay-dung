import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Image as ImageIcon, Users, Key, Fingerprint, Database, Trash2 } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';

export default function Settings() {
  const [settings, setSettings] = useState<any>({});
  const [companyName, setCompanyName] = useState('');
  const [companyTaxId, setCompanyTaxId] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchUsers();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch('http://localhost:3000/system-settings');
    const data = await res.json();
    setSettings(data);
    setCompanyName(data.companyName || '');
    setCompanyTaxId(data.companyTaxId || '');
    setCompanyAddress(data.companyAddress || '');
    setCompanyPhone(data.companyPhone || '');
    setLogoUrl(data.companyLogo || '');
  };

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:3000/auth/users');
    const data = await res.json();
    let dbUsers = Array.isArray(data) ? data : [];
    
    // Merge predefined roles for display so user knows what they can register
    const predefined = [
      { id: 'p1', username: 'Giám đốc', role: 'GIAMDOC' },
      { id: 'p2', username: 'Quản trị viên', role: 'ADMIN' },
      { id: 'p3', username: 'Kế toán trưởng', role: 'KETOAN' },
      { id: 'p4', username: 'Kế toán viên', role: 'KETOAN_VIEN' },
      { id: 'p5', username: 'Thủ quỹ', role: 'THUQUY' },
      { id: 'p6', username: 'Thủ kho', role: 'KHO' },
      { id: 'p7', username: 'Chỉ huy trưởng', role: 'CHIHUYTRUONG' },
      { id: 'p8', username: 'Kỹ sư trưởng', role: 'KYSUTRUONG' },
      { id: 'p9', username: 'Giám sát', role: 'GIAMSAT' },
      { id: 'p10', username: 'Nhân sự', role: 'NHANSU' },
      { id: 'p11', username: 'Hành chính', role: 'HANHCHINH' },
    ];

    const merged = [...dbUsers];
    predefined.forEach(p => {
      // If we don't already have someone with this exact ROLE in db, then show the predefined placeholder
      if (!merged.find(u => u.role === p.role)) {
        merged.push(p);
      }
    });

    setUsers(merged);
  };

  const handleSaveInfo = async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:3000/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, companyTaxId, companyAddress, companyPhone })
      });
      alert('Đã lưu Thông tin doanh nghiệp!');
      window.location.reload();
    } catch (err) {
      alert('Không thể lưu thông tin, vui lòng kiểm tra kết nối máy chủ!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    const res = await fetch('http://localhost:3000/system-settings/upload-logo', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    setLogoUrl(data.url);
    setLoading(false);
    alert('Đã tải lên Logo! Vui lòng ấn Lưu thông tin để cập nhật toàn hệ thống.');
  };

  const handleRegisterFingerprint = async (username: string) => {
    try {
      setLoading(true);
      // 1. Get options
      const optRes = await fetch(`http://localhost:3000/auth/register/options/${username}`, { method: 'POST' });
      const options = await optRes.json();

      // 2. Start WebAuthn
      const attResp = await startRegistration({ optionsJSON: options });

      // 3. Verify
      const verifyRes = await fetch(`http://localhost:3000/auth/register/verify/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      });

      const verification = await verifyRes.json();
      if (verification.verified) {
        alert('Đăng ký Sinh trắc học thành công!');
      } else {
        alert('Đăng ký thất bại!');
      }
    } catch (error: any) {
      alert('Lỗi đăng ký: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetTrialData = async () => {
    if (!window.confirm('CẢNH BÁO: Hành động này sẽ XÓA TOÀN BỘ dữ liệu giao dịch (Dự án, Hóa đơn, Thu chi, Nhập xuất kho...). Chỉ giữ lại Tài khoản, Cấu hình, Danh mục và Bản quyền phần mềm. Bạn có chắc chắn muốn xóa?')) {
      return;
    }
    
    if (window.prompt('Để xác nhận xóa, vui lòng gõ "XOA":') !== 'XOA') {
      alert('Hủy bỏ thao tác xóa do xác nhận không đúng.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/system-settings/reset-trial-data', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload();
      } else {
        alert('Có lỗi xảy ra khi xóa dữ liệu.');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SettingsIcon /> Cài đặt Hệ thống
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Thông tin công ty */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={18} /> Thông tin Doanh nghiệp
          </h3>
          <div className="form-group">
            <label>Tên Công ty</label>
            <input 
              type="text" 
              className="form-input" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nhập tên doanh nghiệp..." 
            />
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Mã số thuế</label>
            <input 
              type="text" 
              className="form-input" 
              value={companyTaxId}
              onChange={(e) => setCompanyTaxId(e.target.value)}
              placeholder="Ví dụ: 0101234567..." 
            />
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Địa chỉ</label>
            <input 
              type="text" 
              className="form-input" 
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="Nhập địa chỉ công ty..." 
            />
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Số điện thoại</label>
            <input 
              type="text" 
              className="form-input" 
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              placeholder="Ví dụ: 0987654321..." 
            />
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Logo Công ty</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ height: '60px', objectFit: 'contain', background: '#fff', padding: '4px', borderRadius: '4px' }} />
              ) : (
                <div style={{ width: '60px', height: '60px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No Logo
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleUploadLogo} disabled={loading} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSaveInfo} disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>

        {/* Quản lý người dùng */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} /> Phân quyền & Đăng nhập
          </h3>
          
          <table className="table" style={{ marginTop: '16px' }}>
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Phân quyền</th>
                <th style={{ textAlign: 'center' }}>Sinh trắc học</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td><span className="badge" style={{ background: 'var(--primary)', color: '#fff' }}>{u.role}</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-sm btn-primary" onClick={() => handleRegisterFingerprint(u.username)} disabled={loading}>
                      <Fingerprint size={16} /> Đăng ký Vân tay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            * Lưu ý: Click vào "Đăng ký Vân tay" để thiết lập mã PIN, Vân tay hoặc FaceID (WebAuthn) cho thiết bị hiện tại.
            <br /> Danh sách trên bao gồm các tài khoản hệ thống gợi ý. Nếu tài khoản chưa tồn tại trong cơ sở dữ liệu, khi bạn ấn Đăng ký, hệ thống sẽ tự động tạo mới tài khoản với Quyền (Role) tương ứng.
          </div>
        </div>

        {/* Dữ liệu & Hệ thống */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
            <Database size={18} /> Quản trị Dữ liệu (Nguy hiểm)
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
            Khu vực này dành riêng cho Quản trị viên cấp cao. Các thao tác ở đây không thể hoàn tác, vui lòng thận trọng.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div>
              <h4 style={{ color: 'var(--danger)', marginBottom: '4px' }}>Xóa dữ liệu dùng thử (Reset DB)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Xóa toàn bộ các giao dịch, dự án, chứng từ, phiếu xuất/nhập kho... Đưa hệ thống về trạng thái sạch để bắt đầu dùng thật (Go-Live).
              </p>
            </div>
            <button className="btn" style={{ background: 'var(--danger)', color: '#fff', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={handleResetTrialData} disabled={loading}>
              <Trash2 size={16} /> {loading ? 'Đang xử lý...' : 'Xóa dữ liệu dùng thử'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
