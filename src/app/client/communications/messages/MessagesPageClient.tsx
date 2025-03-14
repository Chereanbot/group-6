'use client';

import { useState, useCallback } from 'react';
import ContactsList from '@/components/communications/ContactsList';
import ChatArea from '@/components/communications/ChatArea';
import { toast } from 'react-hot-toast';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userRole: string;
  status: string;
  lastSeen: string;
  isOnline: boolean;
  office?: {
    id: string;
    name: string;
    location: string;
  };
  unreadCount?: number;
  lastMessage?: {
    content: string;
    createdAt: string;
    status: 'SENT' | 'DELIVERED' | 'READ';
  };
}

interface Props {
  contacts: {
    lawyers: Contact[];
    coordinators: Contact[];
  };
  userId: string;
}

export function MessagesPageClient({ contacts, userId }: Props) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'LAWYER' | 'COORDINATOR'>('ALL');

  const allContacts = [...contacts.lawyers, ...contacts.coordinators];

  const filteredContacts = allContacts.filter(contact => {
    const matchesSearch = contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || contact.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleContactSelect = useCallback((contact: Contact) => {
    setSelectedContact(contact);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleRoleFilter = useCallback((role: 'ALL' | 'LAWYER' | 'COORDINATOR') => {
    setRoleFilter(role);
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <ContactsList
          contacts={filteredContacts}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
        />
      </div>
      <div className="w-2/3">
        <ChatArea
          selectedContact={selectedContact}
          userId={userId}
        />
      </div>
    </div>
  );
} 