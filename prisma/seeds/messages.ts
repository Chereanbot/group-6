import { MessagePriority, MessageCategory } from '@prisma/client';

export const messageSeeds = [
  {
    subject: "Legal Consultation Request",
    content: "Hello, I need legal advice regarding a corporate matter.",
    senderId: "user-1",
    recipientId: "lawyer-1",
    priority: MessagePriority.MEDIUM,
    category: MessageCategory.GENERAL,
    isRead: false,
    isStarred: false,
    isArchived: false
  },
  {
    subject: "Re: Legal Consultation Request",
    content: "I've reviewed your case and would like to schedule a meeting.",
    senderId: "lawyer-1",
    recipientId: "user-1",
    priority: MessagePriority.MEDIUM,
    category: MessageCategory.GENERAL,
    isRead: false,
    isStarred: false,
    isArchived: false
  },
  {
    subject: "Meeting Schedule",
    content: "Thank you for your quick response. When would be a good time?",
    senderId: "user-1",
    recipientId: "lawyer-1",
    priority: MessagePriority.MEDIUM,
    category: MessageCategory.GENERAL,
    isRead: false,
    isStarred: false,
    isArchived: false
  }
]; 