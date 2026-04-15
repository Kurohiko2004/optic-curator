// Lấy token và tạo Headers dùng chung
export const getHeaders = (withAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Hàm fetch dùng chung cho các request (giống fetchCartApi)
export const fetchApi = async (url, method = 'GET', body = null, withAuth = false) => {
  const options = {
    method,
    headers: getHeaders(withAuth)
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Lỗi hệ thống khi gọi API');
  }
  return data;
};
