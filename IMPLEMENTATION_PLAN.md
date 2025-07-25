# Accumulator Raft Implementation Plan

## Overview
The system will process Telegram-like messages from `pineapple.json`, accumulate events in Redis, and perform intelligent topic categorization using a multi-agent system with versioned in-memory graph storage.

## Core Architecture Principles
- **Simplicity First**: Minimal complexity approach for local validation
- **Pure In-Memory Processing**: No database queries during message processing
- **Versioned Tree Storage**: Complete semantic graph stored as JSONB blobs
- **Single Orchestrator**: Concierge agent maintains in-memory graph and coordinates all other agents
- **No Configuration Management**: Hard-coded sensible defaults for faster development

## Critical Access Control & Stateless Design

### Access Control Matrix
| Component | Redis Access | Database Access | State Management |
|-----------|-------------|----------------|------------------|
| **Accumulator Raft** | ✅ Full Access | ❌ None | Stateless |
| **Storage Raft** | ❌ None | ✅ Full Access | Stateless |
| **Concierge Agent** | ❌ None | ❌ None* | Stateful (In-Memory) |
| **Individual Agents** | ❌ None | ❌ None | Stateless |
| **Background Agent** | ❌ None | ✅ Read/Write Trees | Stateless |
| **Event Simulator** | ❌ None | ❌ None | Stateless |

*Concierge Agent only accesses database during startup to load versioned tree

