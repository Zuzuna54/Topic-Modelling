# Phase 1 Implementation Plan
## Foundation Components with Mock Orchestration

### Overview
Phase 1 focuses on building the core infrastructure and orchestration flow with mocked agent responses. This allows us to validate the system architecture, data flow, and component interactions before implementing the complex AI processing logic.

### Goals
- ✅ Create a visual mock tree representation for testing
- ✅ Build Event Simulator for pineapple.json processing
- ✅ Implement Accumulator Raft for message batching
- ✅ Develop Concierge Agent with complete orchestration flow
- ✅ Mock all individual agent responses with realistic data
- ✅ Validate end-to-end message processing pipeline

---

## Step 1: Mock Tree Creation & Visualization

### 1.1 Create Mock Data Structures
Based on the IMPLEMENTATION_PLAN.md specifications, create TypeScript interfaces and a mock tree populated with sample data.

**File**: `types/index.ts`
```typescript
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
```

### 1.2 Create Mock Tree Generator
**File**: `services/mockTreeGenerator.ts`
```typescript
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
      { id: 5, name: "Eve Davis" }
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
      { id: 4, name: "Personal Life", words: ["family", "personal", "life", "weekend"] }
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
      { id: "conv_3", participants: [1, 5], topic: 3 }
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
      { id: 1, content: "Hey everyone! What do you think about the new AI developments?", userId: 1, conversationId: "conv_1", topicId: 1 },
      { id: 2, content: "I think AI is revolutionary! It's changing everything.", userId: 2, conversationId: "conv_1", topicId: 1, replyTo: 1 },
      { id: 3, content: "Who's coming to the party this weekend?", userId: 2, conversationId: "conv_2", topicId: 2 },
      { id: 4, content: "I'll be there! Can't wait 🎉", userId: 3, conversationId: "conv_2", topicId: 2, replyTo: 3 },
      { id: 5, content: "We need to finish the project by Friday", userId: 1, conversationId: "conv_3", topicId: 3 }
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
    });
  }

  private static generateMockRelationships(graph: InMemoryGraph): void {
    const relationships = [
      { userA: 1, userB: 2, type: 'friendly', strength: 0.8 },
      { userA: 2, userB: 3, type: 'professional', strength: 0.6 },
      { userA: 1, userB: 5, type: 'professional', strength: 0.7 }
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
```

