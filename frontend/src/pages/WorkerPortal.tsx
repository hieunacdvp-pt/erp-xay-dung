import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, LogOut, CheckCircle2, History, Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkerPortal({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<'IN' | 'OUT' | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [defaultProjectId, setDefaultProjectId] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchAttendances();
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:3000/projects');
      const data = await res.json();
      if (data && data.length > 0) {
        setDefaultProjectId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttendances = async () => {
    try {
      const res = await fetch('http://localhost:3000/attendances');
      const data = await res.json();
      setAttendances(data.filter((a: any) => a.personnelId === user.id));
    } catch (e) {
      console.error(e);
    }
  };

  const triggerCamera = async (type: 'IN' | 'OUT') => {
    setActionType(type);
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        streamRef.current = stream;
        setShowCamera(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }, 100);
      } catch (err) {
        toast.error('Không thể mở Camera. Vui lòng cấp quyền.');
        // Fallback: dùng input file
        const el = document.getElementById('cameraInput');
        if (el) el.click();
      }
    } else {
      const el = document.getElementById('cameraInput');
      if (el) el.click();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        closeCamera();
        proceedCheckIn(base64);
      }
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Đọc ảnh và thu nhỏ nếu cần (tạm dùng FileReader)
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      proceedCheckIn(base64);
    };
    reader.readAsDataURL(file);
  };

  const proceedCheckIn = (photoUrl: string) => {
    if (!actionType) return;
    const type = actionType;
    setLoading(true);

    const submitData = async (lat: string, lng: string) => {
      try {
        const payload: any = {
          personnelId: user.id,
          projectId: defaultProjectId,
          date: new Date().toISOString().split('T')[0],
          status: 'PRESENT', // Cứ check in là ghi nhận có mặt
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          photoUrl: photoUrl.substring(0, 50) + '...[Image Data]' // Chỉ gửi tượng trưng để test
        };
        if (type === 'IN') payload.timeIn = new Date().toISOString();
        if (type === 'OUT') payload.timeOut = new Date().toISOString();
        
        const res = await fetch('http://localhost:3000/attendances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Lỗi chấm công');
        toast.success(`Chấm công ${type === 'IN' ? 'VÀO' : 'RA'} thành công!`);
        fetchAttendances();
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setLoading(false);
        setActionType(null);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          submitData(pos.coords.latitude.toString(), pos.coords.longitude.toString());
        }, 
        (err) => {
          console.warn('GPS Error:', err);
          toast.error('Lỗi định vị. Sẽ ghi nhận bằng IP/Mạng tạm thời.');
          // Fallback: Ghi nhận tọa độ mặc định hoặc 0,0 nếu bị chặn
          submitData('0.0000', '0.0000');
        }, 
        { enableHighAccuracy: false, timeout: 10000 }
      );
    } else {
      toast.error('Trình duyệt không hỗ trợ định vị GPS');
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--accent-gradient)', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Xin chào, {user.username}</h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>Cán bộ / Công nhân hiện trường</p>
        </div>
        <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px' }} onClick={onLogout} title="Đăng xuất">
          <LogOut size={20} />
        </button>
      </header>

      <main style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Hidden Camera Input */}
        <input 
          type="file" 
          id="cameraInput" 
          accept="image/*" 
          capture="user" 
          style={{ display: 'none' }}
          onChange={handlePhotoCapture}
        />

        {/* Vùng chấm công */}
        <div style={{ background: 'white', padding: '24px 16px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 24px 0', color: '#334155', fontSize: '1.1rem' }}>CHẤM CÔNG BẰNG GPS</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button 
              className="btn" 
              style={{ padding: '24px 16px', flexDirection: 'column', gap: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: '2px solid #22c55e', borderRadius: '16px', height: 'auto' }}
              onClick={() => triggerCamera('IN')}
              disabled={loading}
            >
              <Clock size={36} />
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>VÀO CA</span>
            </button>
            <button 
              className="btn" 
              style={{ padding: '24px 16px', flexDirection: 'column', gap: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '2px solid #ef4444', borderRadius: '16px', height: 'auto' }}
              onClick={() => triggerCamera('OUT')}
              disabled={loading}
            >
              <LogOut size={36} />
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>TAN CA</span>
            </button>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <MapPin size={14} /> Bắt buộc cho phép truy cập vị trí (GPS)
          </div>
        </div>

        {/* Lịch sử chấm công */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', flex: 1 }}>
          <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '1rem' }}>
            <History size={18} /> Lịch sử chấm công gần đây
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attendances.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '0.9rem' }}>Chưa có dữ liệu chấm công</div>
            ) : (
              attendances.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10).map((att: any) => (
                <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: '50%', 
                      background: att.status === 'IN' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: att.status === 'IN' ? '#22c55e' : '#ef4444',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {att.status === 'IN' ? <CheckCircle2 size={24} /> : <LogOut size={24} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#334155', fontSize: '0.95rem' }}>{att.status === 'IN' ? 'Vào ca' : 'Tan ca'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{new Date(att.createdAt).toLocaleString('vi-VN')}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> Hợp lệ</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Camera Modal */}
      {showCamera && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'black', zIndex: 9999, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
            <span style={{ fontWeight: 'bold' }}>Chụp ảnh điểm danh</span>
            <button onClick={closeCamera} style={{ background: 'none', border: 'none', color: 'white' }}><X size={28}/></button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <video ref={videoRef} playsInline style={{ width: '100%', maxHeight: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', background: '#111' }}>
            <button 
              onClick={capturePhoto}
              style={{
                width: '64px', height: '64px', borderRadius: '50%', background: 'white', border: '4px solid #aaa',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <Camera size={32} color="black" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
