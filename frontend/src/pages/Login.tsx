import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { startAuthentication } from '@simplewebauthn/browser';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWorkerMode, setIsWorkerMode] = useState(false);
  const [workerInfo, setWorkerInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isWorkerMode) {
        if (!workerInfo) {
          if (!username.match(/^[0-9]+$/)) throw new Error('Vui lòng nhập Số điện thoại hợp lệ');
          const lookup = await fetch(`http://localhost:3000/personnel/lookup/${username}`);
          if (!lookup.ok) throw new Error('Lỗi khi tra cứu số điện thoại');
          const data = await lookup.text();
          if (!data) throw new Error('Số điện thoại không tồn tại trên hệ thống!');
          setWorkerInfo(JSON.parse(data));
          setLoading(false);
          return;
        } else {
          // Confirm login
          onLoginSuccess({ id: workerInfo.id, username: workerInfo.name, role: 'WORKER' });
          return;
        }
      }

      // Demo Login Mode
      if (password === '1') {
        const u = username.toLowerCase();
        let role = 'NHANSU'; // Default fallback
        if (u === 'admin' || u.includes('quản trị')) role = 'ADMIN';
        else if (u === 'giamdoc' || u.includes('giám đốc')) role = 'GIAMDOC';
        else if (u.includes('ketoantruong') || u.includes('kế toán trưởng')) role = 'KETOAN';
        else if (u.includes('ketoan') || u.includes('kế toán')) role = 'KETOAN_VIEN';
        else if (u.includes('thuquy') || u.includes('thủ quỹ')) role = 'THUQUY';
        else if (u.includes('thukho') || u.includes('kho') || u.includes('thủ kho')) role = 'KHO';
        else if (u.includes('chihuy') || u.includes('chỉ huy')) role = 'CHIHUYTRUONG';
        else if (u.includes('kysu') || u.includes('kỹ sư')) role = 'KYSUTRUONG';
        else if (u.includes('giamsat') || u.includes('giám sát')) role = 'GIAMSAT';
        else if (u.includes('nhansu') || u.includes('nhân sự')) role = 'NHANSU';
        else if (u.includes('hanhchinh') || u.includes('hành chính')) role = 'HANHCHINH';
        else if (u.includes('vattu') || u.includes('vật tư')) role = 'VATTU';
        else if (u.includes('kythuat') || u.includes('kỹ thuật')) role = 'KYTHUAT';
        else if (u.includes('kehoach') || u.includes('kế hoạch')) role = 'KEHOACH';
        else {
          throw new Error('Tài khoản test không tồn tại. Vui lòng nhập đúng chức danh (VD: phongvattu, canbokythuat...)');
        }

        // Giả lập delay
        await new Promise(r => setTimeout(r, 500));
        
        // Cấp ID tĩnh cho từng role để lưu trữ trạng thái readBy chính xác
        const roleIds: Record<string, number> = {
          'ADMIN': 1, 'GIAMDOC': 2, 'KETOAN': 3, 'KETOAN_VIEN': 4,
          'THUQUY': 5, 'KHO': 6, 'CHIHUYTRUONG': 7, 'KYSUTRUONG': 8,
          'GIAMSAT': 9, 'NHANSU': 10, 'HANHCHINH': 11, 'VATTU': 12,
          'KYTHUAT': 13, 'KEHOACH': 14
        };
        const fixedId = roleIds[role] || Math.floor(Math.random() * 1000) + 20;

        onLoginSuccess({ id: fixedId, username, role });
        return;
      }

      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        throw new Error('Sai tài khoản hoặc mật khẩu');
      }

      const data = await res.json();
      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!username) {
      setError('Vui lòng nhập tài khoản trước khi dùng Vân tay/FaceID');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const optRes = await fetch(`http://localhost:3000/auth/login/options/${username}`, { method: 'POST' });
      if (!optRes.ok) throw new Error('Tài khoản không tồn tại hoặc chưa đăng ký Vân tay');
      const options = await optRes.json();

      const asseResp = await startAuthentication({ optionsJSON: options });

      const verifyRes = await fetch(`http://localhost:3000/auth/login/verify/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asseResp),
      });

      const verification = await verifyRes.json();
      if (verification.verified) {
        onLoginSuccess(verification.user);
      } else {
        throw new Error('Xác thực vân tay thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi sinh trắc học');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)'
    }}>
      <div className="glass-panel" style={{ width: '400px', padding: '40px', borderRadius: '16px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Construction ERP
        </h2>
        
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.1)', padding: '4px', borderRadius: '8px', marginBottom: '24px' }}>
          <button type="button" className={`btn ${!isWorkerMode ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '8px', background: !isWorkerMode ? 'var(--accent)' : 'transparent', color: !isWorkerMode ? 'white' : 'var(--text-secondary)' }} onClick={() => { setIsWorkerMode(false); setUsername(''); setPassword(''); setError(''); }}>
            Quản trị / Văn phòng
          </button>
          <button type="button" className={`btn ${isWorkerMode ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '8px', background: isWorkerMode ? 'var(--success)' : 'transparent', color: isWorkerMode ? 'white' : 'var(--text-secondary)' }} onClick={() => { setIsWorkerMode(true); setUsername(''); setPassword(''); setError(''); }}>
            Cán bộ / Công nhân
          </button>
        </div>

        <p className="text-muted" style={{ textAlign: 'center', marginBottom: '24px' }}>
          {isWorkerMode ? 'Nhập Số điện thoại để chấm công' : 'Đăng nhập để tiếp tục'}
        </p>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!workerInfo ? (
            <div className="form-group">
              <label className="form-label">{isWorkerMode ? 'Số điện thoại' : 'Tài khoản'}</label>
              <input 
                type="text" 
                className="form-input" 
                required
                placeholder={isWorkerMode ? 'VD: 0901234567' : 'VD: admin'}
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); setWorkerInfo(null); }}
              />
            </div>
          ) : (
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #22c55e', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Xin chào</div>
              <div style={{ color: '#22c55e', fontSize: '1.25rem', fontWeight: 'bold' }}>{workerInfo.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Bộ phận: {workerInfo.role === 'WORKER' ? 'Công nhân' : workerInfo.role}</div>
            </div>
          )}

          {!isWorkerMode && (
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">Mật khẩu</label>
              <input 
                type="password" 
                className="form-input" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: isWorkerMode ? '32px' : 0 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px', background: isWorkerMode ? 'var(--success)' : 'var(--accent)' }} disabled={loading}>
              {loading ? 'Đang xử lý...' : (isWorkerMode ? (workerInfo ? 'Vào Chấm công ngay' : 'Tìm nhân viên') : 'Đăng nhập')}
            </button>
            {!isWorkerMode && (
              <button type="button" className="btn" style={{ padding: '12px', background: 'var(--accent-gradient)', color: '#fff' }} onClick={handleBiometricLogin} disabled={loading} title="Đăng nhập bằng Vân tay / FaceID">
                <Fingerprint size={20} />
              </button>
            )}
          </div>
        </form>

        {!isWorkerMode && (
          <div style={{ marginTop: '24px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.6' }}>
            <b style={{ color: 'var(--text-primary)' }}>Tài khoản Demo (Mật khẩu chung: 1)</b><br/>
            Giám đốc: <b>giamdoc</b> | Chỉ huy trưởng: <b>chihuy</b> | Kế toán: <b>ketoan</b><br/>
            Thủ kho: <b>thukho</b> | Admin: <b>admin</b> | Nhân sự: <b>nhansu</b>
          </div>
        )}
      </div>
    </div>
  );
}