### 1.3 Create Tree Visualizer
**File**: `services/treeVisualizer.ts`
```typescript
import { InMemoryGraph } from '../types';

export class TreeVisualizer {
  static generateTextVisualization(graph: InMemoryGraph): string {
    let output = '';
    
    output += '📊 SOCIAL GRAPH VISUALIZATION\n';
    output += '=' .repeat(50) + '\n\n';
    
    // Stats Overview
    output += '📈 STATISTICS:\n';
    output += `- Messages: ${graph.stats.totalMessages}\n`;
    output += `- Users: ${graph.stats.totalUsers}\n`;
    output += `- Topics: ${graph.stats.totalTopics}\n`;
    output += `- Conversations: ${graph.stats.activeConversations}\n`;
    output += `- Relationships: ${graph.stats.trackedRelationships}\n`;
    output += `- Context Windows: ${graph.stats.activeContextWindows}\n\n`;
    
    // Users Section
    output += '👥 USERS:\n';
    graph.users.forEach(user => {
      output += `  ${user.id}. ${user.name}\n`;
      output += `     Messages: ${user.messageIds.size}\n`;
      output += `     Style: ${user.communicationStyle.responsePattern}\n`;
      output += `     Active Convs: ${user.activeConversations.size}\n`;
    });
    output += '\n';
    
    // Topics Section
    output += '🏷️ TOPICS:\n';
    graph.topics.forEach(topic => {
      output += `  ${topic.id}. "${topic.name}"\n`;
      output += `     Words: [${topic.representativeWords.join(', ')}]\n`;
      output += `     Messages: ${topic.messageIds.size}\n`;
      output += `     Users: ${topic.userIds.size}\n`;
    });
    output += '\n';
    
    // Conversations Section
    output += '💬 CONVERSATIONS:\n';
    graph.conversations.forEach(conv => {
      const participants = Array.from(conv.participantIds)
        .map(id => graph.users.get(id)?.name || `User${id}`)
        .join(', ');
      output += `  ${conv.id}: [${participants}]\n`;
      output += `     Messages: ${conv.messageIds.length}\n`;
      output += `     Topics: ${Array.from(conv.topicIds).join(', ')}\n`;
      output += `     Active: ${conv.isActive}\n`;
    });
    output += '\n';
    
    // Recent Messages Section
    output += '📝 RECENT MESSAGES:\n';
    graph.recentMessages.slice(0, 5).forEach(msgId => {
      const msg = graph.messages.get(msgId)!;
      const user = graph.users.get(msg.userId)!;
      const topic = msg.topicId ? graph.topics.get(msg.topicId)?.name : 'No Topic';
      output += `  [${msg.id}] ${user.name}: "${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}"\n`;
      output += `       Topic: ${topic} | Sentiment: ${msg.sentiment}\n`;
    });
    output += '\n';
    
    // Relationships Section
    output += '🤝 RELATIONSHIPS:\n';
    graph.userRelationships.forEach((rel, key) => {
      const userA = graph.users.get(rel.userA)!;
      const userB = graph.users.get(rel.userB)!;
      output += `  ${userA.name} ↔ ${userB.name}\n`;
      output += `     Type: ${rel.relationshipType} | Strength: ${rel.relationshipStrength.toFixed(2)}\n`;
      output += `     Interactions: ${rel.interactionCount}\n`;
    });
    
    return output;
  }

  static generateMermaidDiagram(graph: InMemoryGraph): string {
    let output = 'graph TD\n';
    
    // Add users
    graph.users.forEach(user => {
      output += `  U${user.id}["👤 ${user.name}<br/>Messages: ${user.messageIds.size}"]\n`;
    });
    
    // Add topics
    graph.topics.forEach(topic => {
      output += `  T${topic.id}["🏷️ ${topic.name}<br/>Messages: ${topic.messageIds.size}"]\n`;
    });
    
    // Add conversations
    graph.conversations.forEach(conv => {
      output += `  C${conv.id.split('_')[1]}["💬 ${conv.id}<br/>Messages: ${conv.messageIds.length}"]\n`;
    });
    
    // Add relationships
    graph.userRelationships.forEach((rel, key) => {
      const strength = (rel.relationshipStrength * 5).toFixed(0); // Scale for line thickness
      output += `  U${rel.userA} -.->|"${rel.relationshipType}<br/>${rel.relationshipStrength.toFixed(2)}"| U${rel.userB}\n`;
    });
    
    // Connect users to topics through messages
    graph.messagesByTopic.forEach((messageIds, topicId) => {
      const userIds = new Set();
      messageIds.forEach(msgId => {
        const msg = graph.messages.get(msgId);
        if (msg) userIds.add(msg.userId);
      });
      
      userIds.forEach(userId => {
        output += `  U${userId} --> T${topicId}\n`;
      });
    });
    
    // Add styling
    output += '\n  classDef userStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n';
    output += '  classDef topicStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px\n';
    output += '  classDef convStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px\n';
    
    // Apply styles
    graph.users.forEach(user => {
      output += `  class U${user.id} userStyle\n`;
    });
    graph.topics.forEach(topic => {
      output += `  class T${topic.id} topicStyle\n`;
    });
    graph.conversations.forEach(conv => {
      output += `  class C${conv.id.split('_')[1]} convStyle\n`;
    });
    
    return output;
  }
}
```

---

## Step 2: Event Simulator Implementation

