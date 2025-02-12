import { getClient } from "./api/auth";
import { InvoiceDisplayed, InvoiceWithArticles, MonthlyInvoices } from "./interfaces";
import { Invoice } from "./interfaces";
export const transformInvoices = async (apiInvoices: Invoice[]): Promise<MonthlyInvoices[]> => {
    const groupedByMonth: { [key: string]: InvoiceDisplayed[] } = {};
  
    for (const invoice of apiInvoices) {
      const monthName = new Date(invoice.emission_date).toLocaleString("fr-FR", { month: "long" });
        //TODO: add get customer(client) api call
        let client = "Aucun client";
        if(invoice.customer != null) {
            const customer = await getClient(invoice.customer);
            client = customer?.first_name + " " + customer?.last_name;
        }
      const formattedInvoice: InvoiceDisplayed = {
        id: invoice.id,
        client: client,
        invoiceNumber: invoice.label,
        amount: Number(invoice.amount),
      };
  
      if (!groupedByMonth[monthName]) {
        groupedByMonth[monthName] = [];
      }
      groupedByMonth[monthName].push(formattedInvoice);
    }
  
    // Convert to MonthlyInvoices[]
    return Object.entries(groupedByMonth).map(([month, data]) => ({
      month: capitalizeFirstLetter(month),
      total: data.reduce((sum, invoice) => sum + invoice.amount, 0),
      data,
    }));
  };
  
  // Helper function to format amount
export const formatCurrency = (amount: number): string => {
    console.log( amount);
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
  };
  
  // Helper function to capitalize first letter
export const capitalizeFirstLetter = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Transforms an InvoiceWithArticles into an Invoice.
 * Converts due_date from string to Date and maps the article array
 * from Article[] to an array of article ids (number[]).
 */
export function transformInvoice(invoiceWithArticles: InvoiceWithArticles): Invoice {
  return {
    ...invoiceWithArticles,
    emission_date: new Date(invoiceWithArticles.emission_date), // Convert to Date
    due_date: new Date(invoiceWithArticles.due_date),
    article: invoiceWithArticles.article.map(article => article.id)
  };
}