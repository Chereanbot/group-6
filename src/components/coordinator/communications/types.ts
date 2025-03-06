export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'LAWYER' | 'COORDINATOR' | 'KEBELE_MANAGER' | 'KEBELE_MEMBER';

export interface KebeleProfile {
  kebeleName: string;
  subCity: string;
  district: string;
  position?: string;
  phone?: string;
}

export interface BaseUser {
  id: string;
  fullName: string;
  email: string;
  userRole: UserRole;
  isOnline: boolean;
  lastSeen: Date | null;
  status: string;
}

export interface ChatUser extends BaseUser {
  starred: boolean;
  unreadCount: number;
  coordinatorProfile?: {
    office?: {
      id: string;
      name: string;
    };
  };
  avatar?: string;
}

export interface CommunicationUser extends BaseUser {
  lawyerProfile?: {
    specializations?: {
      specialization: {
        name: string;
      };
    }[];
  } | null;
  clientProfile?: {
    caseType?: string;
    caseCategory?: string;
  } | null;
  kebeleProfile?: KebeleProfile;
}

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface MessageAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
  publicId: string;
  resourceType: string;
  format: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  recipientId?: string;
  chatId: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  isForwarded?: boolean;
  originalMessageId?: string;
  attachments?: MessageAttachment[];
}

export interface Chat {
  id: string;
  user: ChatUser;
  lastMessage: Message | null;
  unreadCount: number;
}; 