import React, { useState } from 'react';
import axios from 'axios';

interface LicenseLockedProps {
  status: any;
  onActivated: () => void;
}

export default function LicenseLocked({ status, onActivated }: LicenseLockedProps) {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:3000/license/activate', { key });
      onActivated(); // Reload app
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã kích hoạt không hợp lệ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1b1e',
      fontFamily: "'Inter', sans-serif",
      color: '#fff',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #2A2D35, #1E2026)',
        padding: '50px 40px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid #3f424e'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
        <h1 style={{ fontSize: '24px', margin: '0 0 15px 0', color: '#ff4d4f' }}>
          Tạm Ngưng Dịch Vụ
        </h1>
        <p style={{ color: '#a0a5b1', lineHeight: '1.6', marginBottom: '15px' }}>
          Phần mềm của bạn đã hết hạn dùng thử hoặc chưa được cấp phép bản quyền hợp lệ. 
        </p>

        <div style={{ 
          background: 'rgba(251, 191, 36, 0.1)', 
          border: '1px solid #f59e0b', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#fbbf24', fontWeight: 'bold' }}>Thông tin thanh toán & Gia hạn:</p>
          <p style={{ margin: 0, color: '#fff', fontSize: '15px', lineHeight: '1.5' }}>
            Liên hệ nhà sáng lập phần mềm <strong>Nguyễn Anh Hiểu</strong><br/>
            SĐT: <strong style={{ fontSize: '18px', color: '#fbbf24' }}>0917555622</strong><br/>
            để nhận Mã kích hoạt (License key) mới.
          </p>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#a0a5b1', fontSize: '14px' }}>
            Nhập Mã Kích Hoạt (License Key)
          </label>
          <textarea 
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Dán mã kích hoạt vào đây..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '15px',
              borderRadius: '12px',
              background: '#141517',
              border: '1px solid #3f424e',
              color: '#fff',
              fontSize: '14px',
              resize: 'none',
              fontFamily: 'monospace'
            }}
          />
        </div>

        {error && (
          <div style={{ color: '#ff4d4f', marginBottom: '20px', fontSize: '14px', background: 'rgba(255, 77, 79, 0.1)', padding: '10px', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleActivate}
          disabled={loading || !key.trim()}
          style={{
            width: '100%',
            padding: '16px',
            background: loading ? '#555' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Đang xác thực...' : 'KÍCH HOẠT PHẦN MỀM'}
        </button>
      </div>
    </div>
  );
}
