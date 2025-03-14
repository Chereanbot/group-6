'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { translate } from '@/utils/translations';
import { CasesSkeleton } from '@/components/skeletons/CasesSkeleton';
import { Search, Filter, AlertTriangle } from 'lucide-react';
import { CaseTable } from '../components/CaseTable';
import type { Case } from '../types';

export default function MyCasesPage(): JSX.Element {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAmharic, setIsAmharic] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/client/cases');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setCases(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
      toast({
        title: translate('Error', isAmharic),
        description: translate('Failed to fetch cases', isAmharic),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCaseDeleted = () => {
    fetchCases(); // Refresh the cases list after deletion
  };

  const filteredCases = cases.filter((case_) => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return <CasesSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive">{translate(error, isAmharic)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {translate('My Cases', isAmharic)}
        </h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="language-switch">
            {isAmharic ? 'አማርኛ' : 'English'}
          </Label>
          <Switch
            id="language-switch"
            checked={isAmharic}
            onCheckedChange={setIsAmharic}
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">
                <Search className="w-4 h-4 inline mr-2" />
                {translate('Search', isAmharic)}
              </Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={translate('Search by title or description', isAmharic)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">
                <Filter className="w-4 h-4 inline mr-2" />
                {translate('Status', isAmharic)}
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={translate('Filter by status', isAmharic)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{translate('All Statuses', isAmharic)}</SelectItem>
                  <SelectItem value="ACTIVE">{translate('Active', isAmharic)}</SelectItem>
                  <SelectItem value="PENDING">{translate('Pending', isAmharic)}</SelectItem>
                  <SelectItem value="CLOSED">{translate('Closed', isAmharic)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                {translate('Priority', isAmharic)}
              </Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={translate('Filter by priority', isAmharic)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{translate('All Priorities', isAmharic)}</SelectItem>
                  <SelectItem value="HIGH">{translate('High', isAmharic)}</SelectItem>
                  <SelectItem value="MEDIUM">{translate('Medium', isAmharic)}</SelectItem>
                  <SelectItem value="LOW">{translate('Low', isAmharic)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      {filteredCases.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {translate('No cases found', isAmharic)}
            </p>
          </CardContent>
        </Card>
      ) : (
        <CaseTable 
          cases={filteredCases} 
          isAmharic={isAmharic} 
          onCaseDeleted={handleCaseDeleted}
        />
      )}
    </motion.div>
  );
}
