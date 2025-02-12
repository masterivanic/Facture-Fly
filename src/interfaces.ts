export interface FlyUser {
    id: number;
    username: string | null;
    first_name: string;
    last_name: string;
    email: string;
    is_staff: boolean;
    is_active: boolean;
    date_joined: Date;
    confirm_number: string | null;
    disabled: boolean;
    roles: string; // Replace with union type if UserRole values are known
  }
  
  export interface UserCompany {
    id: number;
    name: string;
    address: string;
    sector: string | null;
    phone: string;
    user: number; // Reference to FlyUser ID
  }
  
  export interface Customer {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    date_joined: Date;
    address: string;
    user: number; // Reference to FlyUser ID
  }
  
  export interface Article {
    id: number;
    label: string ;
    quantity: number;
    price: number;
    description: string;
    user: number;
    facture: number;
  }
  
  export interface Invoice {
    id: number;
    label: string;
    emission_date: Date;
    amount: number;
    discount: number;
    taxe: number;
    paid_amount: number;
    signature: string | null;
    due_date: Date ;
    is_paid: boolean;
    user: number; // Reference to FlyUser ID
    customer: number | null; // Reference to Customer ID (nullable)
    article: number[];
  }

  export interface InvoiceDisplayed {
    client: string;
    invoiceNumber: string;
    amount: number;
    id: number;
  };
  
  export interface MonthlyInvoices  {
    month: string;
    total: number;
    data: InvoiceDisplayed[];
  };