// global types for the BHMS project
export interface Room { 
  id: number;
  room_number: string 
}
export interface Bed { 
  id: number; 
  room_id: number; 
  bed_label: string; 
  is_occupied: boolean 
}
export interface Tenancy { 
  id: number; 
  tenant: number; 
  bed: number; 
  room?: number; 
  check_in_date: string; 
  agreed_rate: string 
}
export interface Account { 
  id: number; 
  username: string; 
  first_name: string; 
  last_name: string; 
  contact_number: string; 
  role: string 
}
export interface Invoice { id: number; 
  tenancy_id: number; 
  billing_month: string 
}
export interface InvoiceItem { 
  id: number; 
  invoice_id: number; 
  line_no: number; 
  charge_type: string; 
  amount: string 
}
export interface Payment { 
  id: number; 
  invoice: number; 
  payment_date: string; 
  amount_paid: string; 
  method: string 
}

export interface LoginResponse {
  tokens: { access: string; refresh: string }
  account: Partial<Account> & { role: string }
}