import { EventEmitter } from 'events';
import { RedisClient } from '../redisClient/redisClient';
import { SimulatedEvent } from '../simulators/eventSimulator';

export interface BatchReadyEvent {
  groupId: number;
  messages: SimulatedEvent[];
  batchSize: number;
  timestamp: Date;
}

export interface MessagePayload {
  id: number;
  timestamp: number;
  fromUserId: number;
  fromUserName: string | null;
  content: string;
  replyToMessageId: number | null;
}

export interface MessageBatchEvent {
  channelId: number;
  messages: MessagePayload[];
  organization_id: number;
  campaign_id: string;
}

export class AccumulatorRaft extends EventEmitter {
  private redisClient: RedisClient;
  private batchSize: number;
  private isRunning = false;
  private organizationId: number;
  private campaignId: string;

  constructor(batchSize: number = 5, organizationId: number = 1, campaignId: string = 'default') {
    super();
    this.redisClient = new RedisClient();
    this.batchSize = batchSize;
    this.organizationId = organizationId;
    this.campaignId = campaignId;
  }

  async initialize(redisUrl?: string): Promise<void> {
    try {
      await this.redisClient.connect(redisUrl);
      console.log('Accumulator Raft initialized');
    } catch (error) {
      console.error('Failed to initialize Accumulator Raft:', error);
      throw error;
    }
  }

  private isValidSimulatedEvent(event: any): event is SimulatedEvent {
    if (typeof event !== 'object' || event === null) {
      console.warn('Invalid event: must be a non-null object');
      return false;
    }

    if (typeof event.id !== 'number') {
      console.warn('Invalid event: id must be a number');
      return false;
    }

    if (typeof event.userId !== 'number') {
      console.warn('Invalid event: userId must be a number');
      return false;
    }

    if (typeof event.content !== 'string') {
      console.warn('Invalid event: content must be a string');
      return false;
    }

    if (typeof event.groupId !== 'number') {
      console.warn('Invalid event: groupId must be a number');
      return false;
    }

    if (!(event.timestamp instanceof Date)) {
      console.warn('Invalid event: timestamp must be a Date');
      return false;
    }

    return true;
  }

  async processMessage(event: SimulatedEvent): Promise<void> {
    if (!this.isValidSimulatedEvent(event)) {
      throw new Error(`Invalid input: event must contain valid SimulatedEvent data: ${JSON.stringify(event)}`);
    }

    // Convert SimulatedEvent to MessagePayload format
    const item: MessagePayload = {
      id: event.id,
      timestamp: Math.floor(event.timestamp.getTime() / 1000), // Convert to Unix timestamp
      fromUserId: event.userId,
      fromUserName: null, // Not available in SimulatedEvent
      content: event.content,
      replyToMessageId: event.replyToMessageId || null,
    };

    // Create batch key following the same pattern as the sandbox raft
    const batchKey = `${this.organizationId}:${this.campaignId}:${event.groupId}`;
    const redisKey = `nlp2:batch:telegram:${batchKey}`;
    
    // Push message to Redis list
    const newLength = await this.redisClient.rPush(redisKey, JSON.stringify(item));
    console.log(`📤 Pushed message into redis list ${redisKey}, new length: ${newLength}`);

        // Check if we have enough messages for a batch
    if (newLength >= this.batchSize) {
      const batch: string[] | null = await this.redisClient.lPopCount(redisKey, this.batchSize);
      console.log(`📥 Popped ${batch?.length} messages from redis list ${redisKey}`);

      if (batch?.length !== this.batchSize) {
        if (batch) {
          console.log(`⚠️ Batch size mismatch. Pushing back into redis...`);
          // Push back the incomplete batch
          for (const item of batch) {
            await this.redisClient.rPush(redisKey, item);
          }
        }
      } else {
        // Parse messages from JSON strings and convert back to SimulatedEvent format
        const messagePayloads = batch.map((item: string) => JSON.parse(item) as MessagePayload);
        
        // Convert MessagePayload back to SimulatedEvent for ConciergeAgent
        const simulatedEvents: SimulatedEvent[] = messagePayloads.map(payload => ({
          id: payload.id,
          content: payload.content,
          userId: payload.fromUserId,
          timestamp: new Date(payload.timestamp * 1000), // Convert back from Unix timestamp
          replyToMessageId: payload.replyToMessageId || undefined,
          groupId: event.groupId
        }));

        console.log('🚀 Emitting batchReady event...');
        
        const batchEvent: BatchReadyEvent = {
          groupId: event.groupId,
          messages: simulatedEvents,
          batchSize: simulatedEvents.length,
          timestamp: new Date()
        };

        this.emit('batchReady', batchEvent);
      }
    }
  }

  start(): void {
    if (this.isRunning) {
      console.log('Accumulator Raft is already running');
      return;
    }

    this.isRunning = true;
    console.log('Accumulator Raft started');
    this.emit('started');
  }

  stop(): void {
    if (!this.isRunning) {
      console.log('Accumulator Raft is not running');
      return;
    }

    this.isRunning = false;
    console.log('Accumulator Raft stopped');
    this.emit('stopped');
  }

  async getQueueStatus(groupId: number): Promise<{ redisKey: string; queueLength: number }> {
    const batchKey = `${this.organizationId}:${this.campaignId}:${groupId}`;
    const redisKey = `nlp2:batch:telegram:${batchKey}`;
    const queueLength = await this.redisClient.lLen(redisKey);
    
    return { redisKey, queueLength };
  }

  async clearQueue(groupId: number): Promise<void> {
    const batchKey = `${this.organizationId}:${this.campaignId}:${groupId}`;
    const redisKey = `nlp2:batch:telegram:${batchKey}`;
    await this.redisClient.del(redisKey);
    console.log(`Cleared queue ${redisKey}`);
  }

  async shutdown(): Promise<void> {
    this.stop();
    await this.redisClient.disconnect();
    console.log('Accumulator Raft disconnected from Redis');
  }

  getStatus(): { isRunning: boolean; batchSize: number; organizationId: number; campaignId: string } {
    return {
      isRunning: this.isRunning,
      batchSize: this.batchSize,
      organizationId: this.organizationId,
      campaignId: this.campaignId,
    };
  }
} 