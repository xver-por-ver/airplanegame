import { EnemyDom } from '../../../../Enemy/Infrastructure/Dom/EnemyDom';
import { PlayerDom } from '../../../../Player/Infrastructure/Dom/PlayerDom';
import { DashboardInterface } from '../../../Domain/Dashboard/DashboardInterface';
import { EventBusInterface } from '../../../Domain/EventBusInterface';
import { GameEvents } from '../../../Domain/GameEvents';
import { Dom } from '../Dom';
import { DashboardMagazineDom } from './DashboardMagazineDom';
import { DashboardRadarDom } from './DashboardRadarDom';
import { DashboardScoreDom } from './DashboardScoreDom';

export class DashboardDom implements DashboardInterface {
  private readonly dashboardMagazine: DashboardMagazineDom;
  private readonly dashboardRadar: DashboardRadarDom;
  private readonly dashboardScore: DashboardScoreDom;

  constructor(
    private readonly player: PlayerDom,
    private readonly enemy: EnemyDom,
    events: EventBusInterface<GameEvents>,
  ) {
    const dom = new Dom();
    this.dashboardMagazine = new DashboardMagazineDom(this.player, dom);
    this.dashboardRadar = new DashboardRadarDom(
      this.player,
      this.enemy,
      dom,
      events,
    );
    this.dashboardScore = new DashboardScoreDom(this.player, dom);
  }

  public animate(
    animateScreen: boolean,
    millisecondsSinceLastAnimateCall: number,
  ): void {
    this.dashboardMagazine.animate(animateScreen);
    this.dashboardRadar.animate(
      animateScreen,
      millisecondsSinceLastAnimateCall,
    );
    this.dashboardScore.animate();
  }

  public getRadarAnouncementDisplayTime(): number {
    return this.dashboardRadar.getDisplayTime();
  }
}