### 2.1 Event Simulator Class
**File**: `simulators/eventSimulator.ts`
```typescript
import fs from 'fs';
import { EventEmitter } from 'events';

export interface PineappleMessage {
  id: number;
  type: string;
  date: string;
  from: string;
  from_id: string;
  text: string | string[];
  reply_to_message_id?: number;
}

export interface PineappleData {
  name: string;
  type: string;
  id: number;
  messages: PineappleMessage[];
}

export interface SimulatedEvent {
  id: number;
  content: string;
  userId: number;
  timestamp: Date;
  replyToMessageId?: number;
  groupId: number;
}

export class EventSimulator extends EventEmitter {
  private data: PineappleData | null = null;
  private isSimulating = false;
  private currentIndex = 0;
  private simulationSpeed = 100; // ms between messages

  constructor() {
    super();
  }

  async loadPineappleData(filePath: string): Promise<void> {
    try {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      this.data = JSON.parse(rawData);
      console.log(`✅ Loaded ${this.data?.messages.length || 0} messages from ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to load pineapple data:', error);
      throw error;
    }
  }

  startSimulation(speed: number = 100): void {
    if (!this.data) {
      throw new Error('No data loaded. Call loadPineappleData() first.');
    }

    if (this.isSimulating) {
      console.log('⚠️ Simulation already running');
      return;
    }

    this.simulationSpeed = speed;
    this.isSimulating = true;
    this.currentIndex = 0;

    console.log(`🎬 Starting simulation with ${this.data.messages.length} messages at ${speed}ms intervals`);
    this.emit('simulationStarted', {
      totalMessages: this.data.messages.length,
      groupId: this.data.id,
      groupName: this.data.name
    });

    this.simulateNextMessage();
  }

  stopSimulation(): void {
    this.isSimulating = false;
    console.log('⏹️ Simulation stopped');
    this.emit('simulationStopped', {
      processedMessages: this.currentIndex,
      totalMessages: this.data?.messages.length || 0
    });
  }

  pauseSimulation(): void {
    this.isSimulating = false;
    console.log('⏸️ Simulation paused');
    this.emit('simulationPaused', {
      processedMessages: this.currentIndex,
      remainingMessages: (this.data?.messages.length || 0) - this.currentIndex
    });
  }

  resumeSimulation(): void {
    if (!this.data || this.currentIndex >= this.data.messages.length) {
      console.log('⚠️ Cannot resume: no data or simulation complete');
      return;
    }

    this.isSimulating = true;
    console.log('▶️ Simulation resumed');
    this.emit('simulationResumed', {
      resumeIndex: this.currentIndex,
      remainingMessages: this.data.messages.length - this.currentIndex
    });

    this.simulateNextMessage();
  }

  private simulateNextMessage(): void {
    if (!this.isSimulating || !this.data || this.currentIndex >= this.data.messages.length) {
      if (this.currentIndex >= (this.data?.messages.length || 0)) {
        console.log('✅ Simulation completed');
        this.emit('simulationCompleted', {
          totalProcessed: this.currentIndex,
          groupId: this.data?.id
        });
      }
      return;
    }

    const pineappleMsg = this.data.messages[this.currentIndex];
    
    // Skip non-message types
    if (pineappleMsg.type !== 'message' || !pineappleMsg.text) {
      this.currentIndex++;
      setImmediate(() => this.simulateNextMessage());
      return;
    }

    // Convert pineapple message to simulated event
    const simulatedEvent = this.convertToSimulatedEvent(pineappleMsg);
    
    console.log(`📤 [${this.currentIndex + 1}/${this.data.messages.length}] Emitting message: "${simulatedEvent.content.substring(0, 50)}..."`);
    
    // Emit the message event
    this.emit('message', simulatedEvent);
    
    this.currentIndex++;
    
    // Schedule next message
    setTimeout(() => this.simulateNextMessage(), this.simulationSpeed);
  }

  private convertToSimulatedEvent(pineappleMsg: PineappleMessage): SimulatedEvent {
    // Extract text content
    let content = '';
    if (typeof pineappleMsg.text === 'string') {
      content = pineappleMsg.text;
    } else if (Array.isArray(pineappleMsg.text)) {
      content = pineappleMsg.text
        .filter(item => typeof item === 'string')
        .join(' ');
    }

    // Extract user ID from from_id (remove 'user' prefix if present)
    const userId = parseInt(pineappleMsg.from_id.replace('user', ''));

    return {
      id: pineappleMsg.id,
      content: content.trim(),
      userId: userId,
      timestamp: new Date(pineappleMsg.date),
      replyToMessageId: pineappleMsg.reply_to_message_id,
      groupId: this.data!.id
    };
  }

  getSimulationStatus(): any {
    return {
      isRunning: this.isSimulating,
      currentIndex: this.currentIndex,
      totalMessages: this.data?.messages.length || 0,
      progress: this.data ? (this.currentIndex / this.data.messages.length) * 100 : 0,
      groupId: this.data?.id,
      groupName: this.data?.name
    };
  }

  setSimulationSpeed(speed: number): void {
    this.simulationSpeed = Math.max(1, speed); // Minimum 1ms
    console.log(`⚡ Simulation speed set to ${this.simulationSpeed}ms`);
  }
}
```

### 2.2 Event Simulator Test
**File**: `scripts/testEventSimulator.ts`
```typescript
import { EventSimulator } from '../simulators/eventSimulator';

