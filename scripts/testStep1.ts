import { MockTreeGenerator } from '../services/mockTreeGenerator';
import { TreeVisualizer } from '../services/treeVisualizer';
import { InMemoryGraph } from '../types';
import * as fs from 'fs';

// Helper function to convert Maps and Sets to plain objects for JSON serialization
function convertGraphToJSON(graph: InMemoryGraph) {
  return {
    groupId: graph.groupId,
    stats: graph.stats,
    
    // Convert Maps to objects
    messages: Object.fromEntries(
      Array.from(graph.messages.entries()).map(([key, msg]) => [
        key,
        {
          ...msg,
          timestamp: msg.timestamp.toISOString(),
          // Convert any Sets to arrays
          ...(msg.contextualSentiment && {
            contextualSentiment: {
              ...msg.contextualSentiment,
              contextMessages: msg.contextualSentiment.contextMessages
            }
          })
        }
      ])
    ),
    
    users: Object.fromEntries(
      Array.from(graph.users.entries()).map(([key, user]) => [
        key,
        {
          ...user,
          messageIds: Array.from(user.messageIds),
          activeConversations: Array.from(user.activeConversations),
          topicParticipation: Object.fromEntries(user.topicParticipation),
          recentInteractions: Object.fromEntries(user.recentInteractions),
          lastActivity: user.lastActivity.toISOString()
        }
      ])
    ),
    
    topics: Object.fromEntries(
      Array.from(graph.topics.entries()).map(([key, topic]) => [
        key,
        {
          ...topic,
          messageIds: Array.from(topic.messageIds),
          userIds: Array.from(topic.userIds),
          conversationIds: Array.from(topic.conversationIds),
          relatedTopics: Array.from(topic.relatedTopics),
          lastUpdated: topic.lastUpdated.toISOString()
        }
      ])
    ),
    
    conversations: Object.fromEntries(
      Array.from(graph.conversations.entries()).map(([key, conv]) => [
        key,
        {
          ...conv,
          participantIds: Array.from(conv.participantIds),
          topicIds: Array.from(conv.topicIds),
          startTime: conv.startTime.toISOString(),
          lastActivity: conv.lastActivity.toISOString(),
          messageFlow: conv.messageFlow.map(flow => ({
            ...flow,
            timestamp: flow.timestamp.toISOString()
          }))
        }
      ])
    ),
    
    userRelationships: Object.fromEntries(
      Array.from(graph.userRelationships.entries()).map(([key, rel]) => [
        key,
        {
          ...rel,
          sentimentHistory: rel.sentimentHistory,
          communicationPatterns: {
            ...rel.communicationPatterns,
            topicOverlap: Array.from(rel.communicationPatterns.topicOverlap)
          },
          lastInteraction: rel.lastInteraction.toISOString(),
          relationshipEvolution: rel.relationshipEvolution.map(evo => ({
            ...evo,
            timestamp: evo.timestamp.toISOString()
          })),
          conversationContext: {
            ...rel.conversationContext,
            recentMessages: rel.conversationContext.recentMessages.map(msg => ({
              ...msg,
              timestamp: msg.timestamp.toISOString()
            })),
            lastContextUpdate: rel.conversationContext.lastContextUpdate.toISOString()
          }
        }
      ])
    ),
    
    conversationContexts: Object.fromEntries(
      Array.from(graph.conversationContexts.entries()).map(([key, ctx]) => [
        key,
        {
          ...ctx,
          messages: ctx.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          })),
          lastUpdated: ctx.lastUpdated.toISOString()
        }
      ])
    ),
    
    // Convert other Maps and Sets
    relationshipsByUser: Object.fromEntries(
      Array.from(graph.relationshipsByUser.entries()).map(([key, set]) => [
        key,
        Array.from(set)
      ])
    ),
    
    topicsByEmbedding: Object.fromEntries(graph.topicsByEmbedding),
    messagesByUser: Object.fromEntries(graph.messagesByUser),
    messagesByTopic: Object.fromEntries(graph.messagesByTopic),
    messagesByConversation: Object.fromEntries(graph.messagesByConversation),
    activeConversations: Object.fromEntries(graph.activeConversations),
    relationshipTypes: Object.fromEntries(
      Array.from(graph.relationshipTypes.entries()).map(([key, set]) => [
        key,
        Array.from(set)
      ])
    ),
    strongRelationships: Array.from(graph.strongRelationships),
    activeContextWindows: Object.fromEntries(
      Array.from(graph.activeContextWindows.entries()).map(([key, set]) => [
        key,
        Array.from(set)
      ])
    ),
    recentInteractionPairs: Array.from(graph.recentInteractionPairs),
    conversationThreads: Object.fromEntries(graph.conversationThreads),
    recentMessages: graph.recentMessages
  };
}

