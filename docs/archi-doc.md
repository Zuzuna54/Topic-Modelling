# Advanced Social Sentiment Analysis System - Complete Architecture Documentation

## 🏗️ System Overview

This is a **Level 5+ Agentic AI System** that processes real-time chat data to build living social graphs with relationship intelligence. The system transforms chaotic messaging data into deep social understanding through sophisticated multi-agent coordination.

### Core Mission
Transform conversations into actionable intelligence by building **living social graphs** that track relationships, understand context, and provide insights about community dynamics in real-time.

## 📊 High-Level Architecture Diagram

```mermaid
graph TB
    %% Data Sources
    subgraph "Data Sources"
        PJ[chat-export.json<br/>Telegram Chat Data]
        ES[Event Simulator<br/>Message Stream Generator]
    end

    %% Raft Layer - Data Access Control
    subgraph "Raft Layer - Data Access Control"
        AR[Accumulator Raft<br/>Redis + Message Batching]
        SR[Storage Raft<br/>PostgreSQL + Versioning]
    end

    %% Agent Layer - Processing
    subgraph "Agent Layer - Zero External Access"
        CA[Concierge Agent<br/>Meta-Agent Orchestrator]
        
        subgraph "AI Agents"
            SA[Sentiment Agent<br/>Gemini-based]
            EA[Embedding Agent<br/>Vector Generation]
            TA[Topic Agent<br/>LLM Topic Modeling]
            TxA[Toxicity Agent<br/>Content Safety]
            RA[Relationship Agent<br/>Social Intelligence]
            SpA[Spam Agent<br/>Content Filtering]
            EmA[Emoji Agent<br/>Emotional Processing]
        end
        
        subgraph "Non-AI Agents"
            GMA[Graph Management Agent<br/>In-Memory Operations]
            IMA[Index Management Agent<br/>Data Structures]
            CBA[Context Builder Agent<br/>Relationship Context]
        end
    end

    %% Storage Layer
    subgraph "Storage & Persistence"
        Redis[(Redis<br/>Message Queue)]
        PG[(PostgreSQL<br/>Versioned Storage)]
        Memory[In-Memory Graph<br/>Active Processing]
    end

    %% Data Flow
    PJ --> ES
    ES --> AR
    AR --> Redis
    AR --> CA
    CA --> SA
    CA --> EA
    CA --> TA
    CA --> TxA
    CA --> RA
    CA --> SpA
    CA --> EmA
    CA --> GMA
    CA --> IMA
    CA --> CBA
    CA --> Memory
    Memory --> SR
    SR --> PG

    %% Styling
    classDef raftLayer fill:#e1f5fe
    classDef agentLayer fill:#f3e5f5
    classDef aiAgent fill:#fff3e0
    classDef nonAiAgent fill:#e8f5e8
    classDef storage fill:#fce4ec

    class AR,SR raftLayer
    class CA agentLayer
    class SA,EA,TA,TxA,RA,SpA,EmA aiAgent
    class GMA,IMA,CBA nonAiAgent
    class Redis,PG,Memory storage
```

## 🔄 Detailed Data Flow Architecture

```mermaid
sequenceDiagram
    participant ES as Event Simulator
    participant AR as Accumulator Raft
    participant Redis as Redis Queue
    participant CA as Concierge Agent
    participant AI as AI Agents (Parallel)
    participant NonAI as Non-AI Agents
    participant IG as In-Memory Graph
    participant SR as Storage Raft
    participant PG as PostgreSQL

    Note over ES,PG: Real-Time Message Processing Pipeline

    ES->>AR: 1. SimulatedEvent<br/>(message, user, timestamp)
    AR->>Redis: 2. Queue Message<br/>(batch accumulation)
    Redis-->>AR: 3. Batch Ready Signal<br/>(configurable size)
    AR->>CA: 4. BatchReadyEvent<br/>(processed messages)
    
    Note over CA: Meta-Agent Orchestration Begins

    CA->>CA: 5. Validation & Filtering<br/>(input sanitization)
    CA->>NonAI: 6. Context Retrieval<br/>(relationship context)
    NonAI-->>CA: 7. MessageContext[]<br/>(enriched context)
    
    Note over CA,AI: Parallel AI Processing Phase

    par Spam Detection
        CA->>AI: 8a. Spam Analysis
        AI-->>CA: SpamResult[]
    and Emoji Processing
        CA->>AI: 8b. Emoji Processing
        AI-->>CA: ProcessedText[]
    and Topic Assignment
        CA->>AI: 8c. Topic Modeling
        AI-->>CA: TopicResult[]
    and Sentiment Analysis
        CA->>AI: 8d. Context-Aware Sentiment
        AI-->>CA: SentimentResult[]
    and Toxicity Analysis
        CA->>AI: 8e. Toxicity Detection
        AI-->>CA: ToxicityResult[]
    and Relationship Analysis
        CA->>AI: 8f. Relationship Updates
        AI-->>CA: RelationshipUpdate[]
    and Embedding Generation
        CA->>AI: 8g. Vector Embeddings
        AI-->>CA: EmbeddingResult[]
    end

    CA->>NonAI: 9. Graph Update<br/>(consolidated results)
    NonAI->>IG: 10. Update In-Memory Graph<br/>(atomic operations)
    NonAI->>NonAI: 11. Index Management<br/>(performance optimization)
    
    CA->>SR: 12. Periodic Storage<br/>(every 10 seconds)
    SR->>PG: 13. Versioned Persistence<br/>(JSONB + entities)
    
    Note over ES,PG: Complete Message Processing Cycle
```