### Stateless Agent Design Principles
Following [agentic AI anatomy](https://dr-arsanjani.medium.com/the-anatomy-of-agentic-ai-0ae7d243d13c), all individual agents are designed as pure functions:

#### Individual Agent Signature
```typescript
interface StatelessAgent {
  // Pure function - no internal state
  process(input: ProcessingInput, context: AgentContext): Promise<ProcessingOutput>;
}

interface AgentContext {
  // Read-only context provided by concierge
  readonly timestamp: Date;
  readonly batchId: string;
  readonly config: AgentConfig;
  // No persistent storage access
}
```

#### Benefits of Stateless Design
- **Horizontal Scalability**: Agents can be deployed across multiple instances
- **Fault Tolerance**: Agent failures don't affect system state
- **Testing Simplicity**: Pure functions are easy to test and debug
- **Resource Efficiency**: No memory leaks or state management overhead
- **Parallel Processing**: Multiple instances can process different batches simultaneously

### Data Flow Isolation
```typescript
// CORRECT: Stateless agent processing
class SentimentAgent implements StatelessAgent {
  async process(messages: string[], context: MessageContext[]): Promise<SentimentResult[]> {
    // Pure processing - no side effects
    return await this.analyzeSentimentWithContext(messages, context);
  }
}

// INCORRECT: Agent accessing external state
class BadAgent {
  async process(messages: string[]) {
    // ❌ Direct database access violates architecture
    const userData = await db.query('SELECT * FROM users');
    // ❌ Redis access violates separation of concerns
    await redis.set('cache_key', data);
  }
}
```

## High-Level Architecture

### 1. Data Flow Pipeline
```
Pineapple.json → Event Simulator → Accumulator Raft → Batch Dump → Concierge Agent (Running Process with In-Memory Tree) → Individual Agents → Storage
```

### 2. Core Components

#### A. Event Simulation Layer
- **File**: `simulators/eventSimulator.ts`
- **Purpose**: Parse pineapple.json and emit events simulating real-time message flow
- **Output**: Standardized events matching blueprint.md format

#### B. Accumulator Raft System
- **File**: `rafts/accumulator_raft.ts`
- **Purpose**: Pure accumulation and batch dumping to concierge agent
- **Features**:
  - Redis-based event accumulation
  - Threshold management (default: 100 messages)
  - Direct batch dump to concierge agent when threshold reached
  - Group-based partitioning
  - No database querying - pure message accumulation

#### C. Concierge Agent (Running Process with In-Memory Semantic Tree)
- **File**: `Agents/conciergeAgent.ts`
- **Purpose**: Main orchestration agent that coordinates all other agents AND maintains semantic tree
- **Features**:
  - **Running Process**: Persistent service maintaining in-memory semantic tree
  - **One-Time Version Load**: Loads complete latest semantic tree version from PostgreSQL ONLY on startup/reload
  - **In-Memory Tree Management**: Maintains topic tree for fast semantic comparison
  - **Message-Topic Matching**: Compares incoming messages ONLY to in-memory tree (no DB queries)
  - **Dynamic Tree Expansion**: Creates and adds new topics to in-memory tree for unmatched messages
  - **Input Validation**: Type checking and noise pre-filtering
  - **Agent Orchestration**: Sequential and parallel coordination of individual agents
  - **Async Generator Pattern**: Streaming processing with topic assignment
  - **Continuous Processing**: Updates in-memory tree and processes message batches continuously

#### D. Individual Processing Agents

##### Spam Detection Agent
- **File**: `Agents/spamAgent.ts`
- **Purpose**: Detect and filter spam messages
- **Input**: Array of message content strings
- **Output**: Array of boolean spam indicators

##### Emoji Processing Agent
- **File**: `Agents/emojiAgent.ts`
- **Purpose**: Convert emojis to text representations
- **Input**: Array of message content strings
- **Output**: Array of unemojified text strings

##### Embedding Agent
- **File**: `Agents/embeddingAgent.ts`
- **Purpose**: Generate vector embeddings for semantic analysis
- **Input**: Array of processed text strings
- **Output**: Array of embedding vectors

##### Enhanced Sentiment Analysis Agent
- **File**: `Agents/sentimentAgent.ts`
- **Purpose**: Context-aware sentiment analysis using relationship and conversation context
- **Input**: Messages with user relationships and conversation context windows
- **Output**: Contextual sentiment analysis with confidence scores and relationship influence
- **Features**:
  - **Base Sentiment Analysis**: Traditional sentiment classification
  - **Contextual Enhancement**: Adjusts sentiment based on conversation context (last 10 messages between users)
  - **Relationship Awareness**: Considers user relationship type and history
  - **Confidence Scoring**: Provides confidence levels for sentiment predictions
  - **Context Explanation**: Identifies which context messages influenced the final sentiment

##### Relationship Analysis Agent
- **File**: `Agents/relationshipAgent.ts`
- **Purpose**: Track and analyze user relationships and communication patterns
- **Input**: Message interactions between user pairs with historical context
- **Output**: Updated relationship profiles and interaction patterns
- **Features**:
  - **Relationship Strength Calculation**: Based on interaction frequency, sentiment history, response patterns
  - **Communication Pattern Analysis**: Response times, initiation balance, topic overlap
  - **Relationship Type Classification**: Friendly, professional, neutral, conflictual detection
  - **Evolution Tracking**: How relationships change over time
  - **Context Window Management**: Maintains sliding window of recent interactions for sentiment context

##### Toxicity Analysis Agent
- **File**: `Agents/toxicityAgent.ts`
- **Purpose**: Detect and score message toxicity
- **Input**: Array of processed text strings
- **Output**: Array of toxicity scores

##### LLM Agent
- **File**: `Agents/llmAgent.ts`
- **Purpose**: Topic classification and generation using large language models
- **Input**: Messages with context for topic determination
- **Output**: Topic assignments and new topic creation

#### E. Background Refinement Agent
- **File**: `Agents/topicRefinementAgent.ts`
- **Purpose**: Periodic topic tree optimization and final event emission
- **Features**:
  - **Tree Extraction**: Pull topic tree from concierge agent's in-memory store
  - **ChatGPT Filtering**: Apply quality filtering to topics before storage
  - **Tree Optimization**: Refine topic structure and remove duplicates
  - **Database Storage**: Store optimized tree with atomic operations
  - **Version Notification**: Signal concierge agent about new optimized version availability
  - **Final Event Emission**: Handle finalized processed messages and topic assignments

#### F. Storage Layer
- **File**: `rafts/storage_raft.ts`
- **Purpose**: Persist processed messages and topics
- **Features**:
  - Topic-message relationship storage
  - Batch insertion optimization
  - Versioned tree blob storage and retrieval

### 3. Infrastructure Components

#### A. Database Clients
- **File**: `postgresClient/postgresClient.ts`
- **Features**: Connection management, query execution, schema management
- **File**: `redisClient/redisClient.ts`
- **Features**: Connection management, accumulation operations, cache management

## Implementation Phases

### Phase 1: Foundation (Core Infrastructure)
1. **Database Setup**
   - Implement PostgreSQL client with TimescaleDB schema
   - Implement Redis client with accumulation operations
   - Database initialization scripts with versioned tree schema

2. **Event Simulation**
   - Parse pineapple.json structure
   - Create event simulator for testing
   - Standardize event format matching concierge agent expectations

3. **Basic Accumulator Raft**
   - Redis-based accumulation logic
   - Threshold management
   - Direct batch dump to concierge agent (no database querying)

### Phase 2: Core Agent Implementation
1. **Individual Processing Agents** (Separate files for each)
   - Spam Detection Agent (`spamAgent.ts`)
   - Emoji Processing Agent (`emojiAgent.ts`)
   - Embedding Agent (`embeddingAgent.ts`)
   - Sentiment Analysis Agent (`sentimentAgent.ts`)
   - Toxicity Analysis Agent (`toxicityAgent.ts`)
   - LLM Agent (`llmAgent.ts`)

2. **Concierge Agent Implementation (Running Process)**
   - Persistent running service with in-memory semantic tree
   - Versioned tree blob loading and graph reconstruction
   - Input validation and noise pre-filtering logic
   - Internal topic determination with LLM integration
   - Agent orchestration with async generators
   - Sequential and parallel processing coordination
   - Real-time message comparison and topic assignment
   - Dynamic tree expansion as new topics emerge

### Phase 3: Advanced Features (Tree Optimization & Production)
1. **Background Refinement Agent**
   - Topic tree optimization with ChatGPT filtering
   - Versioned tree blob storage with atomic operations
   - Concierge agent reload triggering for optimized versions

2. **Storage and Query Services**
   - Storage Raft with batch processing
   - Versioned Tree Management with JSONB blob operations
   - Background Agent coordination for tree optimization

## File Structure
```
├── Agents/
│   ├── conciergeAgent.ts           (Primary orchestrator + in-memory tree)
│   ├── spamAgent.ts                (Spam detection)
│   ├── emojiAgent.ts               (Emoji processing)
│   ├── embeddingAgent.ts           (Vector embeddings)
│   ├── sentimentAgent.ts           (Enhanced contextual sentiment analysis)
│   ├── relationshipAgent.ts        (User relationship and context tracking)
│   ├── toxicityAgent.ts            (Toxicity detection)
│   ├── llmAgent.ts                 (LLM integration)
│   └── topicRefinementAgent.ts     (Background optimization)
├── rafts/
│   ├── accumulator_raft.ts         (Core accumulation)
│   └── storage_raft.ts             (Message persistence)
├── services/
│   └── treeVersionService.ts       (Versioned tree blob operations)
├── simulators/
│   └── eventSimulator.ts           (Pineapple.json simulation)
├── postgresClient/
│   └── postgresClient.ts           (Database client)
├── redisClient/
│   └── redisClient.ts              (Cache client)
├── scripts/
│   ├── setup-db.sql                (Database initialization)
│   ├── run-simulation.ts           (End-to-end test)
└── types/
    └── index.ts                    (TypeScript definitions)
```

## Key Design Decisions

### 1. Concierge Agent Pattern
- Single orchestrator coordinates all individual agents
- Clear input validation and noise filtering
- Async generator pattern for streaming processing
- Sequential and parallel agent execution

### 2. Individual Agent Architecture
- Separate file for each specialized agent
- Clear input/output contracts
- Independent deployability and testing
- Easy agent swapping and upgrading

### 3. Versioned Tree Management
- Concierge agent: Fast in-memory graph operations with versioned loading
- Background agent: Periodic optimization with ChatGPT filtering
- Versioned storage system for complete graph snapshots
- Version-triggered reload mechanism for optimized graphs

### 4. Database Workflow with Versioned Storage
- Background agent creates new versioned tree blob after optimization
- Concierge agent monitors version changes and reloads latest optimized blob
- ChatGPT filtering before versioned storage for quality assurance
- Atomic operations for version management and flag updates

### 5. Redis Strategy
- **Accumulator Raft**: `group:{groupId}:messages` and `group:{groupId}:count`
- **Concierge Agent**: In-memory tree management (no Redis caching needed)
- **Version Coordination**: `group:{groupId}:version_check` for background agent coordination
- **Message Queue**: `group:{groupId}:processing_queue` for message batches

## Concierge Agent Processing Flow

### Input Validation & Pre-filtering
1. **Type Checking**: Strict validation of channelId and message array structure
2. **Noise Filtering**: Remove empty, commands, links, short messages, emoji-only content
3. **Spam Detection**: Filter messages through spam detection agent
4. **Content Processing**: Unemojify remaining valid messages

### Enhanced Parallel Agent Orchestration with Context
```typescript
// Topic determination handled internally using in-memory tree (NO database access)
const topics = this.determineTopicsFromMemory(channelId, messages); // Fast in-memory lookup

// Get relationship and context data for each message
const messageContexts = await this.getMessageContexts(messages);

const [embeddings, contextualSentiment, toxicityResults, relationshipUpdates] = await Promise.all([
  context.agents.embedding.generate(processedTexts),
  context.agents.sentiment.analyzeWithContext(processedTexts, messageContexts),
  context.agents.toxicity.analyze(processedTexts),
  context.agents.relationship.updateRelationships(messageContexts)
]);
```

### Enhanced Agent Interfaces

#### Contextual Sentiment Analysis Agent Interface
```typescript
interface ContextualSentimentAgent {
  async analyzeWithContext(
    messages: string[],
    contexts: MessageContext[]
  ): Promise<ContextualSentimentResult[]>;
}

interface MessageContext {
  messageId: number;
  senderId: number;
  recipientIds: number[];
  userRelationship?: UserRelationship;
  conversationContext: ConversationContextWindow;
  topicContext: number[];
}

interface ContextualSentimentResult {
  messageId: number;
  baseSentiment: 'positive' | 'negative' | 'neutral';
  contextualSentiment: 'positive' | 'negative' | 'neutral';
  confidenceScore: number; // 0-1
  relationshipInfluence: 'strengthened' | 'weakened' | 'neutral';
  contextInfluence: {
    influencingMessageIds: number[];
    contextShift: string; // How context changed sentiment
    emotionalTrajectory: string;
  };
}
```

#### Relationship Analysis Agent Interface
```typescript
interface RelationshipAnalysisAgent {
  async updateRelationships(
    interactions: UserInteraction[]
  ): Promise<RelationshipUpdate[]>;
  
  async calculateRelationshipStrength(
    userA: number,
    userB: number,
    interactionHistory: UserInteraction[]
  ): Promise<number>;
  
  async detectRelationshipType(
    relationship: UserRelationship
  ): Promise<'friendly' | 'professional' | 'neutral' | 'conflictual'>;
}

interface UserInteraction {
  messageId: number;
  senderId: number;
  recipientId: number;
  timestamp: Date;
  content: string;
  sentiment: string;
  topicId?: number;
  replyToId?: number;
}

interface RelationshipUpdate {
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
```

### Streaming Output
- Async generator pattern yields processed messages
- Sequential processing for noise/spam filtering
- Parallel processing for embeddings, sentiment, toxicity, topics
- Continuous processing and in-memory tree updates (no final events from concierge agent)

## Concierge Agent Architecture (Running Process with In-Memory Tree)

### Service Lifecycle (Versioned Approach)
1. **Startup**: Initialize concierge agent as persistent running service
2. **Latest Version Loading**: Fetch latest semantic tree version as complete JSONB blob from database
3. **Graph Reconstruction**: Deserialize blob into complete InMemoryGraph with all relationships
4. **Ready State**: Listen for message batches from accumulator raft (NO MORE DB QUERIES FOR PROCESSING)
5. **Continuous Graph Evolution**: Process batches and evolve complete graph structure in memory
6. **Version Tracking**: Monitor current version number for coordination with background agent
7. **Background Periodic Versioning**: Background agent creates new optimized versions (separate process)

## Concierge Agent Startup Process (Versioned)

### Step-by-Step Initialization
```typescript
class ConciergeAgent {
  private graph: InMemoryGraph;
  private currentVersion: number;
  
  async initialize(groupId: number): Promise<void> {
    // 1. Load latest version from database
    const latestVersion = await this.loadLatestTreeVersion(groupId);
    
    if (latestVersion) {
      // 2. Deserialize complete graph from JSONB blob
      this.graph = this.deserializeGraph(latestVersion.tree_blob);
      this.currentVersion = latestVersion.version_number;
      console.log(`Loaded semantic tree v${this.currentVersion} with ${this.graph.stats.totalMessages} messages`);
    } else {
      // 3. Initialize empty graph for first time
      this.graph = new InMemoryGraph(groupId);
      this.currentVersion = 0;
      console.log('Initialized empty semantic tree for new group');
    }
    
    // 4. Start processing message batches
    this.startProcessing();
  }
  
  private async loadLatestTreeVersion(groupId: number) {
    return await db.query(`
      SELECT tree_blob, version_number, tree_stats 
      FROM latest_semantic_trees 
      WHERE group_id = $1
    `, [groupId]);
  }
}
```

### In-Memory Graph Structure (Topics, Messages, Users, Conversations)
```typescript
interface Message {
  id: number;
  content: string;
  userId: number;
  timestamp: Date;
  topicId?: number;
  embedding?: number[];
  sentiment?: string;
  toxicity?: number;
  replyToMessageId?: number;  // For conversation threading
  conversationId?: string;    // Groups related messages
  // NEW: Context tracking
  contextualSentiment?: {
    baseSentiment: string;
    contextualSentiment: string;
    confidenceScore: number;
    relationshipInfluence: string;
    contextMessages: number[];  // IDs of messages that influenced sentiment
  };
}

interface User {
  id: number;
  name: string;
  messageIds: Set<number>;
  activeConversations: Set<string>;
  topicParticipation: Map<number, number>; // topicId -> message count
  lastActivity: Date;
  // NEW: Relationship and context tracking
  recentInteractions: Map<number, number[]>; // otherUserId -> recent message IDs (sliding window)
  communicationStyle: {
    averageMessageLength: number;
    emojiUsage: number;
    responsePattern: 'quick' | 'delayed' | 'sporadic';
    topTopics: number[];
  };
}

interface Topic {
  id: number;
  name: string;
  representativeWords: string[];
  embedding: number[];
  messageIds: Set<number>;
  userIds: Set<number>;
  conversationIds: Set<string>;
  messageCount: number;
  lastUpdated: Date;
  relatedTopics: Set<number>; // Similar topics
}

interface Conversation {
  id: string;
  participantIds: Set<number>;
  messageIds: number[];      // Ordered by timestamp
  topicIds: Set<number>;     // Topics discussed in conversation
  startTime: Date;
  lastActivity: Date;
  isActive: boolean;
  // NEW: Conversation flow tracking
  messageFlow: {
    messageId: number;
    userId: number;
    timestamp: Date;
    replyToId?: number;
    sentimentShift?: number; // How sentiment changed from previous message
  }[];
}

// NEW: User Relationship Tracking
interface UserRelationship {
  userA: number;
  userB: number;
  relationshipStrength: number;        // 0-1 scale
  relationshipType: 'friendly' | 'professional' | 'neutral' | 'conflictual' | 'unknown';
  interactionCount: number;
  sentimentHistory: number[];          // Rolling sentiment scores
  communicationPatterns: {
    averageResponseTime: number;       // Minutes
    initiationBalance: number;         // Who starts conversations more (-1 to 1)
    topicOverlap: Set<number>;        // Shared topics of interest
    conversationFrequency: number;    // Conversations per week
  };
  lastInteraction: Date;
  relationshipEvolution: {             // How relationship changed over time
    timestamp: Date;
    strength: number;
    type: string;
    triggerEvent?: string;            // What caused the change
  }[];
  // NEW: Conversation context tracking
  conversationContext: {
    recentMessages: {
      messageId: number;
      content: string;
      timestamp: Date;
      senderId: number;
      sentiment: string;
    }[];
    conversationTone: 'positive' | 'negative' | 'neutral' | 'mixed';
    topicFlow: number[];              // Recent topics discussed
    lastContextUpdate: Date;
  };
}

// NEW: Conversation Context Window
interface ConversationContextWindow {
  userPair: string;                   // "userA_userB" (sorted)
  messages: {
    id: number;
    content: string;
    senderId: number;
    timestamp: Date;
    sentiment?: string;
    topicId?: number;
    emotionalTone?: string;
  }[];
  windowSize: number;                 // Default: 10 messages
  contextSummary: {
    dominantTone: string;
    topicProgression: number[];
    emotionalTrajectory: string[];   // How emotions changed over context
    keyPhrases: string[];
  };
  lastUpdated: Date;
}

interface InMemoryGraph {
  groupId: number;
  
  // Core data stores
  messages: Map<number, Message>;
  users: Map<number, User>;
  topics: Map<number, Topic>;
  conversations: Map<string, Conversation>;
  
  // NEW: User relationship and context tracking
  userRelationships: Map<string, UserRelationship>; // "userA_userB" -> relationship
  relationshipsByUser: Map<number, Set<string>>;    // userId -> relationship keys
  conversationContexts: Map<string, ConversationContextWindow>; // "userA_userB" -> context window
  
  // Fast lookup indexes
  topicsByEmbedding: Map<string, number[]>;      // For semantic similarity
  messagesByUser: Map<number, number[]>;         // userId -> messageIds
  messagesByTopic: Map<number, number[]>;        // topicId -> messageIds
  messagesByConversation: Map<string, number[]>; // conversationId -> messageIds
  activeConversations: Map<number, string[]>;    // userId -> active conversation IDs
  
  // NEW: Context and relationship indexes
  relationshipTypes: Map<string, Set<string>>;      // type -> relationship keys
  strongRelationships: Set<string>;                 // High-strength relationships
  activeContextWindows: Map<number, Set<string>>;   // userId -> active context window keys
  recentInteractionPairs: Set<string>;              // Recently active user pairs
  
  // Conversation threading
  conversationThreads: Map<number, number[]>;    // messageId -> reply chain
  recentMessages: number[];                      // Last N messages for context
  
  // Statistics and metadata
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

### Enhanced Message Processing with Relationship & Context Tracking (Internal to Concierge Agent)
1. **Receive Message Batch**: Get batch from accumulator raft
2. **Pre-processing**: Validate input, filter noise, detect spam, unemojify
3. **User Management**: Update user records and activity tracking
4. **Relationship Context Retrieval**: For each message, get user relationships and conversation context windows
5. **Conversation Detection**: Identify conversation threads using reply chains, temporal proximity, and semantic embedding similarity
6. **Topic Determination**: Compare message embeddings with in-memory topics (>0.7 similarity)
7. **Topic Assignment**: Assign to existing topic or create new canonical topic using LLM
8. **Enhanced Parallel Processing**: Process with context awareness
   ```typescript
   const [embeddings, contextualSentiment, toxicityResults, relationshipUpdates] = await Promise.all([
     context.agents.embedding.generate(processedTexts),
     context.agents.sentiment.analyzeWithContext(processedTexts, userRelationships, conversationContexts),
     context.agents.toxicity.analyze(processedTexts),
     context.agents.relationship.updateRelationships(messageInteractions)
   ]);
   ```
9. **Conversation Context Updates**: Update conversation context windows for user pairs
   - Add new messages to relevant context windows (sliding window of 10 messages)
   - Update conversation tone and emotional trajectory
   - Refresh topic flow and key phrases
10. **Relationship Graph Updates**: Update user relationships based on new interactions
    - Calculate relationship strength changes
    - Update communication patterns (response times, initiation balance)
    - Track sentiment history between user pairs
    - Detect relationship type changes (friendly → conflictual, etc.)
11. **Graph Updates**: Update all relationships and indexes in memory:
    - Add messages to topics, users, conversations
    - Update conversation threading and participant tracking
    - Refresh similarity indexes and statistics
    - Update relationship and context indexes
    - Detect and link related topics
12. **Conversation Threading**: Link messages through reply chains, temporal proximity, and relationship context

## Conversation Detection and Threading

### Conversation Identification Methods
1. **Reply Threading**: Direct replies using `replyToMessageId` field
2. **Temporal Proximity**: Messages within 5 minutes from same users
3. **Semantic Similarity**: Messages with similar embedding vectors indicating topical coherence
4. **User Interaction Patterns**: Back-and-forth exchanges between users
5. **Topic Continuity**: Messages sharing similar topics or keywords
6. **Mention Detection**: @username mentions linking users in conversation

### Conversation Graph Construction
```typescript
interface ConversationDetection {
  // Detect new conversations
  detectConversation(messages: Message[]): string {
    // Check for reply chains
    // Analyze temporal proximity (< 5 minutes)
    // Compare embedding similarity for semantic coherence
    // Identify user interaction patterns
    // Group messages into conversation threads
  }
  
  // Link messages to existing conversations
  linkToConversation(message: Message, conversationId: string): void {
    // Add message to conversation
    // Update participant tracking
    // Refresh conversation activity
  }
  
  // Track conversation flow between users
  trackUserInteractions(conversationId: string): Map<number, Set<number>> {
    // userId -> Set of userIds they interact with
    // Build interaction graph for this conversation
  }
}
```

### Conversation Analytics
- **Participant Flow**: Track how users join/leave conversations
- **Topic Evolution**: Monitor how topics change within conversations
- **Interaction Patterns**: Identify who responds to whom
- **Conversation Lifespan**: Track conversation duration and activity
- **Cross-Topic Conversations**: Detect conversations spanning multiple topics
- **Semantic Coherence**: Use embedding similarity to identify topically related messages that form implicit conversations without explicit replies

## Graph Query Operations

### Relationship Queries
```typescript
interface GraphQueries {
  // Topic-Message-User Relationships
  getMessagesForTopic(topicId: number): Message[] {
    return Array.from(topics.get(topicId)?.messageIds || [])
      .map(id => messages.get(id))
      .filter(Boolean);
  }
  
  getUserTopicParticipation(userId: number): Map<number, number> {
    return users.get(userId)?.topicParticipation || new Map();
  }
  
  getTopicsByUser(userId: number): Topic[] {
    const user = users.get(userId);
    return Array.from(user?.topicParticipation.keys() || [])
      .map(topicId => topics.get(topicId))
      .filter(Boolean);
  }
  
  // Conversation Flow Analysis
  getConversationParticipants(conversationId: string): User[] {
    const conversation = conversations.get(conversationId);
    return Array.from(conversation?.participantIds || [])
      .map(userId => users.get(userId))
      .filter(Boolean);
  }
  
  getUserConversations(userId: number): Conversation[] {
    return Array.from(users.get(userId)?.activeConversations || [])
      .map(convId => conversations.get(convId))
      .filter(Boolean);
  }
  
  getConversationTopics(conversationId: string): Topic[] {
    const conversation = conversations.get(conversationId);
    return Array.from(conversation?.topicIds || [])
      .map(topicId => topics.get(topicId))
      .filter(Boolean);
  }
  
  // Message Threading
  getMessageThread(messageId: number): Message[] {
    const thread = conversationThreads.get(messageId) || [];
    return thread.map(id => messages.get(id)).filter(Boolean);
  }
  
  getConversationFlow(conversationId: string): Message[] {
    return conversations.get(conversationId)?.messageIds
      .map(id => messages.get(id))
      .filter(Boolean)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) || [];
  }
  
  // User Interaction Analysis
  getUserInteractionGraph(userId: number): Map<number, number> {
    // Returns userId -> interaction count
    const interactions = new Map<number, number>();
    const userConversations = this.getUserConversations(userId);
    
    userConversations.forEach(conv => {
      conv.participantIds.forEach(participantId => {
        if (participantId !== userId) {
          interactions.set(participantId, (interactions.get(participantId) || 0) + 1);
        }
      });
    });
    
    return interactions;
  }
}
```

### Key Graph Capabilities
- **Topic-Message-User Connections**: See who participates in which topics
- **Conversation Threading**: Track message replies and conversation flow
- **User Interaction Mapping**: Analyze who talks to whom and how often
- **Cross-Topic Analysis**: Find conversations spanning multiple topics
- **Temporal Relationship Tracking**: Understand conversation timing and patterns
- **Social Graph Construction**: Build user interaction networks from conversation data

## Database Access Strategy (Versioned Tree Blobs)

### When Database Access Happens (Only 3 Scenarios)
1. **Startup**: Concierge agent loads latest complete semantic tree version as single JSONB blob
2. **Periodic Versioning**: Background agent creates new versioned tree snapshot (every hour)
3. **Version Reload**: When background agent creates optimized version, reload latest tree blob

## Database Workflow with Tree Optimization

### Concierge Agent Database Interaction (Minimal & Versioned)
1. **Latest Tree Loading**: Loads complete latest semantic tree version from database ONLY on startup
2. **Pure In-Memory Processing**: All processing uses only in-memory graph (no DB queries during processing)
3. **Continuous Tree Evolution**: Receives message batches and evolves in-memory graph continuously
4. **Graph Updates**: Updates topics, users, conversations, and relationships in memory only
5. **Dynamic Expansion**: Creates new topics, conversations, and user connections in memory
6. **Version Awareness**: Tracks current version number for coordination with background agent
7. **Version-Triggered Reload**: Reloads when background agent creates new optimized version

### Background Refinement Agent (Versioned Storage)
1. **Graph Extraction**: Periodically pulls complete InMemoryGraph from concierge agent
2. **ChatGPT Filtering**: Applies quality filtering to topics, conversations, and relationships
3. **Graph Optimization**: Refines topic structure, removes duplicates, optimizes relationships
4. **Version Creation**: Creates new versioned entry in semantic_tree_versions table
5. **Tree Blob Storage**: Serializes complete graph as JSONB blob with metadata
6. **Version Management**: Updates is_latest flag and increments version number
7. **Reload Notification**: Signals concierge agent about new optimized version availability

### Versioned Tree Storage Schema
```sql
-- Versioned semantic tree storage
CREATE TABLE semantic_tree_versions (
    version_id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL,
    tree_blob JSONB NOT NULL,           -- Complete serialized InMemoryGraph
    version_number INTEGER NOT NULL,
    is_latest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'background_agent',
    tree_stats JSONB,                   -- Metadata about tree (message count, topics, etc.)
    optimization_notes TEXT,
    UNIQUE(group_id, version_number)
);

