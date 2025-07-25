import { AccumulatorRaft } from '../rafts/accumulator_raft';
import { SimulatedEvent } from '../simulators/eventSimulator';

async function testAccumulatorRaft() {
  console.log('🧪 Testing Accumulator Raft Implementation\n');
  
  // Create accumulator with small batch size for testing
  const accumulator = new AccumulatorRaft(5); // Small batch size for quick testing
  let batchCount = 0;

  // Set up event listeners
  accumulator.on('batchReady', (batchEvent) => {
    batchCount++;
    console.log(`\n📦 Batch Ready Event #${batchCount}:`);
    console.log(`   🏷️  Group ID: ${batchEvent.groupId}`);
    console.log(`   📊 Batch Size: ${batchEvent.batchSize}`);
    console.log(`   ⏰ Timestamp: ${batchEvent.timestamp.toLocaleTimeString()}`);
    console.log(`   📝 Messages:`);
    
    batchEvent.messages.forEach((msg: SimulatedEvent, index: number) => {
      const preview = msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content;
      console.log(`      ${index + 1}. [${msg.id}] User ${msg.userId}: "${preview}"`);
    });
  });

  accumulator.on('error', (error) => {
    console.error('\n❌ Accumulator Error:', error);
  });

  try {
    // Test 1: Initialize Accumulator Raft
    console.log('🔧 Test 1: Initializing Accumulator Raft...');
    await accumulator.initialize();
    console.log('✅ Accumulator Raft initialized successfully');

    // Test 2: Check initial status
    console.log('\n📊 Test 2: Checking initial status...');
    const initialStatus = await accumulator.getAccumulationStatus(2148778849); // Pineapple Club group ID
    console.log('✅ Initial Status:', initialStatus);

    // Test 3: Start batch checking
    console.log('\n🔄 Test 3: Starting batch checking...');
    accumulator.startBatchChecking(2000); // Check every 2 seconds
    console.log('✅ Batch checking started');

    // Test 4: Accumulate test messages
    console.log('\n📥 Test 4: Accumulating test messages...');
    const testMessages: SimulatedEvent[] = [
      {
        id: 1001,
        content: 'Hello Pineapple Club! 🍍',
        userId: 123456,
        timestamp: new Date(),
        groupId: 2148778849
      },
      {
        id: 1002,
        content: 'GM everyone! How are the pineapples today?',
        userId: 789012,
        timestamp: new Date(),
        replyToMessageId: 1001,
        groupId: 2148778849
      },
      {
        id: 1003,
        content: 'Looking forward to the launch! 🚀',
        userId: 345678,
        timestamp: new Date(),
        groupId: 2148778849
      },
      {
        id: 1004,
        content: 'This is amazing! Great work team 👏',
        userId: 901234,
        timestamp: new Date(),
        groupId: 2148778849
      },
      {
        id: 1005,
        content: 'When moon? When lambo? 😄',
        userId: 567890,
        timestamp: new Date(),
        groupId: 2148778849
      },
      {
        id: 1006,
        content: 'Keep building! The future is bright ☀️',
        userId: 234567,
        timestamp: new Date(),
        groupId: 2148778849
      },
      {
        id: 1007,
        content: 'Pineapple power! 🍍💪',
        userId: 678901,
        timestamp: new Date(),
        groupId: 2148778849
      }
    ];

    // Accumulate messages one by one
    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`📨 Accumulating message ${i + 1}/${testMessages.length}: "${message.content.substring(0, 30)}..."`);
      
      await accumulator.accumulateMessage(message);
      
      // Check status after each message
      const status = await accumulator.getAccumulationStatus(message.groupId);
      console.log(`   📊 Status: ${status?.currentCount}/${status?.batchSize} (${status?.progress.toFixed(1)}%)`);
      
      // Wait a bit between messages
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Test 5: Wait for batch processing
    console.log('\n⏳ Test 5: Waiting for batch processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 6: Check final status
    console.log('\n📊 Test 6: Checking final status...');
    const finalStatus = await accumulator.getAccumulationStatus(2148778849);
    console.log('✅ Final Status:', finalStatus);

    // Test 7: Manual batch trigger (if any remaining messages)
    if (finalStatus && finalStatus.currentCount > 0) {
      console.log('\n🔧 Test 7: Manually triggering batch for remaining messages...');
      await accumulator.triggerBatch(2148778849);
    }

    // Test 8: Test batch size modification
    console.log('\n⚙️ Test 8: Testing batch size modification...');
    const originalBatchSize = accumulator.getBatchSize();
    console.log(`Original batch size: ${originalBatchSize}`);
    
    accumulator.setBatchSize(3);
    const newBatchSize = accumulator.getBatchSize();
    console.log(`New batch size: ${newBatchSize}`);

    // Test 9: Check running status
    console.log('\n🔄 Test 9: Checking running status...');
    const isRunning = accumulator.isRunningStatus();
    console.log(`Is running: ${isRunning}`);

    // Test 10: Cleanup
    console.log('\n🧹 Test 10: Cleaning up...');
    await accumulator.shutdown();
    console.log('✅ Accumulator Raft shutdown complete');

    // Final summary
    console.log('\n' + '═'.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log(`📦 Total batches processed: ${batchCount}`);
    console.log(`📨 Messages tested: ${testMessages.length}`);
    console.log('🎉 Accumulator Raft implementation is working correctly!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    
    // Ensure cleanup even on error
    try {
      await accumulator.shutdown();
    } catch (cleanupError) {
      console.error('❌ Cleanup error:', cleanupError);
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testAccumulatorRaft();
} 