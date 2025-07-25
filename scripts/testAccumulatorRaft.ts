import { AccumulatorRaft, MessageBatchEvent } from '../rafts/accumulator_raft';
import { SimulatedEvent } from '../simulators/eventSimulator';

async function testAccumulatorRaft() {
  console.log('🧪 Testing Accumulator Raft Implementation (Sandbox Pattern)\n');
  
  // Create accumulator with small batch size for testing
  const accumulator = new AccumulatorRaft(3, 1, 'test_campaign'); // Small batch size for quick testing
  let batchCount = 0;

  // Set up event listeners
  accumulator.on('batchReady', (batchEvent: MessageBatchEvent) => {
    batchCount++;
    console.log(`\n📦 Batch Ready Event #${batchCount}:`);
    console.log(`   🏷️  Channel ID: ${batchEvent.channelId}`);
    console.log(`   📊 Batch Size: ${batchEvent.messages.length}`);
    console.log(`   🏢 Organization ID: ${batchEvent.organization_id}`);
    console.log(`   📋 Campaign ID: ${batchEvent.campaign_id}`);
    console.log(`   📝 Messages:`);
    
    batchEvent.messages.forEach((msg, index) => {
      const preview = msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content;
      console.log(`      ${index + 1}. [${msg.id}] User ${msg.fromUserId}: "${preview}"`);
      if (msg.replyToMessageId) {
        console.log(`         ↪️ Reply to message ${msg.replyToMessageId}`);
      }
    });
  });

  accumulator.on('started', () => {
    console.log('✅ Accumulator Raft started');
  });

  accumulator.on('stopped', () => {
    console.log('⏹️ Accumulator Raft stopped');
  });

  try {
    // Initialize Redis connection
    console.log('🔄 Initializing Accumulator Raft...');
    await accumulator.initialize();
    
    // Start the accumulator
    accumulator.start();
    
    // Get initial status
    const status = accumulator.getStatus();
    console.log(`\n📊 Initial Status:`);
    console.log(`   Running: ${status.isRunning}`);
    console.log(`   Batch Size: ${status.batchSize}`);
    console.log(`   Organization ID: ${status.organizationId}`);
    console.log(`   Campaign ID: ${status.campaignId}`);

    // Clear any existing queues for testing
    await accumulator.clearQueue(2148778849); // Pineapple Club group ID
    
    // Create test messages
    const testMessages: SimulatedEvent[] = [
      {
        id: 1,
        content: 'Hello everyone! 👋',
        userId: 101,
        timestamp: new Date(),
        groupId: 2148778849
      },
      {
        id: 2,
        content: 'Good morning from the community!',
        userId: 102,
        timestamp: new Date(Date.now() + 1000),
        groupId: 2148778849
      },
      {
        id: 3,
        content: 'How is everyone doing today?',
        userId: 103,
        timestamp: new Date(Date.now() + 2000),
        groupId: 2148778849,
        replyToMessageId: 1
      },
      {
        id: 4,
        content: 'Great to see the active community!',
        userId: 104,
        timestamp: new Date(Date.now() + 3000),
        groupId: 2148778849
      },
      {
        id: 5,
        content: 'Let\'s discuss the latest updates',
        userId: 105,
        timestamp: new Date(Date.now() + 4000),
        groupId: 2148778849
      },
      {
        id: 6,
        content: 'I agree with the previous messages',
        userId: 106,
        timestamp: new Date(Date.now() + 5000),
        groupId: 2148778849,
        replyToMessageId: 4
      }
    ];

    console.log(`\n🎬 Processing ${testMessages.length} test messages...`);
    
    // Process messages one by one to see batching in action
    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`\n📨 Processing message ${i + 1}/${testMessages.length}: "${message.content}"`);
      
      await accumulator.processMessage(message);
      
      // Check queue status
      const queueStatus = await accumulator.getQueueStatus(message.groupId);
      console.log(`   📊 Queue Status: ${queueStatus.queueLength} messages in ${queueStatus.redisKey}`);
      
      // Small delay to see the process
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Wait a moment for any pending operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check final queue status
    const finalStatus = await accumulator.getQueueStatus(2148778849);
    console.log(`\n📊 Final Queue Status: ${finalStatus.queueLength} messages remaining`);
    
    console.log(`\n✅ Test completed! Total batches processed: ${batchCount}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    await accumulator.shutdown();
    console.log('\n🧹 Test cleanup completed');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Test interrupted');
  process.exit(0);
});

testAccumulatorRaft().catch(console.error); 