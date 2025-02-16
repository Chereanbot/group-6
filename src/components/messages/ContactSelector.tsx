import { useState } from 'react';
import { Search, Users, UserPlus, Mail, Phone, Bell, MessageCircle, AtSign, Hash, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Custom theme colors
const themes = {
  light: {
    bg: 'bg-white',
    hover: 'hover:bg-gray-50',
    selected: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    accent: 'border-blue-500',
  },
  dark: {
    bg: 'bg-gray-900',
    hover: 'hover:bg-gray-800',
    selected: 'bg-gray-800',
    border: 'border-gray-700',
    text: 'text-gray-100',
    textSecondary: 'text-gray-400',
    accent: 'border-blue-400',
  }
};

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  userRole: string;
  avatarUrl?: string;
  lastActive?: Date;
}

interface ContactSelectorProps {
  onSelect: (contact: Contact, messageType?: string) => void;
}

export function ContactSelector({ onSelect }: ContactSelectorProps) {
  const { theme, setTheme } = useTheme();
  const currentTheme = theme === 'dark' ? themes.dark : themes.light;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('recent');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageType, setMessageType] = useState<string>('');
  const [quickMessage, setQuickMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Example coordinator contacts
  const coordinatorContacts = [
    {
      id: '1',
      fullName: 'cs chernet',
      email: 'cscher331@gmail.com',
      phone: '+251947006369`',
      userRole: 'COORDINATOR',
      lastActive: new Date(),
    },
    // Add more coordinator contacts
  ];

  const messageTypes = [
    { id: 'email', icon: <Mail className="h-4 w-4" />, label: 'Email Message' },
    { id: 'phone', icon: <Phone className="h-4 w-4" />, label: 'Phone Message' },
    { id: 'push', icon: <Bell className="h-4 w-4" />, label: 'Push Notification' },
    { id: 'internal', icon: <MessageCircle className="h-4 w-4" />, label: 'Internal Message' },
  ];

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setShowMessageInput(false);
    setMessageType('');
  };

  const handleMessageTypeSelect = (type: string) => {
    setMessageType(type);
    setShowMessageInput(true);
  };

  const getInputForMessageType = () => {
    switch (messageType) {
      case 'email':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AtSign className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Enter email address..."
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            {recipientEmail && !recipientEmail.includes('@') && (
              <p className="text-sm text-red-500">Please enter a valid email address</p>
            )}
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Enter phone number..."
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </div>
            {recipientPhone && recipientPhone.length < 10 && (
              <p className="text-sm text-red-500">Please enter a valid phone number</p>
            )}
          </div>
        );

      case 'internal':
        return (
          <div className="space-y-2">
            <Select
              value={selectedUsers[0]}
              onValueChange={(value) => setSelectedUsers([value])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient..." />
              </SelectTrigger>
              <SelectContent>
                {coordinatorContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{contact.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <span>{contact.fullName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  const isValidInput = () => {
    switch (messageType) {
      case 'email':
        return recipientEmail && recipientEmail.includes('@');
      case 'phone':
        return recipientPhone && recipientPhone.length >= 10;
      case 'internal':
        return selectedUsers.length > 0;
      default:
        return true;
    }
  };

  const handleSendMessage = () => {
    if (!isValidInput()) return;

    const recipient = {
      id: selectedContact?.id || '',
      fullName: selectedContact?.fullName || '',
      email: messageType === 'email' ? recipientEmail : selectedContact?.email || '',
      phone: messageType === 'phone' ? recipientPhone : selectedContact?.phone || '',
      userRole: selectedContact?.userRole || 'COORDINATOR',
    };

    onSelect(recipient, messageType);
    setQuickMessage('');
    setShowMessageInput(false);
    setRecipientEmail('');
    setRecipientPhone('');
    setSelectedUsers([]);
  };

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <div
      className={cn(
        'p-3 rounded-lg border transition-all duration-200 cursor-pointer',
        currentTheme.border,
        currentTheme.bg,
        selectedContact?.id === contact.id 
          ? `${currentTheme.selected} ${currentTheme.accent}`
          : currentTheme.hover
      )}
      onClick={() => handleContactSelect(contact)}
    >
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarFallback className={cn(
            currentTheme.bg,
            currentTheme.text
          )}>
            {contact.fullName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className={cn("font-medium", currentTheme.text)}>
            {contact.fullName}
          </p>
          <p className={currentTheme.textSecondary}>
            {contact.email}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" />
          Select Contact
        </Button>
      </DialogTrigger>
      <DialogContent className={cn(
        "sm:max-w-[500px]",
        currentTheme.bg,
        currentTheme.text
      )}>
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>Select Contact</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className={cn(
              "absolute left-2 top-2.5 h-4 w-4",
              currentTheme.textSecondary
            )} />
            <Input
              placeholder="Search contacts..."
              className={cn(
                "pl-8",
                currentTheme.bg,
                currentTheme.text,
                currentTheme.border
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="recent" onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              {['Recent', 'Lawyers', 'Coords', 'Clients', 'Admin'].map((tab) => (
                <TabsTrigger
                  key={tab.toLowerCase()}
                  value={tab.toLowerCase()}
                  className={cn(
                    "data-[state=active]:bg-primary",
                    currentTheme.text
                  )}
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Coordinators Tab Content */}
            <TabsContent value="coordinators" className="mt-4">
              <div className="space-y-4">
                {/* Contact List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {coordinatorContacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                </div>

                {/* Message Type Selection */}
                {selectedContact && !showMessageInput && (
                  <div className="space-y-2">
                    <p className={cn("text-sm font-medium", currentTheme.text)}>
                      Select Message Type
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {messageTypes.map((type) => (
                        <Button
                          key={type.id}
                          variant="outline"
                          className={cn(
                            "justify-start",
                            currentTheme.bg,
                            currentTheme.text
                          )}
                          onClick={() => handleMessageTypeSelect(type.id)}
                        >
                          {type.icon}
                          <span className="ml-2">{type.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                {showMessageInput && (
                  <div className="space-y-4">
                    {getInputForMessageType()}
                    <div className="space-y-2">
                      <p className={cn(
                        "text-sm font-medium",
                        currentTheme.text
                      )}>
                        Quick Message ({messageType.charAt(0).toUpperCase() + messageType.slice(1)})
                      </p>
                      <Textarea
                        placeholder="Type your message..."
                        value={quickMessage}
                        onChange={(e) => setQuickMessage(e.target.value)}
                        rows={3}
                        className={cn(
                          currentTheme.bg,
                          currentTheme.text,
                          currentTheme.border
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowMessageInput(false)}
                          className={currentTheme.text}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!isValidInput() || !quickMessage.trim()}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 