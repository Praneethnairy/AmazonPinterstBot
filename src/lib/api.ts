import axios, { AxiosInstance, AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = 'https://amazon-pinterest-bot-backend.onrender.com';

export interface Credentials {
  pinterest_token: string;
  amazon_tag: string;
  session_password: string;
}

export interface AutomationConfig {
  categories: string[];
  max_products_per_category: number;
  post_interval_seconds: number;
  daily_pin_limit: number;
  min_rating: number;
  min_reviews: number;
  price_range_min: number;
  price_range_max: number;
}

export interface AutomationRequest {
  credentials: Credentials;
  config: AutomationConfig;
}

export interface JobStatus {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    current_category?: string;
    completed_categories?: number;
    total_categories?: number;
    overall_progress?: number;
  };
  created_at: string;
  updated_at: string;
  results?: {
    total_products_found: number;
    total_pins_created: number;
    total_errors: number;
    category_results: Record<string, any>;
  };
  error?: string;
}

export interface SessionResponse {
  session_id: string;
  encrypted_credentials: string;
  pinterest_boards: Array<{
    id: string;
    name: string;
  }>;
  message: string;
}

export interface JobResponse {
  job_id: string;
  status: string;
  message: string;
}

class ApiClient {
  private client: AxiosInstance;
  private sessionId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      if (this.sessionId) {
        config.headers.Authorization = `Bearer ${this.sessionId}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.sessionId = null;
          // Clear session from localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('session_id');
            localStorage.removeItem('encrypted_credentials');
          }
        }
        return Promise.reject(error);
      }
    );

    // Load session from localStorage on initialization
    if (typeof window !== 'undefined') {
      const savedSessionId = localStorage.getItem('session_id');
      if (savedSessionId) {
        this.sessionId = savedSessionId;
      }
    }
  }

  // Encryption utilities
  private encryptData(data: string, password: string): string {
    return CryptoJS.AES.encrypt(data, password).toString();
  }

  private decryptData(encryptedData: string, password: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Session management
  async startSession(credentials: Credentials): Promise<SessionResponse> {
    try {
      const response: AxiosResponse<SessionResponse> = await this.client.post(
        '/api/start-session',
        credentials
      );

      this.sessionId = response.data.session_id;

      // Store session info in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('session_id', this.sessionId);
        localStorage.setItem('encrypted_credentials', response.data.encrypted_credentials);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to start session');
    }
  }

  async endSession(): Promise<void> {
    try {
      if (this.sessionId) {
        await this.client.delete('/api/session');
      }
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      this.sessionId = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('session_id');
        localStorage.removeItem('encrypted_credentials');
      }
    }
  }

  // Automation management
  async startAutomation(request: AutomationRequest): Promise<JobResponse> {
    try {
      const response: AxiosResponse<JobResponse> = await this.client.post(
        '/api/start-automation',
        request
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to start automation');
    }
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    try {
      const response: AxiosResponse<JobStatus> = await this.client.get(
        `/api/job-status/${jobId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get job status');
    }
  }

  async getUserJobs(): Promise<JobStatus[]> {
    try {
      const response: AxiosResponse<{ jobs: JobStatus[] }> = await this.client.get('/api/jobs');
      return response.data.jobs;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get user jobs');
    }
  }

  async cancelJob(jobId: string): Promise<void> {
    try {
      await this.client.delete(`/api/job/${jobId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to cancel job');
    }
  }

  // Utility methods
  async getPrivacyPolicy(): Promise<string> {
    try {
      const response: AxiosResponse<{ privacy_policy: string }> = await this.client.get(
        '/api/privacy-policy'
      );
      return response.data.privacy_policy;
    } catch (error: any) {
      throw new Error('Failed to load privacy policy');
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await this.client.get('/api/health');
      return response.data;
    } catch (error: any) {
      throw new Error('Health check failed');
    }
  }

  // Session state
  isAuthenticated(): boolean {
    return this.sessionId !== null;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  // Get stored encrypted credentials
  getStoredCredentials(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('encrypted_credentials');
    }
    return null;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Utility functions
export const defaultAutomationConfig: AutomationConfig = {
  categories: ['electronics', 'home', 'fashion', 'health'],
  max_products_per_category: 5,
  post_interval_seconds: 300,
  daily_pin_limit: 50,
  min_rating: 4.0,
  min_reviews: 10,
  price_range_min: 5,
  price_range_max: 500,
};

export const categoryOptions = [
  { value: 'electronics', label: 'Electronics & Gadgets' },
  { value: 'home', label: 'Home & Kitchen' },
  { value: 'fashion', label: 'Fashion & Style' },
  { value: 'health', label: 'Health & Beauty' },
  { value: 'books', label: 'Books & Education' },
  { value: 'sports', label: 'Sports & Outdoors' },
];

export const formatJobStatus = (status: string): string => {
  switch (status) {
    case 'queued':
      return 'Queued';
    case 'running':
      return 'Running';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'queued':
      return 'text-yellow-600 bg-yellow-100';
    case 'running':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