async function testEventSimulator() {
  const simulator = new EventSimulator();

  // Set up event listeners
  simulator.on('simulationStarted', (data) => {
    console.log('🎬 Simulation Started:', data);
  });

  simulator.on('message', (event) => {
    console.log(`📨 Message ${event.id}: [User ${event.userId}] "${event.content}"`);
  });

  simulator.on('simulationCompleted', (data) => {
    console.log('✅ Simulation Completed:', data);
  });

  try {
    // Load pineapple data
    await simulator.loadPineappleData('./pineapple.json');
    
    // Start simulation with 500ms intervals
    simulator.startSimulation(500);
    
    // Stop after 10 seconds for testing
    setTimeout(() => {
      simulator.stopSimulation();
    }, 10000);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testEventSimulator();
}
```

---

## Step 3: Accumulator Raft Implementation

### 3.1 Redis Client Setup
**File**: `redisClient/redisClient.ts`
```typescript
import { createClient, RedisClientType } from 'redis';

export class RedisClient {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(url: string = 'redis://localhost:6379'): Promise<void> {
    try {
      this.client = createClient({ url });
      
      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('🔴 Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('🔴 Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
      console.log('🔴 Redis Client Disconnected');
    }
  }

  async addToGroup(groupId: number, message: any): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    const groupKey = `group:${groupId}:messages`;
    const countKey = `group:${groupId}:count`;

    // Add message to list
    await this.client.lPush(groupKey, JSON.stringify(message));
    
    // Increment count
    const count = await this.client.incr(countKey);
    
    return count;
  }

  async getGroupMessages(groupId: number, count: number): Promise<any[]> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    const groupKey = `group:${groupId}:messages`;
    
    // Get the last 'count' messages and remove them
    const messages = await this.client.lRange(groupKey, -count, -1);
    await this.client.lTrim(groupKey, 0, -count - 1);
    
    return messages.map(msg => JSON.parse(msg)).reverse(); // Reverse to get chronological order
  }

  async getGroupCount(groupId: number): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    const countKey = `group:${groupId}:count`;
    const count = await this.client.get(countKey);
    return count ? parseInt(count) : 0;
  }

  async resetGroupCount(groupId: number): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    const countKey = `group:${groupId}:count`;
    await this.client.set(countKey, '0');
  }

  async clearGroup(groupId: number): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    const groupKey = `group:${groupId}:messages`;
    const countKey = `group:${groupId}:count`;
    
    await this.client.del(groupKey);
    await this.client.del(countKey);
  }

  isConnectedToRedis(): boolean {
    return this.isConnected;
  }
}
```

### 3.2 Accumulator Raft Implementation
**File**: `rafts/accumulator_raft.ts`
```typescript
import { EventEmitter } from 'events';
import { RedisClient } from '../redisClient/redisClient';
import { SimulatedEvent } from '../simulators/eventSimulator';

export interface BatchReadyEvent {
  groupId: number;
  messages: SimulatedEvent[];
  batchSize: number;
  timestamp: Date;
}

export class AccumulatorRaft extends EventEmitter {
  private redisClient: RedisClient;
  private batchSize: number;
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(batchSize: number = 100) {
    super();
    this.redisClient = new RedisClient();
    this.batchSize = batchSize;
  }

