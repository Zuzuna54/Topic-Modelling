export interface MessageContext {
  messageId: number;
  senderId: number;
  recipientIds: number[];
  userRelationship?: any; // UserRelationship from types
  conversationContext: any; // ConversationContextWindow from types
  topicContext: number[];
}

export interface ContextualSentimentResult {
  messageId: number;
  baseSentiment: 'positive' | 'negative' | 'neutral';
  contextualSentiment: 'positive' | 'negative' | 'neutral';
  confidenceScore: number;
  relationshipInfluence: 'strengthened' | 'weakened' | 'neutral';
  contextInfluence: {
    influencingMessageIds: number[];
    contextShift: string;
    emotionalTrajectory: string;
  };
}

export interface EmbeddingResult {
  messageId: number;
  embedding: number[];
  confidence: number;
}

export interface ToxicityResult {
  messageId: number;
  toxicityScore: number;
  categories: string[];
  confidence: number;
}

export interface TopicResult {
  messageId: number;
  topicId?: number;
  topicName?: string;
  confidence: number;
  isNewTopic: boolean;
}

export interface RelationshipUpdate {
  userPair: string;
  strengthChange: number;
  typeChange?: string;
  newPatterns: {
    responseTimeAvg: number;
    initiationBalance: number;
    sentimentTrend: number[];
  };
  triggerEvents: string[];
}

export interface SpamResult {
  messageId: number;
  isSpam: boolean;
  confidence: number;
  reasons: string[];
} 