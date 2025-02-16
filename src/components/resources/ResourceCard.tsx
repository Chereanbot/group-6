"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink,
  Clock,
  Star,
  Share2,
  Download,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LegalResource } from "@/app/lawyer/research/resources/interfaces";
import { format } from "date-fns";
import { toast } from "sonner";

interface ResourceCardProps {
  resource: LegalResource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFavorite = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/lawyer/resources/${resource.id}/favorite`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to update favorite status');
      toast.success(resource.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccess = async () => {
    try {
      await fetch(`/api/lawyer/resources/${resource.id}/access`, {
        method: 'PUT'
      });
      window.open(resource.url, '_blank');
    } catch (error) {
      console.error('Failed to track access:', error);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleFavorite}>
                <Star className="h-4 w-4 mr-2" />
                {resource.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share Resource
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Badge variant="secondary">{resource.category}</Badge>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last accessed {format(new Date(resource.lastAccessed), 'MMM d, yyyy')}
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
            onClick={handleAccess}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Access Resource
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 