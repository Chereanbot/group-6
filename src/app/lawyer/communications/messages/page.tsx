"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, Search, MoreVertical, Star, Archive, 
  Trash2, Reply, Forward, Download, Filter,
  Loader2, AlertCircle, PhoneIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ContactSelector } from '@/components/messages/ContactSelector';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { MessagesSkeleton } from '@/components/messages/MessagesSkeleton';

interface Message {
  id: string;
  subject: string;
  content: string;
  createdAt: Date;
  status: string;
  priority: string;
  category: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  sender: {
    id: string;
    fullName: string;
    email: string;
    userRole: string;
  };
  recipient: {
    id: string;
    fullName: string;
    email: string;
    userRole: string;
  };
}

// Add theme styles
const themes = {
  light: {
    bg: 'bg-white',
    hover: 'hover:bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    messageBg: 'bg-gray-100',
    messageSent: 'bg-blue-500',
    messageReceived: 'bg-gray-100',
    cardBg: 'bg-white',
  },
  dark: {
    bg: 'bg-gray-900',
    hover: 'hover:bg-gray-800',
    border: 'border-gray-700',
    text: 'text-gray-100',
    textSecondary: 'text-gray-400',
    messageBg: 'bg-gray-800',
    messageSent: 'bg-blue-600',
    messageReceived: 'bg-gray-800',
    cardBg: 'bg-gray-900',
  }
};

