const API_URL = "http://localhost:3000/procurement";

// Yêu cầu mua sắm (PR)
export const createPR = async (data: any) => {
  const res = await fetch(`${API_URL}/pr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi tạo Yêu cầu mua sắm");
  return res.json();
};

export const getPRs = async () => {
  const res = await fetch(`${API_URL}/pr`);
  if (!res.ok) throw new Error("Lỗi khi tải danh sách YCMS");
  return res.json();
};

export const approvePR = async (id: number, level: string) => {
  const res = await fetch(`${API_URL}/pr/${id}/approve/${level}`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Lỗi khi duyệt Yêu cầu mua sắm");
  return res.json();
};

export const updatePR = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/pr/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi sửa Yêu cầu mua sắm");
  return res.json();
};

export const deletePR = async (id: number) => {
  const res = await fetch(`${API_URL}/pr/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Lỗi khi xóa Yêu cầu mua sắm");
  return res.json();
};

// Đơn đặt hàng (PO)
export const createPO = async (data: any) => {
  const res = await fetch(`${API_URL}/po`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi tạo Đơn đặt hàng");
  return res.json();
};

export const getPOs = async () => {
  const res = await fetch(`${API_URL}/po`);
  if (!res.ok) throw new Error("Lỗi khi tải danh sách ĐĐH");
  return res.json();
};

export const approvePO = async (id: number, level: string) => {
  const res = await fetch(`${API_URL}/po/${id}/approve/${level}`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Lỗi khi duyệt Đơn đặt hàng");
  return res.json();
};

export const updatePO = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/po/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi sửa Đơn đặt hàng");
  return res.json();
};

export const deletePO = async (id: number) => {
  const res = await fetch(`${API_URL}/po/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Lỗi khi xóa Đơn đặt hàng");
  return res.json();
};

export const receivePO = async (id: number, invoiceNumber?: string) => {
  const res = await fetch(`${API_URL}/po/${id}/receive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoiceNumber })
  });
  if (!res.ok) throw new Error("Lỗi khi nhận hàng");
  return res.json();
};
