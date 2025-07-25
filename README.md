# Advanced Social Sentiment Analysis System

A revolutionary **Level 5+ Agentic AI system** that processes real-time chat data to build living social graphs with relationship intelligence, context-aware sentiment analysis, and sophisticated conversation understanding using advanced multi-agent coordination.

## 🚀 What This Enhanced System Does

This system transforms chaotic chat messages into deep social intelligence by:

- **Building Living Social Graphs**: Maps complex relationships between users with emotional history, interaction patterns, and relationship evolution tracking
- **Context-Aware Sentiment Analysis**: Analyzes emotions considering user relationships, conversation history, and contextual windows (last 10 messages)
- **Intelligent Conversation Detection**: Uses semantic embeddings, reply chains, temporal proximity, and relationship dynamics to identify discussion threads
- **Relationship Intelligence**: Tracks friendship levels, communication patterns, conflict history, and emotional trajectories between users
- **Advanced Topic Modeling**: Automatically discovers and categorizes discussion topics using LLM integration with 70% similarity threshold
- **Stateless Agent Architecture**: Secure, scalable processing with strict access control and zero external dependencies for individual agents
- **Real-time Processing**: Handles message streams with zero database queries during processing through agentic AI coordination
- **Version Management**: Maintains historical snapshots for analysis and optimization with complete relationship timeline preservation

## 🏗️ Agentic AI Architecture Overview

### Visual Architecture Documentation
- **📊 [System Architecture Diagram](system-architecture.mmd)**: Complete component relationships, access control matrix, and agentic AI layers
- **🔄 [Data Flow Diagram](data-flow.mmd)**: End-to-end message processing pipeline with timing, decision points, and relationship tracking

### Level 5+ Agentic AI Flow

```
Pineapple.json → Event Simulator → Accumulator Raft → Concierge Agent (Meta-Agent) → Stateless Processing Agents
                                        ↓                         ↓
                                   Redis Access Only      In-Memory Graph + Relationship Intelligence
                                        ↓                         ↓
                                 Message Batching         Context-Aware Processing + Social Analysis
                                        ↓                         ↓
                                  Storage Raft          Background Optimization + Versioned Database
                                 (DB Access Only)
```

### Core Agentic AI Components

#### **Meta-Agent Coordination Layer**
- **Concierge Agent**: Central meta-agent orchestrating all specialist agents, maintaining living social graph with relationship intelligence

#### **Stateless Processing Agents (Zero External Access)**
- **Enhanced Sentiment Agent**: Context-aware sentiment analysis using relationship history and conversation windows
- **Relationship Agent**: User relationship tracking, interaction pattern analysis, and emotional trajectory monitoring
- **Embedding Agent**: Vector embedding generation for semantic similarity
- **Spam/Toxicity Agents**: Content filtering and safety analysis
- **Topic Agent**: LLM-powered topic classification and creation

#### **Data Access Control Layer (Strict Boundaries)**
- **Accumulator Raft**: Redis-only access for message batching and event streaming
- **Storage Raft**: PostgreSQL-only access for versioned graph persistence and historical data

#### **Background Intelligence Layer**
- **Topic Refinement Optimizer**: Periodic graph optimization using LLM analysis
- **Relationship Evolution Tracker**: Long-term relationship pattern analysis and prediction

## 📊 Enhanced Key Features

### ⚡ Agentic AI Performance Optimizations
- **Zero External Access**: Stateless agents with no database or Redis access during processing
- **Strict Access Control**: Only specific rafts can access external resources (Redis/PostgreSQL)
- **Pure In-Memory Operations**: Complete social graph with relationships loaded in one query
- **Parallel Agent Coordination**: Meta-agent orchestrates multiple specialized agents simultaneously
- **Smart Batching**: Message accumulation with relationship context preservation

### 🧠 Advanced Intelligence Capabilities
- **Context-Aware Sentiment Analysis**: Considers user relationships, conversation history, and emotional patterns
- **Relationship Intelligence**: 
  - Friendship level tracking (acquaintances → close friends)
  - Communication pattern analysis (frequency, response times, message lengths)
  - Conflict detection and resolution tracking
  - Emotional trajectory monitoring over time