## 🧠 Agent Architecture Deep Dive

### Meta-Agent Coordination (Concierge Agent)

```mermaid
graph LR
    subgraph "Concierge Agent Responsibilities"
        OR[Orchestration<br/>• Agent coordination<br/>• Processing pipeline<br/>• Error handling]
        QM[Queue Management<br/>• Batch processing<br/>• Backpressure control<br/>• Priority handling]
        SC[State Coordination<br/>• Graph synchronization<br/>• Context sharing<br/>• Event emission]
    end

    subgraph "Processing Pipeline"
        V[Validation] --> CF[Context Formation]
        CF --> SD[Spam Detection]
        SD --> EP[Emoji Processing]
        EP --> TA[Topic Assignment]
        TA --> PA[Parallel AI Analysis]
        PA --> GU[Graph Updates]
        GU --> IM[Index Management]
    end

    OR --> V
    QM --> CF
    SC --> GU
```

### AI Agent Specialization Matrix

| Agent | Purpose | Input | Output | Technology |
|-------|---------|-------|--------|------------|
| **Sentiment Agent** | Context-aware emotion analysis | Text + Relationship Context | Sentiment scores with relationship influence | Google Gemini |
| **Embedding Agent** | Vector space representation | Processed text | 384-dimensional embeddings | Sentence Transformers |
| **Topic Agent** | Intelligent topic classification | Text + Existing topics + Context | Topic assignments with confidence | Google Gemini |
| **Toxicity Agent** | Context-aware safety analysis | Text + User relationships | Toxicity scores considering relationships | Google Gemini |
| **Relationship Agent** | Social dynamics tracking | Message patterns + User interactions | Relationship strength updates | Google Gemini |
| **Spam Agent** | Context-aware content filtering | Text + User history | Spam probability with context | Google Gemini |
| **Emoji Agent** | Emotional context extraction | Raw text with emojis | Processed text + emotional metadata | Google Gemini |

### Non-AI Agent Infrastructure

```mermaid
graph TB
    subgraph "Non-AI Agents - Infrastructure Layer"
        GMA[Graph Management Agent<br/>• In-memory operations<br/>• Entity lifecycle<br/>• Consistency enforcement]
        
        IMA[Index Management Agent<br/>• Performance optimization<br/>• Query acceleration<br/>• Memory efficiency]
        
        CBA[Context Builder Agent<br/>• Relationship context<br/>• Conversation windows<br/>• Recipient inference]
    end

    subgraph "Graph Operations"
        CREATE[Entity Creation<br/>Users, Messages, Topics]
        UPDATE[Relationship Updates<br/>Strength, Type, History]
        INDEX[Index Maintenance<br/>by User, Topic, Time]
    end

    GMA --> CREATE
    GMA --> UPDATE
    IMA --> INDEX
    CBA --> UPDATE
```

## 🏛️ Data Architecture

### In-Memory Graph Structure