-- Index for fast latest version lookup
CREATE INDEX idx_semantic_tree_latest ON semantic_tree_versions (group_id, is_latest) WHERE is_latest = true;

-- Merged/Latest tree view for easy querying
CREATE VIEW latest_semantic_trees AS 
SELECT * FROM semantic_tree_versions WHERE is_latest = true;
```

## Versioned Tree Operations

### Tree Blob Serialization
```typescript
interface TreeVersionManager {
  // Serialize complete graph to JSONB blob
  serializeGraph(graph: InMemoryGraph): any {
    return {
      groupId: graph.groupId,
      messages: Array.from(graph.messages.entries()),
      users: Array.from(graph.users.entries()),
      topics: Array.from(graph.topics.entries()),
      conversations: Array.from(graph.conversations.entries()),
      indexes: {
        topicsByEmbedding: Array.from(graph.topicsByEmbedding.entries()),
        messagesByUser: Array.from(graph.messagesByUser.entries()),
        messagesByTopic: Array.from(graph.messagesByTopic.entries()),
        // ... other indexes
      },
      stats: graph.stats,
      version: graph.currentVersion,
      serializedAt: new Date()
    };
  }
  
  // Deserialize JSONB blob back to complete graph
  deserializeGraph(blob: any): InMemoryGraph {
    const graph = new InMemoryGraph(blob.groupId);
    graph.messages = new Map(blob.messages);
    graph.users = new Map(blob.users);
    graph.topics = new Map(blob.topics);
    graph.conversations = new Map(blob.conversations);
    // Rebuild indexes and relationships
    // ... reconstruction logic
    return graph;
  }
}
```

### Version Query Operations
```sql
-- Load latest tree for group
SELECT tree_blob FROM latest_semantic_trees WHERE group_id = $1;

