import { EnemyDom } from '../../../../Enemy/Infrastructure/Dom/EnemyDom';
import { PlayerDom } from '../../../../Player/Infrastructure/Dom/PlayerDom';
import { DashboardRadarInterface } from '../../../Domain/Dashboard/DashboardRadarInterface';
import { Dom } from '../Dom';

export class DashboardRadarDom implements DashboardRadarInterface {
  private readonly radarImage: HTMLElement;
  private readonly radarMsg: HTMLElement;
  private displayActivated: boolean = false;
  private readonly displayTime: number = 2000;
  private displayDeactivationTimeout: number = this.displayTime;
  private pause: boolean = false;

  constructor(
    private readonly player: PlayerDom,
    private readonly enemy: EnemyDom,
    private readonly dom: Dom,
  ) {
    this.radarImage = this.dom.getElementById('radarImg');
    this.radarMsg = this.dom.getElementById('radarMsg');
  }

  public animate(
    animateScreen: boolean,
    millisecondsSinceLastAnimateCall: number,
  ): void {
    this.displayActivationControl(
      animateScreen,
      millisecondsSinceLastAnimateCall,
    );
    if (
      true === animateScreen &&
      true === this.player.getBase().atomicMissileDetection(this.enemy)
    ) {
      this.displayActivate('-90px -89px', '<p>ATOMIC MISILE APPROACHING</p>');
    }

    if (
      (false !== animateScreen || false !== this.player.defeated()) &&
      this.player.getBase().baseHit()
    ) {
      this.displayActivate(
        this.player.getBase().getSpritePosition(),
        this.player.getBase().getRadarMessage(),
      );
      this.pause = true;
    }
  }

  public getPaused(): boolean {
    return this.pause;
  }

  private displayActivate(backgroundPosition: string, message: string): void {
    this.displayActivated = true;
    this.displayDeactivationTimeout = this.displayTime;
    this.dom
      .htmlElementStyle(this.radarImage, 'visibility', 'visible')
      .htmlElementStyle(
        this.radarImage,
        'background-position',
        backgroundPosition,
      )
      .innerHtml(this.radarMsg, message);
  }

  private displayActivationControl(
    animateScreen: boolean,
    millisecondsSinceLastAnimateCall: number,
  ): void {
    if (
      this.displayActivated &&
      (animateScreen || (false === animateScreen && this.pause))
    ) {
      this.displayDeactivationTimeout -= millisecondsSinceLastAnimateCall;
      if (0 >= this.displayDeactivationTimeout) {
        this.displayClear();
      }
    }
  }

  private displayClear(): void {
    this.pause = false;
    this.displayActivated = false;
    this.dom
      .htmlElementStyle(this.radarImage, 'visibility', 'hidden')
      .innerHtml(this.radarMsg, '');
  }

  public getDisplayTime(): number {
    return this.displayTime;
  }
}
