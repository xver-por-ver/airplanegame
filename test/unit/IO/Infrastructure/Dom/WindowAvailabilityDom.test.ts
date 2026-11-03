import { describe, expect, test } from '@jest/globals';
import { EventBus } from '../../../../../src/IO/Infrastructure/EventBus';
import { GameEvents } from '../../../../../src/IO/Domain/GameEventsInterface';
import { WindowAvailabilityDom } from '../../../../../src/IO/Infrastructure/Dom/WindowAvailabilityDom';

describe('WindowAvailabilityDom', () => {
  const makeObserver = (width: number, height: number) => {
    const browserWindow = new EventTarget() as Window;
    Object.defineProperty(browserWindow, 'innerWidth', {
      configurable: true,
      value: width,
    });
    Object.defineProperty(browserWindow, 'innerHeight', {
      configurable: true,
      value: height,
    });
    const events = new EventBus<GameEvents>();
    const changes: Array<{
      focused: boolean;
      meetsMinimumResolution: boolean;
    }> = [];
    events.on('window.availabilityChanged', (status) => changes.push(status));
    new WindowAvailabilityDom(events, browserWindow);
    return { browserWindow, changes };
  };

  test('publishes initial availability and threshold changes', () => {
    const { browserWindow, changes } = makeObserver(1032, 760);
    expect(changes).toEqual([
      { focused: true, meetsMinimumResolution: false },
    ]);

    Object.defineProperty(browserWindow, 'innerWidth', {
      configurable: true,
      value: 1033,
    });
    browserWindow.dispatchEvent(new Event('resize'));
    expect(changes).toEqual([
      { focused: true, meetsMinimumResolution: false },
      { focused: true, meetsMinimumResolution: true },
    ]);
  });

  test('publishes focus changes and suppresses duplicate availability', () => {
    const { browserWindow, changes } = makeObserver(1280, 800);
    browserWindow.dispatchEvent(new Event('resize'));
    browserWindow.dispatchEvent(new Event('blur'));
    browserWindow.dispatchEvent(new Event('blur'));
    browserWindow.dispatchEvent(new Event('focus'));

    expect(changes).toEqual([
      { focused: true, meetsMinimumResolution: true },
      { focused: false, meetsMinimumResolution: true },
      { focused: true, meetsMinimumResolution: true },
    ]);
  });
});
