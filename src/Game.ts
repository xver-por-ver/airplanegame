import { PlayerControlsDom } from './IO/Infrastructure/Dom/PlayerControlsDom';
import { ScreenDom } from './IO/Infrastructure/Dom/ScreenDom';
import { DashboardDom } from './IO/Infrastructure/Dom/Dashboard/DashboardDom';
import { EnemyDom } from './Enemy/Infrastructure/Dom/EnemyDom';
import { PlayerDom } from './Player/Infrastructure/Dom/PlayerDom';
import { HitDom } from './Hit/Infrastructure/Dom/HitDom';
import { MenuDom } from './IO/Infrastructure/Dom/MenuDom';

export default class Game {
  private readonly player: PlayerDom;
  private readonly enemy: EnemyDom;
  private readonly screen: ScreenDom;
  private readonly dashboard: DashboardDom;
  private readonly controls: PlayerControlsDom;
  private readonly menu: MenuDom;
  private millisecondsSinceLastAnimateCall: number = 0;
  private lastAnimateCallTimestamp: number = 0;
  private animateRatePerSecond: number = 0;

  constructor() {
    this.player = new PlayerDom();
    this.enemy = new EnemyDom();

    this.dashboard = new DashboardDom(this.player, this.enemy);
    this.screen = new ScreenDom(
      this.player,
      this.enemy,
      new HitDom(this.player, this.enemy),
    );
    this.menu = new MenuDom();

    this.controls = new PlayerControlsDom(
      this.screen,
      this.player,
      this.dashboard,
    );

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

    this.screen.animate(
      this.controls.animateScreen(),
      this.animateRatePerSecond,
      this.millisecondsSinceLastAnimateCall,
      this.dashboard.getRadarAnouncementDisplayTime(),
    );
    this.dashboard.animate(
      this.controls.animateScreen(),
      this.millisecondsSinceLastAnimateCall,
    );
    this.menu.animate(
      this.millisecondsSinceLastAnimateCall,
      this.controls.getGameInitiated(),
      this.controls.animateScreen(),
      this.dashboard.getPaused(),
      this.player.defeated(),
    );

    if (false === this.menu.gameOverDisplayed()) {
      this.requestAnimation();
    }
  }

  private requestAnimation() {
    window.requestAnimationFrame(this.animate.bind(this));
  }
}
