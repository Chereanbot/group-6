import { useState } from 'react';
import { UserRoleEnum } from '@prisma/client';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface AddUserModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

interface UserFormData {
  email: string;
  fullName: string;
  password: string;
  role: UserRoleEnum;
  phone?: string;
  specializations?: string[];
  experience?: number;
  company?: string;
  address?: string;
}

export default function AddUserModal({ onClose, onSubmit }: AddUserModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    fullName: '',
    password: '',
    role: UserRoleEnum.CLIENT,
    phone: '',
    specializations: [],
    experience: 0,
    company: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.email || !formData.password || !formData.fullName) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Clean up the data before submission
      const submitData = {
        ...formData,
        // Remove undefined or empty values
        phone: formData.phone || undefined,
        specializations: formData.role === UserRoleEnum.LAWYER ? formData.specializations : undefined,
        experience: formData.role === UserRoleEnum.LAWYER ? formData.experience : undefined,
        company: formData.role === UserRoleEnum.CLIENT ? formData.company : undefined,
        address: formData.role === UserRoleEnum.CLIENT ? formData.address : undefined,
      };

      const response = await onSubmit(submitData);
      
      if (formData.role === UserRoleEnum.COORDINATOR) {
        toast.success('Basic coordinator account created. Please complete the profile setup.');
        router.push(`/admin/coordinators/new?userId=${response?.data?.user?.id}`);
      } else if (formData.role === UserRoleEnum.LAWYER) {
        toast.success('Basic lawyer account created. Please complete the profile setup.');
        router.push(`/admin/lawyers/new?userId=${response?.data?.user?.id}`);
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const renderStepOne = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRoleEnum })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value={UserRoleEnum.CLIENT}>Client</option>
          <option value={UserRoleEnum.LAWYER}>Lawyer</option>
          <option value={UserRoleEnum.COORDINATOR}>Coordinator</option>
          <option value={UserRoleEnum.ADMIN}>Admin</option>
          <option value={UserRoleEnum.SUPER_ADMIN}>Super Admin</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {formData.role === UserRoleEnum.COORDINATOR && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Note: After creating the coordinator account, you will be redirected to complete their profile setup.
          </p>
        </div>
      )}

      {formData.role === UserRoleEnum.LAWYER && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Note: After creating the lawyer account, you will be redirected to complete their profile setup.
          </p>
        </div>
      )}
    </div>
  );

  const renderStepTwo = () => {
    switch (formData.role) {
      case UserRoleEnum.LAWYER:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Specializations</label>
              <select
                multiple
                value={formData.specializations}
                onChange={(e) => setFormData({
                  ...formData,
                  specializations: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="CRIMINAL">Criminal Law</option>
                <option value="CIVIL">Civil Law</option>
                <option value="CORPORATE">Corporate Law</option>
                <option value="FAMILY">Family Law</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Years of Experience</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        );

      case UserRoleEnum.CLIENT:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company (Optional)</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const shouldShowStepTwo = formData.role === UserRoleEnum.LAWYER || formData.role === UserRoleEnum.CLIENT;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">Add New User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? renderStepOne() : renderStepTwo()}

          <div className="flex justify-between">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Back
              </button>
            )}
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Cancel
              </button>
              
              {step === 1 ? (
                shouldShowStepTwo ? (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                    disabled={!formData.email || !formData.fullName || !formData.password || loading}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                    disabled={!formData.email || !formData.fullName || !formData.password || loading}
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                )
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 