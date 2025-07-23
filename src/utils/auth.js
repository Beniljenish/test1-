// Authentication utilities

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('organizo_user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

export const storeUser = (user) => {
  try {
    localStorage.setItem('organizo_user', JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user:', error);
  }
};

export const removeStoredUser = () => {
  try {
    localStorage.removeItem('organizo_user');
  } catch (error) {
    console.error('Error removing stored user:', error);
  }
};