import fs from 'fs';
import { EventEmitter } from 'events';

export interface PineappleMessage {
  id: number;
  type: string;
  date: string;
  from: string;
  from_id: string;
  text: string | string[];
  reply_to_message_id?: number;
}

export interface PineappleData {
  name: string;
  type: string;
  id: number;
  messages: PineappleMessage[];
}

export interface SimulatedEvent {
  id: number;
  content: string;
  userId: number;
  timestamp: Date;
  replyToMessageId?: number;
  groupId: number;
}

export class EventSimulator extends EventEmitter {
  private data: PineappleData | null = null;
  private isSimulating = false;
  private currentIndex = 0;
  private simulationSpeed = 100; // ms between messages

  constructor() {
    super();
  }

  async loadPineappleData(filePath: string): Promise<void> {
    try {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      this.data = JSON.parse(rawData);
      console.log(`Loaded ${this.data?.messages.length || 0} messages from ${filePath}`);
    } catch (error) {
      console.error('Failed to load pineapple data:', error);
      throw error;
    }
  }

  startSimulation(speed: number = 100): void {
    if (!this.data) {
      throw new Error('No data loaded. Call loadPineappleData() first.');
    }

    if (this.isSimulating) {
      console.log('Simulation already running');
      return;
    }

    this.simulationSpeed = speed;
    this.isSimulating = true;
    this.currentIndex = 0;

    console.log(`Starting simulation with ${this.data.messages.length} messages at ${speed}ms intervals`);
    this.emit('simulationStarted', {
      totalMessages: this.data.messages.length,
      groupId: this.data.id,
      groupName: this.data.name
    });

    this.simulateNextMessage();
  }

  stopSimulation(): void {
    this.isSimulating = false;
    console.log('Simulation stopped');
    this.emit('simulationStopped', {
      processedMessages: this.currentIndex,
      totalMessages: this.data?.messages.length || 0
    });
  }

  pauseSimulation(): void {
    this.isSimulating = false;
    console.log('Simulation paused');
    this.emit('simulationPaused', {
      processedMessages: this.currentIndex,
      remainingMessages: (this.data?.messages.length || 0) - this.currentIndex
    });
  }

  resumeSimulation(): void {
    if (!this.data || this.currentIndex >= this.data.messages.length) {
      console.log('Cannot resume: no data or simulation complete');
      return;
    }

    this.isSimulating = true;
    console.log('Simulation resumed');
    this.emit('simulationResumed', {
      resumeIndex: this.currentIndex,
      remainingMessages: this.data.messages.length - this.currentIndex
    });

    this.simulateNextMessage();
  }

  private simulateNextMessage(): void {
    if (!this.isSimulating || !this.data || this.currentIndex >= this.data.messages.length) {
      if (this.currentIndex >= (this.data?.messages.length || 0)) {
        console.log('Simulation completed');
        this.emit('simulationCompleted', {
          totalProcessed: this.currentIndex,
          groupId: this.data?.id
        });
      }
      return;
    }

    const pineappleMsg = this.data.messages[this.currentIndex];
    
    // Skip non-message types
    if (pineappleMsg.type !== 'message' || !pineappleMsg.text) {
      this.currentIndex++;
      setImmediate(() => this.simulateNextMessage());
      return;
    }

    // Convert pineapple message to simulated event
    const simulatedEvent = this.convertToSimulatedEvent(pineappleMsg);
    
    console.log(`[${this.currentIndex + 1}/${this.data.messages.length}] Emitting message: "${simulatedEvent.content.substring(0, 50)}..."`);
    
    // Emit the message event
    this.emit('message', simulatedEvent);
    
    this.currentIndex++;
    
    // Schedule next message
    setTimeout(() => this.simulateNextMessage(), this.simulationSpeed);
  }

  private convertToSimulatedEvent(pineappleMsg: PineappleMessage): SimulatedEvent {
    // Extract text content
    let content = '';
    if (typeof pineappleMsg.text === 'string') {
      content = pineappleMsg.text;
    } else if (Array.isArray(pineappleMsg.text)) {
      content = pineappleMsg.text
        .filter(item => typeof item === 'string')
        .join(' ');
    }

    // Extract user ID from from_id (remove 'user' prefix if present)
    const userIdStr = pineappleMsg.from_id.replace('user', '');
    const userId = parseInt(userIdStr) || Math.abs(userIdStr.split('').reduce((a, b) => a + b.charCodeAt(0), 0));

    return {
      id: pineappleMsg.id,
      content: content.trim(),
      userId: userId,
      timestamp: new Date(pineappleMsg.date),
      replyToMessageId: pineappleMsg.reply_to_message_id,
      groupId: this.data!.id
    };
  }

  getSimulationStatus(): any {
    return {
      isRunning: this.isSimulating,
      currentIndex: this.currentIndex,
      totalMessages: this.data?.messages.length || 0,
      progress: this.data ? (this.currentIndex / this.data.messages.length) * 100 : 0,
      groupId: this.data?.id,
      groupName: this.data?.name
    };
  }

  setSimulationSpeed(speed: number): void {
    this.simulationSpeed = Math.max(1, speed); // Minimum 1ms
    console.log(`Simulation speed set to ${this.simulationSpeed}ms`);
  }
} 