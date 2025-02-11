import { InvoiceDisplayed, MonthlyInvoices } from "./interfaces";
import { Invoice } from "./interfaces";
export const transformInvoices = (apiInvoices: Invoice[]): MonthlyInvoices[] => {
    const groupedByMonth: { [key: string]: InvoiceDisplayed[] } = {};
  
    apiInvoices.forEach((invoice) => {
      const monthName = new Date(invoice.emission_date).toLocaleString("fr-FR", { month: "long" });
        //TODO: add get customer(client) api call
      const formattedInvoice: InvoiceDisplayed = {
        id: invoice.id,
        client: "Aucun client",
        invoiceNumber: invoice.label,
        amount: invoice.total_amount,
      };
  
      if (!groupedByMonth[monthName]) {
        groupedByMonth[monthName] = [];
      }
      groupedByMonth[monthName].push(formattedInvoice);
    });
  
    // Convert to MonthlyInvoices[]
    return Object.entries(groupedByMonth).map(([month, data]) => ({
      month: capitalizeFirstLetter(month),
      total: data.reduce((sum, invoice) => sum + invoice.amount, 0),
      data,
    }));
  };
  
  // Helper function to format amount
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
  };
  
  // Helper function to capitalize first letter
export const capitalizeFirstLetter = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
  