const storage = {
  setToken: (token) => {
    if (typeof window !== 'undefined')
      localStorage.setItem('admin_token', token);
  },
  getToken: () => {
    if (typeof window !== 'undefined')
      return localStorage.getItem('admin_token');
    return null;
  },
  removeToken: () => {
    if (typeof window !== 'undefined')
      localStorage.removeItem('admin_token');
  },
  setAdmin: (admin) => {
    if (typeof window !== 'undefined')
      localStorage.setItem('admin_user', JSON.stringify(admin));
  },
  getAdmin: () => {
    if (typeof window !== 'undefined') {
      const a = localStorage.getItem('admin_user');
      return a ? JSON.parse(a) : null;
    }
    return null;
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  },
};
export default storage;