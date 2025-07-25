import { EventSimulator } from '../simulators/eventSimulator';
import { AccumulatorRaft, MessageBatchEvent } from '../rafts/accumulator_raft';

async function testIntegration() {
  console.log('🔗 Integration Test: Event Simulator → Accumulator Raft\n');
  
  // Initialize components
  const simulator = new EventSimulator();
  const accumulator = new AccumulatorRaft(5, 1, 'pineapple_campaign'); // Batch size 5 for real data
  
  let batchCount = 0;
  let totalMessages = 0;
  
  console.log('🔧 Setting up components...');

  // Set up accumulator event listeners
  accumulator.on('batchReady', (batchEvent: MessageBatchEvent) => {
    batchCount++;
    console.log(`\n📦 Batch #${batchCount} Ready:`);
    console.log(`   🏷️  Channel: ${batchEvent.channelId} | Org: ${batchEvent.organization_id} | Campaign: ${batchEvent.campaign_id}`);
    console.log(`   📊 Batch Size: ${batchEvent.messages.length}`);
    console.log(`   📝 Sample Messages:`);
    
    // Show first 3 messages from batch
    batchEvent.messages.slice(0, 3).forEach((msg, index) => {
      const preview = msg.content.length > 60 ? msg.content.substring(0, 60) + '...' : msg.content;
      console.log(`      ${index + 1}. [${msg.id}] User ${msg.fromUserId}: \"${preview}\"`);
    });
    
    if (batchEvent.messages.length > 3) {
      console.log(`      ... and ${batchEvent.messages.length - 3} more messages`);
    }
  });

  // Set up simulator event listeners  
  simulator.on('simulationStarted', (data) => {
    console.log(`\n🎬 Simulation Started:`);
    console.log(`   📊 Total Messages: ${data.totalMessages.toLocaleString()}`);
    console.log(`   🏷️  Group: ${data.groupName}`);
    console.log(`   🔄 Starting message processing...\n`);
  });

  simulator.on('message', async (event) => {
    totalMessages++;
    
    // Show progress every 10 messages
    if (totalMessages % 10 === 0) {
      console.log(`📨 Processed ${totalMessages} messages... (Latest: User ${event.userId})`);
    }
    
    // Feed each message to the accumulator
    try {
      await accumulator.processMessage(event);
    } catch (error) {
      console.error(`❌ Error processing message ${event.id}:`, error);
    }
  });

  simulator.on('simulationCompleted', async () => {
    console.log(`\n✅ Simulation Completed:`);
    console.log(`   📊 Total Messages Processed: ${totalMessages.toLocaleString()}`);
    console.log(`   📦 Total Batches Created: ${batchCount}`);
    
    // Check if there are any remaining messages in the queue
    const queueStatus = await accumulator.getQueueStatus(2148778849);
    console.log(`   📋 Messages in Queue: ${queueStatus.queueLength}`);
    
    // Stop components
    simulator.stopSimulation();
    accumulator.stop();
  });

  try {
    // Initialize both components
    console.log('🔄 Initializing Redis connection...');
    await accumulator.initialize();
    
    console.log('🔄 Loading pineapple data...');
    await simulator.loadPineappleData('./pineapple.json');
    
    // Clear any existing queues
    await accumulator.clearQueue(2148778849);
    
    // Start the accumulator
    accumulator.start();
    
    console.log('🚀 Starting integration test...\n');
    
    // Start simulation with a reasonable speed (faster than real-time but observable)
    simulator.startSimulation(50); // 50ms between messages = 20 messages per second
    
    // Let it run for a limited time (process 1000 messages)
    const maxMessages = 1000;
    
    // Wait until we've processed enough messages or simulation completes
    while (totalMessages < maxMessages && simulator.getSimulationStatus().isRunning) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (totalMessages >= maxMessages) {
      console.log(`\n⏰ Reached message limit (${maxMessages}), stopping simulation...`);
      simulator.stopSimulation();
    }
    
    // Wait a moment for any pending batches
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Final statistics
    const finalQueueStatus = await accumulator.getQueueStatus(2148778849);
    
    console.log(`\n🎯 Integration Test Results:`);
    console.log(`   📊 Messages Processed: ${totalMessages.toLocaleString()}`);
    console.log(`   📦 Batches Created: ${batchCount}`);
    console.log(`   📋 Messages in Final Queue: ${finalQueueStatus.queueLength}`);
    console.log(`   🏷️  Redis Key Used: ${finalQueueStatus.redisKey}`);
    
    const avgMessagesPerBatch = batchCount > 0 ? (totalMessages - finalQueueStatus.queueLength) / batchCount : 0;
    console.log(`   📈 Average Messages per Batch: ${avgMessagesPerBatch.toFixed(1)}`);
    
    console.log(`\n✅ Integration test completed successfully!`);
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  } finally {
    // Cleanup
    simulator.stopSimulation();
    await accumulator.shutdown();
    console.log('\n🧹 Integration test cleanup completed');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Integration test interrupted');
  process.exit(0);
});

testIntegration().catch(console.error); 