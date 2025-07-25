import { InMemoryGraph, Message, User, Topic, Conversation, UserRelationship, ConversationContextWindow } from '../types';

export class MockTreeGenerator {
  static generateMockTree(groupId: number = 1): InMemoryGraph {
    const graph: InMemoryGraph = {
      groupId,
      messages: new Map(),
      users: new Map(),
      topics: new Map(),
      conversations: new Map(),
      userRelationships: new Map(),
      relationshipsByUser: new Map(),
      conversationContexts: new Map(),
      topicsByEmbedding: new Map(),
      messagesByUser: new Map(),
      messagesByTopic: new Map(),
      messagesByConversation: new Map(),
      activeConversations: new Map(),
      relationshipTypes: new Map(),
      strongRelationships: new Set(),
      activeContextWindows: new Map(),
      recentInteractionPairs: new Set(),
      conversationThreads: new Map(),
      recentMessages: [],
      stats: {
        totalMessages: 0,
        totalUsers: 0,
        totalTopics: 0,
        activeConversations: 0,
        trackedRelationships: 0,
        activeContextWindows: 0,
        lastProcessedTime: new Date()
      }
    };

    // Generate mock users
    this.generateMockUsers(graph);
    
    // Generate mock topics
    this.generateMockTopics(graph);
    
    // Generate mock conversations
    this.generateMockConversations(graph);
    
    // Generate mock messages
    this.generateMockMessages(graph);
    
    // Generate mock relationships
    this.generateMockRelationships(graph);
    
    // Generate mock context windows
    this.generateMockContextWindows(graph);
    
    // Update indexes and stats
    this.updateIndexesAndStats(graph);
    
    return graph;
  }

  private static generateMockUsers(graph: InMemoryGraph): void {
    const mockUsers = [
      { id: 1, name: "Alice Johnson" },
      { id: 2, name: "Bob Smith" },
      { id: 3, name: "Charlie Brown" },
      { id: 4, name: "Diana Prince" },
      { id: 5, name: "Eve Davis" },
      { id: 6, name: "Frank Miller" },
      { id: 7, name: "Grace Chen" },
      { id: 8, name: "Henry Wilson" },
      { id: 9, name: "Ivy Rodriguez" },
      { id: 10, name: "Jack Thompson" },
      { id: 11, name: "Kate Anderson" },
      { id: 12, name: "Leo Martinez" }
    ];

    mockUsers.forEach(userData => {
      const user: User = {
        id: userData.id,
        name: userData.name,
        messageIds: new Set(),
        activeConversations: new Set(),
        topicParticipation: new Map(),
        lastActivity: new Date(),
        recentInteractions: new Map(),
        communicationStyle: {
          averageMessageLength: 50 + Math.random() * 100,
          emojiUsage: Math.random() * 0.3,
          responsePattern: ['quick', 'delayed', 'sporadic'][Math.floor(Math.random() * 3)] as any,
          topTopics: []
        }
      };
      graph.users.set(user.id, user);
    });
  }

  private static generateMockTopics(graph: InMemoryGraph): void {
    const mockTopics = [
      { id: 1, name: "Technology Discussion", words: ["tech", "software", "AI", "programming"] },
      { id: 2, name: "Social Events", words: ["party", "meetup", "event", "gathering"] },
      { id: 3, name: "Work Projects", words: ["project", "deadline", "meeting", "work"] },
      { id: 4, name: "Personal Life", words: ["family", "personal", "life", "weekend"] },
      { id: 5, name: "Sports & Fitness", words: ["sports", "gym", "fitness", "exercise", "game"] },
      { id: 6, name: "Food & Cooking", words: ["food", "recipe", "cooking", "restaurant", "meal"] },
      { id: 7, name: "Travel & Adventure", words: ["travel", "vacation", "trip", "adventure", "explore"] },
      { id: 8, name: "Entertainment", words: ["movie", "music", "book", "game", "show"] },
      { id: 9, name: "Learning & Education", words: ["learn", "study", "course", "book", "knowledge"] },
      { id: 10, name: "Health & Wellness", words: ["health", "wellness", "meditation", "sleep", "mental"] }
    ];

    mockTopics.forEach(topicData => {
      const topic: Topic = {
        id: topicData.id,
        name: topicData.name,
        representativeWords: topicData.words,
        embedding: Array.from({ length: 384 }, () => Math.random() - 0.5), // Mock 384-dim embedding
        messageIds: new Set(),
        userIds: new Set(),
        conversationIds: new Set(),
        messageCount: 0,
        lastUpdated: new Date(),
        relatedTopics: new Set()
      };
      graph.topics.set(topic.id, topic);
    });
  }