- **Conversation Context Windows**: Maintains sliding windows of last 10 messages between user pairs
- **Dynamic Topic Creation**: LLM-generated topics with 70% similarity threshold
- **Social Network Evolution**: Tracks relationship strength changes and community formation
- **Multi-Dimensional Conversation Detection**: Semantic + social + temporal + relationship signals

### 🔐 Security & Reliability Features
- **Access Control Matrix**: Enforced boundaries preventing unauthorized data access
- **Stateless Agent Security**: Individual agents cannot leak data or cause security breaches
- **Isolated Processing**: Each agent operates in complete isolation for maximum resilience
- **Versioned Relationship Snapshots**: Complete relationship history preserved across versions
- **Atomic Social Updates**: Consistent relationship and conversation state management
- **Historical Relationship Analysis**: Track relationship evolution and predict future patterns

## 🛠️ Technology Stack

- **Node.js/TypeScript**: Core runtime and language
- **PostgreSQL + TimescaleDB**: Persistent storage with time-series optimization
- **Redis**: Message accumulation and caching
- **Docker**: Local development environment
- **OpenAI/ChatGPT**: LLM integration for topic optimization
- **Vector Embeddings**: Semantic analysis and similarity detection

## 📁 Enhanced Project Structure

```
├── Agents/                          # Agentic AI Processing Layer
│   ├── conciergeAgent.ts           # Meta-agent orchestrator + in-memory social graph
│   ├── sentimentAgent.ts           # Enhanced contextual sentiment analysis
│   ├── relationshipAgent.ts        # User relationship and context tracking
│   ├── embeddingAgent.ts           # Vector embeddings for semantic analysis
│   ├── spamAgent.ts                # Spam detection and content filtering
│   ├── toxicityAgent.ts            # Toxicity detection and safety analysis
│   ├── llmAgent.ts                 # LLM integration for topic classification
│   └── topicRefinementAgent.ts     # Background optimization and refinement
├── rafts/                           # Data Access Control Layer
│   ├── accumulator_raft.ts         # Redis-only message batching system
│   └── storage_raft.ts             # PostgreSQL-only persistence layer
├── services/                        # Supporting services
├── simulators/                      # Data simulation tools
├── postgresClient/                  # Database connectivity
├── redisClient/                     # Cache connectivity
├── scripts/                         # Setup and deployment tools
├── system-architecture.mmd         # 📊 Complete system architecture diagram
├── data-flow.mmd                   # 🔄 End-to-end data flow diagram
├── SYSTEM_STRATEGY_EXPLAINED.md    # 📖 Comprehensive system strategy guide
├── IMPLEMENTATION_PLAN.md          # 🛠️ Detailed technical implementation plan
└── pineapple.json                  # 📋 Sample chat data for simulation
```

### Architecture Documentation Files

- **`system-architecture.mmd`**: Visual representation of the complete agentic AI system with access control matrix
- **`data-flow.mmd`**: Detailed flow diagram showing message processing pipeline with relationship tracking
- **`SYSTEM_STRATEGY_EXPLAINED.md`**: Strategic overview of the enhanced social intelligence system
- **`IMPLEMENTATION_PLAN.md`**: Comprehensive technical implementation with relationship and context features

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd topic-modelling-solution-3
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Initialize database**
   ```bash
   npm run setup:db
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Run the simulation**
   ```bash
   npm run simulate
   ```

### Environment Configuration

Create a `.env` file with:

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=topic_modeling
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI (for topic optimization)
OPENAI_API_KEY=your_api_key_here

# Processing Configuration
BATCH_SIZE=100
SIMILARITY_THRESHOLD=0.5
OPTIMIZATION_INTERVAL=3600000
```

## 🎯 Usage Examples

### Running Full Pipeline

```bash
# Start all services
npm run start:all

# Run event simulation with pineapple.json
npm run simulate:events

# Monitor processing metrics
npm run monitor
```

### Querying the Social Graph

```bash
# Get conversation analytics
npm run query:conversations

# Analyze topic evolution
npm run query:topics

# Export social network
npm run export:graph
```

### Background Optimization

```bash
# Trigger manual optimization
npm run optimize:topics

# View version history
npm run versions:list

# Rollback to previous version
npm run rollback --version=5
```

## 📈 Enhanced Monitoring & Social Intelligence Analytics

