"use client";

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Plus,
  X,
  Link as LinkIcon,
  Tag,
  Save,
  Upload,
  File
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { categories } from "../mockData";

interface FormData {
  title: string;
  category: string;
  description: string;
  url: string;
  tags: string[];
  notes?: string;
  credentials?: {
    username?: string;
    password?: string;
  };
  attachments: {
    name: string;
    file: File;
  }[];
}

export default function NewResourcePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    description: '',
    url: '',
    tags: [],
    attachments: [],
  });
  const [newTag, setNewTag] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(newTag.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag.trim()]
        });
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload attachments first if any
      const attachmentUploads = await Promise.all(
        attachments.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          // Add file upload API call here
          return {
            name: file.name,
            url: 'uploaded-url'
          };
        })
      );

      // Create resource with attachments
      const response = await fetch('/api/lawyer/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          attachments: attachmentUploads
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create resource');
      }

      toast.success("Resource added successfully");
      router.push('/lawyer/research/resources');
    } catch (error) {
      toast.error("Failed to add resource");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Resource</h1>
            <p className="text-muted-foreground">
              Add a new legal research resource or database
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Resource Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat !== "All Resources").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Resource URL</Label>
              <div className="relative">
                <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Type a tag and press Enter"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes or instructions..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Access Credentials (Optional)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                >
                  {showCredentials ? 'Hide' : 'Show'} Credentials
                </Button>
              </div>
              {showCredentials && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.credentials?.username || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        credentials: {
                          ...formData.credentials,
                          username: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.credentials?.password || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        credentials: {
                          ...formData.credentials,
                          password: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-muted rounded-lg p-2"
                    >
                      <File className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <Upload className="h-4 w-4" />
                      <span>Upload files</span>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Adding..." : "Add Resource"}
          </Button>
        </div>
      </form>
    </div>
  );
} 