-- Load specific version
SELECT tree_blob FROM semantic_tree_versions 
WHERE group_id = $1 AND version_number = $2;

-- Compare versions (get metadata)
SELECT version_number, tree_stats, created_at, optimization_notes
FROM semantic_tree_versions 
WHERE group_id = $1 
ORDER BY version_number DESC 
LIMIT 10;

-- Store new version
INSERT INTO semantic_tree_versions (group_id, tree_blob, version_number, tree_stats, optimization_notes)
VALUES ($1, $2, $3, $4, $5);

-- Update latest flag (atomic operation)
BEGIN;
UPDATE semantic_tree_versions SET is_latest = false WHERE group_id = $1;
UPDATE semantic_tree_versions SET is_latest = true WHERE group_id = $1 AND version_number = $2;
COMMIT;
```

### Benefits of Versioned Tree Storage

#### **1. Complete Graph Preservation**
- **Full Relationships**: Entire graph structure preserved including all connections
- **Fast Loading**: Single JSONB blob load vs hundreds of individual topic queries
- **Atomic Snapshots**: Complete state captured at each version

#### **2. Version History & Analysis**
- **Historical Tracking**: Compare how graph evolved over time
- **Rollback Capability**: Revert to previous version if optimization fails
- **A/B Testing**: Compare different optimization strategies
- **Growth Analysis**: Track topic emergence and conversation patterns

#### **3. Performance Benefits**
- **Startup Speed**: Load complete graph in single query
- **Memory Efficiency**: Optimized serialization format
- **Network Reduction**: One large transfer vs many small queries
- **Index Preservation**: Rebuild optimized indexes from stored state

#### **4. Operational Advantages**
- **Version Comparison**: Easy diff between tree versions
- **Backup & Recovery**: Complete semantic state in each version
- **Development Testing**: Load specific versions for testing
- **Production Safety**: Always maintain latest working version

## Service Startup Sequence

### 1. Infrastructure Services
1. **PostgreSQL**: Database with TimescaleDB and versioned semantic tree storage
2. **Redis**: In-memory cache for accumulator raft operations
3. **Concierge Agent**: Start as persistent running service, load latest tree version from DB

### 2. Processing Services  
1. **Event Simulator**: Begin parsing pineapple.json and emitting events
2. **Accumulator Raft**: Start accumulating events in Redis
3. **Individual Agents**: Spam, Emoji, Embedding, Sentiment, Toxicity, LLM agents ready
4. **Concierge Agent**: Ready to receive batches and orchestrate processing

### 3. Background Services
1. **Background Refinement Agent**: Periodic tree optimization
2. **Storage Raft**: Message and topic persistence

## Complete Workflow Summary

### 1. System Initialization
1. **PostgreSQL & Redis**: Start database services
2. **Concierge Agent**: Load latest semantic tree version (JSONB blob) into memory
3. **Individual Agents**: Initialize spam, sentiment, toxicity, embedding, LLM agents
4. **Event Simulator**: Begin streaming pineapple.json data

### 2. Message Processing Flow
1. **Event Simulator** → Parses pineapple.json → Emits message events
2. **Accumulator Raft** → Accumulates messages in Redis → Dumps batch (100 messages) to concierge agent
3. **Concierge Agent** → Validates/filters messages → Orchestrates individual agents → Updates in-memory graph
4. **Individual Agents** → Process spam, sentiment, toxicity, embeddings in parallel
5. **Topic Assignment** → Compare embeddings to in-memory topics → Assign or create new topics
6. **Graph Updates** → Update topics, users, conversations, relationships in memory only

### 3. Background Optimization
1. **Background Agent** → Periodically extracts complete graph from concierge agent
2. **ChatGPT Filtering** → Optimizes topics and relationships for quality
3. **Version Storage** → Creates new versioned JSONB blob in database
4. **Reload Trigger** → Signals concierge agent to reload optimized version

### 4. Key Performance Features
- **Zero DB Queries**: During message processing (pure in-memory)
- **Single Blob Load**: Complete graph loaded in one query at startup
- **Version History**: Every optimization creates new versioned snapshot
- **Conversation Threading**: Automatic detection using reply chains, temporal proximity, and semantic embedding similarity
- **Social Graph**: Complete mapping of user interactions and topic participation

## Key Clarifications & FAQ

### Q: How does topic matching work without database queries?
**A:** The concierge agent loads the complete semantic tree as a JSONB blob on startup and keeps it in memory. All topic matching uses embedding similarity against this in-memory tree.

### Q: What happens to new topics created during processing?
**A:** New topics are added to the in-memory graph immediately. The background agent periodically extracts the updated graph and creates a new versioned snapshot in the database.

### Q: How do we handle version updates?
**A:** The background agent creates new versioned entries with `is_latest = true`. The concierge agent monitors the version number and reloads the complete graph when a new optimized version is available.

### Q: Why use JSONB blobs instead of normalized tables?
**A:** JSONB blobs preserve the complete graph structure including all relationships, provide atomic snapshots, enable fast single-query loading, and maintain version history for analysis and rollback.

### Q: How are conversations detected automatically?
**A:** Through multiple methods: direct reply chains (`replyToMessageId`), temporal proximity (messages within 5 minutes), semantic similarity using embedding vectors, user interaction patterns, topic continuity, and @username mentions. The semantic embeddings are particularly powerful for detecting topical conversations even when users don't explicitly reply to each other.

### Q: What if the in-memory graph becomes too large?
**A:** The background agent can optimize the graph by removing old conversations, merging similar topics, and archiving inactive users. Each optimization creates a new version.

### Q: How do we ensure data consistency?
**A:** The versioned approach ensures atomic snapshots. The `is_latest` flag is updated atomically, and the concierge agent only reloads complete validated versions.

### Q: How do semantic embeddings improve conversation detection?
**A:** Embedding similarity allows us to detect conversations based on topical coherence, not just explicit replies. For example, if three users discuss "crypto market crash" within minutes without directly replying to each other, their semantically similar messages get grouped into the same conversation thread.

### Q: Can we query historical data?
**A:** Yes! Every version is preserved, allowing historical analysis of topic evolution, user behavior changes, and conversation patterns over time.

## System Architecture & Data Flow Diagrams

### Architectural Diagrams
- **System Architecture**: `system-architecture.mmd` - Complete component relationships and access control
- **Data Flow**: `data-flow.mmd` - End-to-end message processing pipeline with timing and decision points

### Agentic AI Architecture Alignment

Following [agentic AI maturity models](https://dr-arsanjani.medium.com/scaling-agentic-ai-86a541f10aad) and [agent anatomy principles](https://dr-arsanjani.medium.com/the-anatomy-of-agentic-ai-0ae7d243d13c), our system implements:

#### **Multi-Agent System (MAS) with Meta-Agent Coordination**
- **Concierge Agent**: Acts as meta-agent orchestrating all individual agents
- **Individual Processing Agents**: Specialized, stateless agents for specific tasks
- **Shared Memory**: In-memory social graph serves as coordination mechanism
- **Dynamic Task Assignment**: Concierge dynamically routes work to appropriate agents

#### **Agent Anatomy Implementation**
Each agent follows the core agent anatomy:
```typescript
interface AgentAnatomy {
  // Goals: Defined by agent specialization (sentiment, relationships, etc.)
  goals: string[];
  
