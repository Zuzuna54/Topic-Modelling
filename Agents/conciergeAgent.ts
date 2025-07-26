import { EventEmitter } from 'events';
import { InMemoryGraph, Message, User, Topic, Conversation } from '../types';
import { MockTreeGenerator } from '../services/mockTreeGenerator';
import { SimulatedEvent } from '../simulators/eventSimulator';
import { BatchReadyEvent } from '../rafts/accumulator_raft';
import { 
  MockSentimentAgent, 
  MockEmbeddingAgent, 
  MockToxicityAgent, 
  MockTopicAgent, 
  MockRelationshipAgent, 
  MockSpamAgent, 
  MockEmojiAgent 
} from './mockAgents';
import { 
  MessageContext, 
  ContextualSentimentResult, 
  EmbeddingResult, 
  ToxicityResult, 
  TopicResult, 
  RelationshipUpdate, 
  SpamResult 
} from './interfaces';

export class ConciergeAgent extends EventEmitter {
  private graph: InMemoryGraph;
  private isProcessing = false;
  private processingQueue: BatchReadyEvent[] = [];
  
  // Mock Agents
  private sentimentAgent: MockSentimentAgent;
  private embeddingAgent: MockEmbeddingAgent;
  private toxicityAgent: MockToxicityAgent;
  private topicAgent: MockTopicAgent;
  private relationshipAgent: MockRelationshipAgent;
  private spamAgent: MockSpamAgent;
  private emojiAgent: MockEmojiAgent;

  constructor() {
    super();
    
    // Initialize with empty graph (will be loaded or created)
    this.graph = MockTreeGenerator.generateMockTree(1);
    
    // Initialize mock agents
    this.sentimentAgent = new MockSentimentAgent();
    this.embeddingAgent = new MockEmbeddingAgent();
    this.toxicityAgent = new MockToxicityAgent();
    this.topicAgent = new MockTopicAgent();
    this.relationshipAgent = new MockRelationshipAgent();
    this.spamAgent = new MockSpamAgent();
    this.emojiAgent = new MockEmojiAgent();
    
    console.log('🎭 Concierge Agent initialized');
  }

