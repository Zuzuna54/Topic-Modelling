import { EventSimulator } from './simulators/eventSimulator';
import { AccumulatorRaft } from './rafts/accumulator_raft';
import { ConciergeAgent } from './Agents/conciergeAgent';
import { TreeVisualizer } from './services/treeVisualizer';

async function runPhase1System() {
  console.log('Starting Phase 1 Social Sentiment Analysis System');
  console.log('=' .repeat(60));

  // Initialize components
  const eventSimulator = new EventSimulator();
  const accumulatorRaft = new AccumulatorRaft(5); // Small batch size for testing
  const conciergeAgent = new ConciergeAgent();

  try {
    // Step 1: Initialize all components
    console.log('\nStep 1: Initializing System Components');
    await accumulatorRaft.initialize();
    await conciergeAgent.initialize(1);

    // Step 2: Set up event listeners
    console.log('\nStep 2: Setting up Event Listeners');
    
    // Simulator → Accumulator
    eventSimulator.on('message', async (event) => {
      await accumulatorRaft.processMessage(event);
    });

    // Accumulator → Concierge
    accumulatorRaft.on('batchReady', async (batchEvent) => {
      await conciergeAgent.processBatch(batchEvent);
    });

    // Concierge processing events
    conciergeAgent.on('batchProcessed', (data) => {
      console.log('\n✅ BATCH PROCESSED:', data);
      console.log(`📊 Graph Stats:`, data.stats);
    });

    // Step 3: Load and start simulation
    console.log('\nStep 3: Loading Pineapple Data');
    await eventSimulator.loadPineappleData('./pineapple.json');

    // Step 4: Start accumulator batch checking
    console.log('\nStep 4: Starting Accumulator Raft');
    accumulatorRaft.start(); // Start processing

    // Step 5: Start event simulation
    console.log('\nStep 5: Starting Event Simulation');
    eventSimulator.startSimulation(1000); // 1 message per second

    // Step 6: Set up monitoring
    console.log('\nStep 6: Setting up Monitoring');
    const monitoringInterval = setInterval(async () => {
      const accumulatorStatus = accumulatorRaft.getStatus();
      const queueStatus = await accumulatorRaft.getQueueStatus(1);
      const conciergeStatus = conciergeAgent.getProcessingStatus();
      const simulatorStatus = eventSimulator.getSimulationStatus();

      console.log('\nSYSTEM STATUS:');
      console.log(`  Simulator: ${simulatorStatus.progress.toFixed(1)}% (${simulatorStatus.currentIndex}/${simulatorStatus.totalMessages})`);
      console.log(`  Accumulator: ${accumulatorStatus.isRunning ? 'Running' : 'Stopped'} (Queue: ${queueStatus.queueLength} messages)`);
      console.log(`  Concierge: ${conciergeStatus.isProcessing ? 'Processing' : 'Idle'} (Queue: ${conciergeStatus.queueSize})`);
    }, 5000);

    // Step 7: Set up graceful shutdown
    const gracefulShutdown = async () => {
      console.log('\nInitiating graceful shutdown...');
      clearInterval(monitoringInterval);
      
      eventSimulator.stopSimulation();
      accumulatorRaft.stop();
      await accumulatorRaft.shutdown();
      
      // Generate final visualization
      console.log('\nFinal Graph Visualization:');
      const finalGraph = conciergeAgent.exportGraph();
      const visualization = TreeVisualizer.generateTextVisualization(finalGraph);
      console.log(visualization);
      
      console.log('\nSystem shutdown complete');
      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    // Auto-shutdown after simulation completes
    eventSimulator.on('simulationCompleted', () => {
      console.log('\nSimulation completed! Shutting down in 10 seconds...');
      setTimeout(gracefulShutdown, 10000);
    });

    console.log('\nPhase 1 System is running!');
    console.log('Press Ctrl+C to stop');

  } catch (error) {
    console.error('\nSystem startup failed:', error);
    process.exit(1);
  }
}

// Test runner for isolated components
async function runComponentTests() {
  console.log('Running Component Tests');
  console.log('=' .repeat(40));

  try {
    // Test 1: Mock Tree Generation
    console.log('\nTest 1: Mock Tree Generation');
    const { MockTreeGenerator } = await import('./services/mockTreeGenerator');
    const mockGraph = MockTreeGenerator.generateMockTree(1);
    console.log(`Generated mock graph with ${mockGraph.stats.totalMessages} messages`);

    // Test 2: Tree Visualization
    console.log('\nTest 2: Tree Visualization');
    const { TreeVisualizer } = await import('./services/treeVisualizer');
    const textViz = TreeVisualizer.generateTextVisualization(mockGraph);
    console.log(textViz);

    // Test 3: Event Simulator (short test)
    console.log('\nTest 3: Event Simulator');
    const simulator = new EventSimulator();
    await simulator.loadPineappleData('./pineapple.json');
    console.log('Event simulator loaded data successfully');

    console.log('\nAll component tests passed!');

  } catch (error) {
    console.error('\nComponent tests failed:', error);
  }
}

// Main entry point
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test') || args.includes('-t')) {
    await runComponentTests();
  } else {
    await runPhase1System();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
} 