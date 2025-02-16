"use client";

import { useState, useEffect } from 'react';
import { AppealList } from '@/components/admin/appeals/AppealList';
import { AppealStats } from '@/components/admin/appeals/AppealStats';
import { AppealFilters } from '@/components/admin/appeals/AppealFilters';
import { CreateAppealModal } from '@/components/admin/appeals/CreateAppealModal';
import { appealService } from '@/services/appeal.service';
import { Appeal, AppealFilters as AppealFiltersType, AppealStats as AppealStatsType } from '@/types/appeal.types';
import { toast } from 'react-hot-toast';

export default function AppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [stats, setStats] = useState<AppealStatsType | null>(null);
  const [filters, setFilters] = useState<AppealFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appealsData, statsData] = await Promise.all([
        appealService.getAppeals(filters),
        appealService.getAppealStats()
      ]);
      setAppeals(appealsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading appeals:', error);
      toast.error('Failed to load appeals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppeal = async (data: CreateAppealDto) => {
    try {
      await appealService.createAppeal(data);
      await loadData();
      setIsCreateModalOpen(false);
      toast.success('Appeal created successfully');
    } catch (error) {
      console.error('Error creating appeal:', error);
      toast.error('Failed to create appeal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Appeals Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Create Appeal
        </button>
      </div>

      {stats && <AppealStats stats={stats} />}

      <AppealFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      <AppealList
        appeals={appeals}
        loading={loading}
        onRefresh={loadData}
      />

      <CreateAppealModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateAppeal}
      />
    </div>
  );
} 