  private static generateMockConversations(graph: InMemoryGraph): void {
    const conversations = [
      { id: "conv_1", participants: [1, 2], topic: 1 },
      { id: "conv_2", participants: [2, 3, 4], topic: 2 },
      { id: "conv_3", participants: [1, 5], topic: 3 },
      { id: "conv_4", participants: [6, 7, 8], topic: 5 },
      { id: "conv_5", participants: [9, 10], topic: 6 },
      { id: "conv_6", participants: [11, 12, 1], topic: 7 },
      { id: "conv_7", participants: [3, 7, 9], topic: 8 },
      { id: "conv_8", participants: [4, 8, 10, 12], topic: 9 },
      { id: "conv_9", participants: [5, 6, 11], topic: 10 },
      { id: "conv_10", participants: [2, 7, 12], topic: 4 }
    ];

    conversations.forEach(convData => {
      const conversation: Conversation = {
        id: convData.id,
        participantIds: new Set(convData.participants),
        messageIds: [],
        topicIds: new Set([convData.topic]),
        startTime: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
        lastActivity: new Date(),
        isActive: true,
        messageFlow: []
      };
      graph.conversations.set(conversation.id, conversation);
    });
  }

  private static generateMockMessages(graph: InMemoryGraph): void {
    const mockMessages = [
      // Technology Discussion
      { id: 1, content: "Hey everyone! What do you think about the new AI developments?", userId: 1, conversationId: "conv_1", topicId: 1 },
      { id: 2, content: "I think AI is revolutionary! It's changing everything.", userId: 2, conversationId: "conv_1", topicId: 1, replyTo: 1 },
      { id: 3, content: "Have you tried the new programming language features?", userId: 1, conversationId: "conv_1", topicId: 1 },
      { id: 4, content: "Yes! The syntax is so much cleaner now", userId: 2, conversationId: "conv_1", topicId: 1, replyTo: 3 },
      
      // Social Events
      { id: 5, content: "Who's coming to the party this weekend?", userId: 2, conversationId: "conv_2", topicId: 2 },
      { id: 6, content: "I'll be there! Can't wait 🎉", userId: 3, conversationId: "conv_2", topicId: 2, replyTo: 5 },
      { id: 7, content: "Should we bring anything specific?", userId: 4, conversationId: "conv_2", topicId: 2 },
      { id: 8, content: "Just bring your good vibes!", userId: 2, conversationId: "conv_2", topicId: 2, replyTo: 7 },
      
      // Work Projects
      { id: 9, content: "We need to finish the project by Friday", userId: 1, conversationId: "conv_3", topicId: 3 },
      { id: 10, content: "I can work on the documentation this week", userId: 5, conversationId: "conv_3", topicId: 3, replyTo: 9 },
      { id: 11, content: "Perfect! I'll handle the testing phase", userId: 1, conversationId: "conv_3", topicId: 3 },
      
      // Sports & Fitness
      { id: 12, content: "Anyone up for a gym session this morning?", userId: 6, conversationId: "conv_4", topicId: 5 },
      { id: 13, content: "I'm in! What time?", userId: 7, conversationId: "conv_4", topicId: 5, replyTo: 12 },
      { id: 14, content: "How about 7 AM? We can do some cardio", userId: 8, conversationId: "conv_4", topicId: 5 },
      { id: 15, content: "Perfect! See you there 💪", userId: 6, conversationId: "conv_4", topicId: 5, replyTo: 14 },
      
      // Food & Cooking
      { id: 16, content: "I tried this amazing pasta recipe yesterday!", userId: 9, conversationId: "conv_5", topicId: 6 },
      { id: 17, content: "Ooh share the recipe! I love cooking pasta", userId: 10, conversationId: "conv_5", topicId: 6, replyTo: 16 },
      { id: 18, content: "It's carbonara with a twist - added mushrooms", userId: 9, conversationId: "conv_5", topicId: 6 },
      { id: 19, content: "That sounds delicious! I'll try it this weekend", userId: 10, conversationId: "conv_5", topicId: 6, replyTo: 18 },
      
      // Travel & Adventure
      { id: 20, content: "Planning a trip to Japan next month!", userId: 11, conversationId: "conv_6", topicId: 7 },
      { id: 21, content: "Amazing! I went there last year. Tokyo is incredible", userId: 12, conversationId: "conv_6", topicId: 7, replyTo: 20 },
      { id: 22, content: "Any recommendations for must-visit places?", userId: 1, conversationId: "conv_6", topicId: 7 },
      { id: 23, content: "Definitely visit Kyoto and try the cherry blossoms!", userId: 12, conversationId: "conv_6", topicId: 7, replyTo: 22 },
      
      // Entertainment
      { id: 24, content: "Did anyone watch the new sci-fi movie last night?", userId: 3, conversationId: "conv_7", topicId: 8 },
      { id: 25, content: "Yes! The special effects were mind-blowing", userId: 7, conversationId: "conv_7", topicId: 8, replyTo: 24 },
      { id: 26, content: "I'm planning to see it this weekend", userId: 9, conversationId: "conv_7", topicId: 8 },
      { id: 27, content: "You'll love it! The plot twists are amazing", userId: 3, conversationId: "conv_7", topicId: 8, replyTo: 26 },
      
      // Learning & Education
      { id: 28, content: "Started an online course on data science", userId: 4, conversationId: "conv_8", topicId: 9 },
      { id: 29, content: "That's great! Which platform are you using?", userId: 8, conversationId: "conv_8", topicId: 9, replyTo: 28 },
      { id: 30, content: "I'm using Coursera. The content is really comprehensive", userId: 10, conversationId: "conv_8", topicId: 9 },
      { id: 31, content: "I might join you! Been wanting to learn ML", userId: 12, conversationId: "conv_8", topicId: 9, replyTo: 30 },
      
      // Health & Wellness
      { id: 32, content: "Starting a meditation routine this week", userId: 5, conversationId: "conv_9", topicId: 10 },
      { id: 33, content: "That's wonderful! I've been meditating for 6 months", userId: 6, conversationId: "conv_9", topicId: 10, replyTo: 32 },
      { id: 34, content: "Any tips for beginners?", userId: 11, conversationId: "conv_9", topicId: 10 },
      { id: 35, content: "Start with just 5 minutes a day. Consistency matters!", userId: 6, conversationId: "conv_9", topicId: 10, replyTo: 34 },
      
      // Personal Life
      { id: 36, content: "Family dinner tonight! Mom's making her famous lasagna", userId: 2, conversationId: "conv_10", topicId: 4 },
      { id: 37, content: "That sounds amazing! Family time is so important", userId: 7, conversationId: "conv_10", topicId: 4, replyTo: 36 },
      { id: 38, content: "Agreed! Nothing beats home-cooked meals", userId: 12, conversationId: "conv_10", topicId: 4 },
      { id: 39, content: "You're making me miss my family now 😊", userId: 2, conversationId: "conv_10", topicId: 4, replyTo: 38 },
      
      // Additional diverse messages
      { id: 40, content: "Coffee break anyone? The new café downtown is amazing", userId: 8, conversationId: "conv_5", topicId: 6 }
    ];

    mockMessages.forEach(msgData => {
      const message: Message = {
        id: msgData.id,
        content: msgData.content,
        userId: msgData.userId,
        timestamp: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
        topicId: msgData.topicId,
        conversationId: msgData.conversationId,
        replyToMessageId: msgData.replyTo,
        embedding: Array.from({ length: 384 }, () => Math.random() - 0.5), // Mock embedding
        sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
        toxicity: Math.random() * 0.1, // Low toxicity for mock data
        contextualSentiment: {
          baseSentiment: 'neutral',
          contextualSentiment: 'positive',
          confidenceScore: 0.85,
          relationshipInfluence: 'neutral',
          contextMessages: []
        }
      };
      graph.messages.set(message.id, message);
      
      // Update user messageIds
      const user = graph.users.get(message.userId);
      if (user) {
        user.messageIds.add(message.id);
      }
      
      // Update topic messageIds and userIds
      if (message.topicId) {
        const topic = graph.topics.get(message.topicId);
        if (topic) {
          topic.messageIds.add(message.id);
          topic.userIds.add(message.userId);
          topic.messageCount++;
        }
      }
      
      // Update conversation messageIds
      if (message.conversationId) {
        const conversation = graph.conversations.get(message.conversationId);
        if (conversation) {
          conversation.messageIds.push(message.id);
        }
      }
    });
  }

