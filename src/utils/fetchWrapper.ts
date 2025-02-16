class FetchWrapper {
  private async getAuthHeaders(): Promise<HeadersInit> {
    return {
      'Content-Type': 'application/json'
    };
  }

  async get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: await this.getAuthHeaders(),
      credentials: 'include' // Important for sending cookies
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async post<T>(url: string, data: any): Promise<T> {
    const headers = data instanceof FormData 
      ? {} 
      : await this.getAuthHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include', // Important for sending cookies
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async patch<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: await this.getAuthHeaders(),
      credentials: 'include', // Important for sending cookies
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async delete(url: string): Promise<void> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
      credentials: 'include', // Important for sending cookies
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

export const fetchWrapper = new FetchWrapper(); 