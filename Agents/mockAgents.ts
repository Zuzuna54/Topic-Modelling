
import { 
  MessageContext, 
  ContextualSentimentResult, 
  EmbeddingResult,
  ContextualToxicityResult,
  EscalationAnalysis,
  TopicResult, 
  RelationshipUpdate, 
  SpamResult 
} from '../types/agents';

export class MockSentimentAgent {
  async analyzeWithContext(
    messages: string[], 
    contexts: MessageContext[]
  ): Promise<ContextualSentimentResult[]> {
    console.log(`MockSentimentAgent: Analyzing ${messages.length} messages with context`);
    
    return messages.map((message, index) => {
      const context = contexts[index];
      
      // Mock sentiment analysis based on keywords
      let baseSentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      let contextualSentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      
      // Simple keyword-based sentiment
      const positive = ['good', 'great', 'awesome', 'love', 'excellent', 'amazing', '🎉', '😊'];
      const negative = ['bad', 'terrible', 'hate', 'awful', 'worst', '😠', '😢'];
      
      const lowerMessage = message.toLowerCase();
      
      if (positive.some(word => lowerMessage.includes(word))) {
        baseSentiment = 'positive';
        contextualSentiment = 'positive';
      } else if (negative.some(word => lowerMessage.includes(word))) {
        baseSentiment = 'negative';
        contextualSentiment = 'negative';
      }
      
      // Relationship influence (mock)
      let relationshipInfluence: 'strengthened' | 'weakened' | 'neutral' = 'neutral';
      if (context.userRelationship?.relationshipType === 'friendly') {
        relationshipInfluence = 'strengthened';
      }

      return {
        messageId: context.messageId,
        baseSentiment,
        contextualSentiment,
        confidenceScore: 0.7 + Math.random() * 0.3, // 0.7 - 1.0
        relationshipInfluence,
        contextInfluence: {
          influencingMessageIds: [],
          contextShift: 'No significant shift',
          emotionalTrajectory: 'stable'
        }
      };
    });
  }
}

export class MockEmbeddingAgent {
  async generate(messages: string[]): Promise<EmbeddingResult[]> {
    console.log(`MockEmbeddingAgent: Generating embeddings for ${messages.length} messages`);
    
    return messages.map((message, index) => ({
      messageId: index + 1, // Will be updated by concierge with real message ID
      embedding: Array.from({ length: 384 }, () => Math.random() - 0.5), // Mock 384-dim embedding
      confidence: 0.8 + Math.random() * 0.2 // 0.8 - 1.0
    }));
  }
}

