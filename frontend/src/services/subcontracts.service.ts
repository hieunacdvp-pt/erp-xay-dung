const API_URL = 'http://localhost:3000/subcontracts';

export const getSubcontracts = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const getSubcontractById = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
};

export const createSubcontract = async (data: any) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateSubcontract = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const createAcceptance = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/${id}/acceptances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};
