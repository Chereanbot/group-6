'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContactsList from '@/components/communications/ContactsList';
import LawyerChatArea from '@/components/communications/LawyerChatArea';
import { Input } from '@/components/ui/input';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  userRole: string;
  status: string;
  lastSeen: string;
  isOnline: boolean;
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
    createdAt: string;
    updatedAt: string;
  }>;
  unreadCount?: number;
  lastMessage?: {
    content: string;
    createdAt: string;
    status: 'SENT' | 'DELIVERED' | 'READ';
  };
}

interface MessagesPageProps {
  contacts: {
    office: any;
    superAdmins: Contact[];
    coordinators: Contact[];
    clients: Contact[];
  };
  userId: string;
}

export function MessagesPageClient({ contacts, userId }: MessagesPageProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = {
    superAdmins: contacts.superAdmins.filter(contact =>
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    coordinators: contacts.coordinators.filter(contact =>
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    clients: contacts.clients.filter(contact =>
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r bg-background flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">Messages</h2>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              className="pl-10 bg-accent/50"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Office Info */}
        <div className="px-4 py-2 border-b bg-accent/20">
          <p className="text-sm font-medium">{contacts.office.name}</p>
          <p className="text-xs text-muted-foreground">{contacts.office.location}</p>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <div className="px-4 py-2 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="admin" className="flex-1">Admin</TabsTrigger>
              <TabsTrigger value="coordinator" className="flex-1">Office</TabsTrigger>
              <TabsTrigger value="client" className="flex-1">Clients</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="flex-1 overflow-hidden">
            <ContactsList 
              contacts={[
                ...filteredContacts.superAdmins,
                ...filteredContacts.coordinators,
                ...filteredContacts.clients
              ]}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
            />
          </TabsContent>

          <TabsContent value="admin" className="flex-1 overflow-hidden">
            <ContactsList 
              contacts={filteredContacts.superAdmins}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
            />
          </TabsContent>

          <TabsContent value="coordinator" className="flex-1 overflow-hidden">
            <ContactsList 
              contacts={filteredContacts.coordinators}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
            />
          </TabsContent>

          <TabsContent value="client" className="flex-1 overflow-hidden">
            <ContactsList 
              contacts={filteredContacts.clients}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        <LawyerChatArea 
          userId={userId}
          selectedContact={selectedContact}
        />
      </div>
    </div>
  );
} 