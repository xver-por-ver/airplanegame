import { PlayerControlsDom } from './IO/Infrastructure/Dom/PlayerControlsDom';
import { ScreenDom } from './IO/Infrastructure/Dom/ScreenDom';
import { DashboardDom } from './IO/Infrastructure/Dom/Dashboard/DashboardDom';
import { EnemyDom } from './Enemy/Infrastructure/Dom/EnemyDom';
import { PlayerDom } from './Player/Infrastructure/Dom/PlayerDom';
import { HitDom } from './Hit/Infrastructure/Dom/HitDom';
import { MenuDom } from './IO/Infrastructure/Dom/MenuDom';
import { EventBus } from './IO/Infrastructure/EventBus';
import { EventBusInterface } from './IO/Domain/EventBusInterface';
import { GameEvents } from './IO/Domain/GameEventsInterface';
import { GameLifecycle } from './IO/Infrastructure/GameLifecycle';
import { WindowAvailabilityDom } from './IO/Infrastructure/Dom/WindowAvailabilityDom';
import { FrameTiming } from './FrameTiming';

export default class Game {
  private readonly player: PlayerDom;
  private readonly enemy: EnemyDom;
  private readonly screen: ScreenDom;
  private readonly dashboard: DashboardDom;
  private readonly menu: MenuDom;
  private readonly events: EventBusInterface<GameEvents>;
  private readonly lifecycle: GameLifecycle;
  private gameDefeated: boolean = false;
  private lastAnimateCallTimestamp: number = 0;

  constructor() {
    this.events = new EventBus<GameEvents>();
    this.lifecycle = new GameLifecycle(this.events);
    this.events.on('game.startRequested', () => this.startGame());
    this.player = new PlayerDom();
    this.enemy = new EnemyDom();

    this.dashboard = new DashboardDom(this.player, this.enemy, this.events);
    this.menu = new MenuDom(this.events);
    new WindowAvailabilityDom(this.events);
    this.screen = new ScreenDom(
      this.player,
      this.enemy,
      new HitDom(this.player, this.enemy),
    );

    new PlayerControlsDom(this.screen, this.player, this.events);

    this.requestAnimation();
  }

  private animate(timestamp: number): void {
    const frameTiming = FrameTiming.between(
      timestamp,
      this.lastAnimateCallTimestamp,
    );
    this.lastAnimateCallTimestamp = timestamp;

    this.updateDefeatedState();
    this.screen.animate(
      this.lifecycle.isRunning(),
      frameTiming,
      this.dashboard.getRadarAnouncementDisplayTime(),
    );
    this.dashboard.animate(
      this.lifecycle.isRunning(),
      frameTiming.millisecondsSincePreviousFrame,
    );
    this.updateDefeatedState();
    this.menu.animate(frameTiming.millisecondsSincePreviousFrame);

    if (false === this.menu.gameOverDisplayed()) {
      this.requestAnimation();
    }
  }

  private startGame(): void {
    if (this.gameDefeated || this.player.defeated()) {
      return;
    }

    this.lifecycle.start();
  }

  private updateDefeatedState(): void {
    if (!this.gameDefeated && this.player.defeated()) {
      this.gameDefeated = true;
      this.lifecycle.markDefeated();
      this.events.emit('game.defeated', undefined);
    }
  }

  private requestAnimation() {
    window.requestAnimationFrame(this.animate.bind(this));
  }
}
