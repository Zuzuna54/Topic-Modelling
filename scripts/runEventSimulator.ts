import { EventSimulator } from '../simulators/eventSimulator';

async function runEventSimulator() {
  console.log('Running Event Simulator - Processing Real Pineapple Club Messages\n');
  
  const simulator = new EventSimulator();
  let messageCount = 0;
  let userStats = new Map<number, number>();

  // Set up event listeners
  simulator.on('simulationStarted', (data) => {
    console.log('Event Simulator Started:');
    console.log(`   Total Messages: ${data.totalMessages.toLocaleString()}`);
    console.log(`   Group: ${data.groupName}`);
    console.log(`   Group ID: ${data.groupId}`);
    console.log('\nLive Message Stream:');
    console.log('─'.repeat(80));
  });

  simulator.on('message', (event) => {
    messageCount++;
    
    // Track user activity
    const currentCount = userStats.get(event.userId) || 0;
    userStats.set(event.userId, currentCount + 1);
    
    // Format message display
    const timestamp = event.timestamp.toLocaleTimeString();
    let content = event.content.trim();
    
    // Handle long messages
    if (content.length > 100) {
      content = content.substring(0, 100) + '...';
    }
    
    // Handle empty messages
    if (!content) {
      content = '[empty message]';
    }
    
    console.log(`[${messageCount.toString().padStart(4, ' ')}] ${timestamp} | User ${event.userId.toString().padStart(10, ' ')} | "${content}"`);
    
    // Show reply information
    if (event.replyToMessageId) {
      console.log(`      Replying to message ID: ${event.replyToMessageId}`);
    }
    
    // Show stats every 25 messages
    if (messageCount % 25 === 0) {
      const uniqueUsers = userStats.size;
      const avgMessagesPerUser = (messageCount / uniqueUsers).toFixed(1);
      const progress = simulator.getSimulationStatus().progress.toFixed(2);
      
      console.log(`\nStats Update: ${messageCount} messages | ${uniqueUsers} unique users | ${avgMessagesPerUser} avg/user | ${progress}% complete\n`);
    }
  });

  simulator.on('simulationCompleted', (data) => {
    console.log('\n' + '═'.repeat(80));
    console.log('Simulation Completed!');
    console.log(`Final Statistics:`);
    console.log(`   Total Messages Processed: ${data.totalProcessed.toLocaleString()}`);
    console.log(`   Unique Users: ${userStats.size}`);
    console.log(`   Messages per User: ${(data.totalProcessed / userStats.size).toFixed(1)}`);
    
    // Show top 5 most active users
    const sortedUsers = Array.from(userStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    console.log(`\nTop 5 Most Active Users:`);
    sortedUsers.forEach(([userId, count], index) => {
      console.log(`   ${index + 1}. User ${userId}: ${count} messages`);
    });
    
    console.log('\nEvent Simulator run completed successfully!');
  });

  try {
    // Load pineapple data
    console.log('Loading pineapple.json data...');
    await simulator.loadPineappleData('./pineapple.json');
    
    console.log('\nStarting simulation with 200ms intervals (5 messages per second)');
    console.log('Press Ctrl+C to stop the simulation\n');
    
    // Start simulation - 200ms = 5 messages per second (reasonable speed to follow)
    simulator.startSimulation(200);
    
    // Auto-stop after processing 100 messages for demo purposes
    // Remove this timeout if you want it to run indefinitely
    setTimeout(() => {
      console.log('\nAuto-stopping demo after 100 messages...');
      simulator.stopSimulation();
    }, 20000); // 20 seconds should be enough for ~100 messages at 200ms intervals

  } catch (error) {
    console.error('\nFailed to run Event Simulator:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nStopping Event Simulator...');
  process.exit(0);
});

// Run if this file is executed directly
if (require.main === module) {
  runEventSimulator();
} 