'use client';

import { useState } from 'react';
import ContactsList from '@/components/communications/ContactsList';
import ChatArea from '@/components/communications/ChatArea';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userRole: string;
  status: string;
  lastSeen: string;
  isOnline: boolean;
}

interface MessagesPageClientProps {
  contacts: Contact[];
  userId: string;
}

export function MessagesPageClient({ contacts, userId }: MessagesPageClientProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex flex-col md:flex-row">
        <ContactsList
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
        />
        <div className="flex-1 h-full">
          <ChatArea
            selectedContact={selectedContact}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
} 