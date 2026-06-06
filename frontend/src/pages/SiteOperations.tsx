import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Send, Plus, CheckCircle, Package, Clock, CloudRain, Sun, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SiteOperations() {
  const [activeTab, setActiveTab] = useState('requisition'); // requisition, attendance, progress
  const [projects, setProjects] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [personnels, setPersonnels] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  
  // User context
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    fetch('http://localhost:3000/projects').then(r => r.json()).then(setProjects).catch(console.error);
    fetch('http://localhost:3000/materials').then(r => r.json()).then(setMaterials).catch(console.error);
    fetch('http://localhost:3000/personnel').then(r => r.json()).then(data => {
      setPersonnels(data.filter((p: any) => p.status === 'ACTIVE'));
      if (data.length > 0) setSelectedPersonnel(String(data[0].id));
    }).catch(console.error);
  }, []);

  // --- ATTENDANCE STATE ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // --- REQUISITION STATE ---
  const [reqItems, setReqItems] = useState<any[]>([]);
  const [reqNote, setReqNote] = useState('');
  const [budgetStatuses, setBudgetStatuses] = useState<any[]>([]);
  const [selectedMatId, setSelectedMatId] = useState<string>('');
  const [selectedMatQty, setSelectedMatQty] = useState<string>('1');
  const [showExtraMaterials, setShowExtraMaterials] = useState<boolean>(false);

  useEffect(() => {
    if (selectedProject && activeTab === 'requisition') {
      fetch(`http://localhost:3000/projects/${selectedProject}/budget-status`)
        .then(res => res.json())
        .then(setBudgetStatuses)
        .catch(console.error);
    }
  }, [selectedProject, activeTab]);

  // --- PROGRESS STATE ---
  const [progWeather, setProgWeather] = useState('Sunny');
  const [progContent, setProgContent] = useState('');
  const [progPhoto, setProgPhoto] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Không thể truy cập camera. Vui lòng cấp quyền!');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const takePhoto = (setTarget: (p: string) => void) => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setTarget(dataUrl);
        stopCamera();
      }
    }
  };

  const getLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocating(false);
          toast.success('Đã định vị thành công!');
        },
        (error) => {
          setLocating(false);
          toast.error('Không thể lấy vị trí. ' + error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocating(false);
      toast.error('Trình duyệt không hỗ trợ định vị.');
    }
  };

  const submitAttendance = async (type: 'IN' | 'OUT') => {
    if (!selectedProject) return toast.error('Vui lòng chọn Dự án');
    if (!selectedPersonnel) return toast.error('Vui lòng chọn Nhân viên');
    if (!photo) return toast.error('Vui lòng chụp ảnh khuôn mặt');
    if (!location) return toast.error('Vui lòng định vị GPS');

    const data = {
      personnelId: parseInt(selectedPersonnel),
      projectId: parseInt(selectedProject),
      date: new Date().toISOString(),
      status: 'PRESENT',
      latitude: location.lat,
      longitude: location.lng,
      photoUrl: photo,
      timeIn: type === 'IN' ? new Date().toISOString() : undefined,
      timeOut: type === 'OUT' ? new Date().toISOString() : undefined
    };

    try {
      const res = await fetch('http://localhost:3000/attendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Lỗi chấm công');
      toast.success(`Chấm công ${type === 'IN' ? 'VÀO' : 'RA'} thành công!`);
      setPhoto(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const submitRequisition = async () => {
    if (!selectedProject) return toast.error('Vui lòng chọn Dự án');
    if (reqItems.length === 0) return toast.error('Vui lòng thêm ít nhất 1 vật tư');

    const data = {
      projectId: parseInt(selectedProject),
      requesterId: selectedPersonnel ? parseInt(selectedPersonnel) : null,
      note: reqNote,
      username: user?.username,
      items: reqItems
    };

    try {
      const res = await fetch('http://localhost:3000/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Lỗi gửi yêu cầu');
      toast.success('Đã gửi phiếu yêu cầu thành công!');
      setReqItems([]);
      setReqNote('');
      // Refresh budget status after successful request
      fetch(`http://localhost:3000/projects/${selectedProject}/budget-status`)
        .then(res => res.json())
        .then(setBudgetStatuses)
        .catch(console.error);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const submitProgress = async () => {
    if (!selectedProject) return toast.error('Vui lòng chọn Dự án');
    if (!progContent) return toast.error('Vui lòng nhập nội dung');

    const data = {
      projectId: parseInt(selectedProject),
      reporterId: selectedPersonnel ? parseInt(selectedPersonnel) : null,
      weather: progWeather,
      content: progContent,
      username: user?.username,
      imageUrls: progPhoto ? [progPhoto] : []
    };

    try {
      const res = await fetch('http://localhost:3000/progress-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Lỗi gửi báo cáo');
      toast.success('Đã gửi báo cáo tiến độ thành công!');
      setProgContent('');
      setProgPhoto(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--bg-card)', minHeight: '100vh', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      {/* Mobile Header */}
      <div style={{ padding: '24px 20px', background: 'var(--accent-gradient)', color: 'white' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Công trường số</h2>
        <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.875rem' }}>{new Date().toLocaleDateString('vi-VN')} • Xin chào {user?.username || 'Kỹ sư'}</p>
        
        <select 
          className="form-control" 
          style={{ marginTop: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}
          value={selectedPersonnel}
          onChange={e => setSelectedPersonnel(e.target.value)}
        >
          <option value="" style={{ color: 'black' }}>-- Chọn Nhân viên chấm công --</option>
          {personnels.map(p => (
            <option key={p.id} value={p.id} style={{ color: 'black' }}>{p.name} - {p.role}</option>
          ))}
        </select>
        
        <select 
          className="form-control" 
          style={{ marginTop: '12px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
        >
          <option value="" style={{ color: 'black' }}>-- Chọn Công trình đang đứng --</option>
          {projects.map(p => (
            <option key={p.id} value={p.id} style={{ color: 'black' }}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          style={{ flex: 1, padding: '16px 0', background: 'none', border: 'none', borderBottom: activeTab === 'attendance' ? '2px solid var(--accent-primary)' : 'none', color: activeTab === 'attendance' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'attendance' ? 600 : 400 }}
          onClick={() => setActiveTab('attendance')}
        ><Clock size={18} style={{ display: 'block', margin: '0 auto 4px' }} /> Chấm công</button>
        <button 
          style={{ flex: 1, padding: '16px 0', background: 'none', border: 'none', borderBottom: activeTab === 'requisition' ? '2px solid var(--accent-primary)' : 'none', color: activeTab === 'requisition' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'requisition' ? 600 : 400 }}
          onClick={() => setActiveTab('requisition')}
        ><Package size={18} style={{ display: 'block', margin: '0 auto 4px' }} /> Vật tư</button>
        <button 
          style={{ flex: 1, padding: '16px 0', background: 'none', border: 'none', borderBottom: activeTab === 'progress' ? '2px solid var(--accent-primary)' : 'none', color: activeTab === 'progress' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'progress' ? 600 : 400 }}
          onClick={() => setActiveTab('progress')}
        ><Calendar size={18} style={{ display: 'block', margin: '0 auto 4px' }} /> Tiến độ</button>
      </div>

      <div style={{ padding: '20px' }}>
        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="fade-in">
            <h3 style={{ marginTop: 0, fontSize: '1.2rem' }}>Điểm danh GPS</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Yêu cầu có mặt tại công trường và chụp ảnh trực tiếp.</p>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <MapPin size={24} color={location ? 'var(--success)' : 'var(--warning)'} />
                <div>
                  <div style={{ fontWeight: 600 }}>Vị trí GPS</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {locating ? 'Đang lấy tọa độ...' : location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Chưa có tọa độ'}
                  </div>
                </div>
                {!location && (
                  <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={getLocation} disabled={locating}>
                    Định vị
                  </button>
                )}
              </div>
            </div>

            <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', position: 'relative', aspectRatio: '3/4', marginBottom: '20px' }}>
              {photo ? (
                <img src={photo} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraStream ? 'block' : 'none' }} />
              )}
              
              {!photo && !cameraStream && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                  <Camera size={48} color="rgba(255,255,255,0.2)" />
                  <button className="btn btn-primary" onClick={startCamera}>Mở Camera</button>
                </div>
              )}
              
              {!photo && cameraStream && (
                <button 
                  onClick={() => takePhoto(setPhoto)}
                  style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '64px', height: '64px', borderRadius: '50%', background: 'white', border: '4px solid var(--accent-primary)', cursor: 'pointer' }}
                />
              )}
              
              {photo && (
                <button className="btn btn-sm" style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)' }} onClick={() => setPhoto(null)}>
                  Chụp lại
                </button>
              )}
            </div>
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '16px', background: 'var(--success)' }} 
                onClick={() => submitAttendance('IN')}
                disabled={!photo || !location}
              >
                Chấm công VÀO
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '16px', background: 'var(--warning)' }} 
                onClick={() => submitAttendance('OUT')}
                disabled={!photo || !location}
              >
                Chấm công RA
              </button>
            </div>
          </div>
        )}

        {/* REQUISITION TAB */}
        {activeTab === 'requisition' && (
          <div className="fade-in">
            <h3 style={{ marginTop: 0, fontSize: '1.2rem' }}>Phiếu xin cấp vật tư</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input type="checkbox" id="showExtra" checked={showExtraMaterials} onChange={e => setShowExtraMaterials(e.target.checked)} />
              <label htmlFor="showExtra" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hiển thị vật tư ngoài dự toán (Phát sinh)</label>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <select className="form-control" id="matSelect" style={{ flex: 1 }} value={selectedMatId} onChange={e => setSelectedMatId(e.target.value)}>
                <option value="">-- Chọn vật tư --</option>
                {materials
                  .filter(m => showExtraMaterials || budgetStatuses.some(b => b.materialId === m.id || b.materialName?.toLowerCase() === m.name.toLowerCase()))
                  .map(m => {
                    const b = budgetStatuses.find(b => b.materialId === m.id || b.materialName?.toLowerCase() === m.name.toLowerCase());
                    const label = b ? `${m.name} (${m.unit}) - Tồn: ${b.remaining}` : `${m.name} (${m.unit}) - Ngoài dự toán`;
                    return <option key={m.id} value={m.id}>{label}</option>;
                  })}
              </select>
              
              <input 
                type="number" 
                className="form-control" 
                style={{ 
                  width: '80px', 
                  borderColor: (selectedMatId && budgetStatuses.find(b => b.materialId === parseInt(selectedMatId))?.remaining < parseFloat(selectedMatQty || '0')) ? 'var(--danger)' : '',
                  color: (selectedMatId && budgetStatuses.find(b => b.materialId === parseInt(selectedMatId))?.remaining < parseFloat(selectedMatQty || '0')) ? 'var(--danger)' : ''
                }} 
                placeholder="SL" 
                value={selectedMatQty} 
                onChange={e => setSelectedMatQty(e.target.value)} 
              />
              <button className="btn btn-primary" onClick={() => {
                if (!selectedMatId) return;
                const mat = materials.find(m => m.id === parseInt(selectedMatId));
                setReqItems([...reqItems, { materialId: mat.id, name: mat.name, unit: mat.unit, quantity: parseFloat(selectedMatQty || '1') }]);
                setSelectedMatQty('1');
              }}>
                <Plus size={18} />
              </button>
            </div>
            
            {selectedMatId && (() => {
              const b = budgetStatuses.find(b => b.materialId === parseInt(selectedMatId));
              if (!b) return <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Vật tư này ngoài danh mục dự toán.</div>;
              
              const isOver = b.remaining < parseFloat(selectedMatQty || '0');
              return (
                <div style={{ fontSize: '0.8rem', marginBottom: '16px', padding: '8px', background: isOver ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', border: isOver ? '1px solid var(--danger)' : '1px dashed rgba(255,255,255,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Định mức:</span> <span style={{ fontWeight: 'bold' }}>{b.budgeted} {b.unit}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Đã xuất/Yêu cầu:</span> <span style={{ fontWeight: 'bold' }}>{b.requested} {b.unit}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tồn dự toán:</span> <span style={{ fontWeight: 'bold', color: isOver ? 'var(--danger)' : 'var(--success)' }}>{b.remaining} {b.unit}</span>
                  </div>
                  {isOver && <div style={{ color: 'var(--danger)', marginTop: '4px', fontStyle: 'italic' }}>* Yêu cầu vượt dự toán, phiếu sẽ bị cắm cờ Cảnh Báo!</div>}
                </div>
              );
            })()}

            {reqItems.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                {reqItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span>{item.name}</span>
                    <span style={{ fontWeight: 600 }}>{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            )}

            <textarea 
              className="form-control" 
              placeholder="Ghi chú thêm (Lý do cấp, hạn cần...)" 
              rows={3} 
              value={reqNote}
              onChange={e => setReqNote(e.target.value)}
              style={{ marginBottom: '20px' }}
            />

            <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }} onClick={submitRequisition}>
              <Send size={18} /> Gửi Phiếu Yêu Cầu
            </button>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="fade-in">
            <h3 style={{ marginTop: 0, fontSize: '1.2rem' }}>Báo cáo Tiến độ / Nhật ký</h3>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button className={`btn ${progWeather === 'Sunny' ? 'btn-primary' : ''}`} style={{ flex: 1 }} onClick={() => setProgWeather('Sunny')}>
                <Sun size={18} /> Nắng
              </button>
              <button className={`btn ${progWeather === 'Rainy' ? 'btn-primary' : ''}`} style={{ flex: 1, background: progWeather === 'Rainy' ? '#3b82f6' : '' }} onClick={() => setProgWeather('Rainy')}>
                <CloudRain size={18} /> Mưa
              </button>
            </div>

            <textarea 
              className="form-control" 
              placeholder="Nhập nội dung công việc đã thực hiện trong ngày hôm nay..." 
              rows={5} 
              value={progContent}
              onChange={e => setProgContent(e.target.value)}
              style={{ marginBottom: '16px' }}
            />

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Hình ảnh hiện trường (Tùy chọn)</div>
              {progPhoto ? (
                <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={progPhoto} alt="Progress" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                  <button className="btn btn-sm" style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)' }} onClick={() => setProgPhoto(null)}>Xóa</button>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', padding: '32px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {
                  // Reuse camera or just simulate file upload
                  startCamera();
                }}>
                  <Camera size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mở Camera chụp ảnh</div>
                </div>
              )}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }} onClick={submitProgress}>
              <Send size={18} /> Gửi Báo Cáo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
