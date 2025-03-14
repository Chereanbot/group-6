'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Send, Search, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userRole: string;
  status: string;
  lastSeen: string;
  isOnline: boolean;
  clientProfile?: {
    cases: Array<{
      id: string;
      title: string;
      status: string;
      priority: string;
      createdAt: string;
      updatedAt: string;
    }>;
  } | null;
}

interface SMS {
  id: string;
  text: string;
  senderId: string;
  recipientId: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    phone: string;
    userRole: string;
  };
  recipient: {
    id: string;
    fullName: string;
    phone: string;
    userRole: string;
  };
}

interface SMSPageClientProps {
  contacts: Contact[];
  smsHistory: SMS[];
  userId: string;
}

export function SMSPageClient({ contacts, smsHistory, userId }: SMSPageClientProps) {
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact => 
    contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const handleSendSMS = async () => {
    if (!selectedContact || !message.trim()) return;

    try {
      setSending(true);
      const response = await fetch('/api/lawyer/communications/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedContact.id,
          text: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS');
      }

      toast({
        title: 'SMS Sent',
        description: 'Your message has been sent successfully.',
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'Error',
        description: 'Failed to send SMS. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const filteredSMS = selectedContact
    ? smsHistory.filter(sms => 
        (sms.senderId === userId && sms.recipientId === selectedContact.id) ||
        (sms.senderId === selectedContact.id && sms.recipientId === userId)
      )
    : smsHistory;

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      {/* Contacts List */}
      <Card className="col-span-4 p-4 flex flex-col">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                selectedContact?.id === contact.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{contact.fullName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {contact.phone}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* SMS Area */}
      <Card className="col-span-8 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            {selectedContact ? selectedContact.fullName : 'Select a contact'}
          </h2>
          {selectedContact && (
            <p className="text-sm text-gray-500">{selectedContact.phone}</p>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {filteredSMS.map((sms) => (
            <div
              key={sms.id}
              className={`flex ${sms.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  sms.senderId === userId
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <p className="break-words">{sms.text}</p>
                <div className="flex items-center justify-end space-x-1 mt-1">
                  <span className="text-xs opacity-70">
                    {format(new Date(sms.createdAt), 'p')}
                  </span>
                  {sms.senderId === userId && (
                    <span className="text-xs">
                      {sms.status === 'READ' ? '✓✓' : sms.status === 'DELIVERED' ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendSMS();
            }}
            className="flex space-x-2"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={!selectedContact || sending}
            />
            <Button type="submit" disabled={!selectedContact || sending || !message.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
} 