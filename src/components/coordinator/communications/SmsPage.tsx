"use client";

import { useState, useEffect } from 'react';
import { 
  HiOutlineSearch,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineShieldCheck,
  HiOutlinePaperAirplane,
  HiOutlinePhone,
  HiOutlineTemplate,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineExclamationCircle,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineRefresh,
  HiOutlineArrowRight,
  HiOutlineEye
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Contact {
  id: string;
  fullName: string;
  phone: string;
  userRole: string;
  email?: string;
  clientProfile?: {
    phone: string;
  };
}

interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}

interface StatusHistoryItem {
  status: 'DRAFT' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  timestamp: Date;
  detail: string;
}

interface SmsMessage {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  content: string;
  status: 'DRAFT' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: Date;
}

const initialTemplates: SmsTemplate[] = [
  { id: '1', name: 'የቀጠሮ ማሳወቂያ', content: 'ውድ ${fullName}, የእርስዎ ቀጠሮ በሚቀጥለው ሳምንት ${date} ላይ ነው። እባክዎ በሰዓትዎ ይገኙ።', category: 'Appointment' },
  { id: '2', name: 'የሰነድ ማረጋገጫ', content: 'ውድ ${fullName}, የእርስዎ ሰነድ ተረጋግጧል። እባክዎ ለመውሰድ ወደ ቢሮአችን ይምጡ።', category: 'Document' },
  { id: '3', name: 'የሰነድ ማሻሻያ ጥያቄ', content: 'ውድ ${fullName}, የላኩት ሰነድ ትክክለኛ አይደለም። እባክዎ እንደገና ያስገቡ።', category: 'Document' },
  { id: '4', name: 'የክፍያ ማሳወቂያ', content: 'ውድ ${fullName}, እባክዎ የአገልግሎት ክፍያዎን ${amount} ብር በአስቸኳይ ይክፈሉ።', category: 'Payment' },
  { id: '5', name: 'የጉዳይ ሁኔታ', content: 'ውድ ${fullName}, የእርስዎ ጉዳይ በሂደት ላይ ነው። ለበለጠ መረጃ እባክዎ ቢሮአችንን ያነጋግሩ።', category: 'Case Status' },
  { id: '6', name: 'የስብሰባ ጥሪ', content: 'ውድ ${fullName}, በ${date} ከጠዋቱ ${time} ሰዓት ላይ ስብሰባ አለን። እባክዎ ይገኙ።', category: 'Meeting' },
  { id: '7', name: 'የሰነድ ማሳሰቢያ', content: 'ውድ ${fullName}, እባክዎ የሚከተሉትን ሰነዶች ያዘጋጁ: ${documents}', category: 'Document' },
  { id: '8', name: 'የጊዜ ማሳሰቢያ', content: 'ውድ ${fullName}, የሰነድ ማስገቢያ ጊዜዎ እየተቃረበ ነው። እባክዎ በ${deadline} በፊት ያስገቡ።', category: 'Deadline' },
  { id: '9', name: 'የአገልግሎት ማሳወቂያ', content: 'ውድ ${fullName}, አገልግሎታችን ከ${startTime} እስከ ${endTime} ድረስ ይሰጣል።', category: 'Service' },
  { id: '10', name: 'የቀጠሮ ለውጥ', content: 'ውድ ${fullName}, የቀጠሮዎ ቀን ተለውጧል። አዲሱ ቀጠሮ ${newDate} ${newTime} ሰዓት ላይ ነው።', category: 'Appointment' },
  { id: '11', name: 'የሰነድ ማረጋገጫ ጥያቄ', content: 'ውድ ${fullName}, እባክዎ የመታወቂያ ካርድዎን ኮፒ ይላኩልን።', category: 'Document' },
  { id: '12', name: 'የጉዳይ ማጠናቀቂያ', content: 'ውድ ${fullName}, የእርስዎ ጉዳይ በተሳካ ሁኔታ ተጠናቋል። እባክዎ ሰነዶችዎን ለመውሰድ ይምጡ።', category: 'Case Status' },
  { id: '13', name: 'የክፍያ ማረጋገጫ', content: 'ውድ ${fullName}, ክፍያዎ በተሳካ ሁኔታ ተከናውኗል። አመሰግናለሁ።', category: 'Payment' },
  { id: '14', name: 'የአስቸኳይ ጥሪ', content: 'ውድ ${fullName}, እባክዎ በአስቸኳይ ቢሮአችንን ያነጋግሩ። ጉዳይዎ አስቸኳይ ትኩረት ይፈልጋል።', category: 'Urgent' },
  { id: '15', name: 'የሰነድ ማሳሰቢያ', content: 'ውድ ${fullName}, የጎደሉ ሰነዶችዎን እባክዎ በአስቸኳይ ያስገቡ: ${missingDocuments}', category: 'Document' },
  { id: '16', name: 'የጉዳይ ማሳወቂያ', content: 'ውድ ${fullName}, በጉዳይዎ ላይ አዲስ ለውጥ አለ። እባክዎ ለዝርዝር መረጃ ያነጋግሩን።', category: 'Case Status' },
  { id: '17', name: 'የቀጠሮ ማሳሰቢያ', content: 'ውድ ${fullName}, ነገ በ${time} ሰዓት ቀጠሮ እንዳለዎት እናሳስባለን።', category: 'Appointment' },
  { id: '18', name: 'የአገልግሎት ማቋረጥ', content: 'ውድ ${fullName}, በ${date} ቢሮአችን ዝግ ይሆናል። ይቅርታ እንጠይቃለን።', category: 'Service' },
  { id: '19', name: 'የሰነድ ጥያቄ', content: 'ውድ ${fullName}, እባክዎ የሚከተሉትን ተጨማሪ ሰነዶች ያቅርቡ: ${requiredDocuments}', category: 'Document' },
  { id: '20', name: 'የምስክር ወረቀት ዝግጁ', content: 'ውድ ${fullName}, የምስክር ወረቀትዎ ዝግጁ ሆኗል። እባክዎ ለመውሰድ ይምጡ።', category: 'Document' }
];

