import { useState } from 'react';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

interface ContactsListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

export default function ContactsList({
  contacts,
  selectedContact,
  onSelectContact,
}: ContactsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'LAWYER' | 'COORDINATOR'>('ALL');

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'ALL' || contact.userRole === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full md:w-80 h-full border-r dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
      {/* Search and Filter */}
      <div className="p-4 border-b dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 mt-4">
          {(['ALL', 'LAWYER', 'COORDINATOR'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                filter === option
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {option === 'ALL' ? 'All' : option.charAt(0) + option.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No contacts found
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-800">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className={cn(
                  'w-full p-4 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                  selectedContact?.id === contact.id && 'bg-gray-100 dark:bg-gray-800'
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {contact.fullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  {contact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium truncate dark:text-white">
                      {contact.fullName}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {contact.isOnline 
                        ? 'Online' 
                        : contact.lastSeen 
                          ? format(new Date(contact.lastSeen), 'p')
                          : 'Offline'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {contact.userRole.charAt(0) + contact.userRole.slice(1).toLowerCase()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 