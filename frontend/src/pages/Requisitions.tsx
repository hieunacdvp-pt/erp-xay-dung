import React, { useEffect, useState } from 'react';
import { Package, CheckCircle, XCircle, Clock, Truck, FileText, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Requisitions() {
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const res = await fetch('http://localhost:3000/requisitions');
      setRequisitions(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'fulfill') => {
    try {
      const res = await fetch(`http://localhost:3000/requisitions/${id}/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user?.username })
      });
      if (!res.ok) throw new Error(`Lỗi khi ${action}`);
      toast.success('Thao tác thành công!');
      fetchRequisitions();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Phê duyệt Vật tư</h2>
          <p className="text-muted">Quản lý các yêu cầu cấp vật tư từ công trường gửi về</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Dự án</th>
              <th>Vật tư yêu cầu</th>
              <th>Ghi chú</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {requisitions.map(req => (
              <tr key={req.id}>
                <td>{new Date(req.createdAt).toLocaleString('vi-VN')}</td>
                <td style={{ fontWeight: 600 }}>{req.project?.name}</td>
                <td>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.875rem' }}>
                    {req.items?.map((item: any) => (
                      <li key={item.id}>{item.material?.name}: <span style={{ fontWeight: 600 }}>{item.quantity} {item.material?.unit}</span></li>
                    ))}
                  </ul>
                </td>
                <td style={{ maxWidth: '200px' }}>{req.note || '-'}</td>
                <td>
                  {req.isOverBudget && <span className="badge badge-danger" style={{ marginBottom: '4px', display: 'inline-block', width: 'max-content' }}><AlertTriangle size={12}/> VƯỢT DỰ TOÁN</span>}
                  <div style={{ marginTop: '4px' }}>
                    {req.status === 'PENDING' && <span className="badge badge-warning"><Clock size={12}/> Chờ duyệt</span>}
                    {req.status === 'APPROVED' && <span className="badge badge-primary"><CheckCircle size={12}/> Đã duyệt</span>}
                    {req.status === 'REJECTED' && <span className="badge badge-danger"><XCircle size={12}/> Từ chối</span>}
                    {req.status === 'FULFILLED' && <span className="badge badge-success"><Truck size={12}/> Đã xuất kho</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {req.status === 'PENDING' && (user?.role === 'ADMIN' || user?.role === 'GIAMDOC') && (
                      <>
                        <button className="btn btn-sm" style={{ background: 'var(--success)' }} onClick={() => handleAction(req.id, 'approve')}>Duyệt</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleAction(req.id, 'reject')}>Từ chối</button>
                      </>
                    )}
                    {req.status === 'APPROVED' && (user?.role === 'ADMIN' || user?.role === 'KHO' || user?.role === 'KETOAN') && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleAction(req.id, 'fulfill')}>
                        <Truck size={14} style={{ marginRight: '4px' }}/> Xuất kho
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {requisitions.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Không có yêu cầu nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
