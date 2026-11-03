import { EventBusInterface } from '../../Domain/EventBusInterface';
import { GameEvents } from '../../Domain/GameEventsInterface';

export class WindowAvailabilityDom {
  private windowFocused: boolean = true;
  private meetsMinimumResolution: boolean = true;
  private initialized: boolean = false;
  private lastPublishedWindowFocus: boolean = true;

  constructor(
    private readonly events: EventBusInterface<GameEvents>,
    private readonly browserWindow: Window = window,
  ) {
    this.publishAvailability();
    this.browserWindow.addEventListener('resize', this.publishAvailability);
    this.browserWindow.addEventListener('focus', this.windowFocus);
    this.browserWindow.addEventListener('blur', this.windowBlur);
  }

  private readonly publishAvailability = (): void => {
    const meetsMinimumResolution =
      this.browserWindow.innerHeight >= 760 &&
      this.browserWindow.innerWidth > 1032;
    if (
      this.initialized &&
      this.meetsMinimumResolution === meetsMinimumResolution &&
      this.windowFocused === this.lastPublishedWindowFocus
    ) {
      return;
    }

    this.initialized = true;
    this.lastPublishedWindowFocus = this.windowFocused;
    this.meetsMinimumResolution = meetsMinimumResolution;
    this.events.emit('window.availabilityChanged', {
      focused: this.windowFocused,
      meetsMinimumResolution,
    });
  };

  private readonly windowFocus = (): void => {
    this.windowFocused = true;
    this.publishAvailability();
  };

  private readonly windowBlur = (): void => {
    this.windowFocused = false;
    this.publishAvailability();
  };
}
