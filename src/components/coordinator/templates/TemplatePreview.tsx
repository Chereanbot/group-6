import { useState } from 'react';

interface TemplatePreviewProps {
  template: any;
}

export default function TemplatePreview({ template }: TemplatePreviewProps) {
  const [formData, setFormData] = useState({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">{template.name} Preview</h2>
      
      {template.content.sections.map((section) => (
        <div key={section.title} className="mb-6">
          <h3 className="text-lg font-medium mb-4">{section.title}</h3>
          <div className="space-y-4">
            {section.fields.map((field) => (
              <div key={field} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="text"
                  className="rounded-md border-gray-300"
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 