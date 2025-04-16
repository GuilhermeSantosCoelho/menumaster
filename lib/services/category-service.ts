import { Category } from '@/types/entities';
import { mockCategories } from '@/lib/mocks/data';

class CategoryService {
  private categories = [...mockCategories];

  async getCategories(establishmentId: string): Promise<Category[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.categories.filter(category => category.establishment.id === establishmentId);
  }

  async createCategory(category: {
    name: string;
    description: string;
    establishmentId: string;
  }): Promise<Category> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newCategory: Category = {
      id: Math.random().toString(36).substring(7),
      name: category.name,
      description: category.description,
      establishmentId: category.establishmentId,
      establishment: { id: category.establishmentId } as any,
      products: [],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }

    const updatedCategory = {
      ...this.categories[index],
      ...category,
      updatedAt: new Date(),
    };

    this.categories[index] = updatedCategory;
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }

    this.categories.splice(index, 1);
  }
}

export const categoryService = new CategoryService(); 