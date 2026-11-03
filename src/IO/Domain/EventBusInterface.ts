export interface EventBusInterface<Events extends object> {
  on<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void,
  ): () => void;
  emit<K extends keyof Events>(event: K, payload: Events[K]): void;
}
