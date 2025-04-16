import { mockInvoices } from '@/lib/mocks/data';

export type InvoiceStatus = 'paga' | 'pendente' | 'atrasada';

export type Invoice = {
  id: string;
  data: string;
  vencimento: string;
  valor: number;
  status: InvoiceStatus;
  plano: string;
};

class InvoiceService {
  private invoices = [...mockInvoices];

  async getInvoices(): Promise<Invoice[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.invoices;
  }

  async getInvoicesByStatus(status: InvoiceStatus | 'todas'): Promise<Invoice[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (status === 'todas') {
      return this.invoices;
    }
    
    return this.invoices.filter(invoice => invoice.status === status);
  }

  async searchInvoices(query: string): Promise<Invoice[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const searchTerm = query.toLowerCase();
    return this.invoices.filter(
      invoice => 
        invoice.id.toLowerCase().includes(searchTerm) || 
        invoice.plano.toLowerCase().includes(searchTerm)
    );
  }

  async getCurrentSubscription(): Promise<{
    plano: string;
    valor: number;
    limiteMesas: number;
    metodoPagamento: string;
    proximaCobranca: string;
    status: 'ativa' | 'inativa';
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      plano: 'Profissional',
      valor: 199.00,
      limiteMesas: 30,
      metodoPagamento: 'Cartão de Crédito •••• 4242',
      proximaCobranca: '15/08/2023',
      status: 'ativa'
    };
  }
}

export const invoiceService = new InvoiceService(); 