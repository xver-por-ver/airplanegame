import { EventBusInterface } from '../Domain/EventBusInterface';

type EventListener = (payload: unknown) => void;
type ListenerEntry = { listener: EventListener };

export class EventBus<
  Events extends object,
> implements EventBusInterface<Events> {
  private readonly listeners = new Map<keyof Events, Set<ListenerEntry>>();

  public on<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void,
  ): () => void {
    let eventListeners = this.listeners.get(event);
    if (!eventListeners) {
      eventListeners = new Set<ListenerEntry>();
      this.listeners.set(event, eventListeners);
    }

    const entry: ListenerEntry = {
      listener: listener as EventListener,
    };
    eventListeners.add(entry);

    return () => {
      eventListeners?.delete(entry);
      if (
        eventListeners?.size === 0 &&
        this.listeners.get(event) === eventListeners
      ) {
        this.listeners.delete(event);
      }
    };
  }

  public emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) {
      return;
    }

    [...eventListeners].forEach(({ listener }) => listener(payload));
  }
}