```typescript
interface InMemoryGraph {
    // Core Entities
    messages: Map<number, Message>           // All processed messages
    users: Map<number, User>                 // User profiles & activity
    topics: Map<number, Topic>               // Dynamic topic taxonomy
    conversations: Map<string, Conversation> // Thread tracking
    userRelationships: Map<string, UserRelationship> // Social graph
    conversationContexts: Map<string, ConversationContextWindow> // Context windows

    // Performance Indexes
    messagesByUser: Map<number, number[]>     // User→Messages lookup
    messagesByTopic: Map<number, number[]>    // Topic→Messages lookup
    activeConversations: Map<number, string[]> // User→Active threads
    relationshipsByUser: Map<number, Set<string>> // User→Relationships
    
    // Metadata & Stats
    stats: GraphStatistics
    groupId: number
}
```

### Message Processing Data Structures

```typescript
interface MessageContext {
    messageId: number
    senderId: number
    recipientIds: number[]
    userRelationship?: UserRelationship
    conversationContext?: ConversationWindow
    topicContext?: number[]
    senderName?: string
    recipientNames?: string[]
}

interface ProcessingResults {
    embeddings: number[][]              // Vector representations
    sentimentResults: SentimentResult[] // Context-aware emotions
    toxicityResults: ToxicityResult[]   // Safety analysis
    topicResults: TopicResult[]         // Topic assignments
    relationshipUpdates: RelationshipUpdate[] // Social graph changes
}
```

## 🔧 Technology Stack Deep Dive

### Core Technologies

```mermaid
graph LR
    subgraph "Runtime Environment"
        Node[Node.js 20+<br/>JavaScript Runtime]
        TS[TypeScript 5.0<br/>Type Safety]
    end

    subgraph "AI & ML"
        Gemini[Google Gemini<br/>LLM Processing]
        ST[Sentence Transformers<br/>Embeddings]
    end

    subgraph "Data Storage"
        Redis[Redis 6+<br/>Message Queue]
        PG[PostgreSQL 14+<br/>Versioned Storage]
        Memory[In-Memory<br/>Active Graph]
    end

    subgraph "Development"
        Jest[Jest<br/>Testing Framework]
        Docker[Docker<br/>Containerization]
    end
```

### Storage Strategy - Multi-Layered Persistence

```mermaid
graph TB
    subgraph "Storage Layers"
        L1[Layer 1: In-Memory Graph<br/>• Active processing<br/>• Real-time updates<br/>• Performance optimization]
        
        L2[Layer 2: Redis Queue<br/>• Message batching<br/>• Event streaming<br/>• Temporary buffering]
        
        L3[Layer 3: PostgreSQL<br/>• Versioned snapshots<br/>• Historical analysis<br/>• Disaster recovery]
    end

    subgraph "Storage Modes"
        Blob[JSONB Blob Storage<br/>• Complete graph snapshots<br/>• Fast restoration<br/>• Version comparison]
        
        Entity[Entity Storage<br/>• Normalized tables<br/>• Relational queries<br/>• Analytics support]
        
        Dual[Dual Storage<br/>• Both blob + entities<br/>• Maximum flexibility<br/>• Performance + Analytics]
    end

    L1 --> L2
    L2 --> L3
    L3 --> Blob
    L3 --> Entity
    L3 --> Dual
```

## ⚡ Performance Architecture

### Processing Pipeline Optimization

```mermaid
graph LR
    subgraph "Performance Optimizations"
        Batch[Message Batching<br/>• Configurable batch size<br/>• Reduced overhead<br/>• Improved throughput]
        
        Parallel[Parallel Processing<br/>• Promise.all coordination<br/>• Independent AI agents<br/>• Resource utilization]
        
        Memory[In-Memory Operations<br/>• Zero DB queries during processing<br/>• Index-optimized lookups<br/>• Atomic updates]
        
        Cache[Intelligent Caching<br/>• Content hash deduplication<br/>• Request deduplication<br/>• Version caching]
    end

    Batch --> Parallel
    Parallel --> Memory
    Memory --> Cache
```

### Scalability Considerations

| Component | Scaling Strategy | Bottleneck | Solution |
|-----------|------------------|------------|----------|
| **Event Simulator** | Horizontal (multiple instances) | I/O throughput | Async processing + batching |
| **Accumulator Raft** | Vertical (Redis scaling) | Memory capacity | Redis clustering + sharding |
| **Concierge Agent** | Horizontal (agent pools) | CPU utilization | Process-level parallelization |
| **AI Agents** | Horizontal (API scaling) | API rate limits | Request pooling + backoff |
| **Storage Raft** | Vertical (PostgreSQL) | Write throughput | Connection pooling + batching |

## 🔒 Security & Access Control

