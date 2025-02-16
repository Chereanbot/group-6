"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineExclamation,
} from 'react-icons/hi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';

interface Instruction {
  id: string;
  type: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isActive: boolean;
  createdAt: Date;
}

export default function AgentInstructions() {
  const { data: session } = useSession();
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newInstruction, setNewInstruction] = useState({
    type: '',
    description: '',
    priority: 'MEDIUM' as const,
  });

  useEffect(() => {
    fetchInstructions();
  }, []);

  const fetchInstructions = async () => {
    try {
      const response = await fetch('/api/coordinator/instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinatorId: session?.user?.id }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch instructions');
      
      const data = await response.json();
      setInstructions(data.data);
    } catch (error) {
      console.error('Error fetching instructions:', error);
      toast.error('Failed to load instructions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInstruction = async () => {
    try {
      const response = await fetch('/api/coordinator/instructions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newInstruction,
          coordinatorId: session?.user?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create instruction');

      const data = await response.json();
      setInstructions(prev => [data.data, ...prev]);
      setIsCreating(false);
      setNewInstruction({ type: '', description: '', priority: 'MEDIUM' });
      toast.success('Instruction created successfully');
    } catch (error) {
      console.error('Error creating instruction:', error);
      toast.error('Failed to create instruction');
    }
  };

  const handleDeleteInstruction = async (id: string) => {
    try {
      const response = await fetch(`/api/coordinator/instructions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete instruction');

      setInstructions(prev => prev.filter(instruction => instruction.id !== id));
      toast.success('Instruction deleted successfully');
    } catch (error) {
      console.error('Error deleting instruction:', error);
      toast.error('Failed to delete instruction');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'MEDIUM':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Agent Instructions
        </h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
          variant="outline"
        >
          <HiOutlinePlus className="h-5 w-5" />
          New Instruction
        </Button>
      </div>

      {isCreating && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 space-y-4">
          <Input
            placeholder="Instruction Type (e.g., MONITOR_WEBSITE, CHECK_UPDATES)"
            value={newInstruction.type}
            onChange={(e) => setNewInstruction(prev => ({ ...prev, type: e.target.value }))}
          />
          
          <Textarea
            placeholder="Describe what the agent should do..."
            value={newInstruction.description}
            onChange={(e) => setNewInstruction(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
          />
          
          <Select
            value={newInstruction.priority}
            onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => 
              setNewInstruction(prev => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low Priority</SelectItem>
              <SelectItem value="MEDIUM">Medium Priority</SelectItem>
              <SelectItem value="HIGH">High Priority</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewInstruction({ type: '', description: '', priority: 'MEDIUM' });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInstruction}
              disabled={!newInstruction.type || !newInstruction.description}
            >
              Create Instruction
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {instructions.map((instruction) => (
          <div
            key={instruction.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {instruction.type}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      instruction.priority
                    )}`}
                  >
                    {instruction.priority}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {instruction.description}
                </p>
                <div className="text-sm text-gray-500">
                  Created {new Date(instruction.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteInstruction(instruction.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <HiOutlineTrash className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