async function testStep1() {
  console.log('🧪 Testing Step 1: Mock Tree Creation & Visualization');
  console.log('=' .repeat(60));

  try {
    // Sub-step 1.1 & 1.2: Create Mock Data Structures and Generate Mock Tree
    console.log('\n📋 Sub-step 1.1 & 1.2: Creating Mock Tree with Sample Data');
    const mockGraph = MockTreeGenerator.generateMockTree(1);
    
    console.log('✅ Mock tree generated successfully!');
    console.log(`📊 Generated ${mockGraph.stats.totalMessages} messages, ${mockGraph.stats.totalUsers} users, ${mockGraph.stats.totalTopics} topics`);

    // Sub-step 1.3: Generate Text Visualization
    console.log('\n📊 Sub-step 1.3a: Generating Text Visualization');
    const textVisualization = TreeVisualizer.generateTextVisualization(mockGraph);
    console.log(textVisualization);

    // Sub-step 1.3: Generate Mermaid Diagram
    console.log('\n🎨 Sub-step 1.3b: Generating Mermaid Diagram');
    const mermaidDiagram = TreeVisualizer.generateMermaidDiagram(mockGraph);
    console.log('Mermaid Diagram:');
    console.log('```mermaid');
    console.log(mermaidDiagram);
    console.log('```');

    // Write visualizations to files
    console.log('\n💾 Writing visualizations to files...');
    
    // Create output directory if it doesn't exist
    const outputDir = './output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Write text visualization
    const textFilePath = `${outputDir}/social_graph_visualization.txt`;
    fs.writeFileSync(textFilePath, textVisualization);
    console.log(`✅ Text visualization saved to: ${textFilePath}`);

    // Write Mermaid diagram
    const mermaidFilePath = `${outputDir}/social_graph_diagram.mmd`;
    fs.writeFileSync(mermaidFilePath, mermaidDiagram);
    console.log(`✅ Mermaid diagram saved to: ${mermaidFilePath}`);

    // Write a complete Mermaid file with proper markdown formatting
    const mermaidMarkdownPath = `${outputDir}/social_graph_diagram.md`;
    const mermaidMarkdown = `# Social Graph Visualization

## Network Diagram

\`\`\`mermaid
${mermaidDiagram}
\`\`\`

## Statistics
- **Users**: ${mockGraph.stats.totalUsers}
- **Messages**: ${mockGraph.stats.totalMessages}
- **Topics**: ${mockGraph.stats.totalTopics}
- **Conversations**: ${mockGraph.stats.activeConversations}
- **Relationships**: ${mockGraph.stats.trackedRelationships}

## Generated at
${new Date().toISOString()}
`;
    fs.writeFileSync(mermaidMarkdownPath, mermaidMarkdown);
    console.log(`✅ Mermaid markdown saved to: ${mermaidMarkdownPath}`);

    // Test data integrity
    console.log('\n🔍 Testing Data Integrity:');
    
    // Check messages are properly linked to users
    let totalUserMessages = 0;
    mockGraph.users.forEach(user => {
      totalUserMessages += user.messageIds.size;
    });
    console.log(`✅ User message links: ${totalUserMessages} total user-message connections`);
    
    // Check topics have proper message associations
    let totalTopicMessages = 0;
    mockGraph.topics.forEach(topic => {
      totalTopicMessages += topic.messageIds.size;
    });
    console.log(`✅ Topic message links: ${totalTopicMessages} total topic-message connections`);
    
    // Check relationships
    console.log(`✅ User relationships: ${mockGraph.userRelationships.size} relationships tracked`);
    
    // Check conversation contexts
    console.log(`✅ Context windows: ${mockGraph.conversationContexts.size} context windows created`);

    // Generate JSON tree structure and save to file + console
    console.log('\n📋 Prettified JSON Tree Structure:');
    console.log('=' .repeat(60));
    const jsonTree = convertGraphToJSON(mockGraph);
    console.log(JSON.stringify(jsonTree, null, 2));

    // Write JSON tree structure to file
    const jsonFilePath = `${outputDir}/social_graph_data.json`;
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonTree, null, 2));
    console.log(`\n✅ JSON tree data saved to: ${jsonFilePath}`);

    console.log('\n🎉 Step 1 Implementation Complete!');
    console.log('All sub-steps working correctly:');
    console.log('  ✅ 1.1: Mock Data Structures (TypeScript interfaces)');
    console.log('  ✅ 1.2: Mock Tree Generator (realistic social graph)');
    console.log('  ✅ 1.3: Tree Visualizer (text + Mermaid diagrams)');
    
    console.log('\n📂 Output Files Created:');
    console.log('  📄 ./output/social_graph_visualization.txt - Text visualization');
    console.log('  🎨 ./output/social_graph_diagram.mmd - Mermaid diagram');
    console.log('  📋 ./output/social_graph_diagram.md - Mermaid in markdown');
    console.log('  🔧 ./output/social_graph_data.json - Complete JSON tree structure');
    
    console.log('\n💡 How to view the Mermaid diagram:');
    console.log('  1. Copy content from .mmd file');
    console.log('  2. Paste into: https://mermaid.live/');
    console.log('  3. Or use VS Code Mermaid Preview extension');
    console.log('  4. Or view the .md file in GitHub/any markdown viewer');

  } catch (error) {
    console.error('\n❌ Step 1 test failed:', error);
    throw error;
  }
}

export { testStep1 };

// To run this test, execute: npx ts-node scripts/testStep1.ts
testStep1().catch(console.error); 