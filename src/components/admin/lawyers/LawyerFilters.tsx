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

interface LawyerFiltersProps {
  filters: {
    specialization: string;
    status: string;
    office: string;
    searchTerm: string;
  };
  onFilterChange: (filters: any) => void;
}

export function LawyerFilters({ filters, onFilterChange }: LawyerFiltersProps) {
  const [offices, setOffices] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    // Fetch offices and specializations
    const fetchFilterData = async () => {
      try {
        const [officesRes, specializationsRes] = await Promise.all([
          fetch('/api/admin/offices'),
          fetch('/api/admin/specializations')
        ]);

        if (officesRes.ok && specializationsRes.ok) {
          const [officesData, specializationsData] = await Promise.all([
            officesRes.json(),
            specializationsRes.json()
          ]);

          setOffices(officesData.data || []);
          setSpecializations(specializationsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      specialization: 'all',
      status: 'all',
      office: 'all',
      searchTerm: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-muted-foreground-dark" />
            <Input
              placeholder="Search by name or email"
              value={localFilters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10 bg-background dark:bg-background-dark border-border dark:border-border-dark text-foreground dark:text-foreground-dark"
            />
          </div>
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            value={localFilters.office || 'all'}
            onValueChange={(value) => handleFilterChange('office', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Offices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offices</SelectItem>
              {offices.map((office: any) => (
                <SelectItem key={office.id} value={office.id}>
                  {office.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={localFilters.specialization || 'all'}
            onValueChange={(value) => handleFilterChange('specialization', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Specializations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map((spec: any) => (
                <SelectItem key={spec.id} value={spec.id}>
                  {spec.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={localFilters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={handleReset}
          className="w-full sm:w-auto border-border dark:border-border-dark text-foreground dark:text-foreground-dark hover:bg-muted dark:hover:bg-muted-dark"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
} 