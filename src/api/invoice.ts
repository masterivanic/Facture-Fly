import axios from "axios";
import { API_URL, TOKEN } from "../constants";
import { Article, Invoice } from "../interfaces";

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