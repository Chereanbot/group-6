"use client";

import { Dialog } from '@headlessui/react';
import { HiOutlineX, HiOfficeBuilding, HiLocationMarker, HiMail, HiPhone, 
  HiUsers, HiOutlineBriefcase, HiOutlineUserGroup } from 'react-icons/hi';
import { OfficeType, OfficeStatus } from '@prisma/client';

interface Office {
  id: string;
  name: string;
  location: string;
  type: OfficeType;
  status: OfficeStatus;
  contactEmail: string;
  contactPhone: string;
  address: string;
  capacity: number;
  metrics: {
    lawyers: {
      total: number;
      active: number;
    };
    coordinators: {
      total: number;
      active: number;
      capacity: number;
      available: number;
    };
    clients: number;
    cases: {
      total: number;
      active: number;
      completed: number;
      pending: number;
  };
  };
  coordinators: Array<{
    id: string;
    fullName: string;
    email: string;
    status: string;
  }>;
  lawyers: Array<{
    id: string;
    fullName: string;
    status: string;
    caseCount: number;
  }>;
}

interface OfficeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  office: Office;
}

export default function OfficeDetailsModal({
  isOpen,
  onClose,
  office
}: OfficeDetailsModalProps) {
  const getStatusColor = (status: OfficeStatus) => {
    switch (status) {
      case OfficeStatus.ACTIVE:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case OfficeStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case OfficeStatus.MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatStatus = (status: OfficeStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatType = (type: OfficeType) => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <HiOutlineX className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
            <div>
                <Dialog.Title className="text-2xl font-semibold text-gray-900 dark:text-white">
                {office.name}
                </Dialog.Title>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Office ID: {office.id}
              </p>
            </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(office.status)}`}>
                  <span className="h-2 w-2 rounded-full bg-current mr-2"></span>
                  {formatStatus(office.status)}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {formatType(office.type)}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <HiLocationMarker className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-base text-gray-900 dark:text-white">{office.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <HiMail className="h-5 w-5 text-gray-400" />
            <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-base text-gray-900 dark:text-white">{office.contactEmail}</p>
                  </div>
            </div>
                <div className="flex items-center space-x-3">
                  <HiPhone className="h-5 w-5 text-gray-400" />
            <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-base text-gray-900 dark:text-white">{office.contactPhone}</p>
                  </div>
                </div>
            </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <HiUsers className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Staff</h3>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Lawyers: {office.metrics.lawyers.active} active
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Coordinators: {office.metrics.coordinators.active} / {office.metrics.coordinators.capacity}
              </p>
            </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <HiOutlineBriefcase className="h-5 w-5 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Cases</h3>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total: {office.metrics.cases.total}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Active: {office.metrics.cases.active}
              </p>
            </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <HiOutlineUserGroup className="h-5 w-5 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Clients</h3>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total: {office.metrics.clients}
              </p>
            </div>
                </div>
              </div>
            </div>

            {/* Staff Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lawyers */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Lawyers</h3>
                <div className="space-y-3">
                  {office.lawyers.map(lawyer => (
                    <div key={lawyer.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{lawyer.fullName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lawyer.caseCount} active cases
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lawyer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lawyer.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coordinators */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Coordinators</h3>
                <div className="space-y-3">
                  {office.coordinators.map(coordinator => (
                    <div key={coordinator.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{coordinator.fullName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{coordinator.email}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          coordinator.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {coordinator.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 