export default function MessagesPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/lawyer/communications/messages');
    },
  });
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [subject, setSubject] = useState('');
  const [showSubject, setShowSubject] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [selectedMessageToForward, setSelectedMessageToForward] = useState<string | null>(null);
  const [forwardRecipientId, setForwardRecipientId] = useState<string>('');
  const [contacts, setContacts] = useState<Array<{ id: string; fullName: string }>>([]);
  const [isSending, setIsSending] = useState(false);
  const [isStarring, setIsStarring] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isForwarding, setIsForwarding] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentTheme = theme === 'dark' ? themes.dark : themes.light;
  const [smsStatus, setSmsStatus] = useState<string | null>(null);
  const [selectedMessageType, setSelectedMessageType] = useState<'email' | 'phone' | 'web' | 'internal'>('internal');

  useEffect(() => {
    if (session?.user?.id) {
      fetchMessages();
    }
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContact]);

  useEffect(() => {
    if (forwardDialogOpen) {
      fetchContacts();
    }
  }, [forwardDialogOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/lawyer/messages', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      if (!Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }

      setMessages(data.data);
      console.log('Messages loaded:', data.data.length);

    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to load messages');
      if (error instanceof Error && error.message === 'Not authenticated') {
        router.push('/auth/signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedContact || !newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await fetch('/api/lawyer/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedContact,
          subject: subject || 'New Message',
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [data, ...prev]);
      setNewMessage('');
      setSubject('');
      setShowSubject(false);
      toast.success("Your message has been sent successfully.");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleStarMessage = async (messageId: string) => {
    if (isStarring === messageId) return;
    
    try {
      setIsStarring(messageId);
      const response = await fetch(`/api/lawyer/messages/${messageId}/star`, {
        method: 'PUT'
      });
      if (response.ok) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
        ));
      }
    } catch (error) {
      console.error('Error starring message:', error);
    } finally {
      setIsStarring(null);
    }
  };

  const handleArchiveMessage = async (messageId: string) => {
    if (isArchiving === messageId) return;

    try {
      setIsArchiving(messageId);
      const response = await fetch(`/api/lawyer/messages/${messageId}/archive`, {
        method: 'PUT'
      });
      if (response.ok) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, isArchived: !msg.isArchived } : msg
        ));
      }
    } catch (error) {
      console.error('Error archiving message:', error);
    } finally {
      setIsArchiving(null);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (isDeleting === messageId) return;

    try {
      setIsDeleting(messageId);
      const response = await fetch(`/api/lawyer/messages/${messageId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== messageId));
        toast.success("The message has been deleted successfully.");
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.sender.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filter) {
      case 'unread':
        return !message.isRead && matchesSearch;
      case 'starred':
        return message.isStarred && matchesSearch;
      case 'archived':
        return message.isArchived && matchesSearch;
      default:
        return !message.isArchived && matchesSearch;
    }
  });

  const getContactName = (message: Message) => {
    return message.sender.fullName;
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/lawyer/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleForwardMessage = async (messageId: string) => {
    if (!forwardRecipientId || isForwarding) return;

    try {
      setIsForwarding(true);
      const response = await fetch(`/api/lawyer/messages/${messageId}/forward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: forwardRecipientId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to forward message');
      }

      const data = await response.json();
      setMessages(prev => [data, ...prev]);
      setForwardDialogOpen(false);
      setSelectedMessageToForward(null);
      setForwardRecipientId('');
      toast.success('Message forwarded successfully');
    } catch (error) {
      console.error('Error forwarding message:', error);
      toast.error('Failed to forward message');
    } finally {
      setIsForwarding(false);
    }
  };

  const sendSMSMessage = async (phoneNumber: string, content: string, subject?: string) => {
    try {
      if (!session?.user?.id) {
        router.push('/lawyer/communications/messages');
        return;
      }

      setIsSending(true);
      setSmsStatus('sending');

      const response = await fetch('/api/lawyer/messages/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientPhone: phoneNumber,
          content,
          subject,
          senderId: session.user.id,
          category: 'SMS',
          priority: 'MEDIUM'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send SMS');
      }

      setMessages(prev => [data.data, ...prev]);
      
      toast.success("SMS sent successfully", {
        icon: <PhoneIcon className="w-4 w-4" />,
      });

      setSmsStatus('sent');
      return true;

    } catch (error) {
      console.error('SMS Send Error:', error);
      setSmsStatus('failed');
      
      if (error instanceof Error && error.message.includes('authentication')) {
        router.push('/lawyer/communications/messages');
        return false;
      }
      
      toast.error(error instanceof Error ? error.message : 'Failed to send SMS', {
        icon: <AlertCircle className="w-4 w-4" />,
      });
      
      return false;

    } finally {
      setIsSending(false);
    }
  };

  const handleMessageSend = async (message: {
    content: string;
    subject?: string;
    sendMethod: 'email' | 'phone' | 'web' | 'internal';
    attachments?: File[];
    priority: 'low' | 'medium' | 'high';
    recipient: {
      type: 'phone' | 'email' | 'contact' | 'web';
      value: string;
    };
  }) => {
    try {
      if (!session?.user?.id) {
        toast.error('Please sign in to send messages');
        router.push('/auth/signin');
        return;
      }

      switch (message.recipient.type) {
        case 'phone':
          await sendSMSMessage(message.recipient.value, message.content, message.subject);
          break;

        case 'email':
          await sendEmailMessage(message.recipient.value, message.content, message.subject);
          break;

        case 'web':
          await sendWebPushMessage(message.recipient.value, message.content, message.subject);
          break;

        case 'contact':
          await sendMessage(message.recipient.value, message.content, message.subject);
          break;

        default:
          toast.error('Invalid send method');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleMessageTypeSelect = (type: 'email' | 'phone' | 'web' | 'internal') => {
    setSelectedMessageType(type);
  };

  if (status === "loading" || !mounted) {
    return <MessagesSkeleton />;
  }

  if (!session?.user?.id) {
    router.push('/auth/signin');
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Sidebar Loading Skeleton */}
          <div className="col-span-4 bg-white dark:bg-gray-800 rounded-lg border p-4">
            <Skeleton className="h-10 w-full mb-4" />
            <div className="flex space-x-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-16" />
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Loading Skeleton */}
          <div className="col-span-8 bg-white dark:bg-gray-800 rounded-lg border p-4">
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-4">
                <Skeleton className="h-24 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="mt-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Error Loading Messages</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      fetchMessages();
                    }}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setMessages([]);
                      setIsLoading(false);
                    }}
                  >
                    Clear Error
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return <MessagesSkeleton />;
  }

  return (
    <div className={cn(
      "container mx-auto p-4",
      currentTheme.bg
    )}>
      <div className="grid grid-cols-12 gap-4">
        {/* Left Sidebar */}
        <div className="col-span-4 space-y-4">
          <ContactSelector 
            onSelect={(contact, messageType) => {
              setSelectedContact(contact.id);
              if (messageType) {
                setSelectedMessageType(messageType);
              }
            }} 
          />
          
          <div className={cn(
            "rounded-lg border p-4",
            currentTheme.cardBg,
            currentTheme.border
          )}>
            <h3 className={cn(
              "font-medium mb-4",
              currentTheme.text
            )}>
              Recent Chats
            </h3>
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-center space-x-4 p-2 rounded-lg cursor-pointer",
                    currentTheme.hover,
                    selectedContact === message.sender.id && currentTheme.messageBg
                  )}
                  onClick={() => setSelectedContact(message.sender.id)}
                >
                  <Avatar>
                    <AvatarFallback className={currentTheme.bg}>
                      {message.sender.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium truncate", currentTheme.text)}>
                      {message.sender.fullName}
                    </p>
                    <p className={cn("text-sm truncate", currentTheme.textSecondary)}>
                      {message.content}
                    </p>
                  </div>
                  <div className={cn("text-xs", currentTheme.textSecondary)}>
                    {format(new Date(message.createdAt), 'MMM d')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-8">
          {selectedContact ? (
            <div className={cn(
              "rounded-lg border",
              currentTheme.cardBg,
              currentTheme.border
            )}>
              {/* Chat header */}
              <div className={cn(
                "border-b p-4",
                currentTheme.border
              )}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback className={currentTheme.bg}>
                        {messages.find(m => m.sender.id === selectedContact)?.sender.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={cn("font-medium", currentTheme.text)}>
                        {messages.find(m => m.sender.id === selectedContact)?.sender.fullName}
                      </p>
                      <p className={currentTheme.textSecondary}>
                        {messages.find(m => m.sender.id === selectedContact)?.sender.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={currentTheme.text}
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={currentTheme.text}
                    >
                      <Forward className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className={currentTheme.text}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className={currentTheme.bg}>
                        <DropdownMenuItem className={currentTheme.text}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className={currentTheme.text}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Messages list */}
              <div className={cn(
                "h-[calc(100vh-300px)] overflow-y-auto p-4",
                currentTheme.bg,
                "custom-scrollbar"
              )}>
                <div className="space-y-4">
                  {messages
                    .filter(m => m.sender.id === selectedContact || m.recipient.id === selectedContact)
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender.id === selectedContact ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            message.sender.id === selectedContact
                              ? currentTheme.messageReceived
                              : currentTheme.messageSent,
                            message.sender.id === selectedContact
                              ? currentTheme.text
                              : 'text-white'
                          )}
                        >
                          {message.subject && (
                            <p className="font-medium mb-1">{message.subject}</p>
                          )}
                          <p>{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className={cn(
                              "text-xs",
                              message.sender.id === selectedContact
                                ? currentTheme.textSecondary
                                : 'text-white/70'
                            )}>
                              {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4"
                                onClick={() => handleStarMessage(message.id)}
                                disabled={isStarring === message.id}
                              >
                                {isStarring === message.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Star className={`h-3 w-3 ${message.isStarred ? 'fill-yellow-400' : ''}`} />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message composer */}
              <div className={cn(
                "border-t p-4",
                currentTheme.border
              )}>
                <MessageComposer
                  onSend={handleMessageSend}
                  messageType={selectedMessageType}
                  showPhoneInput={selectedMessageType === 'phone'}
                />
              </div>
            </div>
          ) : (
            <div className={cn(
              "h-full flex items-center justify-center",
              currentTheme.textSecondary
            )}>
              Select a contact to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 