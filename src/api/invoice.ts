import axios from "axios";
import { API_URL } from "../constants";
import { Article, Invoice, InvoiceWithArticles } from "../interfaces";
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN = AsyncStorage.getItem('accessToken')

export const getInvoices = async () => {
    const response = await axios.get(`${API_URL}/facturation/invoice/`,{
        headers: {
          Authorization: `Bearer ${TOKEN}`, 
          "Content-Type": "application/json", 
        },
      });
    return response.data.results as Invoice[];
}

export const getInvoiceById = async (factureId: number) => {
    const response = await axios.get(`${API_URL}/facturation/invoice/${factureId}/`,{
        headers: {
          Authorization: `Bearer ${TOKEN}`, 
          "Content-Type": "application/json", 
        },
      });
    return response.data as Invoice;
}

export const getArticlesByIds = async (articleIds: number[]) => {
    const articles: Article[] = [];
    for(const articleId of articleIds) {
        const response = await axios.get(`${API_URL}/facturation/article/${articleId}/`,{
            headers: {
                Authorization: `Bearer ${TOKEN}`, 
                "Content-Type": "application/json", 
            },
        });
        articles.push(response.data as Article);
    }
    return articles;
}

export const createInvoice = async (invoice: InvoiceWithArticles) => {
    const response = await axios.post(`${API_URL}/facturation/invoice/`, invoice,{
        headers: {
          Authorization: `Bearer ${TOKEN}`, 
          "Content-Type": "application/json", 
        },
    });
    return response.data as InvoiceWithArticles;
}

export const updateInvoice = async (invoice: InvoiceWithArticles) => {
    const response = await axios.put(`${API_URL}/facturation/invoice/${invoice.id}/`, invoice,{
        headers: {
          Authorization: `Bearer ${TOKEN}`, 
          "Content-Type": "application/json", 
        },
    });
    return response.data as Invoice;
}

export const createDefaultInvoice = async () => {
    const defaultInvoice: InvoiceWithArticles = {
        id: 0,
        label: 'Facture',
        emission_date: new Date(),
        amount: 0,
        discount: 0,
        taxe: 20,
        paid_amount: 0,
        signature: '',
        due_date: new Date().toISOString().split('T')[0],
        is_paid: false,
        user: 1,
        customer: null,
        article: [
          {
            id: 0,
            label: 'Article',
            quantity: 0,
            price: 0,
            user: 1,
            description: '',
          }
        ]
    };
    return await createInvoice(defaultInvoice);
}