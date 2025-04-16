import { mockEstablishments } from '@/lib/mocks/data';

export interface WiFiSettings {
  wifiSsid: string;
  wifiPassword: string;
}

class WiFiService {
  async getWiFiSettings(establishmentId: string): Promise<WiFiSettings> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const establishment = mockEstablishments.find(e => e.id === establishmentId);
    if (!establishment) {
      throw new Error('Establishment not found');
    }

    return {
      wifiSsid: establishment.wifiSsid || '',
      wifiPassword: establishment.wifiPassword || '',
    };
  }

  async updateWiFiSettings(establishmentId: string, settings: WiFiSettings): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const establishment = mockEstablishments.find(e => e.id === establishmentId);
    if (!establishment) {
      throw new Error('Establishment not found');
    }

    // Update the establishment's WiFi settings
    establishment.wifiSsid = settings.wifiSsid;
    establishment.wifiPassword = settings.wifiPassword;
  }
}

export const wifiService = new WiFiService(); 