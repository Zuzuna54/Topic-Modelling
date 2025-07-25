import { 
  MockSentimentAgent, 
  MockEmbeddingAgent, 
  MockToxicityAgent, 
  MockTopicAgent, 
  MockRelationshipAgent, 
  MockSpamAgent, 
  MockEmojiAgent 
} from '../Agents/mockAgents';
import { MessageContext } from '../Agents/interfaces';

async function testMockAgents() {
  console.log('🧪 Testing Mock Agent Implementations\n');
  
  // Test messages
  const testMessages = [
    'Hey everyone! This is amazing! 🎉',
    'I hate this terrible project deadline',
    'Looking forward to the party this weekend 😊',
    'Anyone interested in our new AI software?',
    'Buy now! Click here for free money! Act fast!',
    'Working late on code again... ☠️'
  ];

  // Mock message contexts
  const mockContexts: MessageContext[] = testMessages.map((_, index) => ({
    messageId: index + 1,
    senderId: Math.floor(Math.random() * 5) + 1,
    recipientIds: [1, 2, 3, 4, 5].filter(id => id !== (index % 5) + 1),
    userRelationship: { relationshipType: 'friendly' },
    conversationContext: { recentMessages: [] },
    topicContext: [1, 2]
  }));

  try {
    // Test 1: MockSentimentAgent
    console.log('🧪 Test 1: MockSentimentAgent');
    const sentimentAgent = new MockSentimentAgent();
    const sentimentResults = await sentimentAgent.analyzeWithContext(testMessages, mockContexts);
    
    console.log('📊 Sentiment Results:');
    sentimentResults.forEach((result, index) => {
      console.log(`  [${result.messageId}] "${testMessages[index]}"`);
      console.log(`     Base: ${result.baseSentiment} | Contextual: ${result.contextualSentiment}`);
      console.log(`     Confidence: ${result.confidenceScore.toFixed(2)} | Influence: ${result.relationshipInfluence}`);
    });
    console.log('✅ MockSentimentAgent test passed\n');

    // Test 2: MockEmbeddingAgent
    console.log('🧪 Test 2: MockEmbeddingAgent');
    const embeddingAgent = new MockEmbeddingAgent();
    const embeddingResults = await embeddingAgent.generate(testMessages);
    
    console.log('📊 Embedding Results:');
    embeddingResults.forEach((result, index) => {
      console.log(`  [${result.messageId}] "${testMessages[index]}"`);
      console.log(`     Embedding dim: ${result.embedding.length} | Confidence: ${result.confidence.toFixed(2)}`);
      console.log(`     Sample values: [${result.embedding.slice(0, 3).map(v => v.toFixed(3)).join(', ')}...]`);
    });
    console.log('✅ MockEmbeddingAgent test passed\n');

    // Test 3: MockToxicityAgent
    console.log('🧪 Test 3: MockToxicityAgent');
    const toxicityAgent = new MockToxicityAgent();
    const toxicityResults = await toxicityAgent.analyze(testMessages);
    
    console.log('📊 Toxicity Results:');
    toxicityResults.forEach((result, index) => {
      console.log(`  [${result.messageId}] "${testMessages[index]}"`);
      console.log(`     Score: ${result.toxicityScore.toFixed(3)} | Confidence: ${result.confidence.toFixed(2)}`);
      console.log(`     Categories: [${result.categories.join(', ')}]`);
    });
    console.log('✅ MockToxicityAgent test passed\n');

    // Test 4: MockTopicAgent
    console.log('🧪 Test 4: MockTopicAgent');
    const topicAgent = new MockTopicAgent();
    const topicResults = await topicAgent.assignTopics(testMessages);
    
    console.log('📊 Topic Results:');
    topicResults.forEach((result, index) => {
      console.log(`  [${result.messageId}] "${testMessages[index]}"`);
      console.log(`     Topic ID: ${result.topicId || 'None'} | Name: ${result.topicName || 'None'}`);
      console.log(`     Confidence: ${result.confidence.toFixed(2)} | New Topic: ${result.isNewTopic}`);
    });
    console.log('✅ MockTopicAgent test passed\n');

    // Test 5: MockRelationshipAgent
    console.log('🧪 Test 5: MockRelationshipAgent');
    const relationshipAgent = new MockRelationshipAgent();
    const relationshipResults = await relationshipAgent.updateRelationships(mockContexts);
    
    console.log('📊 Relationship Update Results:');
    relationshipResults.forEach((result, index) => {
      console.log(`  [${index + 1}] User Pair: ${result.userPair}`);
      console.log(`     Strength Change: ${result.strengthChange.toFixed(3)}`);
      console.log(`     Type Change: ${result.typeChange || 'None'}`);
      console.log(`     Response Time: ${result.newPatterns.responseTimeAvg.toFixed(1)}min`);
      console.log(`     Trigger Events: [${result.triggerEvents.join(', ')}]`);
    });
    console.log('✅ MockRelationshipAgent test passed\n');

    // Test 6: MockSpamAgent
    console.log('🧪 Test 6: MockSpamAgent');
    const spamAgent = new MockSpamAgent();
    const spamResults = await spamAgent.detect(testMessages);
    
    console.log('📊 Spam Detection Results:');
    spamResults.forEach((result, index) => {
      console.log(`  [${result.messageId}] "${testMessages[index]}"`);
      console.log(`     Is Spam: ${result.isSpam} | Confidence: ${result.confidence.toFixed(2)}`);
      console.log(`     Reasons: [${result.reasons.join(', ')}]`);
    });
    console.log('✅ MockSpamAgent test passed\n');

    // Test 7: MockEmojiAgent
    console.log('🧪 Test 7: MockEmojiAgent');
    const emojiAgent = new MockEmojiAgent();
    const emojiResults = await emojiAgent.unemojify(testMessages);
    
    console.log('📊 Emoji Processing Results:');
    emojiResults.forEach((result, index) => {
      console.log(`  Original: "${testMessages[index]}"`);
      console.log(`  Converted: "${result}"`);
    });
    console.log('✅ MockEmojiAgent test passed\n');

    // Summary
    console.log('🎉 ALL MOCK AGENT TESTS PASSED!');
    console.log('📊 Test Summary:');
    console.log(`  ✅ MockSentimentAgent: ${sentimentResults.length} results`);
    console.log(`  ✅ MockEmbeddingAgent: ${embeddingResults.length} embeddings generated`);
    console.log(`  ✅ MockToxicityAgent: ${toxicityResults.length} toxicity scores`);
    console.log(`  ✅ MockTopicAgent: ${topicResults.length} topic assignments`);
    console.log(`  ✅ MockRelationshipAgent: ${relationshipResults.length} relationship updates`);
    console.log(`  ✅ MockSpamAgent: ${spamResults.length} spam classifications`);
    console.log(`  ✅ MockEmojiAgent: ${emojiResults.length} emoji conversions`);

  } catch (error) {
    console.error('❌ Mock Agent tests failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testMockAgents();
}

export { testMockAgents }; 