### Real-time Metrics
- Messages processed per second
- Active conversations count with relationship context
- Topic discovery rate and coherence scores
- User engagement levels and relationship activity
- Memory usage and performance metrics
- **Relationship Tracking**: Active relationships, new connections, relationship strength changes
- **Context Processing**: Context window utilization, sentiment accuracy improvements

### Advanced Social Intelligence Analysis
- **Relationship Evolution**: Friendship formation patterns, relationship lifecycle tracking
- **Social Network Dynamics**: Community formation, influence patterns, social cluster identification
- **Emotional Intelligence**: Sentiment accuracy improvements with context, emotional trajectory analysis
- **Conversation Quality**: Context-aware conversation threading accuracy, relationship-influenced sentiment detection

### Historical Analysis
- Topic evolution over time with social context
- User behavior changes and relationship development patterns
- Conversation pattern trends and relationship influence
- Social network growth and community evolution
- **Relationship Timeline**: Complete history of relationship changes and emotional patterns
- **Context Impact Analysis**: How conversation context improves sentiment accuracy over time

### Quality Metrics
- Topic coherence scores with relationship context
- Conversation accuracy with social signals
- Contextual sentiment distribution and confidence scores  
- Relationship classification accuracy
- Spam detection effectiveness
- **Context-Enhanced Metrics**: Sentiment accuracy improvement with vs. without context, relationship prediction accuracy

## 🔧 Enhanced Configuration

### Core Processing Parameters

- **Batch Size**: Number of messages processed together (default: 100)
- **Similarity Threshold**: Minimum embedding similarity for topic assignment (default: 0.7)
- **Conversation Window**: Time window for conversation detection (default: 5 minutes)
- **Optimization Frequency**: Background optimization interval (default: 1 hour)

### Relationship & Context Parameters

- **Context Window Size**: Number of recent messages to consider for sentiment analysis (default: 10)
- **Relationship Decay Rate**: How quickly relationship strength decreases without interaction (default: 0.95/day)
- **Minimum Interaction Threshold**: Minimum messages for relationship establishment (default: 5)
- **Emotional Trajectory Window**: Time window for tracking emotional patterns (default: 24 hours)
- **Relationship Strength Levels**: Configurable thresholds for acquaintance/friend/close friend (default: 10/50/200 interactions)

### Enhanced Agent Configuration

Each agent can be configured independently:

- **Enhanced Sentiment Agent**: Model selection, confidence thresholds, relationship influence weights, context window settings
- **Relationship Agent**: Interaction tracking sensitivity, relationship evolution rates, conflict detection thresholds
- **Spam Agent**: Sensitivity levels and keyword filters
- **Toxicity Agent**: Safety thresholds and content policies  
- **Embedding Agent**: Model selection and dimension settings
- **LLM Agent**: Topic classification models, similarity thresholds, creativity parameters

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Scale individual components**
   ```bash
   docker-compose scale concierge-agent=3
   docker-compose scale background-optimizer=1
   ```

### Performance Tuning

- **Memory Allocation**: Ensure sufficient RAM for in-memory graph
- **Database Optimization**: Configure PostgreSQL for JSONB operations
- **Redis Configuration**: Optimize for high-throughput operations
- **Agent Scaling**: Scale individual agents based on workload

## 📚 Documentation

### Core Documentation
- **[System Strategy Guide](SYSTEM_STRATEGY_EXPLAINED.md)**: Comprehensive explanation of how the enhanced social intelligence system works with relationship tracking and context analysis
- **[Implementation Plan](IMPLEMENTATION_PLAN.md)**: Detailed technical implementation guide with agentic AI architecture and access control
- **[System Architecture Diagram](system-architecture.mmd)**: Visual representation of the complete agentic AI system with component relationships and access control matrix
- **[Data Flow Diagram](data-flow.mmd)**: End-to-end message processing pipeline with relationship tracking and context processing

### Technical References
- **[API Documentation](docs/api.md)**: REST API reference with relationship and context endpoints
- **[Agentic AI Best Practices](docs/agentic-ai.md)**: Guidelines for Level 5+ agentic AI implementation
- **[Relationship Intelligence Guide](docs/relationships.md)**: Deep dive into relationship tracking and social intelligence features
- **[Context-Aware Processing](docs/context.md)**: Technical details on conversation context and sentiment enhancement

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Submit a pull request

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Comprehensive test coverage
- Documentation for all public APIs

### Testing

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

*Transforming conversations into deep social understanding - one relationship at a time* 