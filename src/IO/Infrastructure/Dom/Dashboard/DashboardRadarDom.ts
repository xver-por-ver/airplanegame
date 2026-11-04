import { EnemyDom } from '../../../../Enemy/Infrastructure/Dom/EnemyDom';
import { MissileAbstractDom } from '../../../../Enemy/Infrastructure/Dom/MissileAbstractDom';
import { MissileAtomicDom } from '../../../../Enemy/Infrastructure/Dom/MissileAtomicDom';
import { PlayerDom } from '../../../../Player/Infrastructure/Dom/PlayerDom';
import { EventBusInterface } from '../../../Domain/EventBusInterface';
import { GameEvents } from '../../../Domain/GameEventsInterface';
import { DashboardRadarInterface } from '../../../Domain/Dashboard/DashboardRadarInterface';
import { Dom } from '../Dom';

export class DashboardRadarDom implements DashboardRadarInterface {
  private readonly radarImage: HTMLElement;
  private readonly radarMsg: HTMLElement;
  private displayActivated: boolean = false;
  private readonly displayTime: number = 2000;
  private displayDeactivationTimeout: number = this.displayTime;
  private gameplayHoldActive: boolean = false;

  constructor(
    private readonly player: PlayerDom,
    private readonly enemy: EnemyDom,
    private readonly dom: Dom,
    private readonly events: EventBusInterface<GameEvents>,
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
    if (true === animateScreen && true === this.atomicMissileDetection()) {
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
      this.setGameplayHold(true);
    }
  }

  private atomicMissileDetection(): boolean {
    const missile = this.enemy
      .getLaunchedMissiles()
      .find(
        (candidate: MissileAbstractDom): candidate is MissileAtomicDom =>
          candidate instanceof MissileAtomicDom && candidate.radarAnnounce(),
      );
    if (undefined === missile) {
      return false;
    }
    missile.unsetRadarAnnounce();
    return true;
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
      (animateScreen || (false === animateScreen && this.gameplayHoldActive))
    ) {
      this.displayDeactivationTimeout -= millisecondsSinceLastAnimateCall;
      if (0 >= this.displayDeactivationTimeout) {
        this.displayClear();
      }
    }
  }

  private displayClear(): void {
    this.setGameplayHold(false);
    this.displayActivated = false;
    this.dom
      .htmlElementStyle(this.radarImage, 'visibility', 'hidden')
      .innerHtml(this.radarMsg, '');
  }

  private setGameplayHold(active: boolean): void {
    if (this.gameplayHoldActive === active) {
      return;
    }
    this.gameplayHoldActive = active;
    this.events.emit('gameplay.holdChanged', {
      active,
      reason: 'base-hit',
    });
  }

  public getDisplayTime(): number {
    return this.displayTime;
  }
}