const newTemplates: SmsTemplate[] = [
  { id: '21', name: 'Appointment Reminder', content: 'Hello ${fullName}, this is a reminder for your appointment on ${date} at ${time}. Please be on time. Thank you!', category: 'Appointment' },
  { id: '22', name: 'Document Collection Notification', content: 'Dear ${fullName}, your documents are ready for collection. Please visit our office at your earliest convenience.', category: 'Document' },
  { id: '23', name: 'Payment Reminder', content: 'Hi ${fullName}, this is a friendly reminder that your payment of ${amount} is due. Please ensure it is settled by the due date.', category: 'Payment' },
  { id: '24', name: 'Service Update', content: 'Hello ${fullName}, we wanted to inform you that your service request is currently being processed. Thank you for your patience!', category: 'Service' },
  { id: '25', name: 'Feedback Request', content: 'Dear ${fullName}, we value your feedback! Please let us know how we did by replying to this message.', category: 'Feedback' },
  { id: '26', name: 'Event Invitation', content: 'Hi ${fullName}, you are invited to our upcoming event on ${date} at ${time}. We hope to see you there!', category: 'Event' },
  { id: '27', name: 'New Feature Announcement', content: 'Hello ${fullName}, we are excited to announce a new feature that will enhance your experience. Check it out on our website!', category: 'Announcement' },
  { id: '28', name: 'Follow-Up Message', content: 'Hi ${fullName}, just following up on our last conversation. If you have any questions, feel free to reach out!', category: 'Follow-Up' },
  { id: '29', name: 'Holiday Greeting', content: 'Dear ${fullName}, wishing you a wonderful holiday season filled with joy and happiness. Thank you for being with us!', category: 'Greeting' },
  { id: '30', name: 'Service Cancellation Confirmation', content: 'Hello ${fullName}, your service has been successfully canceled as per your request. If you need further assistance, let us know.', category: 'Cancellation' }
];

