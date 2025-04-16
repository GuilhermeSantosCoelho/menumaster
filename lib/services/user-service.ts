import { User } from '@/types/entities';
import { mockUsers } from '@/lib/mocks/data';

class UserService {
  private users = [...mockUsers];

  async getUserProfile(userId: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUserProfile(userId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...this.users[index],
      name: data.name || this.users[index].name,
      email: data.email || this.users[index].email,
      phone: data.phone || this.users[index].phone,
      updatedAt: new Date(),
    };

    this.users[index] = updatedUser;
    return updatedUser;
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // In a real application, you would verify the current password hash
    // For mock data, we'll just update the password
    user.password = newPassword; // In a real app, this would be hashed
    user.updatedAt = new Date();
  }
}

export const userService = new UserService(); 