export class MockToxicityAgent {
  // Enhanced contextual toxicity analysis
  async analyzeWithContext(
    messages: string[], 
    contexts: MessageContext[]
  ): Promise<ContextualToxicityResult[]> {
    console.log(`MockToxicityAgent: Analyzing contextual toxicity for ${messages.length} messages`);
    
    return messages.map((message, index) => {
      const context = contexts[index];
      
      // Base toxicity detection (same as legacy)
      const toxicWords = ['hate', 'stupid', 'idiot', 'kill', 'die', 'moron', 'loser', 'pathetic'];
      const aggressiveWords = ['shut up', 'screw you', 'whatever', 'annoying', 'dumb'];
      const lowerMessage = message.toLowerCase();
      
      const hasToxicWords = toxicWords.some(word => lowerMessage.includes(word));
      const hasAggressiveWords = aggressiveWords.some(word => lowerMessage.includes(word));
      
      // Calculate base toxicity (0-1)
      let baseToxicity = 0.0;
      if (hasToxicWords) {
        baseToxicity = 0.7 + Math.random() * 0.3; // 0.7-1.0 for toxic words
      } else if (hasAggressiveWords) {
        baseToxicity = 0.4 + Math.random() * 0.3; // 0.4-0.7 for aggressive words
      } else {
        baseToxicity = Math.random() * 0.2; // 0.0-0.2 for clean messages
      }

      // Relationship-aware context adjustment
      const relationship = context.userRelationship;
      const conversationContext = context.conversationContext;
      
      let contextualToxicity = baseToxicity;
      let relationshipImpact: 'escalating' | 'de-escalating' | 'neutral' | 'playful_banter' = 'neutral';
      let relationshipContext: 'friendly_banter' | 'heated_argument' | 'genuine_hostility' | 'professional_disagreement' = 'friendly_banter';
      let conversationTone: 'deteriorating' | 'stable' | 'improving' = 'stable';
      let recommendedAction: 'no_action' | 'warn_users' | 'moderate_content' | 'escalate_to_admin' = 'no_action';

      // Context-based adjustments
      if (relationship) {
        // Strong relationships can engage in playful banter
        if (relationship.relationshipType === 'friendly' && relationship.relationshipStrength > 0.7) {
          if (baseToxicity < 0.8) {
            contextualToxicity = baseToxicity * 0.3; // Reduce toxicity for friends
            relationshipImpact = 'playful_banter';
            relationshipContext = 'friendly_banter';
            recommendedAction = 'no_action';
          }
        }
        
        // Professional relationships have lower tolerance
        if (relationship.relationshipType === 'professional') {
          contextualToxicity = Math.min(baseToxicity * 1.5, 1.0); // Increase sensitivity
          relationshipContext = 'professional_disagreement';
          if (contextualToxicity > 0.5) {
            recommendedAction = 'warn_users';
          }
        }
        
        // Conflictual relationships escalate quickly
        if (relationship.relationshipType === 'conflictual') {
          contextualToxicity = Math.min(baseToxicity * 1.8, 1.0);
          relationshipImpact = 'escalating';
          relationshipContext = 'heated_argument';
          conversationTone = 'deteriorating';
          if (contextualToxicity > 0.6) {
            recommendedAction = 'moderate_content';
          }
          if (contextualToxicity > 0.8) {
            recommendedAction = 'escalate_to_admin';
          }
        }
      }

      // Conversation context analysis
      if (conversationContext && conversationContext.conversationTone) {
        if (conversationContext.conversationTone === 'negative') {
          contextualToxicity = Math.min(contextualToxicity * 1.3, 1.0);
          conversationTone = 'deteriorating';
          if (relationshipImpact === 'neutral') {
            relationshipImpact = 'escalating';
          }
        }
      }

      // Determine toxicity categories based on content and context
      const toxicityCategories: string[] = [];
      if (contextualToxicity > 0.7) {
        if (relationshipContext === 'friendly_banter') {
          // Don't categorize as harmful if it's friendly banter
        } else {
          toxicityCategories.push('harassment');
          if (hasToxicWords) toxicityCategories.push('hate_speech');
          if (contextualToxicity > 0.9) toxicityCategories.push('threat');
        }
      }
      if (contextualToxicity > 0.5 && relationshipContext === 'professional_disagreement') {
        toxicityCategories.push('inappropriate_workplace_communication');
      }

      // Mock escalation triggers
      const escalationTriggers: string[] = [];
      if (contextualToxicity > baseToxicity * 1.2) {
        escalationTriggers.push('relationship_deterioration');
      }
      if (hasToxicWords && relationshipContext !== 'friendly_banter') {
        escalationTriggers.push('hostile_language');
      }

      return {
        messageId: context.messageId,
        baseToxicity,
        contextualToxicity,
        toxicityCategories,
        confidenceScore: 0.75 + Math.random() * 0.25, // 0.75-1.0
        relationshipImpact,
        contextInfluence: {
          influencingMessageIds: [], // Mock - would analyze recent conversation
          escalationTriggers,
          relationshipContext,
          conversationTone
        },
        recommendedAction
      };
    });
  }

  // Analyze escalation patterns in conversation history
  async detectEscalationPatterns(
    conversationHistory: any // ConversationContextWindow
  ): Promise<EscalationAnalysis> {
    console.log(`MockToxicityAgent: Detecting escalation patterns for ${conversationHistory.userPair}`);
    
    // Mock escalation analysis based on conversation context
    const messages = conversationHistory.messages || [];
    const userPair = conversationHistory.userPair || 'unknown_pair';
    
    // Simple escalation detection based on message sentiment progression
    let escalationLevel = 0.0;
    let escalationPattern: 'increasing' | 'decreasing' | 'stable' | 'cyclical' = 'stable';
    
    if (messages.length > 3) {
      // Analyze sentiment trajectory to detect escalation
      const recentMessages = messages.slice(-5); // Last 5 messages
      let sentimentSum = 0;
      let negativeCount = 0;
      
      recentMessages.forEach((msg: any) => {
        if (msg.sentiment === 'negative') {
          negativeCount++;
          sentimentSum -= 1;
        } else if (msg.sentiment === 'positive') {
          sentimentSum += 1;
        }
      });
      
      escalationLevel = Math.max(0, negativeCount / recentMessages.length);
      
      if (negativeCount >= 3) {
        escalationPattern = 'increasing';
      } else if (negativeCount <= 1) {
        escalationPattern = 'decreasing';
      }
    }
    
    // Mock trigger events
    const triggerEvents = [];
    if (escalationLevel > 0.4) {
      triggerEvents.push({
        messageId: messages[messages.length - 1]?.id || 0,
        escalationJump: escalationLevel,
        context: 'negative_sentiment_sequence'
      });
    }
    
    // Determine relationship risk
    let relationshipRisk: 'low' | 'medium' | 'high' | 'severe' = 'low';
    if (escalationLevel > 0.7) relationshipRisk = 'severe';
    else if (escalationLevel > 0.5) relationshipRisk = 'high';
    else if (escalationLevel > 0.3) relationshipRisk = 'medium';
    
    return {
      userPair,
      escalationLevel,
      escalationPattern,
      triggerEvents,
      relationshipRisk,
      interventionRecommended: escalationLevel > 0.5
    };
  }
}

