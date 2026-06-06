import React, { useEffect, useState, useRef } from 'react';
import { Bell, Trash2 } from 'lucide-react';

export default function NotificationBell({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchMessages = () => {
    if (!user) return;
    fetch(`http://localhost:3000/messages?userId=${user.id}&role=${user.role}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
      })
      .catch(console.error);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  const markAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/messages/${id}/read`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài làm markAsRead
    if (!confirm('Xóa thông báo này?')) return;
    try {
      await fetch(`http://localhost:3000/messages/${id}?userId=${user?.id}`, { method: 'DELETE' });
      setMessages(messages.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button 
        className="btn" 
        style={{ position: 'relative', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px', borderRadius: '50%' }}
        onClick={() => setIsOpen(!isOpen)}
        title="Thông báo"
      >
        <Bell size={20} color="var(--text-primary)" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px', 
            background: 'var(--danger)', color: 'white', 
            borderRadius: '50%', width: '18px', height: '18px', 
            fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '10px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)',
          borderRadius: '12px', width: '350px', maxHeight: '450px', display: 'flex', flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)', zIndex: 1000, backdropFilter: 'blur(16px)'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Thông báo</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '12px' }}>
              {unreadCount} mới
            </span>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {messages.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Không có thông báo nào.
              </div>
            ) : (
              messages.map(m => (
                <div 
                  key={m.id} 
                  style={{ 
                    padding: '12px', 
                    marginBottom: '8px',
                    borderRadius: '8px',
                    background: m.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid',
                    borderColor: m.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: m.isRead ? 0.6 : 1
                  }}
                  onClick={() => {
                    if (!m.isRead) markAsRead(m.id);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: m.isRead ? 'normal' : 'bold', color: m.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', flex: 1, paddingRight: '8px', lineHeight: 1.3 }}>
                      {m.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(m.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <button onClick={(e) => handleDelete(m.id, e)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }} title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {m.content}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {m.type === 'TASK' && (
                        <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>
                          GIAO VIỆC
                        </span>
                      )}
                      {m.type === 'MESSAGE' && (
                        <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>
                          TIN NHẮN
                        </span>
                      )}
                      {m.type === 'SYSTEM_ALERT' && (
                        <span style={{ background: 'rgba(244, 63, 94, 0.2)', color: 'var(--danger)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>
                          HỆ THỐNG
                        </span>
                      )}
                    </div>
                    {m.sender && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Từ: {m.sender.role}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
