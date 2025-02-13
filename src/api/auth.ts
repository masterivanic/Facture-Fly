import axios from 'axios';
import { Customer, UserCompany } from '../interfaces';
import { API_URL } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
const TOKEN = AsyncStorage.getItem('accessToken')
export const getClient = async (clientId: number) => {
    const response = await axios.get(`${API_URL}/auth/customer/${clientId}/`,{
        headers: {
          Authorization: `Bearer ${TOKEN}`, 
          "Content-Type": "application/json", 
        },
      });
    return response.data as Customer;
}

export const getClients = async () => {
    const response = await axios.get(`${API_URL}/auth/customer/`,{
        headers: {
          Authorization: `Bearer ${TOKEN}`, 
          "Content-Type": "application/json", 
        },
    });
    return response.data.results as Customer[];
}

export const updateClient = async (clientId: number, data: Customer) => {
    const response = await axios.put(`${API_URL}/auth/customer/${clientId}/`, data, {
        headers: {
          Authorization: `Bearer ${TOKEN}`, 
          "Content-Type": "application/json", 
        },
    });
    return response.data as Customer;
}

export const getUserCompany = async () => {
    const response = await axios.get(`${API_URL}/auth/company/`,{
        headers: {
          Authorization: `Bearer ${TOKEN}`, 
          "Content-Type": "application/json", 
        },
    });
    return response.data.results[0] as UserCompany;
}

export const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login/`, { email, password });
    AsyncStorage.setItem('accessToken', response.data.access);
    AsyncStorage.setItem('refreshToken', response.data.refresh);
    return response.data;
}

export const refreshToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
    const response = await axios.post(`${API_URL}/auth/refresh/`, {
        headers: {
          Authorization: `Bearer ${refreshToken}`, 
          "Content-Type": "application/json", 
        },
    });
    AsyncStorage.setItem('accessToken', response.data.access);
    AsyncStorage.setItem('refreshToken', response.data.refresh);
}