"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { AuditType, AuditStatus, AuditPriority, AuditCategory } from "@/app/lawyer/compliance/audit/interfaces";

interface AuditFiltersProps {
  selectedFilters: {
    type?: string[];
    status?: string[];
    priority?: string[];
    category?: string[];
  };
  onFilterChange: (filters: any) => void;
}

const FILTER_OPTIONS = {
  type: [
    { value: 'INTERNAL', label: 'Internal' },
    { value: 'EXTERNAL', label: 'External' },
    { value: 'REGULATORY', label: 'Regulatory' },
    { value: 'CLIENT', label: 'Client' },
    { value: 'FINANCIAL', label: 'Financial' },
    { value: 'OPERATIONAL', label: 'Operational' },
  ],
  status: [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'REQUIRES_REVIEW', label: 'Requires Review' },
    { value: 'NON_COMPLIANT', label: 'Non-Compliant' },
  ],
  priority: [
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ],
  category: [
    { value: 'CASE_MANAGEMENT', label: 'Case Management' },
    { value: 'CLIENT_CONFIDENTIALITY', label: 'Client Confidentiality' },
    { value: 'DOCUMENT_RETENTION', label: 'Document Retention' },
    { value: 'FINANCIAL_COMPLIANCE', label: 'Financial Compliance' },
    { value: 'ETHICS', label: 'Ethics' },
    { value: 'DATA_PROTECTION', label: 'Data Protection' },
    { value: 'PROFESSIONAL_CONDUCT', label: 'Professional Conduct' },
  ],
};

export function AuditFilters({ selectedFilters, onFilterChange }: AuditFiltersProps) {
  const handleFilterChange = (type: string, value: string) => {
    const currentFilters = selectedFilters[type as keyof typeof selectedFilters] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(v => v !== value)
      : [...currentFilters, value];
    
    onFilterChange({
      ...selectedFilters,
      [type]: newFilters,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {Object.values(selectedFilters).flat().length > 0 && (
            <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
              {Object.values(selectedFilters).flat().length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
          <div key={key}>
            <DropdownMenuLabel className="capitalize">{key}</DropdownMenuLabel>
            {options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={selectedFilters[key as keyof typeof selectedFilters]?.includes(option.value)}
                onCheckedChange={() => handleFilterChange(key, option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 