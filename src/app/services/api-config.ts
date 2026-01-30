import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly apiBaseUrl = 'http://localhost:3000';

  constructor() {}

  /**
   * Get the base API URL
   */
  getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }

  /**
   * Get the tasks endpoint URL
   */
  getTasksUrl(): string {
    return `${this.apiBaseUrl}/tasks`;
  }

  /**
   * Get a specific task endpoint URL
   */
  getTaskUrl(id: string | number): string {
    return `${this.apiBaseUrl}/tasks/${id}`;
  }

  /**
   * Get the habits endpoint URL
   */
  getHabitsUrl(): string {
    return `${this.apiBaseUrl}/habits`;
  }

  /**
   * Get a specific habit endpoint URL
   */
  getHabitUrl(id: string | number): string {
    return `${this.apiBaseUrl}/habits/${id}`;
  }

  /**
   * Get the statistics endpoint URL
   */
  getStatisticsUrl(): string {
    return `${this.apiBaseUrl}/statistics`;
  }

  /**
   * Get a specific statistics entry endpoint URL
   */
  getStatisticUrl(id: string | number): string {
    return `${this.apiBaseUrl}/statistics/${id}`;
  }
}
