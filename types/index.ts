// Core Data Interfaces (from IMPLEMENTATION_PLAN.md)
export interface Message {
  id: number;
  content: string;
  userId: number;
  timestamp: Date;
  topicId?: number;
  embedding?: number[];
  sentiment?: string;
  toxicity?: number;
  replyToMessageId?: number;
  conversationId?: string;
  contextualSentiment?: {
    baseSentiment: string;
    contextualSentiment: string;
    confidenceScore: number;
    relationshipInfluence: string;
    contextMessages: number[];
  };
}

export interface User {
  id: number;
  name: string;
  messageIds: Set<number>;
  activeConversations: Set<string>;
  topicParticipation: Map<number, number>;
  lastActivity: Date;
  recentInteractions: Map<number, number[]>;
  communicationStyle: {
    averageMessageLength: number;
    emojiUsage: number;
    responsePattern: 'quick' | 'delayed' | 'sporadic';
    topTopics: number[];
  };
}

export interface Topic {
  id: number;
  name: string;
  representativeWords: string[];
  embedding: number[];
  messageIds: Set<number>;
  userIds: Set<number>;
  conversationIds: Set<string>;
  messageCount: number;
  lastUpdated: Date;
  relatedTopics: Set<number>;
}

export interface Conversation {
  id: string;
  participantIds: Set<number>;
  messageIds: number[];
  topicIds: Set<number>;
  startTime: Date;
  lastActivity: Date;
  isActive: boolean;
  messageFlow: {
    messageId: number;
    userId: number;
    timestamp: Date;
    replyToId?: number;
    sentimentShift?: number;
  }[];
}

export interface UserRelationship {
  userA: number;
  userB: number;
  relationshipStrength: number;
  relationshipType: 'friendly' | 'professional' | 'neutral' | 'conflictual' | 'unknown';
  interactionCount: number;
  sentimentHistory: number[];
  communicationPatterns: {
    averageResponseTime: number;
    initiationBalance: number;
    topicOverlap: Set<number>;
    conversationFrequency: number;
  };
  lastInteraction: Date;
  relationshipEvolution: {
    timestamp: Date;
    strength: number;
    type: string;
    triggerEvent?: string;
  }[];
  conversationContext: {
    recentMessages: {
      messageId: number;
      content: string;
      timestamp: Date;
      senderId: number;
      sentiment: string;
    }[];
    conversationTone: 'positive' | 'negative' | 'neutral' | 'mixed';
    topicFlow: number[];
    lastContextUpdate: Date;
  };
}

export interface ConversationContextWindow {
  userPair: string;
  messages: {
    id: number;
    content: string;
    senderId: number;
    timestamp: Date;
    sentiment?: string;
    topicId?: number;
    emotionalTone?: string;
  }[];
  windowSize: number;
  contextSummary: {
    dominantTone: string;
    topicProgression: number[];
    emotionalTrajectory: string[];
    keyPhrases: string[];
  };
  lastUpdated: Date;
}

export interface InMemoryGraph {
  groupId: number;
  messages: Map<number, Message>;
  users: Map<number, User>;
  topics: Map<number, Topic>;
  conversations: Map<string, Conversation>;
  userRelationships: Map<string, UserRelationship>;
  relationshipsByUser: Map<number, Set<string>>;
  conversationContexts: Map<string, ConversationContextWindow>;
  topicsByEmbedding: Map<string, number[]>;
  messagesByUser: Map<number, number[]>;
  messagesByTopic: Map<number, number[]>;
  messagesByConversation: Map<string, number[]>;
  activeConversations: Map<number, string[]>;
  relationshipTypes: Map<string, Set<string>>;
  strongRelationships: Set<string>;
  activeContextWindows: Map<number, Set<string>>;
  recentInteractionPairs: Set<string>;
  conversationThreads: Map<number, number[]>;
  recentMessages: number[];
  stats: {
    totalMessages: number;
    totalUsers: number;
    totalTopics: number;
    activeConversations: number;
    trackedRelationships: number;
    activeContextWindows: number;
    lastProcessedTime: Date;
  };
} 