  async initialize(groupId: number = 1): Promise<void> {
    try {
      console.log(`🎭 Initializing Concierge Agent for group ${groupId}`);
      
      // In Phase 1, we'll use mock data
      // In later phases, this would load from database
      this.graph = MockTreeGenerator.generateMockTree(groupId);
      
      console.log(`✅ Concierge Agent ready - loaded graph with ${this.graph.stats.totalMessages} messages`);
      
      this.emit('agentReady', {
        groupId: this.graph.groupId,
        stats: this.graph.stats
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Concierge Agent:', error);
      throw error;
    }
  }

  async processBatch(batchEvent: BatchReadyEvent): Promise<void> {
    console.log(`🎭 Concierge Agent: Received batch with ${batchEvent.messages.length} messages`);
    
    // Add to queue if currently processing
    if (this.isProcessing) {
      this.processingQueue.push(batchEvent);
      console.log(`📥 Batch queued (queue size: ${this.processingQueue.length})`);
      return;
    }

    this.isProcessing = true;
    
    try {
      await this.processMessageBatch(batchEvent);
      
      // Process queued batches
      while (this.processingQueue.length > 0) {
        const nextBatch = this.processingQueue.shift()!;
        await this.processMessageBatch(nextBatch);
      }
      
    } catch (error) {
      console.error('❌ Failed to process batch:', error);
      this.emit('processingError', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processMessageBatch(batchEvent: BatchReadyEvent): Promise<void> {
    const { messages } = batchEvent;
    console.log(`🔄 Processing batch of ${messages.length} messages`);

    // Step 1: Input Validation & Pre-filtering
    console.log('📋 Step 1: Input Validation & Pre-filtering');
    const validatedMessages = this.validateAndFilter(messages);
    console.log(`✅ ${validatedMessages.length}/${messages.length} messages passed validation`);

    if (validatedMessages.length === 0) {
      console.log('⚠️ No valid messages to process');
      return;
    }

    // Step 2: Spam Detection (Sequential)
    console.log('🚫 Step 2: Spam Detection');
    const spamResults = await this.spamAgent.detect(validatedMessages.map(m => m.content));
    const cleanMessages = validatedMessages.filter((_, index) => !spamResults[index].isSpam);
    console.log(`✅ ${cleanMessages.length}/${validatedMessages.length} messages passed spam filter`);

    if (cleanMessages.length === 0) {
      console.log('⚠️ All messages filtered as spam');
      return;
    }

    // Step 3: Emoji Processing (Sequential)
    console.log('😀 Step 3: Emoji Processing');
    const processedTexts = await this.emojiAgent.unemojify(cleanMessages.map(m => m.content));
    console.log(`✅ Processed emojis for ${processedTexts.length} messages`);

    // Step 4: User Management & Context Retrieval
    console.log('👥 Step 4: User Management & Context Retrieval');
    const messageContexts = this.getMessageContexts(cleanMessages);
    console.log(`✅ Retrieved context for ${messageContexts.length} messages`);

    // Step 5: Topic Determination (In-Memory)
    console.log('🏷️ Step 5: Topic Determination');
    const topicResults = await this.topicAgent.assignTopics(processedTexts);
    console.log(`✅ Assigned topics for ${topicResults.length} messages`);

    // Step 6: Parallel Agent Processing
    console.log('⚡ Step 6: Parallel Agent Processing');
    const [embeddings, sentimentResults, toxicityResults, relationshipUpdates] = await Promise.all([
      this.embeddingAgent.generate(processedTexts),
      this.sentimentAgent.analyzeWithContext(processedTexts, messageContexts),
      this.toxicityAgent.analyze(processedTexts),
      this.relationshipAgent.updateRelationships(messageContexts)
    ]);
    console.log('✅ Parallel processing completed');

    // Step 7: Graph Updates
    console.log('📊 Step 7: Updating In-Memory Graph');
    await this.updateGraph(cleanMessages, {
      embeddings,
      sentimentResults,
      toxicityResults,
      topicResults,
      relationshipUpdates
    });
    console.log('✅ Graph updated successfully');

    // Step 8: Emit Processing Complete Event
    console.log('📤 Step 8: Emitting processing complete event');
    this.emit('batchProcessed', {
      batchId: `${batchEvent.groupId}_${Date.now()}`,
      processedCount: cleanMessages.length,
      filteredCount: messages.length - cleanMessages.length,
      stats: this.graph.stats,
      timestamp: new Date()
    });

    console.log(`✅ Batch processing completed - Graph now has ${this.graph.stats.totalMessages} total messages`);
  }

  private validateAndFilter(messages: SimulatedEvent[]): SimulatedEvent[] {
    return messages.filter(message => {
      // Basic validation
      if (!message.content || message.content.trim().length === 0) {
        return false;
      }

      // Filter out very short messages (likely noise)
      if (message.content.trim().length < 3) {
        return false;
      }

      // Filter out bot commands
      if (message.content.startsWith('/') || message.content.startsWith('!')) {
        return false;
      }

      // Filter out pure URLs
      const urlPattern = /^https?:\/\/[^\s]+$/;
      if (urlPattern.test(message.content.trim())) {
        return false;
      }

      return true;
    });
  }

  private getMessageContexts(messages: SimulatedEvent[]): MessageContext[] {
    return messages.map((message, index) => {
      // Mock context retrieval - in real implementation, this would get actual relationships
      const messageContext: MessageContext = {
        messageId: message.id,
        senderId: message.userId,
        recipientIds: this.getRecipientIds(message), // Mock recipient detection
        userRelationship: this.getUserRelationship(message.userId),
        conversationContext: this.getConversationContext(message.userId),
        topicContext: this.getTopicContext(message.userId)
      };

      return messageContext;
    });
  }

  private getRecipientIds(message: SimulatedEvent): number[] {
    // Mock recipient detection - in real implementation, this would parse @mentions, etc.
    // For now, assume all other users in the graph are potential recipients
    const allUserIds = Array.from(this.graph.users.keys());
    return allUserIds.filter(id => id !== message.userId);
  }

  private getUserRelationship(userId: number): any {
    // Mock relationship retrieval
    const relationships = Array.from(this.graph.userRelationships.values());
    return relationships.find(rel => rel.userA === userId || rel.userB === userId);
  }

  private getConversationContext(userId: number): any {
    // Mock conversation context retrieval
    const contexts = Array.from(this.graph.conversationContexts.values());
    return contexts[0] || null; // Return first available context for simplicity
  }

  private getTopicContext(userId: number): number[] {
    // Mock topic context - return topics this user has participated in
    const user = this.graph.users.get(userId);
    return user ? Array.from(user.topicParticipation.keys()) : [];
  }

  private async updateGraph(
    messages: SimulatedEvent[], 
    results: {
      embeddings: EmbeddingResult[];
      sentimentResults: ContextualSentimentResult[];
      toxicityResults: ToxicityResult[];
      topicResults: TopicResult[];
      relationshipUpdates: RelationshipUpdate[];
    }
  ): Promise<void> {
    const { embeddings, sentimentResults, toxicityResults, topicResults, relationshipUpdates } = results;

    // Update messages in graph
    messages.forEach((simMessage, index) => {
      const message: Message = {
        id: simMessage.id,
        content: simMessage.content,
        userId: simMessage.userId,
        timestamp: simMessage.timestamp,
        topicId: topicResults[index]?.topicId,
        embedding: embeddings[index]?.embedding,
        sentiment: sentimentResults[index]?.baseSentiment,
        toxicity: toxicityResults[index]?.toxicityScore,
        replyToMessageId: simMessage.replyToMessageId,
        conversationId: this.determineConversationId(simMessage),
        contextualSentiment: {
          baseSentiment: sentimentResults[index]?.baseSentiment || 'neutral',
          contextualSentiment: sentimentResults[index]?.contextualSentiment || 'neutral',
          confidenceScore: sentimentResults[index]?.confidenceScore || 0.5,
          relationshipInfluence: sentimentResults[index]?.relationshipInfluence || 'neutral',
          contextMessages: sentimentResults[index]?.contextInfluence?.influencingMessageIds || []
        }
      };

      this.graph.messages.set(message.id, message);

      // Update user message tracking - create user if doesn't exist
      let user = this.graph.users.get(message.userId);
      if (!user) {
        // Create new user from real data
        user = {
          id: message.userId,
          name: `User${message.userId}`, // We don't have real names from pineapple.json
          messageIds: new Set(),
          activeConversations: new Set(),
          topicParticipation: new Map(),
          lastActivity: message.timestamp,
          recentInteractions: new Map(),
          communicationStyle: {
            averageMessageLength: message.content.length,
            emojiUsage: 0,
            responsePattern: 'unknown' as any,
            topTopics: []
          }
        };
        this.graph.users.set(message.userId, user);
        console.log(`👤 Created new user: User${message.userId} (ID: ${message.userId})`);
      }
      
      // Update user data
      user.messageIds.add(message.id);
      user.lastActivity = message.timestamp;
      
      // Update communication style with real data
      const currentAvgLength = user.communicationStyle.averageMessageLength;
      const messageCount = user.messageIds.size;
      user.communicationStyle.averageMessageLength = 
        ((currentAvgLength * (messageCount - 1)) + message.content.length) / messageCount;
      
      // Update topic participation
      if (message.topicId) {
        const currentCount = user.topicParticipation.get(message.topicId) || 0;
        user.topicParticipation.set(message.topicId, currentCount + 1);
        
        // Update top topics
        const topTopics = Array.from(user.topicParticipation.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([topicId]) => topicId);
        user.communicationStyle.topTopics = topTopics;
      }

      // Update topic message tracking
      if (message.topicId) {
        const topic = this.graph.topics.get(message.topicId);
        if (topic) {
          topic.messageIds.add(message.id);
          topic.userIds.add(message.userId);
          topic.messageCount++;
          topic.lastUpdated = message.timestamp;
        }
      }
    });

    // Update statistics
    this.graph.stats.totalMessages = this.graph.messages.size;
    this.graph.stats.totalUsers = this.graph.users.size;
    this.graph.stats.lastProcessedTime = new Date();

    console.log(`📊 Graph updated: ${this.graph.stats.totalMessages} total messages, ${this.graph.stats.totalUsers} total users`);
  }

  private determineConversationId(message: SimulatedEvent): string {
    // Mock conversation detection - in real implementation, this would use sophisticated logic
    if (message.replyToMessageId) {
      const replyTo = this.graph.messages.get(message.replyToMessageId);
      if (replyTo?.conversationId) {
        return replyTo.conversationId;
      }
    }

    // Generate new conversation ID
    return `conv_${message.groupId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for system monitoring
  getGraphStats(): any {
    return {
      ...this.graph.stats,
      graphSize: {
        messages: this.graph.messages.size,
        users: this.graph.users.size,
        topics: this.graph.topics.size,
        conversations: this.graph.conversations.size,
        relationships: this.graph.userRelationships.size
      },
      indexes: {
        messagesByUser: this.graph.messagesByUser.size,
        messagesByTopic: this.graph.messagesByTopic.size,
        activeConversations: this.graph.activeConversations.size
      }
    };
  }

  getProcessingStatus(): any {
    return {
      isProcessing: this.isProcessing,
      queueSize: this.processingQueue.length,
      lastProcessed: this.graph.stats.lastProcessedTime
    };
  }

  // Export graph for visualization/debugging
  exportGraph(): InMemoryGraph {
    return this.graph;
  }
} 