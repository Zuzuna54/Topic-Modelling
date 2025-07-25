import { EventEmitter } from 'events';
import { RedisClient } from '../redisClient/redisClient';
import { SimulatedEvent } from '../simulators/eventSimulator';

export interface BatchReadyEvent {
  groupId: number;
  messages: SimulatedEvent[];
  batchSize: number;
  timestamp: Date;
}

export class AccumulatorRaft extends EventEmitter {
  private redisClient: RedisClient;
  private batchSize: number;
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(batchSize: number = 100) {
    super();
    this.redisClient = new RedisClient();
    this.batchSize = batchSize;
  }

  async initialize(redisUrl?: string): Promise<void> {
    try {
      await this.redisClient.connect(redisUrl);
      console.log('✅ Accumulator Raft initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Accumulator Raft:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.stopBatchChecking();
    await this.redisClient.disconnect();
    console.log('✅ Accumulator Raft shutdown complete');
  }

  startBatchChecking(intervalMs: number = 1000): void {
    if (this.isRunning) {
      console.log('⚠️ Batch checking already running');
      return;
    }

    this.isRunning = true;
    console.log(`🔄 Starting batch checking every ${intervalMs}ms`);

    this.checkInterval = setInterval(async () => {
      await this.checkForBatches();
    }, intervalMs);
  }

  stopBatchChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Batch checking stopped');
  }

  async accumulateMessage(message: SimulatedEvent): Promise<void> {
    try {
      const count = await this.redisClient.addToGroup(message.groupId, message);
      
      console.log(`📥 Accumulated message ${message.id} for group ${message.groupId} (count: ${count})`);
      
      // Check if we've reached the batch threshold
      if (count >= this.batchSize) {
        await this.processBatch(message.groupId);
      }
      
    } catch (error) {
      console.error('❌ Failed to accumulate message:', error);
      this.emit('error', error);
    }
  }

  private async checkForBatches(): Promise<void> {
    // For Phase 1, we'll focus on a single group
    // In production, this would check multiple groups
    const groupIds = [1]; // Assuming default group ID is 1
    
    for (const groupId of groupIds) {
      try {
        const count = await this.redisClient.getGroupCount(groupId);
        if (count >= this.batchSize) {
          await this.processBatch(groupId);
        }
      } catch (error) {
        console.error(`❌ Error checking batch for group ${groupId}:`, error);
      }
    }
  }

  private async processBatch(groupId: number): Promise<void> {
    try {
      console.log(`📦 Processing batch for group ${groupId}`);
      
      // Get the batch of messages
      const messages = await this.redisClient.getGroupMessages(groupId, this.batchSize);
      
      if (messages.length === 0) {
        console.log(`⚠️ No messages found for group ${groupId} batch`);
        return;
      }

      // Reset the count for this group
      await this.redisClient.resetGroupCount(groupId);

      // Create batch event
      const batchEvent: BatchReadyEvent = {
        groupId,
        messages,
        batchSize: messages.length,
        timestamp: new Date()
      };

      console.log(`📤 Emitting batch ready event for group ${groupId} with ${messages.length} messages`);
      
      // Emit batch ready event for Concierge Agent
      this.emit('batchReady', batchEvent);

    } catch (error) {
      console.error(`❌ Failed to process batch for group ${groupId}:`, error);
      this.emit('error', error);
    }
  }

  // Manual batch trigger for testing
  async triggerBatch(groupId: number): Promise<void> {
    await this.processBatch(groupId);
  }

  // Get current accumulation status
  async getAccumulationStatus(groupId: number): Promise<any> {
    try {
      const count = await this.redisClient.getGroupCount(groupId);
      return {
        groupId,
        currentCount: count,
        batchSize: this.batchSize,
        progress: (count / this.batchSize) * 100,
        readyForBatch: count >= this.batchSize
      };
    } catch (error) {
      console.error(`❌ Failed to get accumulation status for group ${groupId}:`, error);
      return null;
    }
  }

  setBatchSize(newSize: number): void {
    this.batchSize = Math.max(1, newSize);
    console.log(`📦 Batch size set to ${this.batchSize}`);
  }

  getBatchSize(): number {
    return this.batchSize;
  }

  isRunningStatus(): boolean {
    return this.isRunning;
  }
} 