'use client';

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Circle, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  userRole: string;
  status: string;
  lastSeen?: Date;
  office?: {
    id: string;
    name: string;
    location: string;
  };
  clientCases?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  unreadCount: number;
  lastMessage?: {
    content: string;
    createdAt: Date;
    status: 'SENT' | 'DELIVERED' | 'READ';
  };
}

interface ContactListProps {
  contacts: Contact[];
  selectedId?: string;
  onContactSelect: (contact: Contact) => void;
}

export function ContactList({ contacts, selectedId, onContactSelect }: ContactListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'text-green-500';
      case 'AWAY':
        return 'text-yellow-500';
      case 'OFFLINE':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'COORDINATOR':
        return 'bg-blue-100 text-blue-800';
      case 'CLIENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMessageStatus = (status: string) => {
    switch (status) {
      case 'READ':
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCheck className="h-4 w-4 text-gray-500" />;
      case 'SENT':
        return <Check className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-px">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            className={`w-full p-3 hover:bg-accent flex items-center gap-3 transition-colors ${
              selectedId === contact.id ? 'bg-accent' : ''
            }`}
            onClick={() => onContactSelect(contact)}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatar} />
                <AvatarFallback>
                  {contact.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Circle 
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                  getStatusColor(contact.status)
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-medium truncate">{contact.fullName}</span>
                  <Badge className={getRoleBadgeColor(contact.userRole)} variant="secondary">
                    {contact.userRole.split('_').map(word => 
                      word.charAt(0) + word.slice(1).toLowerCase()
                    ).join(' ')}
                  </Badge>
                </div>
                {contact.lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(contact.lastMessage.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2 truncate">
                  {contact.office ? (
                    <span className="text-sm text-gray-500 truncate">
                      {contact.office.name} - {contact.office.location}
                    </span>
                  ) : contact.clientCases && contact.clientCases.length > 0 ? (
                    <span className="text-sm text-gray-500 truncate">
                      Case: {contact.clientCases[0].title} - {contact.clientCases[0].priority}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500 truncate">{contact.email}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {contact.lastMessage && getMessageStatus(contact.lastMessage.status)}
                  {contact.unreadCount > 0 && (
                    <Badge variant="default" className="bg-blue-500">
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}

        {contacts.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No contacts found
          </div>
        )}
      </div>
    </ScrollArea>
  );
} 