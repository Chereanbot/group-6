"use client";

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Search,
  BookOpen,
  Scale,
  Bookmark,
  ExternalLink,
  Clock,
  Star,
  Filter,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for legal resources
const mockResources = [
  {
    id: "1",
    title: "Westlaw",
    category: "Case Law Database",
    description: "Comprehensive legal research database with case law, statutes, and secondary sources",
    url: "https://westlaw.com",
    tags: ["case law", "statutes", "legal research"],
    lastAccessed: new Date("2024-02-15"),
    isFavorite: true
  },
  {
    id: "2",
    title: "LexisNexis",
    category: "Legal Database",
    description: "Legal research platform with extensive case law and analytical materials",
    url: "https://lexisnexis.com",
    tags: ["research", "analytics", "case law"],
    lastAccessed: new Date("2024-02-10"),
    isFavorite: true
  },
  {
    id: "3",
    title: "HeinOnline",
    category: "Legal Journal Database",
    description: "Database of legal journals, law reviews, and historical legal documents",
    url: "https://heinonline.org",
    tags: ["journals", "academic", "legal history"],
    lastAccessed: new Date("2024-02-01"),
    isFavorite: false
  }
];

const categories = [
  "All Resources",
  "Case Law Databases",
  "Legal Journals",
  "Statutes & Regulations",
  "Practice Guides",
  "Forms & Templates",
  "Legal News",
  "CLE Resources"
];

export default function LegalResourcesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredResources = mockResources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Research Resources</h1>
          <p className="text-muted-foreground mt-1">
            Access and manage your legal research tools and resources
          </p>
        </div>
        <Button onClick={() => router.push('/lawyer/research/resources/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recently Used</TabsTrigger>
          <TabsTrigger value="databases">Databases</TabsTrigger>
          <TabsTrigger value="journals">Journals</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {resource.title}
                          {resource.isFavorite && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          )}
                        </CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="secondary">{resource.category}</Badge>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last accessed {resource.lastAccessed.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Access Resource
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
} 