### Agent Isolation Architecture

```mermaid
graph TB
    subgraph "Security Boundaries"
        subgraph "Processing Layer (Zero External Access)"
            AI_AGENTS[AI Agents<br/>• No database access<br/>• No Redis access<br/>• Pure processing only]
            
            NON_AI[Non-AI Agents<br/>• In-memory only<br/>• No network access<br/>• Stateless operations]
        end
        
        subgraph "Data Access Layer (Controlled Access)"
            ACCUMULATOR[Accumulator Raft<br/>• Redis access only<br/>• Message queuing<br/>• No graph access]
            
            STORAGE[Storage Raft<br/>• PostgreSQL access only<br/>• Versioned persistence<br/>• No processing logic]
        end
    end

    subgraph "Access Control Matrix"
        PROCESSING_AGENTS[Processing Agents] -.->|❌ NO ACCESS| EXTERNAL_RESOURCES[External Resources]
        DATA_RAFTS[Data Rafts] -.->|✅ CONTROLLED ACCESS| EXTERNAL_RESOURCES
    end
```

### Data Privacy & Isolation

- **Stateless Agent Design**: All AI agents are stateless and cannot persist data
- **Access Control Boundaries**: Clear separation between processing and storage
- **Content Hashing**: Idempotent operations prevent duplicate processing
- **Versioned Storage**: Complete audit trail with rollback capabilities

## 📈 Monitoring & Observability

### System Health Metrics

```mermaid
graph LR
    subgraph "Real-Time Metrics"
        MSG[Messages/Second<br/>Processing Rate]
        QUEUE[Queue Depth<br/>Backpressure Monitor]
        MEM[Memory Usage<br/>Graph Size Tracking]
    end

    subgraph "Business Metrics"
        USERS[Active Users<br/>Community Growth]
        TOPICS[Topic Discovery<br/>Conversation Themes]
        REL[Relationship Formation<br/>Social Dynamics]
    end

    subgraph "Performance Metrics"
        LAT[Processing Latency<br/>End-to-end Timing]
        ERR[Error Rates<br/>Agent Failures]
        THROUGH[Throughput<br/>Messages Processed]
    end
```

### Error Handling & Recovery

- **Graceful Degradation**: System continues operating with reduced functionality
- **Retry Logic**: Exponential backoff for transient failures
- **Circuit Breakers**: Prevent cascade failures in AI agents
- **State Recovery**: In-memory graph restoration from versioned storage

## 🚀 Deployment Architecture

### Production Deployment Strategy

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer<br/>Request Distribution]
        
        subgraph "Application Tier"
            APP1[App Instance 1<br/>Full System Stack]
            APP2[App Instance 2<br/>Full System Stack]
            APP3[App Instance N<br/>Full System Stack]
        end
        
        subgraph "Data Tier"
            REDIS_CLUSTER[Redis Cluster<br/>Message Queue HA]
            PG_PRIMARY[PostgreSQL Primary<br/>Write Operations]
            PG_REPLICA[PostgreSQL Replica<br/>Read Operations]
        end
        
        subgraph "External Services"
            GEMINI[Google Gemini API<br/>AI Processing]
            MONITORING[Monitoring Stack<br/>Observability]
        end
    end

    LB --> APP1
    LB --> APP2
    LB --> APP3
    APP1 --> REDIS_CLUSTER
    APP2 --> REDIS_CLUSTER
    APP3 --> REDIS_CLUSTER
    APP1 --> PG_PRIMARY
    APP2 --> PG_PRIMARY
    APP3 --> PG_PRIMARY
    APP1 --> GEMINI
    APP2 --> GEMINI
    APP3 --> GEMINI
```

## 🔧 Configuration & Environment

### Environment Variables
```bash
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=topic_modeling
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Processing Configuration
BATCH_SIZE=5
SIMILARITY_THRESHOLD=0.7
OPTIMIZATION_INTERVAL=10000
```

### System Requirements

| Component | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| **CPU** | 2 cores | 4 cores | 8+ cores |
| **Memory** | 4GB RAM | 8GB RAM | 16+ GB RAM |
| **Storage** | 10GB SSD | 50GB SSD | 500+ GB SSD |
| **Network** | 100 Mbps | 1 Gbps | 10+ Gbps |

This architecture represents a sophisticated, production-ready system that combines cutting-edge AI processing with robust engineering practices, making it ideal for real-world social intelligence applications.