  private static generateMockRelationships(graph: InMemoryGraph): void {
    const relationships = [
      { userA: 1, userB: 2, type: 'friendly', strength: 0.8 },
      { userA: 2, userB: 3, type: 'professional', strength: 0.6 },
      { userA: 1, userB: 5, type: 'professional', strength: 0.7 },
      { userA: 3, userB: 4, type: 'friendly', strength: 0.75 },
      { userA: 6, userB: 7, type: 'friendly', strength: 0.85 },
      { userA: 7, userB: 8, type: 'professional', strength: 0.65 },
      { userA: 9, userB: 10, type: 'friendly', strength: 0.9 },
      { userA: 11, userB: 12, type: 'professional', strength: 0.7 },
      { userA: 1, userB: 11, type: 'friendly', strength: 0.8 },
      { userA: 4, userB: 8, type: 'professional', strength: 0.6 },
      { userA: 5, userB: 6, type: 'neutral', strength: 0.5 },
      { userA: 9, userB: 7, type: 'friendly', strength: 0.7 },
      { userA: 2, userB: 12, type: 'professional', strength: 0.65 },
      { userA: 10, userB: 12, type: 'friendly', strength: 0.8 },
      { userA: 3, userB: 7, type: 'neutral', strength: 0.55 },
      { userA: 8, userB: 10, type: 'professional', strength: 0.7 }
    ];

    relationships.forEach(relData => {
      const relationshipKey = `${Math.min(relData.userA, relData.userB)}_${Math.max(relData.userA, relData.userB)}`;
      const relationship: UserRelationship = {
        userA: relData.userA,
        userB: relData.userB,
        relationshipStrength: relData.strength,
        relationshipType: relData.type as any,
        interactionCount: Math.floor(Math.random() * 50) + 10,
        sentimentHistory: Array.from({ length: 10 }, () => Math.random() - 0.5),
        communicationPatterns: {
          averageResponseTime: Math.random() * 60, // 0-60 minutes
          initiationBalance: (Math.random() - 0.5) * 2, // -1 to 1
          topicOverlap: new Set([1, 2]),
          conversationFrequency: Math.random() * 10 // conversations per week
        },
        lastInteraction: new Date(),
        relationshipEvolution: [{
          timestamp: new Date(),
          strength: relData.strength,
          type: relData.type,
          triggerEvent: 'initial_assessment'
        }],
        conversationContext: {
          recentMessages: [],
          conversationTone: 'neutral',
          topicFlow: [1, 2],
          lastContextUpdate: new Date()
        }
      };
      graph.userRelationships.set(relationshipKey, relationship);
    });
  }

