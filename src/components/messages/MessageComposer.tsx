import { useState } from 'react';
import { Send, Paperclip, Image, Link, Settings, Mail, Phone, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { SendMethodSelector } from './SendMethodSelector';

interface MessageComposerProps {
  onSend: (message: {
    content: string;
    subject?: string;
    attachments?: File[];
    sendMethod: 'email' | 'phone' | 'web' | 'internal';
    priority: 'low' | 'medium' | 'high';
    recipient: {
      type: 'phone' | 'email' | 'contact' | 'web';
      value: string;
    };
  }) => void;
}

// Add theme styles
const themes = {
  light: {
    bg: 'bg-white',
    hover: 'hover:bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    input: 'bg-white',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    buttonText: 'text-white',
  },
  dark: {
    bg: 'bg-gray-900',
    hover: 'hover:bg-gray-800',
    border: 'border-gray-700',
    text: 'text-gray-100',
    textSecondary: 'text-gray-400',
    input: 'bg-gray-800',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    buttonText: 'text-gray-100',
  }
};

export function MessageComposer({ onSend }: MessageComposerProps) {
  const { theme } = useTheme();
  const currentTheme = theme === 'dark' ? themes.dark : themes.light;
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sendMethod, setSendMethod] = useState<'email' | 'phone' | 'web' | 'internal'>('internal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [recipient, setRecipient] = useState<{
    type: 'phone' | 'email' | 'contact' | 'web';
    value: string;
  } | null>(null);

  return (
    <div className={cn(
      "border rounded-lg p-4 space-y-4",
      currentTheme.bg,
      currentTheme.border
    )}>
      <SendMethodSelector
        onRecipientChange={(recipient) => {
          setRecipient(recipient);
          setSendMethod(recipient.type);
        }}
      />

      <Input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className={cn(
          "transition-colors duration-200",
          currentTheme.input,
          currentTheme.text,
          currentTheme.border
        )}
      />
      
      <Textarea
        placeholder="Type your message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className={cn(
          "transition-colors duration-200",
          currentTheme.input,
          currentTheme.text,
          currentTheme.border
        )}
      />

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className={cn("transition-colors", currentTheme.text)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className={cn("transition-colors", currentTheme.text)}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className={cn("transition-colors", currentTheme.text)}
          >
            <Link className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={cn("transition-colors", currentTheme.text)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className={cn(
                "transition-colors duration-200",
                currentTheme.bg,
                currentTheme.border
              )}
            >
              <DropdownMenuItem 
                onClick={() => setSendMethod('email')}
                className={cn("transition-colors", currentTheme.text)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send as Email
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSendMethod('phone')}
                className={cn("transition-colors", currentTheme.text)}
              >
                <Phone className="mr-2 h-4 w-4" />
                Send as SMS
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSendMethod('web')}
                className={cn("transition-colors", currentTheme.text)}
              >
                <Bell className="mr-2 h-4 w-4" />
                Send as Web Push
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-x-2">
          <span className={cn(
            "text-sm transition-colors",
            currentTheme.textSecondary
          )}>
            Sending as: {sendMethod.charAt(0).toUpperCase() + sendMethod.slice(1)}
          </span>
          <Button
            onClick={() => {
              if (!recipient) {
                toast.error("Please select a recipient");
                return;
              }
              
              onSend({
                content,
                subject,
                attachments,
                sendMethod,
                priority,
                recipient
              });
            }}
            className={cn(
              "transition-colors duration-200",
              currentTheme.buttonBg,
              currentTheme.buttonText
            )}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
} 