import { Category } from '@/types/entities';
import { mockCategories } from '@/lib/mocks/data';
import api from '../axios';
class CategoryService {
  private categories = [...mockCategories];

  async getCategories(establishmentId: string): Promise<Category[]> {
    try {
      const response = await api.get<{ categories: Category[] }>(`/categories?establishmentId=${establishmentId}`);
      return response.data.categories;
    } catch (error) {
      throw new Error('Erro ao buscar categorias');
    }
  }

  async createCategory(category: {
    name: string;
    description: string;
    establishmentId: string;
  }): Promise<Category> {
    try {
      const response = await api.post<{ category: Category }>('/categories', category);
      return response.data.category;
    } catch (error) {
      throw new Error('Erro ao criar categoria');
    }
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    try {
      const response = await api.put<{ category: Category }>(`/categories/${id}`, category);
      return response.data.category;
    } catch (error) {
      throw new Error('Erro ao atualizar categoria');
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      throw new Error('Erro ao deletar categoria');
    }
  }
}

export const categoryService = new CategoryService(); 