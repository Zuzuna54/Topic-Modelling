import { EventSimulator } from '../simulators/eventSimulator';

async function demoEventSimulator() {
  console.log('🎭 Event Simulator Demo\n');
  
  const simulator = new EventSimulator();
  let messageCount = 0;

  // Set up comprehensive event listeners
  simulator.on('simulationStarted', (data) => {
    console.log('🎬 Simulation Started:');
    console.log(`   📊 Total Messages: ${data.totalMessages}`);
    console.log(`   🏷️  Group: ${data.groupName} (ID: ${data.groupId})\n`);
  });

  simulator.on('message', (event) => {
    messageCount++;
    const preview = event.content.length > 60 ? event.content.substring(0, 60) + '...' : event.content;
    console.log(`📨 [${messageCount}] User ${event.userId}: "${preview}"`);
    
    if (event.replyToMessageId) {
      console.log(`   ↪️ Replying to message ID: ${event.replyToMessageId}`);
    }
  });

  simulator.on('simulationPaused', (data) => {
    console.log(`\n⏸️  Simulation Paused: ${data.processedMessages}/${data.processedMessages + data.remainingMessages} messages processed`);
  });

  simulator.on('simulationResumed', (data) => {
    console.log(`\n▶️ Simulation Resumed: ${data.remainingMessages} messages remaining\n`);
  });

  simulator.on('simulationStopped', (data) => {
    console.log(`\n⏹️ Simulation Stopped: Processed ${data.processedMessages}/${data.totalMessages} messages`);
  });

  simulator.on('simulationCompleted', (data) => {
    console.log(`\n✅ Simulation Completed! Processed all ${data.totalProcessed} messages`);
  });

  try {
    // Load the data
    console.log('📁 Loading pineapple.json...');
    await simulator.loadPineappleData('./pineapple.json');
    
    console.log('\n🎮 Demo Sequence:');
    console.log('1. Fast simulation (100ms intervals) for 3 seconds');
    console.log('2. Pause for 2 seconds');
    console.log('3. Resume with slower speed (1000ms intervals) for 5 seconds');
    console.log('4. Show final status\n');

    // Phase 1: Fast simulation
    console.log('Phase 1: Fast Simulation (100ms intervals)');
    console.log('─'.repeat(50));
    simulator.startSimulation(100);
    
    // Let it run for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Phase 2: Pause
    console.log('\nPhase 2: Pausing simulation...');
    simulator.pauseSimulation();
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Phase 3: Resume with slower speed
    console.log('\nPhase 3: Resuming with slower speed (1000ms intervals)');
    console.log('─'.repeat(50));
    simulator.setSimulationSpeed(1000);
    simulator.resumeSimulation();
    
    // Let it run for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Phase 4: Stop and show status
    console.log('\nPhase 4: Stopping simulation and showing final status');
    console.log('─'.repeat(50));
    simulator.stopSimulation();
    
    // Show final status
    const finalStatus = simulator.getSimulationStatus();
    console.log('\n📊 Final Status:');
    console.log(`   📈 Progress: ${finalStatus.progress.toFixed(1)}%`);
    console.log(`   🔢 Processed: ${finalStatus.currentIndex}/${finalStatus.totalMessages}`);
    console.log(`   🏷️  Group: ${finalStatus.groupName}`);
    console.log(`   ⚡ Last Speed: 1000ms intervals`);
    
    console.log('\n🎉 Demo completed successfully!');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  demoEventSimulator();
} 