export class MockTopicAgent {
  private topics = [
    { id: 1, name: 'Technology Discussion', keywords: ['tech', 'software', 'AI', 'programming', 'code'] },
    { id: 2, name: 'Social Events', keywords: ['party', 'meetup', 'event', 'gathering', 'celebration'] },
    { id: 3, name: 'Work Projects', keywords: ['project', 'deadline', 'meeting', 'work', 'office'] },
    { id: 4, name: 'Personal Life', keywords: ['family', 'personal', 'life', 'weekend', 'home'] }
  ];

  async assignTopics(messages: string[]): Promise<TopicResult[]> {
    console.log(`MockTopicAgent: Assigning topics for ${messages.length} messages`);
    
    return messages.map((message, index) => {
      const lowerMessage = message.toLowerCase();
      
      // Find matching topic
      let matchedTopic = null;
      let maxScore = 0;
      
      for (const topic of this.topics) {
        const score = topic.keywords.reduce((acc, keyword) => {
          return acc + (lowerMessage.includes(keyword) ? 1 : 0);
        }, 0);
        
        if (score > maxScore) {
          maxScore = score;
          matchedTopic = topic;
        }
      }
      
      // If no topic matches well, it might be a new topic
      const confidence = maxScore > 0 ? 0.7 + (maxScore * 0.1) : 0.3;
      const isNewTopic = maxScore === 0 && message.length > 20; // Arbitrary threshold
      
      return {
        messageId: index + 1,
        topicId: matchedTopic?.id,
        topicName: matchedTopic?.name || (isNewTopic ? 'Uncategorized Discussion' : undefined),
        confidence,
        isNewTopic
      };
    });
  }
}

export class MockRelationshipAgent {
  async updateRelationships(contexts: MessageContext[]): Promise<RelationshipUpdate[]> {
    console.log(`MockRelationshipAgent: Updating relationships for ${contexts.length} message contexts`);
    
    // Group contexts by user pairs
    const userPairs = new Map<string, MessageContext[]>();
    
    contexts.forEach(context => {
      context.recipientIds.forEach(recipientId => {
        if (recipientId !== context.senderId) {
          const userPair = [context.senderId, recipientId].sort().join('_');
          if (!userPairs.has(userPair)) {
            userPairs.set(userPair, []);
          }
          userPairs.get(userPair)!.push(context);
        }
      });
    });
    
    const updates: RelationshipUpdate[] = [];
    
    userPairs.forEach((pairContexts, userPair) => {
      // Mock relationship strength change
      const strengthChange = (Math.random() - 0.5) * 0.1; // -0.05 to +0.05
      
      updates.push({
        userPair,
        strengthChange,
        typeChange: strengthChange > 0.03 ? 'friendly' : undefined,
        newPatterns: {
          responseTimeAvg: 5 + Math.random() * 30, // 5-35 minutes
          initiationBalance: (Math.random() - 0.5) * 2, // -1 to 1
          sentimentTrend: Array.from({ length: 5 }, () => Math.random() - 0.5)
        },
        triggerEvents: strengthChange > 0.03 ? ['positive_interaction'] : []
      });
    });
    
    return updates;
  }
}

export class MockSpamAgent {
  async detect(messages: string[]): Promise<SpamResult[]> {
    console.log(`MockSpamAgent: Detecting spam in ${messages.length} messages`);
    
    return messages.map((message, index) => {
      // Mock spam detection
      const spamIndicators = ['buy now', 'click here', 'free money', 'act fast', 'limited time'];
      const lowerMessage = message.toLowerCase();
      
      const spamScore = spamIndicators.reduce((score, indicator) => {
        return score + (lowerMessage.includes(indicator) ? 1 : 0);
      }, 0);
      
      const isSpam = spamScore > 0 || message.length < 5; // Very short messages might be spam
      const reasons = [];
      
      if (spamScore > 0) reasons.push('contains_spam_keywords');
      if (message.length < 5) reasons.push('too_short');
      
      return {
        messageId: index + 1,
        isSpam,
        confidence: isSpam ? 0.8 + Math.random() * 0.2 : 0.9 + Math.random() * 0.1,
        reasons
      };
    });
  }
}

export class MockEmojiAgent {
  private emojiMap: { [key: string]: string } = {
    '😊': 'smiling',
    '😢': 'crying',
    '😠': 'angry',
    '🎉': 'celebration',
    '❤️': 'love',
    '👍': 'thumbs up',
    '👎': 'thumbs down',
    '🔥': 'fire',
    '💯': 'hundred',
    '😂': 'laughing'
  };

  async unemojify(messages: string[]): Promise<string[]> {
    console.log(`MockEmojiAgent: Converting emojis for ${messages.length} messages`);
    
    return messages.map(message => {
      let converted = message;
      
      Object.entries(this.emojiMap).forEach(([emoji, text]) => {
        converted = converted.replace(new RegExp(emoji, 'g'), ` ${text} `);
      });
      
      // Clean up extra spaces
      converted = converted.replace(/\s+/g, ' ').trim();
      
      return converted;
    });
  }
} 