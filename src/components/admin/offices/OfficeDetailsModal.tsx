"use client";

import { Dialog } from '@headlessui/react';
import { HiOutlineX } from 'react-icons/hi';
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
  description?: string;
  _count?: {
    lawyers: number;
    coordinators: number;
  };
}

interface OfficeDetailsModalProps {
  office: Office | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OfficeDetailsModal({
  office,
  isOpen,
  onClose
}: OfficeDetailsModalProps) {
  if (!office) return null;

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
        <Dialog.Panel className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <HiOutlineX className="h-6 w-6" />
            </button>
          </div>

          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Office Details
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Office Name
              </h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {office.name}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Location
              </h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {office.location}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Type
              </h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatType(office.type)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatStatus(office.status)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Contact Email
              </h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {office.contactEmail}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Contact Phone
              </h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {office.contactPhone}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Address
              </h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {office.address}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Capacity
              </h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {office.capacity}
              </p>
            </div>

            {office._count && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Staff Count
                </h3>
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    Lawyers: {office._count.lawyers}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    Coordinators: {office._count.coordinators}
                  </p>
                </div>
              </div>
            )}

            {office.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {office.description}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 