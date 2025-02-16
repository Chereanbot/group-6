"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  type: 'CASE' | 'CLIENT' | 'DOCUMENT' | 'REPORT';
  content: any;
  isDefault: boolean;
}

interface TemplateContextType {
  templates: Record<string, Template[]>;
  loading: boolean;
  error: string | null;
  createTemplate: (template: Partial<Template>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }) {
  const [templates, setTemplates] = useState<Record<string, Template[]>>({
    CASE: [],
    CLIENT: [],
    DOCUMENT: [],
    REPORT: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      
      // Initialize with empty arrays for each type
      const organized = {
        CASE: [],
        CLIENT: [],
        DOCUMENT: [],
        REPORT: []
      };
      
      // Organize templates by type
      data.forEach(template => {
        organized[template.type].push(template);
      });
      
      setTemplates(organized);
      setError(null);
    } catch (err) {
      setError('Failed to load templates');
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Partial<Template>) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });

      if (!response.ok) throw new Error('Failed to create template');
      
      await refreshTemplates();
      toast.success('Template created successfully');
    } catch (err) {
      toast.error('Failed to create template');
      throw err;
    }
  };

  const updateTemplate = async (id: string, template: Partial<Template>) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });

      if (!response.ok) throw new Error('Failed to update template');
      
      await refreshTemplates();
      toast.success('Template updated successfully');
    } catch (err) {
      toast.error('Failed to update template');
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete template');
      
      await refreshTemplates();
      toast.success('Template deleted successfully');
    } catch (err) {
      toast.error('Failed to delete template');
      throw err;
    }
  };

  useEffect(() => {
    refreshTemplates();
  }, []);

  return (
    <TemplateContext.Provider
      value={{
        templates,
        loading,
        error,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        refreshTemplates
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
}; 