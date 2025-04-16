import { User, Establishment, PaymentMethod } from '@/types/entities';
import { mockUsers, mockEstablishments } from '@/lib/mocks/data';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

class AuthService {
  private currentUser: User | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      return {
        user: null,
        error: 'Usuário não encontrado'
      };
    }

    console.log(user);

    // In a real app, we would hash and compare passwords
    if (credentials.password !== 'hashed_password') {
      return {
        user: null,
        error: 'Senha incorreta'
      };
    }

    this.currentUser = user;
    return {
      user,
      error: null
    };
  }

  async logout(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<User | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.currentUser;
  }

  async signUp(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'establishments'>): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (mockUsers.some(u => u.email === userData.email)) {
      return {
        user: null,
        error: 'Email já cadastrado'
      };
    }

    const newUser: User = {
      ...userData,
      id: (mockUsers.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      establishments: []
    };

    mockUsers.push(newUser);
    this.currentUser = newUser;

    return {
      user: newUser,
      error: null
    };
  }

  async registerUser(data: {
    name: string;
    email: string;
    password: string;
    establishmentName: string;
  }): Promise<{ user: User; establishment: Establishment }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email already exists
    const existingUser = mockUsers.find(user => user.email === data.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password, // In a real app, this would be hashed
      phone: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      establishments: [], // Will be updated after establishment creation
      role: 'OWNER',
    };

    // Create new establishment
    const newEstablishment: Establishment = {
      id: crypto.randomUUID(),
      name: data.establishmentName,
      description: undefined,
      address: undefined,
      phone: undefined,
      logo: undefined,
      primaryColor: '#0f172a',
      secondaryColor: '#f97316',
      wifiSsid: undefined,
      wifiPassword: undefined,
      ownerId: newUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: newUser,
      staff: [],
      products: [],
      categories: [],
      tables: [],
      orders: [],
      subscription: {
        id: crypto.randomUUID(),
        establishmentId: '', // Will be set after establishment creation
        establishment: null as any, // Will be set after establishment creation
        startDate: new Date(),
        active: true,
        autoRenew: true,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        invoices: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      active: true,
    };

    // Update establishment reference in subscription
    newEstablishment.subscription.establishmentId = newEstablishment.id;
    newEstablishment.subscription.establishment = newEstablishment;

    // Update user's establishments array
    newUser.establishments = [newEstablishment];

    // Add to mock data
    mockUsers.push(newUser);
    mockEstablishments.push(newEstablishment);

    return {
      user: newUser,
      establishment: newEstablishment,
    };
  }

  async resetPassword(newPassword: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    // Update the user's password in mock data
    const userIndex = mockUsers.findIndex(u => u.id === this.currentUser!.id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    mockUsers[userIndex].password = newPassword;
    this.currentUser.password = newPassword;
  }
}

export const authService = new AuthService(); 