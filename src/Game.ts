import { PlayerControlsDom } from './IO/Infrastructure/Dom/PlayerControlsDom';
import { ScreenDom } from './IO/Infrastructure/Dom/ScreenDom';
import { DashboardDom } from './IO/Infrastructure/Dom/Dashboard/DashboardDom';
import { EnemyDom } from './Enemy/Infrastructure/Dom/EnemyDom';
import { PlayerDom } from './Player/Infrastructure/Dom/PlayerDom';
import { HitDom } from './Hit/Infrastructure/Dom/HitDom';
import { MenuDom } from './IO/Infrastructure/Dom/MenuDom';
import { EventBus } from './IO/Infrastructure/EventBus';
import { EventBusInterface } from './IO/Domain/EventBusInterface';
import { GameEvents, GamePauseBlocker } from './IO/Domain/GameEventsInterface';

export default class Game {
  private readonly player: PlayerDom;
  private readonly enemy: EnemyDom;
  private readonly screen: ScreenDom;
  private readonly dashboard: DashboardDom;
  private readonly menu: MenuDom;
  private readonly events: EventBusInterface<GameEvents>;
  private gameStarted: boolean = false;
  private gameRunning: boolean = false;
  private userPaused: boolean = false;
  private windowFocused: boolean = true;
  private meetsMinimumResolution: boolean = true;
  private gameplayHoldActive: boolean = false;
  private gameDefeated: boolean = false;
  private millisecondsSinceLastAnimateCall: number = 0;
  private lastAnimateCallTimestamp: number = 0;
  private animateRatePerSecond: number = 0;

  constructor() {
    this.events = new EventBus<GameEvents>();
    this.listenToLifecycleEvents();
    this.player = new PlayerDom();
    this.enemy = new EnemyDom();

    this.dashboard = new DashboardDom(this.player, this.enemy, this.events);
    this.menu = new MenuDom(this.events);
    this.screen = new ScreenDom(
      this.player,
      this.enemy,
      new HitDom(this.player, this.enemy),
      this.events,
    );

    new PlayerControlsDom(this.screen, this.player, this.events);

    this.requestAnimation();
  }

  private animate(timestamp: number): void {
    this.millisecondsSinceLastAnimateCall = Math.round(
      timestamp - this.lastAnimateCallTimestamp,
    );
    this.animateRatePerSecond = Math.round(
      1000 / this.millisecondsSinceLastAnimateCall,
    );
    this.lastAnimateCallTimestamp = timestamp;

    this.updateDefeatedState();
    this.screen.animate(
      this.gameRunning,
      this.animateRatePerSecond,
      this.millisecondsSinceLastAnimateCall,
      this.dashboard.getRadarAnouncementDisplayTime(),
    );
    this.dashboard.animate(
      this.gameRunning,
      this.millisecondsSinceLastAnimateCall,
    );
    this.updateDefeatedState();
    this.menu.animate(this.millisecondsSinceLastAnimateCall);

    if (false === this.menu.gameOverDisplayed()) {
      this.requestAnimation();
    }
  }

  private listenToLifecycleEvents(): void {
    this.events.on('game.startRequested', () => this.startGame());
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

  private startGame(): void {
    if (this.gameStarted || this.gameDefeated || this.player.defeated()) {
      return;
    }

    this.gameStarted = true;
    this.events.emit('game.started', undefined);
    this.updateLifecycle(true);
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

  private updateDefeatedState(): void {
    if (!this.gameDefeated && this.player.defeated()) {
      this.gameDefeated = true;
      this.gameRunning = false;
      this.events.emit('game.defeated', undefined);
    }
  }

  private requestAnimation() {
    window.requestAnimationFrame(this.animate.bind(this));
  }
}
