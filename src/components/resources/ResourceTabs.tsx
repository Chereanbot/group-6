"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceCard } from "./ResourceCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Star, 
  Clock, 
  Database,
  BookMarked,
  Share2
} from "lucide-react";
import { LegalResource, ResourceTab } from "@/app/lawyer/research/resources/interfaces";
import { format, subDays } from "date-fns";

interface ResourceTabsProps {
  resources: LegalResource[];
  searchQuery: string;
}

const tabs: ResourceTab[] = [
  {
    id: "all",
    label: "All Resources",
    value: "all",
    icon: BookOpen,
    filter: (resources) => resources
  },
  {
    id: "favorites",
    label: "Favorites",
    value: "favorites",
    icon: Star,
    filter: (resources) => resources.filter(r => r.isFavorite)
  },
  {
    id: "recent",
    label: "Recently Used",
    value: "recent",
    icon: Clock,
    filter: (resources) => resources
      .filter(r => new Date(r.lastAccessed) > subDays(new Date(), 7))
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
  },
  {
    id: "databases",
    label: "Databases",
    value: "databases",
    icon: Database,
    filter: (resources) => resources.filter(r => r.category === "Case Law Database")
  },
  {
    id: "journals",
    label: "Journals",
    value: "journals",
    icon: BookMarked,
    filter: (resources) => resources.filter(r => r.category === "Legal Journal Database")
  },
  {
    id: "shared",
    label: "Shared With Me",
    value: "shared",
    icon: Share2,
    filter: (resources) => resources.filter(r => r.shares && r.shares.length > 0)
  }
];

export function ResourceTabs({ resources, searchQuery }: ResourceTabsProps) {
  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="w-full justify-start">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.value} className="flex items-center gap-2">
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.value} className="mt-6">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tab.filter(filteredResources).map((resource) => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
} 