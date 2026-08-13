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
    let output = 'graph TB\n';
    
    // Create subgraphs for better organization
    output += '  subgraph Users["👥 Users"]\n';
    graph.users.forEach(user => {
      const messageCount = user.messageIds.size;
      const style = messageCount > 5 ? '🌟' : messageCount > 2 ? '⭐' : '👤';
      output += `    U${user.id}["${style} ${user.name}<br/>📝 ${messageCount} msgs"]\n`;
    });
    output += '  end\n\n';
    
    output += '  subgraph Topics["🏷️ Topics"]\n';
    graph.topics.forEach(topic => {
      const messageCount = topic.messageIds.size;
      const participantCount = topic.userIds.size;
      if (messageCount > 0) { // Only show topics with messages
        output += `    T${topic.id}["${topic.name}<br/>📊 ${messageCount} msgs, ${participantCount} users"]\n`;
      }
    });
    output += '  end\n\n';
    
    // Add only the most significant relationships (strength > 0.7)
    output += '  %% Strong Relationships\n';
    graph.userRelationships.forEach((rel, key) => {
      if (rel.relationshipStrength > 0.7) {
        const relationshipStyle = rel.relationshipType === 'friendly' ? '===' : rel.relationshipType === 'professional' ? '--' : '-.';
        const emoji = rel.relationshipType === 'friendly' ? '💙' : rel.relationshipType === 'professional' ? '🤝' : '🤷';
        output += `  U${rel.userA} ${relationshipStyle}>|"${emoji} ${rel.relationshipStrength.toFixed(2)}"| U${rel.userB}\n`;
      }
    });
    
    output += '\n  %% Topic Participation (Active Users Only)\n';
    // Connect users to topics through messages, but only for active participants
    graph.messagesByTopic.forEach((messageIds, topicId) => {
      const userParticipation = new Map();
      messageIds.forEach(msgId => {
        const msg = graph.messages.get(msgId);
        if (msg) {
          userParticipation.set(msg.userId, (userParticipation.get(msg.userId) || 0) + 1);
        }
      });
      
      // Only show connections for users with 2+ messages in this topic
      userParticipation.forEach((count, userId) => {
        if (count >= 2) {
          output += `  U${userId} -.->|"${count} msgs"| T${topicId}\n`;
        } else if (count === 1) {
          output += `  U${userId} -.-> T${topicId}\n`;
        }
      });
    });
    
    // Add enhanced styling with different colors for different relationship types
    output += '\n  %% Styling\n';
    output += '  classDef userStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000\n';
    output += '  classDef activeUserStyle fill:#bbdefb,stroke:#0d47a1,stroke-width:3px,color:#000\n';
    output += '  classDef topicStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000\n';
    output += '  classDef activeTopicStyle fill:#e1bee7,stroke:#4a148c,stroke-width:3px,color:#000\n';
    
    // Apply styles based on activity level
    graph.users.forEach(user => {
      const messageCount = user.messageIds.size;
      if (messageCount > 2) {
        output += `  class U${user.id} activeUserStyle\n`;
      } else {
        output += `  class U${user.id} userStyle\n`;
      }
    });
    
    graph.topics.forEach(topic => {
      const messageCount = topic.messageIds.size;
      if (messageCount > 2) {
        output += `  class T${topic.id} activeTopicStyle\n`;
      } else if (messageCount > 0) {
        output += `  class T${topic.id} topicStyle\n`;
      }
    });
    
    return output;
  }
} 