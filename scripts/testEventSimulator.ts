import { EventSimulator } from '../simulators/eventSimulator';

async function testEventSimulator() {
  const simulator = new EventSimulator();

  // Set up event listeners
  simulator.on('simulationStarted', (data) => {
    console.log('🎬 Simulation Started:', data);
  });

  simulator.on('message', (event) => {
    console.log(`📨 Message ${event.id}: [User ${event.userId}] "${event.content}"`);
  });

  simulator.on('simulationCompleted', (data) => {
    console.log('✅ Simulation Completed:', data);
  });

  try {
    // Load pineapple data
    await simulator.loadPineappleData('./pineapple.json');
    
    // Start simulation with 500ms intervals
    simulator.startSimulation(500);
    
    // Stop after 10 seconds for testing
    setTimeout(() => {
      simulator.stopSimulation();
    }, 10000);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testEventSimulator();
} 