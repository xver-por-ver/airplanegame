import { EventBusInterface } from '../Domain/EventBusInterface';
import { GameEvents, GamePauseBlocker } from '../Domain/GameEventsInterface';

export class GameLifecycle {
  private gameStarted: boolean = false;
  private gameRunning: boolean = false;
  private userPaused: boolean = false;
  private windowFocused: boolean = true;
  private meetsMinimumResolution: boolean = true;
  private gameplayHoldActive: boolean = false;
  private gameDefeated: boolean = false;

  constructor(private readonly events: EventBusInterface<GameEvents>) {
    this.events.on('game.userPauseChanged', ({ paused }) => {
      this.userPaused = paused;
      this.updateLifecycle();
    });
    this.events.on(
      'window.availabilityChanged',
      ({ focused, meetsMinimumResolution }) => {
        this.windowFocused = focused;
        this.meetsMinimumResolution = meetsMinimumResolution;
        this.updateLifecycle();
      },
    );
    this.events.on('gameplay.holdChanged', ({ active }) => {
      this.gameplayHoldActive = active;
      this.updateLifecycle();
    });
  }

  public start(): void {
    if (this.gameStarted || this.gameDefeated) {
      return;
    }

    this.gameStarted = true;
    this.events.emit('game.started', undefined);
    this.updateLifecycle(true);
  }

  public isRunning(): boolean {
    return this.gameRunning;
  }

  public markDefeated(): void {
    this.gameDefeated = true;
    this.gameRunning = false;
  }

  private updateLifecycle(starting: boolean = false): void {
    if (!this.gameStarted || this.gameDefeated) {
      return;
    }

    const blockers = this.getPauseBlockers();
    const shouldRun = 0 === blockers.length;
    if (starting) {
      this.gameRunning = shouldRun;
      if (!shouldRun) {
        this.events.emit('game.paused', { blockers });
      }
      return;
    }

    if (this.gameRunning === shouldRun) {
      return;
    }

    this.gameRunning = shouldRun;
    if (shouldRun) {
      this.events.emit('game.resumed', undefined);
    } else {
      this.events.emit('game.paused', { blockers });
    }
  }

  private getPauseBlockers(): GamePauseBlocker[] {
    const blockers: GamePauseBlocker[] = [];
    if (this.userPaused) {
      blockers.push('user-pause');
    }
    if (!this.windowFocused) {
      blockers.push('window-blur');
    }
    if (!this.meetsMinimumResolution) {
      blockers.push('minimum-resolution');
    }
    if (this.gameplayHoldActive) {
      blockers.push('gameplay-hold');
    }
    return blockers;
  }
}
