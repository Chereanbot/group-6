"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SettingCategory } from '@/types/security.types';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { UserRoleEnum } from '@prisma/client';
import { getSettings, updateSetting, updateBatchSettings } from '@/app/actions/settings';

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
}

interface SettingsContextType {
  settings: Setting[];
  isLoading: boolean;
  error: string | null;
  updateSetting: (id: string, data: Partial<Setting>) => Promise<void>;
  updateBatchSettings: (updates: { id: string; data: Partial<Setting> }[]) => Promise<void>;
  refreshSettings: () => Promise<void>;
  getCategorySettings: (categoryId: string) => Setting[];
}

const defaultContextValue: SettingsContextType = {
  settings: [],
  isLoading: true,
  error: null,
  updateSetting: async () => {},
  updateBatchSettings: async () => {},
  refreshSettings: async () => {},
  getCategorySettings: () => [],
};

const SettingsContext = createContext<SettingsContextType>(defaultContextValue);

// Cache settings for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let settingsCache: { data: Setting[]; timestamp: number } | null = null;

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<SettingsContextType, 'updateSetting' | 'updateBatchSettings' | 'refreshSettings' | 'getCategorySettings'>>(defaultContextValue);
  const { data: session } = useSession();

  const refreshSettings = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const data = await getSettings();
      setState({
        settings: data,
        isLoading: false,
        error: null,
      });
      // Update cache
      settingsCache = { data, timestamp: Date.now() };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setState({
        settings: [],
        isLoading: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    // Check if cache is valid
    if (settingsCache && Date.now() - settingsCache.timestamp < CACHE_DURATION) {
      setState({
        settings: settingsCache.data,
        isLoading: false,
        error: null,
      });
      return;
    }

    await refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    loadSettings();

    // Set up real-time updates (if you have WebSocket or Server-Sent Events)
    const eventSource = new EventSource('/api/settings/events');
    
    eventSource.onmessage = (event) => {
      const updatedSettings = JSON.parse(event.data);
      setState(prev => ({
        ...prev,
        settings: updatedSettings,
      }));
      settingsCache = { data: updatedSettings, timestamp: Date.now() };
    };

    return () => {
      eventSource.close();
    };
  }, [loadSettings]);

  const handleUpdateSetting = async (id: string, data: Partial<Setting>) => {
    try {
      // Optimistic update
      setState(prev => ({
        ...prev,
        settings: prev.settings.map(setting =>
          setting.id === id ? { ...setting, ...data } : setting
        ),
      }));

      await updateSetting(id, data);
      toast.success('Setting updated successfully');
    } catch (err) {
      // Revert optimistic update
      await refreshSettings();
      throw err;
    }
  };

  const handleBatchUpdate = async (updates: { id: string; data: Partial<Setting> }[]) => {
    try {
      // Optimistic update
      setState(prev => ({
        ...prev,
        settings: prev.settings.map(setting => {
          const update = updates.find(u => u.id === setting.id);
          return update ? { ...setting, ...update.data } : setting;
        }),
      }));

      await updateBatchSettings(updates);
      toast.success('Settings updated successfully');
    } catch (err) {
      // Revert optimistic update
      await refreshSettings();
      throw err;
    }
  };

  const getCategorySettings = useCallback((categoryId: string) => {
    return state.settings.filter(setting => setting.categoryId === categoryId);
  }, [state.settings]);

  const contextValue: SettingsContextType = {
    ...state,
    updateSetting: handleUpdateSetting,
    updateBatchSettings: handleBatchUpdate,
    refreshSettings,
    getCategorySettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 