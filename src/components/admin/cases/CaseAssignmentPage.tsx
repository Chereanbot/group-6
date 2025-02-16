"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CaseAssignmentTable } from './CaseAssignmentTable';
import { AssignCaseModal } from './AssignCaseModal';
import { EditCaseModal } from './EditCaseModal';
import { caseService } from '@/services/case.service';
import { Case, User } from '@/types/case.types';
import { toast } from 'react-hot-toast';

export default function CaseAssignmentPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [lawyers, setLawyers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<Case | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [casesData, lawyersData] = await Promise.all([
        caseService.getAllCases(),
        caseService.getLawyers()
      ]);
      setCases(casesData);
      setLawyers(lawyersData);
    } catch (error) {
      setError('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCase = (caseIdOrIds: string | string[]) => {
    setSelectedCases(prev => {
      if (Array.isArray(caseIdOrIds)) {
        return caseIdOrIds;
      }
      if (prev.includes(caseIdOrIds)) {
        return prev.filter(id => id !== caseIdOrIds);
      }
      return [...prev, caseIdOrIds];
    });
  };

  const handleAssign = async (caseId: string, lawyerId: string, isReassignment = false) => {
    try {
      await caseService.assignCase(caseId, lawyerId, isReassignment);
      await loadData();
      setIsModalOpen(false);
      setSelectedCases([]);
      toast.success(isReassignment ? 'Case reassigned successfully' : 'Case assigned successfully');
    } catch (error: any) {
      console.error('Error assigning case:', error);
      toast.error(error.message || 'Failed to assign case. Please try again.');
    }
  };

  const handleEdit = async (caseId: string, data: Partial<Case>) => {
    try {
      await caseService.updateCase(caseId, data);
      await loadData();
      toast.success('Case updated successfully');
    } catch (error) {
      console.error('Error updating case:', error);
      toast.error('Failed to update case. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Case Assignment</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          disabled={selectedCases.length === 0}
        >
          Assign Selected Cases ({selectedCases.length})
        </button>
      </div>

      <CaseAssignmentTable
        cases={cases}
        selectedCases={selectedCases}
        onSelectCase={handleSelectCase}
        onAssign={(caseData) => {
          setSelectedCase(caseData);
          setIsModalOpen(true);
        }}
        onEdit={(caseData) => {
          setCaseToEdit(caseData);
          setIsEditModalOpen(true);
        }}
      />

      <AssignCaseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCase(null);
        }}
        onAssign={handleAssign}
        lawyers={lawyers}
        selectedCase={selectedCase}
        selectedCases={selectedCases}
        cases={cases}
      />

      <EditCaseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCaseToEdit(null);
        }}
        onSave={handleEdit}
        caseData={caseToEdit}
        lawyers={lawyers}
      />
    </div>
  );
} 