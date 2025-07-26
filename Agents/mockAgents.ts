
import { 
  MessageContext, 
  ContextualSentimentResult, 
  EmbeddingResult, 
  ToxicityResult, 
  TopicResult, 
  RelationshipUpdate, 
  SpamResult 
} from './interfaces';

export class MockSentimentAgent {
  async analyzeWithContext(
    messages: string[], 
    contexts: MessageContext[]
  ): Promise<ContextualSentimentResult[]> {
    console.log(`😊 MockSentimentAgent: Analyzing ${messages.length} messages with context`);
    
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
    console.log(`📊 MockEmbeddingAgent: Generating embeddings for ${messages.length} messages`);
    
    return messages.map((message, index) => ({
      messageId: index + 1, // Will be updated by concierge with real message ID
      embedding: Array.from({ length: 384 }, () => Math.random() - 0.5), // Mock 384-dim embedding
      confidence: 0.8 + Math.random() * 0.2 // 0.8 - 1.0
    }));
  }
}

export class MockToxicityAgent {
  async analyze(messages: string[]): Promise<ToxicityResult[]> {
    console.log(`☠️ MockToxicityAgent: Analyzing toxicity for ${messages.length} messages`);
    
    return messages.map((message, index) => {
      // Mock toxicity detection
      const toxicWords = ['hate', 'stupid', 'idiot', 'kill', 'die'];
      const lowerMessage = message.toLowerCase();
      
      const hasToxicWords = toxicWords.some(word => lowerMessage.includes(word));
      const toxicityScore = hasToxicWords ? 0.7 + Math.random() * 0.3 : Math.random() * 0.2;
      
      return {
        messageId: index + 1,
        toxicityScore,
        categories: hasToxicWords ? ['hate_speech', 'harassment'] : [],
        confidence: 0.85 + Math.random() * 0.15
      };
    });
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
    console.log(`🏷️ MockTopicAgent: Assigning topics for ${messages.length} messages`);
    
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
    console.log(`🤝 MockRelationshipAgent: Updating relationships for ${contexts.length} message contexts`);
    
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
    console.log(`🚫 MockSpamAgent: Detecting spam in ${messages.length} messages`);
    
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
    console.log(`😀 MockEmojiAgent: Converting emojis for ${messages.length} messages`);
    
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