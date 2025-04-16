import { mockTables, mockEstablishments } from '@/lib/mocks/data';
import { Table, Establishment } from '@/types/entities';

class TableSignsService {
  async getTableSignsData(establishmentId: string): Promise<{
    tables: Table[];
    establishment: Establishment;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const establishment = mockEstablishments.find(e => e.id === establishmentId);
    if (!establishment) {
      throw new Error('Establishment not found');
    }

    const tables = mockTables.filter(table => table.establishmentId === establishmentId);

    return {
      tables,
      establishment
    };
  }
}

export const tableSignsService = new TableSignsService(); 