  private static generateMockContextWindows(graph: InMemoryGraph): void {
    graph.userRelationships.forEach((relationship, key) => {
      const contextWindow: ConversationContextWindow = {
        userPair: key,
        messages: [],
        windowSize: 10,
        contextSummary: {
          dominantTone: 'neutral',
          topicProgression: [1, 2],
          emotionalTrajectory: ['neutral', 'positive'],
          keyPhrases: ['project', 'meeting', 'weekend']
        },
        lastUpdated: new Date()
      };
      graph.conversationContexts.set(key, contextWindow);
    });
  }

  private static updateIndexesAndStats(graph: InMemoryGraph): void {
    // Update stats
    graph.stats = {
      totalMessages: graph.messages.size,
      totalUsers: graph.users.size,
      totalTopics: graph.topics.size,
      activeConversations: graph.conversations.size,
      trackedRelationships: graph.userRelationships.size,
      activeContextWindows: graph.conversationContexts.size,
      lastProcessedTime: new Date()
    };

    // Update indexes (basic implementation for Phase 1)
    graph.messages.forEach((message, messageId) => {
      // Update messagesByUser
      if (!graph.messagesByUser.has(message.userId)) {
        graph.messagesByUser.set(message.userId, []);
      }
      graph.messagesByUser.get(message.userId)!.push(messageId);

      // Update messagesByTopic
      if (message.topicId && !graph.messagesByTopic.has(message.topicId)) {
        graph.messagesByTopic.set(message.topicId, []);
      }
      if (message.topicId) {
        graph.messagesByTopic.get(message.topicId)!.push(messageId);
      }

      // Update recent messages
      graph.recentMessages.push(messageId);
    });

    // Sort recent messages by timestamp
    graph.recentMessages.sort((a, b) => {
      const msgA = graph.messages.get(a)!;
      const msgB = graph.messages.get(b)!;
      return msgB.timestamp.getTime() - msgA.timestamp.getTime();
    });
  }
} 