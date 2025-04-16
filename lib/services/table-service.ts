import { Table, TableStatus } from '@/types/entities';
import { mockTables } from '@/lib/mocks/data';

class TableService {
  private tables = [...mockTables];

  async getTables(establishmentId: string): Promise<Table[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.tables.filter(table => table.establishmentId === establishmentId);
  }

  async addTable(tableData: Omit<Table, 'id' | 'createdAt' | 'updatedAt' | 'establishment' | 'orders'>): Promise<Table> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTable: Table = {
      id: `table-${this.tables.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      orders: [],
      establishment: {} as any, // This will be populated by the establishment context
      ...tableData
    };
    
    this.tables.push(newTable);
    return newTable;
  }

  async updateTable(id: string, tableData: Partial<Omit<Table, 'id' | 'createdAt' | 'updatedAt' | 'establishment' | 'orders'>>): Promise<Table> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = this.tables.findIndex(table => table.id === id);
    if (index === -1) throw new Error('Table not found');
    
    const updatedTable = {
      ...this.tables[index],
      ...tableData,
      updatedAt: new Date()
    };
    
    this.tables[index] = updatedTable;
    return updatedTable;
  }

  async deleteTable(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = this.tables.findIndex(table => table.id === id);
    if (index === -1) throw new Error('Table not found');
    
    this.tables.splice(index, 1);
  }

  async toggleTableActive(id: string, active: boolean): Promise<Table> {
    return this.updateTable(id, { active });
  }
}

export const tableService = new TableService(); 