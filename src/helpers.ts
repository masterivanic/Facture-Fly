import { InvoiceDisplayed, MonthlyInvoices } from "./interfaces";

export const transformInvoices = (apiInvoices: any[]): MonthlyInvoices[] => {
    const groupedByMonth: { [key: string]: InvoiceDisplayed[] } = {};
  
    apiInvoices.forEach((invoice) => {
      const monthName = new Date(invoice.emission_date).toLocaleString("fr-FR", { month: "long" });
  
      const formattedInvoice: InvoiceDisplayed = {
        client: invoice.customer?.name || "Aucun client",
        invoiceNumber: `INV${invoice.id.toString().padStart(4, "0")}`,
        amount: formatCurrency(invoice.total_amount),
      };
  
      if (!groupedByMonth[monthName]) {
        groupedByMonth[monthName] = [];
      }
      groupedByMonth[monthName].push(formattedInvoice);
    });
  
    // Convert to MonthlyInvoices[]
    return Object.entries(groupedByMonth).map(([month, data]) => ({
      month: capitalizeFirstLetter(month),
      total: formatCurrency(data.reduce((sum, invoice) => sum + parseFloat(invoice.amount.replace("€", "").replace(",", ".")), 0)),
      data,
    }));
  };
  
  // Helper function to format amount
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
  };
  
  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
  