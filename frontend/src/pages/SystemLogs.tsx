import React, { useEffect, useState } from 'react';
import { Activity, User, Clock, FileText, Database, Plus, Edit2, Trash2 } from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/auditlogs');
      setLogs(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Plus size={16} className="text-success" />;
      case 'UPDATE': return <Edit2 size={16} className="text-warning" />;
      case 'DELETE': return <Trash2 size={16} className="text-danger" />;
      default: return <Activity size={16} className="text-info" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE': return <span className="badge badge-success">Thêm mới</span>;
      case 'UPDATE': return <span className="badge badge-warning">Cập nhật</span>;
      case 'DELETE': return <span className="badge badge-danger">Xóa</span>;
      default: return <span className="badge">{action}</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Nhật ký Hệ thống (Audit Logs)</h1>
          <p className="page-subtitle">Theo dõi lịch sử thay đổi dữ liệu của toàn bộ hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={fetchLogs}>
          <Activity size={18} /> Làm mới
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? <div className="loader"></div> : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Người dùng</th>
                  <th>Hành động</th>
                  <th>Thực thể (Module)</th>
                  <th>ID</th>
                  <th>Chi tiết (JSON)</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} />
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={14} />
                        {log.username}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getActionIcon(log.action)}
                        {getActionBadge(log.action)}
                      </div>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Database size={14} className="text-muted" />
                        {log.entity}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>#{log.entityId}</span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm" 
                        onClick={() => alert(JSON.stringify(JSON.parse(log.details || '{}'), null, 2))}
                        disabled={!log.details}
                      >
                        <FileText size={14} /> Xem
                      </button>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>Không có lịch sử nhật ký.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