export default function SmsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'admins' | 'lawyers' | 'coordinators' | 'clients'>('all');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [recentMessages, setRecentMessages] = useState<SmsMessage[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<SmsTemplate | null>(null);
  const [manualPhoneNumber, setManualPhoneNumber] = useState('');
  const [showManualSend, setShowManualSend] = useState(false);
  const [currentMessagePage, setCurrentMessagePage] = useState(1);
  const [totalMessagePages, setTotalMessagePages] = useState(1);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<SmsMessage | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    console.log('Setting initial templates:', initialTemplates);
    fetchContacts();
    setTemplates([...initialTemplates, ...newTemplates]); // Set all templates immediately
    fetchTemplates(); // Try to fetch from API as backup
    fetchRecentMessages();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coordinator/communications/users');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      
      const data = await response.json();
      const allContacts = [
        ...data.admins,
        ...data.lawyers,
        ...data.coordinators,
        ...data.clients
      ].map(contact => ({
        ...contact,
        // Use client profile phone if available, otherwise use user's phone
        phone: contact.clientProfile?.phone || contact.phone || ''
      })).filter(contact => contact.phone); // Only include contacts with phone numbers
      
      setContacts(allContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/coordinator/communications/sms/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      console.log('Fetched templates from API:', data.templates);
      if (data.templates && data.templates.length > 0) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Keep using initialTemplates if API fails
    }
  };

  const fetchRecentMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`/api/coordinator/communications/sms/recent?page=${currentMessagePage}&limit=4`);
      if (!response.ok) throw new Error('Failed to fetch recent messages');
      
      const data = await response.json();
      setRecentMessages(data.messages);
      setTotalMessagePages(data.totalPages);
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      toast.error('Failed to load recent messages');
      setError('Failed to load recent messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Replace placeholders with example values for preview
      let previewContent = template.content
        .replace('${fullName}', selectedContacts.size > 0 
          ? contacts.find(c => c.id === Array.from(selectedContacts)[0])?.fullName || 'Client Name'
          : 'Client Name')
        .replace('${date}', new Date().toLocaleDateString())
        .replace('${time}', new Date().toLocaleTimeString())
        .replace('${amount}', '1000')
        .replace('${documents}', 'ID Card, Passport')
        .replace('${deadline}', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString())
        .replace('${startTime}', '9:00 AM')
        .replace('${endTime}', '5:00 PM')
        .replace('${newDate}', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString())
        .replace('${newTime}', '2:00 PM')
        .replace('${missingDocuments}', 'Birth Certificate, Marriage Certificate')
        .replace('${requiredDocuments}', 'Application Form, Recent Photo');

      setMessage(previewContent);
      setSelectedTemplate(templateId);
      setShowTemplates(false);
    }
  };

  const handleContactToggle = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || selectedContacts.size === 0) {
      toast.error('Please select recipients and enter a message');
      return;
    }

    const confirmSend = window.confirm('Are you sure you want to send this message?');
    if (!confirmSend) return;

    try {
      setSending(true);
      const recipients = Array.from(selectedContacts).map(id => 
        contacts.find(c => c.id === id)
      ).filter(Boolean);

      const response = await fetch('/api/coordinator/communications/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipients,
          message: message,
          templateId: selectedTemplate || undefined
        })
      });

      if (!response.ok) throw new Error('Failed to send messages');

      toast.success(`Messages sent to ${selectedContacts.size} recipient(s)`);
      setMessage('');
      setSelectedContacts(new Set());
      setSelectedTemplate('');
      fetchRecentMessages();
    } catch (error) {
      console.error('Error sending messages:', error);
      toast.error('Failed to send messages');
      setError('Failed to send messages');
    } finally {
      setSending(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!message.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    const templateName = prompt('Enter a name for this template:');
    if (!templateName) return;

    try {
      const response = await fetch('/api/coordinator/communications/sms/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: templateName, content: message }),
      });

      if (!response.ok) throw new Error('Failed to save template');

      toast.success('Template saved successfully!');
      fetchTemplates(); // Refresh templates
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleClearHistory = async () => {
    const confirmClear = window.confirm('Are you sure you want to clear all message histories?');
    if (!confirmClear) return;

    try {
      const response = await fetch('/api/coordinator/communications/sms/clear-history', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear message history');

      toast.success('Message history cleared successfully!');
      setRecentMessages([]); // Clear local state
    } catch (error) {
      console.error('Error clearing message history:', error);
      toast.error('Failed to clear message history');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    const matchesFilter = filter === 'all' || contact.userRole.toLowerCase() === filter.slice(0, -1);
    return matchesSearch && matchesFilter;
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(templateSearchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-500';
      case 'SENT': return 'text-blue-500';
      case 'DRAFT': return 'text-yellow-500';
      case 'FAILED': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handlePreviewTemplate = (template: SmsTemplate) => {
    setPreviewTemplate(template);
  };

  const handleManualSend = async () => {
    if (!manualPhoneNumber.trim()) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Please select a template.');
      return;
    }

    const confirmSend = window.confirm('Are you sure you want to send this message?');
    if (!confirmSend) return;

    try {
      setSending(true);
      const response = await fetch('/api/coordinator/communications/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: [{ phone: manualPhoneNumber }],
          message: message,
          templateId: selectedTemplate
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Failed to send message: ${errorData.message || 'Unknown error'}`);
        return;
      }

      toast.success(`Message sent to ${manualPhoneNumber}`);
      setManualPhoneNumber('');
      setSelectedTemplate('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const toggleManualSend = () => {
    setShowManualSend(!showManualSend);
  };

  const handlePageChange = (page: number) => {
    setCurrentMessagePage(page);
    fetchRecentMessages();
  };

  const handleStatusClick = async (messageId: string) => {
    try {
      setLoadingStatus(true);
      const response = await fetch(`/api/coordinator/communications/sms/status/${messageId}`);
      if (!response.ok) throw new Error('Failed to fetch status history');
      
      const data = await response.json();
      // First set the selected message
      const message = recentMessages.find(msg => msg.id === messageId);
      if (message) {
        setSelectedMessage(message);
        setStatusHistory(data.history || []); // Use data.history instead of data.statusHistory
        setShowStatusModal(true);
      }
    } catch (error) {
      console.error('Error fetching status history:', error);
      toast.error('Failed to fetch status history');
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleResendMessage = async (messageId: string) => {
    try {
      const confirmResend = window.confirm('Are you sure you want to resend this message?');
      if (!confirmResend) return;

      const response = await fetch(`/api/coordinator/communications/sms/resend/${messageId}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to resend message');

      toast.success('Message resent successfully!');
      fetchRecentMessages();
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error resending message:', error);
      toast.error('Failed to resend message');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {loading && <div className="spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {/* Left sidebar - Contacts */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            SMS Communications
          </h2>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                border-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
            />
            <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>

          {/* Filter tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap
                ${filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('admins')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center whitespace-nowrap
                ${filter === 'admins'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
            >
              <HiOutlineShieldCheck className="w-4 h-4 mr-1" />
              Admins
            </button>
            <button
              onClick={() => setFilter('lawyers')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center whitespace-nowrap
                ${filter === 'lawyers'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
            >
              <HiOutlineOfficeBuilding className="w-4 h-4 mr-1" />
              Lawyers
            </button>
            <button
              onClick={() => setFilter('coordinators')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center whitespace-nowrap
                ${filter === 'coordinators'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
            >
              <HiOutlineUserGroup className="w-4 h-4 mr-1" />
              Coordinators
            </button>
            <button
              onClick={() => setFilter('clients')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center whitespace-nowrap
                ${filter === 'clients'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
            >
              <HiOutlineUserGroup className="w-4 h-4 mr-1" />
              Clients
            </button>
          </div>

          {/* Contacts list */}
          <div className="overflow-y-auto h-[calc(100vh-280px)]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map(contact => (
                  <div key={contact.id} className="flex items-center p-2">
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.id)}
                      onChange={() => handleContactToggle(contact.id)}
                      className="mr-2"
                    />
                    <span className="text-gray-900 dark:text-white">
                      {contact.fullName} ({contact.phone})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top stats bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Draft Messages */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 p-4 rounded-lg shadow-lg border border-amber-200 dark:border-amber-700">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <HiOutlineClock className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                </div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Draft</p>
                <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  {recentMessages.filter(m => m.status === 'DRAFT').length}
                </p>
              </div>
            </div>

            {/* Sent Messages */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg shadow-lg border border-blue-200 dark:border-blue-700">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <HiOutlinePaperAirplane className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Sent</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {recentMessages.filter(m => m.status === 'SENT').length}
                </p>
              </div>
            </div>

            {/* Delivered Messages */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 p-4 rounded-lg shadow-lg border border-emerald-200 dark:border-emerald-700">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <HiOutlineCheck className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Delivered</p>
                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                  {recentMessages.filter(m => m.status === 'DELIVERED').length}
                </p>
              </div>
            </div>

            {/* Failed Messages */}
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900 dark:to-rose-800 p-4 rounded-lg shadow-lg border border-rose-200 dark:border-rose-700">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <HiOutlineExclamationCircle className="w-8 h-8 text-rose-500 dark:text-rose-400" />
                </div>
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Failed</p>
                <p className="text-2xl font-bold text-rose-800 dark:text-rose-200">
                  {recentMessages.filter(m => m.status === 'FAILED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message composition area */}
        <div className="p-6 bg-white dark:bg-gray-800 shadow-sm flex-1">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Compose Message
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={toggleManualSend}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 
                    dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg border 
                    border-gray-300 dark:border-gray-600 hover:bg-gray-50 
                    dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-primary-500"
                >
                  <HiOutlinePhone className="w-5 h-5 mr-2" />
                  Send Manual SMS
                </button>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 
                    dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg border 
                    border-gray-300 dark:border-gray-600 hover:bg-gray-50 
                    dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-primary-500"
                >
                  <HiOutlineTemplate className="w-5 h-5 mr-2" />
                  Templates
                </button>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 
                    dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg border 
                    border-gray-300 dark:border-gray-600 hover:bg-gray-50 
                    dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-primary-500"
                >
                  <HiOutlineChartBar className="w-5 h-5 mr-2" />
                  Stats
                </button>
                <button
                  onClick={handleClearHistory}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-white rounded-lg border border-red-300 hover:bg-red-50"
                >
                  Clear All History
                </button>
              </div>
            </div>

            {/* Selected recipients */}
            {selectedContacts.size > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Recipients ({selectedContacts.size})
                  </h4>
                  <button
                    onClick={() => setSelectedContacts(new Set())}
                    className="text-sm text-gray-500 hover:text-gray-700 
                      dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedContacts).map(id => {
                    const contact = contacts.find(c => c.id === id);
                    if (!contact) return null;
                    return (
                      <div
                        key={id}
                        className="flex items-center bg-white dark:bg-gray-600 
                          rounded-full pl-3 pr-2 py-1"
                      >
                        <span className="text-sm text-gray-900 dark:text-white">
                          {contact.fullName}
                        </span>
                        <button
                          onClick={() => handleContactToggle(id)}
                          className="ml-2 text-gray-400 hover:text-gray-600 
                            dark:text-gray-300 dark:hover:text-gray-100"
                        >
                          <HiOutlineX className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Message input */}
            <div className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-40 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 
                  border-none focus:ring-2 focus:ring-primary-500 text-gray-900 
                  dark:text-white resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {message.length} characters
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || selectedContacts.size === 0 || !message.trim()}
                  className={`flex items-center px-6 py-2.5 rounded-lg text-white
                    ${sending || selectedContacts.size === 0 || !message.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600'
                    }`}
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 
                        border-white border-t-transparent mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <HiOutlinePaperAirplane className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recent messages */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Recent Messages
              </h3>
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 
                          flex items-center justify-center">
                          {msg.recipientName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {msg.recipientName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {msg.recipientPhone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleStatusClick(msg.id)}
                          className={`text-sm flex items-center space-x-1 ${getStatusColor(msg.status)} hover:opacity-80 cursor-pointer`}
                        >
                          <span>{msg.status}</span>
                          <HiOutlineEye className="w-4 h-4 ml-1" />
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {msg.content}
                    </p>
                  </div>
                ))}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Page {currentMessagePage} of {totalMessagePages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentMessagePage - 1)}
                      disabled={currentMessagePage === 1}
                      className={`px-3 py-1 text-sm rounded-md border
                        ${currentMessagePage === 1
                          ? 'text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                          : 'text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentMessagePage + 1)}
                      disabled={currentMessagePage === totalMessagePages}
                      className={`px-3 py-1 text-sm rounded-md border
                        ${currentMessagePage === totalMessagePages
                          ? 'text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                          : 'text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates sidebar */}
      {showTemplates && (
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <HiOutlineTemplate className="w-6 h-6 mr-2" />
                Message Templates
              </h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            {/* Search templates */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearchTerm}
                  onChange={(e) => setTemplateSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 
                    border-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
                <HiOutlineSearch className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  key="all"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors
                    ${selectedCategory === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                    }`}
                >
                  All
                </button>
                {Array.from(new Set(templates.map(t => t.category))).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors
                      ${selectedCategory === category
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates list */}
            <div className="space-y-3">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No templates found
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 
                      dark:border-gray-700 overflow-hidden hover:border-primary-500 
                      dark:hover:border-primary-500 transition-colors group"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-500">
                          {template.name}
                        </h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 
                          dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {template.content}
                      </p>
                      <div className="mt-3 flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handlePreviewTemplate(template)}
                          className="text-gray-500 text-sm font-medium flex items-center opacity-0 
                            group-hover:opacity-100 transition-opacity hover:text-gray-700"
                        >
                          Preview
                          <HiOutlineEye className="w-4 h-4 ml-1" />
                        </button>
                        <button
                          onClick={() => handleTemplateSelect(template.id)}
                          className="text-primary-500 text-sm font-medium flex items-center opacity-0 
                            group-hover:opacity-100 transition-opacity hover:text-primary-600"
                        >
                          Use Template
                          <HiOutlineArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Message Status History
              </h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedMessage(null);
                  setStatusHistory([]);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Details
                </h4>
                <p className="text-sm text-gray-900 dark:text-white">
                  To: {selectedMessage.recipientName} ({selectedMessage.recipientPhone})
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {selectedMessage.content}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status Timeline
                </h4>
                <div className="space-y-3">
                  {loadingStatus ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
                    </div>
                  ) : statusHistory.length > 0 ? (
                    statusHistory.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(item.timestamp), 'MMM d, h:mm:ss a')} - {item.detail}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Status: {selectedMessage.status}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No detailed history available</p>
                    </div>
                  )}
                </div>
              </div>
              {selectedMessage.status === 'FAILED' && (
                <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleResendMessage(selectedMessage.id)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white 
                      bg-primary-500 rounded-lg hover:bg-primary-600"
                  >
                    <HiOutlineRefresh className="w-4 h-4 mr-2" />
                    Resend Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Preview Template
              </h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Template Name
                </h4>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {previewTemplate.name}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </h4>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {previewTemplate.category}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message Preview
                </h4>
                <p className="text-sm text-gray-900 dark:text-white mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {previewTemplate.content
                    .replace('${fullName}', 'Client Name')
                    .replace('${date}', new Date().toLocaleDateString())
                    .replace('${time}', new Date().toLocaleTimeString())
                    .replace('${amount}', '1000')
                    .replace('${documents}', 'ID Card, Passport')
                    .replace('${deadline}', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString())
                    .replace('${startTime}', '9:00 AM')
                    .replace('${endTime}', '5:00 PM')
                    .replace('${newDate}', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString())
                    .replace('${newTime}', '2:00 PM')
                    .replace('${missingDocuments}', 'Birth Certificate, Marriage Certificate')
                    .replace('${requiredDocuments}', 'Application Form, Recent Photo')}
                </p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border 
                    border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleTemplateSelect(previewTemplate.id);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 
                    rounded-lg hover:bg-primary-600"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showManualSend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Send Manual SMS
              </h3>
              <button
                onClick={() => setShowManualSend(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={manualPhoneNumber}
                  onChange={(e) => setManualPhoneNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Template
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {templates.slice(0, 10).map(template => (
                    <div key={template.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      <input
                        type="radio"
                        name="template"
                        value={template.id}
                        checked={selectedTemplate === template.id}
                        onChange={() => handleTemplateSelect(template.id)}
                        className="mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{template.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowManualSend(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border 
                    border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSend}
                  disabled={!manualPhoneNumber.trim() || !selectedTemplate}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg
                    ${(!manualPhoneNumber.trim() || !selectedTemplate)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600'
                    }`}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 