"use client";

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  Upload
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaseCard } from "@/components/cases/CaseCard";
import { mockCases } from "./mockData";
import { toast } from "sonner";
import type { Case } from "@/types/case";

export default function CasesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredCases = mockCases.filter(caseItem =>
    caseItem.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (id: string) => {
    router.push(`/lawyer/documents/cases/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/lawyer/documents/cases/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    // Add confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete this case?");
    if (!confirmed) return;

    try {
      // Add API call here
      toast.success("Case deleted successfully");
    } catch (error) {
      toast.error("Failed to delete case");
    }
  };

  const handleUpload = (id: string) => {
    // Add document upload logic
    toast.info("Document upload coming soon");
  };

  const handleDownload = (docId: string) => {
    // Add document download logic
    toast.info("Document download coming soon");
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Case Management</h1>
          <p className="text-muted-foreground mt-1">
            Organize and track your legal cases and documents
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Cases
          </Button>
          <Button onClick={() => router.push('/lawyer/documents/cases/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases by number, title, or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem>
              <AlertCircle className="h-4 w-4 mr-2" />
              High Priority
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Clock className="h-4 w-4 mr-2" />
              Due This Week
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming Hearings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="h-4 w-4 mr-2" />
              My Cases
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Cases</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {filteredCases.map((caseItem: Case) => (
              <CaseCard
                key={caseItem.id}
                caseData={caseItem}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpload={handleUpload}
                onDownload={handleDownload}
              />
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
} 