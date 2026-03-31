import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

export const registerUser = async (user) => {
  const res = await axios.post(`${BASE_URL}/auth/register`, user);
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return res.data;
};

export const getItems = async () => {
  const res = await axios.get(`${BASE_URL}/items`);
  return res.data;
};

export const addItem = async (item) => {
  const res = await axios.post(`${BASE_URL}/items`, item);
  return res.data;
};