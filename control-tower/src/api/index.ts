import axios, { AxiosInstance, AxiosError } from 'axios';
import type { 
  Academy, PixelConfig, ButtonConfig, Batch, AppointmentSettings,
  AppointmentSlot, PixelEvent, ButtonAnalytics, PixelAnalytics, EmbedCode 
} from '@/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

class LynkAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('lynk_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Error interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('lynk_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Academy
  async getAcademy(id: string): Promise<Academy> {
    const { data } = await this.client.get(`/academies/${id}`);
    return data;
  }

  async updateAcademy(id: string, updates: Partial<Academy>): Promise<Academy> {
    const { data } = await this.client.patch(`/academies/${id}`, updates);
    return data;
  }

  // Pixel Config
  async getPixelConfig(academyId: string): Promise<PixelConfig> {
    const { data } = await this.client.get(`/academies/${academyId}/pixel-config`);
    return data;
  }

  async updatePixelConfig(academyId: string, config: Partial<PixelConfig>): Promise<PixelConfig> {
    const { data } = await this.client.patch(`/academies/${academyId}/pixel-config`, config);
    return data;
  }

  async getPixelEvents(academyId: string, params: {
    startDate?: string;
    endDate?: string;
    eventName?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: PixelEvent[]; total: number }> {
    const { data } = await this.client.get(`/academies/${academyId}/pixel-events`, { params });
    return data;
  }

  async getPixelAnalytics(academyId: string, params: {
    startDate: string;
    endDate: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<PixelAnalytics[]> {
    const { data } = await this.client.get(`/academies/${academyId}/pixel-analytics`, { params });
    return data;
  }

  // Button Config
  async getButtonConfig(academyId: string): Promise<ButtonConfig> {
    const { data } = await this.client.get(`/academies/${academyId}/button-config`);
    return data;
  }

  async updateButtonConfig(academyId: string, config: Partial<ButtonConfig>): Promise<ButtonConfig> {
    const { data } = await this.client.patch(`/academies/${academyId}/button-config`, config);
    return data;
  }

  async getButtonAnalytics(academyId: string, params: {
    startDate: string;
    endDate: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<ButtonAnalytics[]> {
    const { data } = await this.client.get(`/academies/${academyId}/button-analytics`, { params });
    return data;
  }

  // Batches
  async getBatches(academyId: string, params?: { active?: boolean }): Promise<Batch[]> {
    const { data } = await this.client.get(`/academies/${academyId}/batches`, { params });
    return data;
  }

  async updateBatch(academyId: string, batchId: string, updates: Partial<Batch>): Promise<Batch> {
    const { data } = await this.client.patch(`/academies/${academyId}/batches/${batchId}`, updates);
    return data;
  }

  // Appointment Settings
  async getAppointmentSettings(academyId: string): Promise<AppointmentSettings> {
    const { data } = await this.client.get(`/academies/${academyId}/appointment-settings`);
    return data;
  }

  async updateAppointmentSettings(academyId: string, settings: Partial<AppointmentSettings>): Promise<AppointmentSettings> {
    const { data } = await this.client.patch(`/academies/${academyId}/appointment-settings`, settings);
    return data;
  }

  async getAppointmentSlots(academyId: string, params: {
    startDate: string;
    endDate: string;
  }): Promise<AppointmentSlot[]> {
    const { data } = await this.client.get(`/academies/${academyId}/appointment-slots`, { params });
    return data;
  }

  // Embed Code
  async getEmbedCode(academyId: string): Promise<EmbedCode> {
    const { data } = await this.client.get(`/academies/${academyId}/embed-code`);
    return data;
  }

  // Test Events
  async sendTestPixelEvent(academyId: string, event: {
    eventName: string;
    eventData?: Record<string, any>;
  }): Promise<void> {
    await this.client.post(`/academies/${academyId}/pixel-test`, event);
  }
}

export const api = new LynkAPI();
export default api;