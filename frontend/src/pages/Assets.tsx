import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Plus, CheckCircle, Truck, Calculator, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { BangKhauHaoPrint } from '../components/print-templates/BangKhauHaoPrint';

export default function Assets() {
  const [assets, setAssets] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    purchasePrice: '',
    depreciationMonths: '60'
  });

  const [showDepreciateModal, setShowDepreciateModal] = useState(false);
  const [depreciateData, setDepreciateData] = useState({
    assetId: '',
    projectId: '',
    month: new Date().toISOString().substring(0, 7)
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Bang_Khau_Hao'
  });

  const latestMonth = useMemo(() => {
    if (allocations.length === 0) return new Date().toISOString().substring(0, 7);
    return allocations.sort((a,b) => b.id - a.id)[0].month;
  }, [allocations]);

  const allocationsToPrint = useMemo(() => {
    return allocations.filter(a => a.month === latestMonth);
  }, [allocations, latestMonth]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [astRes, projRes, allocRes] = await Promise.all([
        fetch('http://localhost:3000/assets'),
        fetch('http://localhost:3000/projects'),
        fetch('http://localhost:3000/assets/allocations')
      ]);
      const asts = await astRes.json();
      setAssets(asts);
      
      const projs = await projRes.json();
      setProjects(projs);
      
      setAllocations(await allocRes.json());

      if (asts.length > 0) setDepreciateData(p => ({ ...p, assetId: String(asts[0].id) }));
      if (projs.length > 0) setDepreciateData(p => ({ ...p, projectId: String(projs[0].id) }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.purchasePrice) return;

    try {
      await fetch('http://localhost:3000/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAsset.name,
          purchasePrice: Number(newAsset.purchasePrice),
          depreciationMonths: Number(newAsset.depreciationMonths)
        })
      });
      setShowAssetModal(false);
      setNewAsset({ name: '', purchasePrice: '', depreciationMonths: '60' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDepreciate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depreciateData.assetId || !depreciateData.projectId || !depreciateData.month) return;

    try {
      const res = await fetch('http://localhost:3000/assets/depreciate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: Number(depreciateData.assetId),
          projectId: Number(depreciateData.projectId),
          month: depreciateData.month
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert('Lỗi: ' + err.message);
        return;
      }
      
      setShowDepreciateModal(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val || 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Máy thi công & Khấu hao (TSCĐ)</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-primary" style={{}} onClick={() => setShowAssetModal(true)}>
            <Plus size={18} /> Thêm Máy mới
          </button>
          <button className="btn btn-primary" onClick={() => setShowDepreciateModal(true)}>
            <Calculator size={18} /> Chạy Khấu hao Tháng
          </button>
          <button className="btn" style={{ background: 'var(--accent-gradient)' }} onClick={handlePrint}>
            <Printer size={18} /> In Bảng khấu hao ({latestMonth})
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} color="var(--primary)" /> Danh sách Máy móc
          </h3>
          {loading ? <div className="loader"></div> : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tên Tài sản</th>
                  <th style={{ textAlign: 'right' }}>Nguyên giá</th>
                  <th style={{ textAlign: 'center' }}>Số tháng KH</th>
                  <th style={{ textAlign: 'right' }}>KH mỗi tháng</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 'bold' }}>{a.name}</td>
                    <td style={{ textAlign: 'right', color: 'var(--info)' }}>{formatCurrency(a.purchasePrice)}</td>
                    <td style={{ textAlign: 'center' }}>{a.depreciationMonths} tháng</td>
                    <td style={{ textAlign: 'right', color: 'var(--warning)' }}>{formatCurrency(a.purchasePrice / a.depreciationMonths)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={20} color="var(--success)" /> Lịch sử Trích Khấu hao
          </h3>
          {loading ? <div className="loader"></div> : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>Máy thi công</th>
                  <th>Dự án chịu phí</th>
                  <th style={{ textAlign: 'right' }}>Số tiền (627)</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map(al => (
                  <tr key={al.id}>
                    <td style={{ fontWeight: 'bold' }}>{al.month}</td>
                    <td>{al.asset?.name}</td>
                    <td style={{ color: 'var(--info)' }}>{al.project?.name}</td>
                    <td style={{ textAlign: 'right', color: 'var(--warning)', fontWeight: 'bold' }}>{formatCurrency(al.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAssetModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '24px' }}>Thêm Máy thi công (TSCĐ)</h3>
            <form onSubmit={handleCreateAsset}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Tên Máy / Thiết bị</label>
                <input type="text" className="form-input" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Nguyên giá (VNĐ)</label>
                <input type="number" className="form-input" value={newAsset.purchasePrice} onChange={e => setNewAsset({...newAsset, purchasePrice: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">Thời gian khấu hao (Tháng)</label>
                <input type="number" className="form-input" value={newAsset.depreciationMonths} onChange={e => setNewAsset({...newAsset, depreciationMonths: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowAssetModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDepreciateModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '24px' }}>Trích Khấu hao (Phân bổ)</h3>
            <form onSubmit={handleDepreciate}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Tháng Khấu hao</label>
                <input type="month" className="form-input" value={depreciateData.month} onChange={e => setDepreciateData({...depreciateData, month: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Chọn Máy thi công</label>
                <select className="form-select" value={depreciateData.assetId} onChange={e => setDepreciateData({...depreciateData, assetId: e.target.value})} required>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Dự án sử dụng (chịu chi phí)</label>
                <select className="form-select" value={depreciateData.projectId} onChange={e => setDepreciateData({...depreciateData, projectId: e.target.value})} required>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
                Hệ thống sẽ tự động hạch toán: <b>Nợ 627</b> (Chi phí máy thi công) / <b>Có 214</b> (Hao mòn TSCĐ).
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowDepreciateModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Chạy Khấu Hao</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Print Container */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <BangKhauHaoPrint ref={printRef} allocations={allocationsToPrint} month={latestMonth} />
      </div>
    </div>
  );
}
