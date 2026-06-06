import React, { useEffect, useState, useRef } from 'react';
import CreateMaterialModal from '../components/CreateMaterialModal';
import { Box, Plus, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { MasterDataPrint } from '../components/print-templates/MasterDataPrint';

interface Material {
  id: number;
  name: string;
  unit: string;
  price?: number;
  description: string | null;
  createdAt: string;
}

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Danh_Sach_Vat_Tu'
  });

  const fetchMaterials = async () => {
    try {
      const res = await fetch('http://localhost:3000/materials?t=' + Date.now());
      if (!res.ok) throw new Error('Failed to fetch materials');
      const data = await res.json();
      setMaterials(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleCreated = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    fetchMaterials();
  };

  const openCreateModal = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div>
      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>Tổng loại vật tư</span>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--accent-primary)' }}>
              <Box size={20} />
            </div>
          </div>
          <span className="stat-value">{materials.length}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Danh sách Vật tư</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handlePrint}>
              <Printer size={18} /> In Danh sách
            </button>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> Thêm Vật tư
            </button>
          </div>
        </div>

        {error && <div style={{ marginBottom: '16px', color: 'var(--warning)', fontSize: '0.875rem' }}>Lưu ý: Không thể kết nối tới máy chủ ({error}).</div>}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tên vật tư</th>
                <th>Đơn vị tính</th>
                <th>Đơn giá (VNĐ)</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500, color: 'white' }}>{item.name}</td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                      {item.unit}
                    </span>
                  </td>
                  <td>{item.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price) : '-'}</td>
                  <td className="text-muted">{item.description || '-'}</td>
                  <td>
                    <button 
                      onClick={() => openEditModal(item)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có dữ liệu vật tư.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CreateMaterialModal 
          material={editingMaterial}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMaterial(null);
          }} 
          onSuccess={handleCreated} 
        />
      )}

      {/* Hidden Print Container */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <MasterDataPrint 
          ref={printRef} 
          title="DANH SÁCH VẬT TƯ"
          data={materials}
          columns={[
            { header: 'Tên Vật tư', key: 'name' },
            { header: 'Đơn vị tính', key: 'unit', align: 'center' },
            { header: 'Đơn giá (VNĐ)', key: 'price', align: 'right', format: (val) => new Intl.NumberFormat('vi-VN').format(val) }
          ]}
        />
      </div>
    </div>
  );
}
