export const OfflineQueueController = {
  async enqueue(
    _entityType: string,
    _entityId: string,
    _operation: string,
    _payload: unknown
  ): Promise<void> {},
  async processQueue(): Promise<void> {},
  async clearQueue(): Promise<void> {},
};
