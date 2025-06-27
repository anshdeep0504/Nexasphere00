import axios from 'axios';

const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
};

export default axiosWithAuth; 