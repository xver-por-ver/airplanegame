import { EnemyDom } from '../../../../Enemy/Infrastructure/Dom/EnemyDom';
import { PlayerDom } from '../../../../Player/Infrastructure/Dom/PlayerDom';
import { DashboardInterface } from '../../../Domain/Dashboard/DashboardInterface';
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
  ) {
    const dom = new Dom();
    this.dashboardMagazine = new DashboardMagazineDom(this.player, dom);
    this.dashboardRadar = new DashboardRadarDom(this.player, this.enemy, dom);
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

  public getPaused(): boolean {
    return this.dashboardRadar.getPaused();
  }

  public getRadarAnouncementDisplayTime(): number {
    return this.dashboardRadar.getDisplayTime();
  }
}
