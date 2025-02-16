"use client";

import { useState } from 'react';
import { AuditList } from "@/components/audit/AuditList";
import { AuditFilters } from "@/components/audit/AuditFilters";
import { AuditStats } from "@/components/audit/AuditStats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import { AuditRecord } from "./interfaces";

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<{
    type?: string[];
    status?: string[];
    priority?: string[];
    category?: string[];
  }>({});

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Compliance Audit</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Audit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AuditStats />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audits..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <AuditFilters
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
        />
      </div>

      <AuditList
        searchQuery={searchQuery}
        filters={selectedFilters}
      />
    </div>
  );
} 