import { describe, expect, test, jest } from '@jest/globals';
import { EventBus } from '../../../../src/IO/Infrastructure/EventBus';

type Events = {
  changed: { value: number };
  reset: undefined;
};

describe('EventBus', () => {
  test('delivers synchronously in registration order', () => {
    const bus = new EventBus<Events>();
    const received: string[] = [];

    bus.on('changed', ({ value }) => received.push(`first:${value}`));
    bus.on('changed', ({ value }) => received.push(`second:${value}`));

    bus.emit('changed', { value: 7 });

    expect(received).toEqual(['first:7', 'second:7']);
  });

  test('uses a listener snapshot for each emission', () => {
    const bus = new EventBus<Events>();
    const received: string[] = [];
    let unsubscribeSecond = () => {};
    let subscribedThird = false;

    bus.on('reset', () => {
      received.push('first');
      unsubscribeSecond();
      if (!subscribedThird) {
        subscribedThird = true;
        bus.on('reset', () => received.push('third'));
      }
    });
    unsubscribeSecond = bus.on('reset', () => received.push('second'));

    bus.emit('reset', undefined);
    expect(received).toEqual(['first', 'second']);

    received.length = 0;
    bus.emit('reset', undefined);
    expect(received).toEqual(['first', 'third']);
  });

  test('unsubscribe removes the listener and can be called repeatedly', () => {
    const bus = new EventBus<Events>();
    const listener = jest.fn();
    const unsubscribe = bus.on('changed', listener);

    unsubscribe();
    unsubscribe();
    bus.emit('changed', { value: 3 });

    expect(listener).not.toHaveBeenCalled();
  });

  test('tracks repeated subscriptions independently', () => {
    const bus = new EventBus<Events>();
    const listener = jest.fn();
    const unsubscribeFirst = bus.on('reset', listener);
    bus.on('reset', listener);

    unsubscribeFirst();
    bus.emit('reset', undefined);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('an old unsubscribe handle does not remove later subscriptions', () => {
    const bus = new EventBus<Events>();
    const unsubscribeOld = bus.on('reset', () => {});
    unsubscribeOld();

    const newListener = jest.fn();
    bus.on('reset', newListener);
    unsubscribeOld();
    bus.emit('reset', undefined);

    expect(newListener).toHaveBeenCalledTimes(1);
  });

  test('propagates listener errors immediately and skips later listeners', () => {
    const bus = new EventBus<Events>();
    const laterListener = jest.fn();
    bus.on('reset', () => {
      throw new Error('listener failed');
    });
    bus.on('reset', laterListener);

    expect(() => bus.emit('reset', undefined)).toThrow('listener failed');
    expect(laterListener).not.toHaveBeenCalled();
  });
});
