import { mockEstablishments } from '@/lib/mocks/data';

class SettingsService {
  private establishments = [...mockEstablishments];

  async getEstablishmentSettings(establishmentId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const establishment = this.establishments.find(e => e.id === establishmentId);
    if (!establishment) {
      throw new Error('Establishment not found');
    }

    return {
      name: establishment.name,
      address: establishment.address,
      phone: establishment.phone,
      description: establishment.description,
      primary_color: establishment.primaryColor || '#0f172a',
      secondary_color: establishment.secondaryColor || '#f97316',
      logo: establishment.logo || null,
      wifi_ssid: establishment.wifiSsid || '',
      wifi_password: establishment.wifiPassword || '',
    };
  }

  async updateEstablishmentSettings(establishmentId: string, settings: {
    name?: string;
    address?: string;
    phone?: string;
    description?: string;
    primary_color?: string;
    secondary_color?: string;
    logo?: string;
    wifi_ssid?: string;
    wifi_password?: string;
  }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.establishments.findIndex(e => e.id === establishmentId);
    if (index === -1) {
      throw new Error('Establishment not found');
    }

    const updatedEstablishment = {
      ...this.establishments[index],
      name: settings.name || this.establishments[index].name,
      address: settings.address || this.establishments[index].address,
      phone: settings.phone || this.establishments[index].phone,
      description: settings.description || this.establishments[index].description,
      primaryColor: settings.primary_color || this.establishments[index].primaryColor,
      secondaryColor: settings.secondary_color || this.establishments[index].secondaryColor,
      logo: settings.logo || this.establishments[index].logo,
      wifiSsid: settings.wifi_ssid || this.establishments[index].wifiSsid,
      wifiPassword: settings.wifi_password || this.establishments[index].wifiPassword,
    };

    this.establishments[index] = updatedEstablishment;
    return updatedEstablishment;
  }
}

export const settingsService = new SettingsService(); 