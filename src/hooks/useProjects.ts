"use client";

import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  coordinatorId: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Partial<Project>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      await fetchProjects();
    } catch (error) {
      throw error;
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      await fetchProjects();
    } catch (error) {
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      await fetchProjects();
    } catch (error) {
      throw error;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
} 