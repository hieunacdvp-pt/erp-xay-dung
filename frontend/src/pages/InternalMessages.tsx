import React, { useState, useEffect } from 'react';
import { Send, Inbox, AlertCircle, Briefcase, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InternalMessages({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [formData, setFormData] = useState({
    receiverRole: 'ALL',
    title: '',
    content: '',
    type: 'MESSAGE'
  });

  const roles = [
    { value: 'ALL', label: 'Tất cả mọi người' },
    { value: 'ADMIN', label: 'Quản trị viên (ADMIN)' },
    { value: 'GIAMDOC', label: 'Giám đốc' },
    { value: 'KETOAN', label: 'Kế toán trưởng' },
    { value: 'KETOAN_VIEN', label: 'Kế toán viên' },
    { value: 'VATTU', label: 'Phòng Vật tư' },
    { value: 'KEHOACH', label: 'Phòng Kế hoạch' },
    { value: 'KHO', label: 'Thủ kho' },
    { value: 'NHANSU', label: 'Nhân sự' },
    { value: 'HANHCHINH', label: 'Hành chính' },
    { value: 'CHIHUYTRUONG', label: 'Chỉ huy trưởng' },
    { value: 'KYSUTRUONG', label: 'Kỹ sư HT' },
    { value: 'GIAMSAT', label: 'Giám sát' },
    { value: 'KYTHUAT', label: 'CB Kỹ thuật' }
  ];

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchMessages = () => {
    if (!user) return;
    fetch(`http://localhost:3000/messages?userId=${user.id}&role=${user.role}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(e => console.error(e));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    try {
      const payload = {
        senderId: user.id,
        receiverRole: formData.receiverRole,
        title: formData.title,
        content: formData.content,
        type: formData.type
      };
      
      const res = await fetch('http://localhost:3000/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to send');
      
      toast.success('Gửi thành công!');
      setIsComposing(false);
      setFormData({ receiverRole: 'ALL', title: '', content: '', type: 'MESSAGE' });
      fetchMessages();
    } catch (e) {
      toast.error('Lỗi khi gửi');
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/messages/${id}/read`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      fetchMessages();
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) return;
    try {
      await fetch(`http://localhost:3000/messages/${id}?userId=${user?.id}`, { method: 'DELETE' });
      fetchMessages();
      toast.success('Đã xóa thông báo');
    } catch (e) {
      toast.error('Lỗi khi xóa');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Inbox size={24} color="var(--accent)" />
          Hộp thư & Giao việc nội bộ
        </h2>
        <button className="btn btn-primary" onClick={() => setIsComposing(!isComposing)}>
          {isComposing ? 'Hủy' : <><Send size={18} /> Soạn tin / Giao việc</>}
        </button>
      </div>

      {isComposing && (
        <form onSubmit={handleSend} style={{ background: 'var(--surface-hover)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label>Gửi tới (Phòng ban/Vai trò)</label>
              <select 
                className="input" 
                value={formData.receiverRole} 
                onChange={e => setFormData({...formData, receiverRole: e.target.value})}
              >
                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label>Loại tin nhắn</label>
              <select 
                className="input" 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="MESSAGE">Tin nhắn văn bản</option>
                <option value="TASK">Giao việc / Yêu cầu xử lý</option>
                <option value="SYSTEM_ALERT">Cảnh báo khẩn cấp</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label>Tiêu đề</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Nhập tiêu đề..."
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Nội dung công việc / tin nhắn</label>
            <textarea 
              className="input" 
              rows={4} 
              placeholder="Nhập chi tiết..."
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Send size={18} /> GỬI NGAY
          </button>
        </form>
      )}

      <div>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Hộp thư đến (Inbox)</h3>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <Inbox size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p>Hộp thư trống</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(m => (
              <div 
                key={m.id} 
                style={{
                  background: m.isRead ? 'var(--surface-hover)' : 'rgba(56, 189, 248, 0.05)',
                  border: '1px solid',
                  borderColor: m.isRead ? 'var(--border-glass)' : 'rgba(56, 189, 248, 0.3)',
                  padding: '20px',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  position: 'relative',
                  opacity: m.isRead ? 0.7 : 1
                }}
              >
                <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px' }}>
                  {!m.isRead && (
                    <button className="btn" style={{ padding: '6px 12px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)' }} onClick={() => markAsRead(m.id)}>
                      <CheckCircle2 size={16} /> Đánh dấu đã đọc
                    </button>
                  )}
                  <button className="btn" style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-secondary)' }} onClick={() => handleDelete(m.id)} title="Xóa thông báo">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  {m.type === 'TASK' ? <Briefcase size={24} color="var(--warning)" /> : 
                   m.type === 'SYSTEM_ALERT' ? <AlertCircle size={24} color="var(--danger)" /> :
                   <FileText size={24} color="var(--accent)" />}
                  
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: m.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: m.isRead ? 'normal' : 'bold' }}>
                      {m.title}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Từ: <strong style={{ color: 'var(--text-primary)' }}>{m.sender?.role || 'HỆ THỐNG'}</strong> • {new Date(m.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: m.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