  // Sense: Receive input from concierge agent
  sense(input: ProcessingInput): SensoryData;
  
  // Reason: Process using LLM/ML models  
  reason(sensoryData: SensoryData, context: AgentContext): ReasoningResult;
  
  // Plan: Determine processing strategy
  plan(reasoningResult: ReasoningResult): ActionPlan;
  
  // Act: Execute processing and return results
  act(plan: ActionPlan): ProcessingOutput;
  
  // Memory: Stateless - no persistent memory (except concierge)
  memory: null; // Stateless design
}
```

#### **Scalability & Compliance Features**
- **Policy Adherence Guardrails**: Access control matrix prevents unauthorized data access
- **Feedback Loops**: Background agent provides continuous optimization
- **Real-time Adaptability**: Dynamic graph updates and version management
- **Organizational Goal Alignment**: Relationship intelligence serves business objectives

### Architectural Benefits

#### **From Research**: [Advanced Context Engineering](https://huggingface.co/blog/jsemrau/context-engineering-for-agents)
- ✅ **Hierarchical Memory**: Short-term (context windows), mid-term (relationships), long-term (versioned trees)
- ✅ **Context Persistence**: Conversation context windows with configurable retention
- ✅ **Relevance-aware Processing**: Relationship and topic-based context filtering
- ✅ **Explainable Decisions**: Context influence tracking in sentiment analysis

#### **From Research**: [LLM Memory Management](https://www.strongly.ai/blog/mastering-llm-memory-a-comprehensive-guide.html)
- ✅ **Sliding Window Memory**: 10-message context windows per user pair
- ✅ **Retrieval-based Methods**: Semantic similarity for topic matching
- ✅ **Dynamic Memory Allocation**: Adaptive context based on relationship strength
- ✅ **Multi-modal Integration**: Text, embeddings, and relationship data

### Innovation Beyond Current Practice

Our system advances beyond typical implementations by:

1. **Relationship-Aware Context**: Context windows tied to user relationships, not just temporal proximity
2. **Multi-Signal Conversation Detection**: Combining semantic, temporal, and relationship signals
3. **Dynamic Relationship Intelligence**: Real-time relationship type classification and evolution tracking
4. **Versioned Social Graph Snapshots**: Complete graph state management with optimization cycles

This architecture represents a **Level 5+ Agentic AI System** in the maturity model - featuring advanced multi-agent coordination with meta-agents, complex feedback mechanisms, and sophisticated policy adherence frameworks.
