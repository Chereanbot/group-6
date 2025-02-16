"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineDocumentAdd,
  HiOutlineUpload,
  HiOutlineExclamation
} from 'react-icons/hi';

const caseTypes = [
  'Civil Litigation',
  'Criminal Defense',
  'Family Law',
  'Property Dispute',
  'Employment Law',
  'Contract Dispute',
  'Other'
];

const NewCase = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    caseType: '',
    title: '',
    description: '',
    incidentDate: '',
    parties: {
      plaintiffs: [''],
      defendants: ['']
    },
    documents: [],
    urgencyLevel: 'medium',
    preferredLanguage: 'english'
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic
  };

  const addParty = (type: 'plaintiffs' | 'defendants') => {
    setFormData(prev => ({
      ...prev,
      parties: {
        ...prev.parties,
        [type]: [...prev.parties[type], '']
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">File New Case</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please provide detailed information about your case
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                ${step >= stepNumber 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'}`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-24 h-1 mx-2
                  ${step > stepNumber 
                    ? 'bg-primary-500' 
                    : 'bg-gray-200 dark:bg-gray-700'}`} 
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm">Basic Info</span>
          <span className="text-sm">Parties</span>
          <span className="text-sm">Documents</span>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Case Type</label>
            <select
              value={formData.caseType}
              onChange={(e) => setFormData({...formData, caseType: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select case type</option>
              {caseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Case Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter a brief title for your case"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 h-32"
              placeholder="Provide detailed information about your case"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Incident Date</label>
            <input
              type="date"
              value={formData.incidentDate}
              onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg
                hover:bg-primary-600 transition-colors"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Parties Information */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Plaintiffs */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Plaintiffs</h3>
              <button
                onClick={() => addParty('plaintiffs')}
                className="text-primary-500 hover:text-primary-600"
              >
                + Add Plaintiff
              </button>
            </div>
            {formData.parties.plaintiffs.map((plaintiff, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  value={plaintiff}
                  onChange={(e) => {
                    const newPlaintiffs = [...formData.parties.plaintiffs];
                    newPlaintiffs[index] = e.target.value;
                    setFormData({
                      ...formData,
                      parties: {
                        ...formData.parties,
                        plaintiffs: newPlaintiffs
                      }
                    });
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={`Plaintiff ${index + 1}`}
                />
              </div>
            ))}
          </div>

          {/* Defendants */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Defendants</h3>
              <button
                onClick={() => addParty('defendants')}
                className="text-primary-500 hover:text-primary-600"
              >
                + Add Defendant
              </button>
            </div>
            {formData.parties.defendants.map((defendant, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  value={defendant}
                  onChange={(e) => {
                    const newDefendants = [...formData.parties.defendants];
                    newDefendants[index] = e.target.value;
                    setFormData({
                      ...formData,
                      parties: {
                        ...formData.parties,
                        defendants: newDefendants
                      }
                    });
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={`Defendant ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg
                hover:bg-primary-600 transition-colors"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Document Upload */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8">
            <div className="text-center">
              <HiOutlineUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-primary-500 hover:text-primary-600">
                    Upload files
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                PDF, DOC, DOCX, JPG up to 10MB each
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              onClick={() => {
                // Handle form submission
                console.log(formData);
              }}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg
                hover:bg-primary-600 transition-colors"
            >
              Submit Case
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NewCase; 