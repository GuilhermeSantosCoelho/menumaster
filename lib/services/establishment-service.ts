import { Establishment } from '@/types/entities';
import { mockEstablishments } from '../mocks/data';
import axios from '../axios';
class EstablishmentService {
  async getEstablishments(userId: string): Promise<Establishment[]> {
    const response = await axios.get<Establishment[]>('/establishments', {
      params: {
        ownerId: userId
      }
    });
    return response.data;
  }

  async getEstablishmentById(id: string): Promise<Establishment | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockEstablishments.find(e => e.id === id) || null;
  }

  async createEstablishment(establishment: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Establishment> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newEstablishment: Establishment = {
      ...establishment,
      id: (mockEstablishments.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      products: [],
      categories: [],
      tables: [],
      orders: []
    };

    mockEstablishments.push(newEstablishment);
    return newEstablishment;
  }

  async updateEstablishment(id: string, establishment: Partial<Establishment>): Promise<Establishment | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockEstablishments.findIndex(e => e.id === id);
    if (index === -1) return null;

    mockEstablishments[index] = {
      ...mockEstablishments[index],
      ...establishment,
      updatedAt: new Date()
    };

    return mockEstablishments[index];
  }

  async deleteEstablishment(id: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockEstablishments.findIndex(e => e.id === id);
    if (index === -1) return false;

    mockEstablishments.splice(index, 1);
    return true;
  }
}

export const establishmentService = new EstablishmentService(); 