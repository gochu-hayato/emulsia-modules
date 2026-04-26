export interface PdfRow {
  label: string;
  value: string;
}

export interface PdfParams {
  title: string;
  rows: PdfRow[];
  footer?: string;
}

export interface InvoiceItem {
  name: string;
  amount: number;
}

export interface InvoiceParams {
  invoiceNumber: string;
  issueDate: string;
  items: InvoiceItem[];
  total: number;
  companyName: string;
}
