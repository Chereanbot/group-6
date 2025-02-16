"use client";

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { ServiceRequest } from '@/types/service.types';
import { User } from '@/types/user.types';
import { userService } from '@/services/user.service';
import { HiOutlineSearch } from 'react-icons/hi';

interface AssignLawyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  onAssign: (requestId: string, lawyerId: string) => Promise<void>;
}

export function AssignLawyerModal({ 
  isOpen, 
  onClose, 
  request, 
  onAssign 
}: AssignLawyerModalProps) {
  const [lawyers, setLawyers] = useState<User[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadLawyers();
    }
  }, [isOpen]);

  const loadLawyers = async () => {
    try {
      setIsLoading(true);
      const availableLawyers = await userService.getLawyers({ available: true });
      setLawyers(availableLawyers);
    } catch (error) {
      console.error('Error loading lawyers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedLawyer) return;
    
    try {
      await onAssign(request.id, selectedLawyer);
      onClose();
    } catch (error) {
      console.error('Error assigning lawyer:', error);
    }
  };

  const filteredLawyers = lawyers.filter(lawyer => 
    lawyer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Lawyer">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search lawyers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Lawyers List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLawyers.map((lawyer) => (
                <label
                  key={lawyer.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer
                    ${selectedLawyer === lawyer.id 
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500' 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } border transition-colors`}
                >
                  <input
                    type="radio"
                    name="lawyer"
                    value={lawyer.id}
                    checked={selectedLawyer === lawyer.id}
                    onChange={(e) => setSelectedLawyer(e.target.value)}
                    className="hidden"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {lawyer.fullName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {lawyer.email}
                    </p>
                  </div>
                </label>
              ))}
              {filteredLawyers.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No lawyers found
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedLawyer}
            className={`px-4 py-2 rounded-lg text-white
              ${selectedLawyer
                ? 'bg-primary-500 hover:bg-primary-600'
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
              }`}
          >
            Assign
          </button>
        </div>
      </div>
    </Modal>
  );
} 