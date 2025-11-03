import { create } from 'zustand';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  open: boolean;
}

interface UiState {
  loading: boolean;
  notification: NotificationState;
  setLoading: (loading: boolean) => void;
  showNotification: (message: string, type: NotificationState['type']) => void;
  hideNotification: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  loading: false,
  notification: {
    message: '',
    type: 'info',
    open: false,
  },
  
  setLoading: (loading) => {
    set({ loading });
  },
  
  showNotification: (message, type) => {
    set({
      notification: {
        message,
        type,
        open: true,
      },
    });
  },
  
  hideNotification: () => {
    set((state) => ({
      notification: {
        ...state.notification,
        open: false,
      },
    }));
  },
}));
