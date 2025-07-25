import { createClient, RedisClientType } from 'redis';

export class RedisClient {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(url: string = 'redis://localhost:6379'): Promise<void> {
    try {
      this.client = createClient({ url });
      
      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('🔴 Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('🔴 Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
      console.log('🔴 Redis Client Disconnected');
    }
  }

  async addToGroup(groupId: number, message: any): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    const groupKey = `group:${groupId}:messages`;
    const countKey = `group:${groupId}:count`;

    // Add message to list
    await this.client.lPush(groupKey, JSON.stringify(message));
    
    // Increment count
    const count = await this.client.incr(countKey);
    
    return count;
  }

  async getGroupMessages(groupId: number, count: number): Promise<any[]> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    const groupKey = `group:${groupId}:messages`;
    
    // Get the last 'count' messages and remove them
    const messages = await this.client.lRange(groupKey, -count, -1);
    await this.client.lTrim(groupKey, 0, -count - 1);
    
    return messages.map(msg => JSON.parse(msg)).reverse(); // Reverse to get chronological order
  }

  async getGroupCount(groupId: number): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    const countKey = `group:${groupId}:count`;
    const count = await this.client.get(countKey);
    return count ? parseInt(count) : 0;
  }

  async resetGroupCount(groupId: number): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    const countKey = `group:${groupId}:count`;
    await this.client.set(countKey, '0');
  }

  async clearGroup(groupId: number): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }

    const groupKey = `group:${groupId}:messages`;
    const countKey = `group:${groupId}:count`;
    
    await this.client.del(groupKey);
    await this.client.del(countKey);
  }

  isConnectedToRedis(): boolean {
    return this.isConnected;
  }
} 