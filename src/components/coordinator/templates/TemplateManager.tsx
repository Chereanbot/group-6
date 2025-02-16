"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTemplate, HiOutlineTrash, HiOutlineDocumentText, HiOutlineClipboardList, HiOutlineUserGroup, HiOutlineScale } from 'react-icons/hi';
import { useTemplates } from '@/contexts/TemplateContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Template {
  id: string;
  name: string;
  type: 'CASE' | 'CLIENT' | 'DOCUMENT' | 'REPORT';
  content: any;
  isDefault: boolean;
}

export default function TemplateManager() {
  const { 
    templates, 
    loading, 
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate 
  } = useTemplates();
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const getTemplateCount = (type: string) => {
    return templates[type]?.length || 0;
  };

  const handleCreateTemplate = async (type: string) => {
    try {
      await createTemplate({
        name: 'New Template',
        type,
        content: {
          sections: [
            {
              title: 'New Section',
              fields: ['New Field']
            }
          ]
        },
        isDefault: false
      });
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleSaveTemplate = async (template: Template) => {
    try {
      await updateTemplate(template.id, template);
      setIsEditing(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId);
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TemplateCard
          title="Case Templates"
          description="Legal case management templates"
          icon={HiOutlineScale}
          count={getTemplateCount('CASE')}
          onClick={() => setActiveCategory('CASE')}
        />
        
        <TemplateCard
          title="Client Templates"
          description="Client profile and management forms"
          icon={HiOutlineUserGroup}
          count={getTemplateCount('CLIENT')}
          onClick={() => setActiveCategory('CLIENT')}
        />
        
        <TemplateCard
          title="Document Templates"
          description="Legal document and form templates"
          icon={HiOutlineDocumentText}
          count={getTemplateCount('DOCUMENT')}
          onClick={() => setActiveCategory('DOCUMENT')}
        />
        
        <TemplateCard
          title="Report Templates"
          description="Case and financial reporting templates"
          icon={HiOutlineClipboardList}
          count={getTemplateCount('REPORT')}
          onClick={() => setActiveCategory('REPORT')}
        />
      </div>

      {activeCategory && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Templates
            </h2>
            <button
              onClick={() => handleCreateTemplate(activeCategory)}
              className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg"
            >
              <HiOutlinePlus className="w-5 h-5 mr-2" />
              Create New Template
            </button>
          </div>

          {templates[activeCategory]?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates[activeCategory].map((template) => (
                <TemplateListItem
                  key={template.id}
                  template={template}
                  onSelect={setSelectedTemplate}
                  onDelete={() => handleDeleteTemplate(template.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No templates found. Create your first template!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ title, description, icon: Icon, count, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-primary-500" />
        <span className="text-sm font-medium text-gray-500">{count} templates</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  );
}

function TemplateListItem({ template, onSelect, onDelete }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onSelect(template)}
            className="text-primary-500 hover:text-primary-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="text-red-500 hover:text-red-600"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {template.content.sections.length} sections
      </div>
      {template.isDefault && (
        <span className="mt-2 inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-600 rounded">
          Default Template
        </span>
      )}
    </div>
  );
} 