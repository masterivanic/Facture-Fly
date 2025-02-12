import axios from 'axios';
import { Customer } from '../interfaces';
import { API_URL, TOKEN } from '../constants';

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