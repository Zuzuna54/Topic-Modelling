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

  private ensureConnected(): void {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client is not connected');
    }
  }

  // Redis List Operations for Batching
  async rPush(key: string, value: string): Promise<number> {
    this.ensureConnected();
    return await this.client!.rPush(key, value);
  }

  async lPopCount(key: string, count: number): Promise<string[] | null> {
    this.ensureConnected();
    const result = await this.client!.lPopCount(key, count);
    return result || null;
  }

  async lLen(key: string): Promise<number> {
    this.ensureConnected();
    return await this.client!.lLen(key);
  }

  async del(key: string): Promise<number> {
    this.ensureConnected();
    return await this.client!.del(key);
  }

  // Legacy methods for backward compatibility
  async addToGroup(groupId: number, message: any): Promise<number> {
    this.ensureConnected();
    const key = `group:${groupId}:messages`;
    await this.client!.hSet(key, message.id.toString(), JSON.stringify(message));
    const countKey = `group:${groupId}:count`;
    return await this.client!.incr(countKey);
  }

  async getGroupMessages(groupId: number, limit: number): Promise<any[]> {
    this.ensureConnected();
    const key = `group:${groupId}:messages`;
    const messageData = await this.client!.hGetAll(key);
    
    const messages = Object.values(messageData)
      .map(data => JSON.parse(data))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(0, limit);
    
    // Remove processed messages
    if (messages.length > 0) {
      const messageIds = messages.map(msg => msg.id.toString());
      await this.client!.hDel(key, messageIds);
    }
    
    return messages;
  }

  async getGroupCount(groupId: number): Promise<number> {
    this.ensureConnected();
    const countKey = `group:${groupId}:count`;
    const count = await this.client!.get(countKey);
    return count ? parseInt(count) : 0;
  }

  async resetGroupCount(groupId: number): Promise<void> {
    this.ensureConnected();
    const countKey = `group:${groupId}:count`;
    await this.client!.del(countKey);
  }

  async clearGroup(groupId: number): Promise<void> {
    this.ensureConnected();
    const messageKey = `group:${groupId}:messages`;
    const countKey = `group:${groupId}:count`;
    await this.client!.del([messageKey, countKey]);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
} 