import { mockTables } from '@/lib/mocks/data';
import { Table, TableStatus } from '@/types/entities';

class SessionService {
  async getTableSession(tableId: string): Promise<Table> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const table = mockTables.find(t => t.id === tableId);
    if (!table) {
      throw new Error('Table not found');
    }

    return table;
  }

  async validateSession(tableId: string): Promise<boolean> {
    const table = await this.getTableSession(tableId);
    return table.status === TableStatus.OCCUPIED;
  }
}

export const sessionService = new SessionService(); 