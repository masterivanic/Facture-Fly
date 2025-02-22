import axios from 'axios';
import { Customer, UserCompany } from '../interfaces';
import { API_URL } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getClient = async (clientId: number) => {
  const accessToken = await getAccessToken();

  const response = await axios.get(`${API_URL}/auth/customer/${clientId}/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return response.data as Customer;
}

export const getClients = async () => {
  const accessToken = await getAccessToken();

  const response = await axios.get(`${API_URL}/auth/customer/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return response.data.results as Customer[];
}

export const updateClient = async (clientId: number, data: Customer) => {
  const accessToken = await getAccessToken();

  const response = await axios.put(`${API_URL}/auth/customer/${clientId}/`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return response.data as Customer;
}

export const getUserCompany = async () => {
  const accessToken = await getAccessToken();
  const response = await axios.get(`${API_URL}/auth/company/`, {

    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const data = response.data.results;
  console.log(data);
  return response.data.results[0] as UserCompany;
}

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login/`, { email, password });
  console.log(response.data.access)
  await AsyncStorage.setItem('accessToken', response.data.access);
  await AsyncStorage.setItem('refreshToken', response.data.refresh);
  return response;
}

export const refreshToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  const response = await axios.post(`${API_URL}/auth/refresh/`, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      "Content-Type": "application/json",
    },
  });
  await AsyncStorage.setItem('accessToken', response.data.access);
  await AsyncStorage.setItem('refreshToken', response.data.refresh);
}
export const register = async (email: string, username: string, password: string, password2: string) => {
  const body = {
    email,
    username,
    password,
    password2,
  }
  console.log('Registration attempt made.');
  const response = await axios.post(`${API_URL}/auth/register/`, body);
  console.log(response.status);
  return response;
}

export const getAccessToken = async () => {
  try {
    const value = await AsyncStorage.getItem('accessToken');
    return value;  // This will return null if not found
  } catch (e) {
    console.error('Error getting access token:', e);
    return null;
  }
};
