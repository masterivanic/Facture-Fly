import axios from "axios";
import { API_URL, TOKEN } from "../constants";
import { Invoice } from "../interfaces";

const getInvoices = async () => {
    const response = await axios.get(`${API_URL}/invoices/`,{
        headers: {
          Authorization: `Bearer ${TOKEN}`, // Attach JWT token
          "Content-Type": "application/json", // Optional, but recommended
        },
      });
    return response.data.results as Invoice[];
}

export default getInvoices;