  async initialize(redisUrl?: string): Promise<void> {
    try {
      await this.redisClient.connect(redisUrl);
      console.log('✅ Accumulator Raft initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Accumulator Raft:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.stopBatchChecking();
    await this.redisClient.disconnect();
    console.log('✅ Accumulator Raft shutdown complete');
  }

  startBatchChecking(intervalMs: number = 1000): void {
    if (this.isRunning) {
      console.log('⚠️ Batch checking already running');
      return;
    }

    this.isRunning = true;
    console.log(`🔄 Starting batch checking every ${intervalMs}ms`);

    this.checkInterval = setInterval(async () => {
      await this.checkForBatches();
    }, intervalMs);
  }

  stopBatchChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Batch checking stopped');
  }

  async accumulateMessage(message: SimulatedEvent): Promise<void> {
    try {
      const count = await this.redisClient.addToGroup(message.groupId, message);
      
      console.log(`📥 Accumulated message ${message.id} for group ${message.groupId} (count: ${count})`);
      
      // Check if we've reached the batch threshold
      if (count >= this.batchSize) {
        await this.processBatch(message.groupId);
      }
      
    } catch (error) {
      console.error('❌ Failed to accumulate message:', error);
      this.emit('error', error);
    }
  }

  private async checkForBatches(): Promise<void> {
    // For Phase 1, we'll focus on a single group
    // In production, this would check multiple groups
    const groupIds = [1]; // Assuming default group ID is 1
    
    for (const groupId of groupIds) {
      try {
        const count = await this.redisClient.getGroupCount(groupId);
        if (count >= this.batchSize) {
          await this.processBatch(groupId);
        }
      } catch (error) {
        console.error(`❌ Error checking batch for group ${groupId}:`, error);
      }
    }
  }

  private async processBatch(groupId: number): Promise<void> {
    try {
      console.log(`📦 Processing batch for group ${groupId}`);
      
      // Get the batch of messages
      const messages = await this.redisClient.getGroupMessages(groupId, this.batchSize);
      
      if (messages.length === 0) {
        console.log(`⚠️ No messages found for group ${groupId} batch`);
        return;
      }

      // Reset the count for this group
      await this.redisClient.resetGroupCount(groupId);

      // Create batch event
      const batchEvent: BatchReadyEvent = {
        groupId,
        messages,
        batchSize: messages.length,
        timestamp: new Date()
      };

      console.log(`📤 Emitting batch ready event for group ${groupId} with ${messages.length} messages`);
      
      // Emit batch ready event for Concierge Agent
      this.emit('batchReady', batchEvent);

    } catch (error) {
      console.error(`❌ Failed to process batch for group ${groupId}:`, error);
      this.emit('error', error);
    }
  }

  // Manual batch trigger for testing
  async triggerBatch(groupId: number): Promise<void> {
    await this.processBatch(groupId);
  }

  // Get current accumulation status
  async getAccumulationStatus(groupId: number): Promise<any> {
    try {
      const count = await this.redisClient.getGroupCount(groupId);
      return {
        groupId,
        currentCount: count,
        batchSize: this.batchSize,
        progress: (count / this.batchSize) * 100,
        readyForBatch: count >= this.batchSize
      };
    } catch (error) {
      console.error(`❌ Failed to get accumulation status for group ${groupId}:`, error);
      return null;
    }
  }

  setBatchSize(newSize: number): void {
    this.batchSize = Math.max(1, newSize);
    console.log(`📦 Batch size set to ${this.batchSize}`);
  }

  getBatchSize(): number {
    return this.batchSize;
  }

  isRunningStatus(): boolean {
    return this.isRunning;
  }
}
```

---

## Step 4: Mock Agent Implementations

### 4.1 Agent Interface Definitions
**File**: `agents/interfaces.ts`
```typescript
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
```

### 4.2 Mock Agent Implementations
**File**: `agents/mockAgents.ts`
```typescript
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
```

---

## Step 5: Concierge Agent Implementation

### 5.1 Concierge Agent Core
**File**: `agents/conciergeAgent.ts`
```typescript
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

