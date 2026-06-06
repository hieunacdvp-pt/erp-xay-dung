const API_URL = 'http://localhost:3000/subcontractors';

export const getSubcontractors = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const getSubcontractorById = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
};

export const createSubcontractor = async (data: any) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateSubcontractor = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteSubcontractor = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return res.json();
};
