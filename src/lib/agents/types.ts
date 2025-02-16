export interface AgentInstruction {
  id: string;
  type: 'rule' | 'preference' | 'task';
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AgentNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  metadata?: Record<string, any>;
}

export interface WebsiteContent {
  url: string;
  content: string;
  lastUpdated: Date;
}

export interface AgentContext {
  instructions: AgentInstruction[];
  websiteContent: WebsiteContent[];
  userPreferences: Record<string, any>;
  notifications: AgentNotification[];
}

export interface AgentAction {
  type: string;
  payload: any;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}
