"use client";

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineDotsVertical } from 'react-icons/hi';

interface TemplateEditorProps {
  template: any;
  onSave: (template: any) => void;
  onCancel: () => void;
}

export default function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [sections, setSections] = useState(template.content.sections);
  const [templateName, setTemplateName] = useState(template.name);
  const [isDefault, setIsDefault] = useState(template.isDefault);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSections(items);
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: 'New Section',
        fields: ['New Field']
      }
    ]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const addField = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields.push('New Field');
    setSections(newSections);
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields.splice(fieldIndex, 1);
    setSections(newSections);
  };

  const updateSectionTitle = (index: number, title: string) => {
    const newSections = [...sections];
    newSections[index].title = title;
    setSections(newSections);
  };

  const updateField = (sectionIndex: number, fieldIndex: number, value: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields[fieldIndex] = value;
    setSections(newSections);
  };

  const handleSave = () => {
    onSave({
      ...template,
      name: templateName,
      isDefault,
      content: { sections }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6 space-y-4">
        <input
          type="text"
          className="text-2xl font-bold w-full border-none focus:ring-0"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded text-primary-500"
            />
            <span className="text-sm text-gray-600">Set as default template</span>
          </label>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {sections.map((section, sectionIndex) => (
                <Draggable 
                  key={`${section.title}-${sectionIndex}`}
                  draggableId={`${section.title}-${sectionIndex}`}
                  index={sectionIndex}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div {...provided.dragHandleProps}>
                            <HiOutlineDotsVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="text-lg font-medium bg-transparent border-none focus:ring-0"
                            value={section.title}
                            onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                          />
                        </div>
                        <button
                          onClick={() => removeSection(sectionIndex)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {section.fields.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="flex-1 rounded-md border-gray-300"
                              value={field}
                              onChange={(e) => updateField(sectionIndex, fieldIndex, e.target.value)}
                            />
                            <button
                              onClick={() => removeField(sectionIndex, fieldIndex)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addField(sectionIndex)}
                          className="text-sm text-primary-500 hover:text-primary-600"
                        >
                          <HiOutlinePlus className="w-4 h-4 inline mr-1" />
                          Add Field
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="mt-6 flex items-center space-x-4">
        <button
          onClick={addSection}
          className="flex items-center px-4 py-2 text-primary-500 border border-primary-500 rounded-lg"
        >
          <HiOutlinePlus className="w-5 h-5 mr-2" />
          Add Section
        </button>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg"
        >
          Save Template
        </button>
      </div>
    </div>
  );
} 