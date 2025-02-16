type ToastType = 'success' | 'error' | 'loading' | 'info' | 'warning' | 'default';

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
}

class ToastManager {
  private static instance: ToastManager;
  private container: HTMLDivElement | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.createContainer();
    }
  }

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  private createContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
      `;
      document.body.appendChild(this.container);
    }
  }

  public show(message: string, type: ToastType, options: ToastOptions = {}) {
    const { duration = 3000 } = options;

    const toast = document.createElement('div');
    const id = Date.now();
    toast.id = `toast-${id}`;
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      padding: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 0.375rem;
      background-color: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      min-width: 300px;
    `;

    // Enhanced colors and styles based on type
    switch (type) {
      case 'success':
        toast.style.borderLeft = '4px solid #10B981';
        toast.style.backgroundColor = '#ECFDF5';
        toast.style.color = '#065F46';
        break;
      case 'error':
        toast.style.borderLeft = '4px solid #EF4444';
        toast.style.backgroundColor = '#FEF2F2';
        toast.style.color = '#991B1B';
        break;
      case 'loading':
        toast.style.borderLeft = '4px solid #3B82F6';
        toast.style.backgroundColor = '#EFF6FF';
        toast.style.color = '#1E40AF';
        break;
      case 'info':
        toast.style.borderLeft = '4px solid #6B7280';
        toast.style.backgroundColor = '#F3F4F6';
        toast.style.color = '#1F2937';
        break;
      case 'warning':
        toast.style.borderLeft = '4px solid #F59E0B';
        toast.style.backgroundColor = '#FFFBEB';
        toast.style.color = '#92400E';
        break;
      default:
        toast.style.borderLeft = '4px solid #9CA3AF';
        toast.style.backgroundColor = '#FFFFFF';
        toast.style.color = '#374151';
    }

    toast.textContent = message;
    this.container?.appendChild(toast);

    // Return the toast ID if it's a loading toast
    if (type === 'loading') {
      return id;
    }

    // Auto-remove toast after duration
    setTimeout(() => {
      this.hide(id);
    }, duration);

    return id;
  }

  public hide(id: number) {
    const toast = document.getElementById(`toast-${id}`);
    if (toast) {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }
}

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

export const showToast = (message: string, type: ToastType, options?: ToastOptions) => {
  return ToastManager.getInstance().show(message, type, options);
};

export const hideToast = (id: number | string, type?: string) => {
  // Convert string id to number if needed
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  ToastManager.getInstance().hide(numericId);
}; 