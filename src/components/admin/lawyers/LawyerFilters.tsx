import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { UserStatus } from '@prisma/client';
import { Search, X } from 'lucide-react';

interface FiltersState {
  specialization: string;
  status: string;
  office: string;
  searchTerm: string;
  experience: string;
  caseLoad: string;
}

interface LawyerFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
}

export function LawyerFilters({ filters, onFilterChange }: LawyerFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FiltersState>(filters);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [offices, setOffices] = useState<string[]>([]);

  useEffect(() => {
    // Fetch specializations and offices
    const fetchFilterOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const [specializationsRes, officesRes] = await Promise.all([
          fetch('/api/specializations', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/offices', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (specializationsRes.ok) {
          const specData = await specializationsRes.json();
          setSpecializations(specData.data.map((s: any) => s.name));
        }

        if (officesRes.ok) {
          const officeData = await officesRes.json();
          setOffices(officeData.data.offices.map((o: any) => o.name));
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FiltersState = {
      specialization: 'all',
      status: 'all',
      office: 'all',
      searchTerm: '',
      experience: '',
      caseLoad: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={localFilters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select
          value={localFilters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(UserStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={localFilters.specialization}
          onValueChange={(value) => handleFilterChange('specialization', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={localFilters.office}
          onValueChange={(value) => handleFilterChange('office', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Office" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            {offices.map((office) => (
              <SelectItem key={office} value={office}>
                {office}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="number"
            placeholder="Minimum years of experience"
            value={localFilters.experience}
            onChange={(e) => handleFilterChange('experience', e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            type="number"
            placeholder="Maximum case load"
            value={localFilters.caseLoad}
            onChange={(e) => handleFilterChange('caseLoad', e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          className="w-full sm:w-auto"
        >
          <X className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
} 