export interface TransactionDebtDetail {
  id: number;
  createdAt: Date;
  vendorName: string;
  beneficiaryFullName: string;
  amountCOP: number;
  amountBs: number;
  saleRate: number;
  purchaseRate: number;
  inversion: number; // bolívares × purchaseRate
  gananciaSistema: number; // COP - inversión
  gananciaAdminColombia: number; // gananciaSistema / 2
  gananciaAdminVenezuela: number; // gananciaSistema / 2
  deudaConVenezuela: number; // inversión + gananciaAdminVenezuela
}

export interface VenezuelaDebtSummary {
  totalDebt: number;
  totalPaid: number;
  pendingDebt: number;
  transactionDetails: TransactionDebtDetail[];
  payments: VenezuelaPaymentDetail[];
}

export interface VenezuelaPaymentDetail {
  id: number;
  amount: number;
  notes: string;
  proofUrl: string;
  createdBy: string;
  createdAt: Date;
  paymentDate: Date;
}