      // Update user message tracking
      const user = this.graph.users.get(message.userId);
      if (user) {
        user.messageIds.add(message.id);
        user.lastActivity = message.timestamp;
        
        // Update topic participation
        if (message.topicId) {
          const currentCount = user.topicParticipation.get(message.topicId) || 0;
          user.topicParticipation.set(message.topicId, currentCount + 1);
        }
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
    this.graph.stats.lastProcessedTime = new Date();

    console.log(`📊 Graph updated: ${this.graph.stats.totalMessages} total messages`);
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
```

---

## Step 6: System Integration & Testing

### 6.1 Main System Orchestrator
**File**: `index.ts`
```typescript
import { EventSimulator } from './simulators/eventSimulator';
import { AccumulatorRaft } from './rafts/accumulator_raft';
import { ConciergeAgent } from './agents/conciergeAgent';
import { TreeVisualizer } from './services/treeVisualizer';

async function runPhase1System() {
  console.log('🚀 Starting Phase 1 Social Sentiment Analysis System');
  console.log('=' .repeat(60));

  // Initialize components
  const eventSimulator = new EventSimulator();
  const accumulatorRaft = new AccumulatorRaft(5); // Small batch size for testing
  const conciergeAgent = new ConciergeAgent();

  try {
    // Step 1: Initialize all components
    console.log('\n📋 Step 1: Initializing System Components');
    await accumulatorRaft.initialize();
    await conciergeAgent.initialize(1);

    // Step 2: Set up event listeners
    console.log('\n🔗 Step 2: Setting up Event Listeners');
    
    // Simulator → Accumulator
    eventSimulator.on('message', async (event) => {
      await accumulatorRaft.accumulateMessage(event);
    });

    // Accumulator → Concierge
    accumulatorRaft.on('batchReady', async (batchEvent) => {
      await conciergeAgent.processBatch(batchEvent);
    });

    // Concierge processing events
    conciergeAgent.on('batchProcessed', (data) => {
      console.log('\n✅ BATCH PROCESSED:', data);
      console.log(`📊 Graph Stats:`, data.stats);
    });

    // Step 3: Load and start simulation
    console.log('\n📁 Step 3: Loading Pineapple Data');
    await eventSimulator.loadPineappleData('./pineapple.json');

    // Step 4: Start accumulator batch checking
    console.log('\n🔄 Step 4: Starting Accumulator Raft');
    accumulatorRaft.startBatchChecking(2000); // Check every 2 seconds

    // Step 5: Start event simulation
    console.log('\n🎬 Step 5: Starting Event Simulation');
    eventSimulator.startSimulation(1000); // 1 message per second

    // Step 6: Set up monitoring
    console.log('\n📊 Step 6: Setting up Monitoring');
    const monitoringInterval = setInterval(() => {
      const accumulatorStatus = accumulatorRaft.getAccumulationStatus(1);
      const conciergeStatus = conciergeAgent.getProcessingStatus();
      const simulatorStatus = eventSimulator.getSimulationStatus();

      console.log('\n📈 SYSTEM STATUS:');
      console.log(`  Simulator: ${simulatorStatus.progress.toFixed(1)}% (${simulatorStatus.currentIndex}/${simulatorStatus.totalMessages})`);
      console.log(`  Accumulator: ${accumulatorStatus ? `${accumulatorStatus.currentCount}/${accumulatorStatus.batchSize} messages` : 'N/A'}`);
      console.log(`  Concierge: ${conciergeStatus.isProcessing ? 'Processing' : 'Idle'} (Queue: ${conciergeStatus.queueSize})`);
    }, 5000);

    // Step 7: Set up graceful shutdown
    const gracefulShutdown = async () => {
      console.log('\n🛑 Initiating graceful shutdown...');
      clearInterval(monitoringInterval);
      
      eventSimulator.stopSimulation();
      accumulatorRaft.stopBatchChecking();
      await accumulatorRaft.shutdown();
      
      // Generate final visualization
      console.log('\n📊 Final Graph Visualization:');
      const finalGraph = conciergeAgent.exportGraph();
      const visualization = TreeVisualizer.generateTextVisualization(finalGraph);
      console.log(visualization);
      
      console.log('\n✅ System shutdown complete');
      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    // Auto-shutdown after simulation completes
    eventSimulator.on('simulationCompleted', () => {
      console.log('\n🎉 Simulation completed! Shutting down in 10 seconds...');
      setTimeout(gracefulShutdown, 10000);
    });

    console.log('\n✅ Phase 1 System is running!');
    console.log('Press Ctrl+C to stop');

  } catch (error) {
    console.error('\n❌ System startup failed:', error);
    process.exit(1);
  }
}

// Test runner for isolated components
async function runComponentTests() {
  console.log('🧪 Running Component Tests');
  console.log('=' .repeat(40));

  try {
    // Test 1: Mock Tree Generation
    console.log('\n🌳 Test 1: Mock Tree Generation');
    const { MockTreeGenerator } = await import('./services/mockTreeGenerator');
    const mockGraph = MockTreeGenerator.generateMockTree(1);
    console.log(`✅ Generated mock graph with ${mockGraph.stats.totalMessages} messages`);

    // Test 2: Tree Visualization
    console.log('\n📊 Test 2: Tree Visualization');
    const { TreeVisualizer } = await import('./services/treeVisualizer');
    const textViz = TreeVisualizer.generateTextVisualization(mockGraph);
    console.log(textViz);

    // Test 3: Event Simulator (short test)
    console.log('\n🎬 Test 3: Event Simulator');
    const simulator = new EventSimulator();
    await simulator.loadPineappleData('./pineapple.json');
    console.log('✅ Event simulator loaded data successfully');

    console.log('\n✅ All component tests passed!');

  } catch (error) {
    console.error('\n❌ Component tests failed:', error);
  }
}

// Main entry point
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test') || args.includes('-t')) {
    await runComponentTests();
  } else {
    await runPhase1System();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
```

### 6.2 Package.json Scripts
**File**: `package.json` (scripts section)
```json
{
  "scripts": {
    "phase1": "npx ts-node index.ts",
    "phase1:test": "npx ts-node index.ts --test",
    "test:simulator": "npx ts-node scripts/testEventSimulator.ts",
    "dev": "npx ts-node index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## Step 7: Development Workflow

### 7.1 Development Steps (Execute in Order)

1. **Set up project structure**:
   ```bash
   mkdir -p {agents,services,simulators,rafts,redisClient,scripts,types}
   npm init -y
   npm install typescript ts-node @types/node redis
   npm install --save-dev @types/redis
   ```

2. **Create TypeScript config**:
   ```bash
   npx tsc --init
   ```

3. **Implement components in order**:
   - `types/index.ts` (data structures)
   - `services/mockTreeGenerator.ts` (mock data)
   - `services/treeVisualizer.ts` (visualization)
   - `simulators/eventSimulator.ts` (event simulation)
   - `redisClient/redisClient.ts` (Redis connectivity)
   - `rafts/accumulator_raft.ts` (message batching)
   - `agents/interfaces.ts` (agent contracts)
   - `agents/mockAgents.ts` (mock implementations)
   - `agents/conciergeAgent.ts` (orchestration)
   - `index.ts` (system integration)

4. **Test individual components**:
   ```bash
   npm run phase1:test
   ```

5. **Run full system**:
   ```bash
   npm run phase1
   ```

### 7.2 Success Criteria

✅ **Mock Tree Generation**: Creates realistic social graph with all data structures  
✅ **Event Simulation**: Successfully processes pineapple.json messages  
✅ **Message Accumulation**: Batches messages in Redis correctly  
✅ **Orchestration Flow**: Concierge agent coordinates all processing steps  
✅ **Mock Agent Processing**: All agents return realistic mock responses  
✅ **Graph Updates**: In-memory graph updates with new messages and relationships  
✅ **System Integration**: All components work together end-to-end  
✅ **Monitoring**: Real-time system status and performance metrics  
✅ **Visualization**: Text and Mermaid diagram output of final graph state

### 7.3 Expected Output

The system should demonstrate:
- Messages flowing from simulator → accumulator → concierge
- Proper batching and threshold management
- Orchestrated agent processing with mock results
- Real-time graph updates and statistics
- Complete system visualization at the end

---

## Next Steps (Phase 2 Preview)

After Phase 1 completion:
- Replace mock agents with real AI implementations
- Add PostgreSQL integration for persistent storage
- Implement background optimization agent
- Add REST API for system monitoring
- Performance testing and optimization

---

*Phase 1 focuses on proving the architecture works with proper orchestration flow before adding complex AI processing.* 