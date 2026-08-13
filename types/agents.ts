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


export interface ContextualToxicityResult {
  messageId: number;
  baseToxicity: number; // 0-1 raw toxicity score
  contextualToxicity: number; // 0-1 context-adjusted score
  toxicityCategories: string[]; // ['hate_speech', 'harassment', 'threat', 'cyberbullying']
  confidenceScore: number; // 0-1
  relationshipImpact: 'escalating' | 'de-escalating' | 'neutral' | 'playful_banter';
  contextInfluence: {
    influencingMessageIds: number[];
    escalationTriggers: string[]; // What caused escalation
    relationshipContext: 'friendly_banter' | 'heated_argument' | 'genuine_hostility' | 'professional_disagreement';
    conversationTone: 'deteriorating' | 'stable' | 'improving';
  };
  recommendedAction: 'no_action' | 'warn_users' | 'moderate_content' | 'escalate_to_admin';
}

export interface EscalationAnalysis {
  userPair: string;
  escalationLevel: number; // 0-1 scale
  escalationPattern: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
  triggerEvents: {
    messageId: number;
    escalationJump: number;
    context: string;
  }[];
  relationshipRisk: 'low' | 'medium' | 'high' | 'severe';
  interventionRecommended: boolean;
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