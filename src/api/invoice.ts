import axios from "axios";
import { API_URL, TOKEN } from "../constants";

const getInvoices = async () => {
    const response = await axios.get(`${API_URL}/invoices/`,{
        headers: {
          Authorization: `Bearer ${TOKEN}`, // Attach JWT token
          "Content-Type": "application/json", // Optional, but recommended
        },
      });
    return response.data.results;
}

export default getInvoices;