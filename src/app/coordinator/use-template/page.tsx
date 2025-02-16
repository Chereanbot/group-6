"use client";

import { useState } from 'react';
import TemplateManager from '@/components/coordinator/templates/TemplateManager';
import TemplateEditor from '@/components/coordinator/templates/TemplateEditor';
import TemplatePreview from '@/components/coordinator/templates/TemplatePreview';

export default function TemplatesPage() {
  const [activeView, setActiveView] = useState<'manager' | 'editor' | 'preview'>('manager');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Template Management</h1>
        <p className="text-gray-600 mt-2">
          Create and manage templates for cases, clients, and documents
        </p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveView('manager')}
          className={`px-4 py-2 rounded-lg ${
            activeView === 'manager' ? 'bg-primary-500 text-white' : 'bg-gray-100'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveView('editor')}
          className={`px-4 py-2 rounded-lg ${
            activeView === 'editor' ? 'bg-primary-500 text-white' : 'bg-gray-100'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveView('preview')}
          className={`px-4 py-2 rounded-lg ${
            activeView === 'preview' ? 'bg-primary-500 text-white' : 'bg-gray-100'
          }`}
        >
          Preview
        </button>
      </div>

      {activeView === 'manager' && <TemplateManager />}
      {activeView === 'editor' && selectedTemplate && (
        <TemplateEditor template={selectedTemplate} onSave={() => {}} onCancel={() => {}} />
      )}
      {activeView === 'preview' && selectedTemplate && (
        <TemplatePreview template={selectedTemplate} />
      )}
    </div>
  );
} 