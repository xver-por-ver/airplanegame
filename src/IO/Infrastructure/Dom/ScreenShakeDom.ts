import { ScreenShakeInterface } from '../../Domain/ScreenShakeInterface';
import { ScreenDom } from './ScreenDom';

export class ScreenShakeDom implements ScreenShakeInterface {
  private remainingShakeTime: number = 0;
  private shakeElapsed: number = 0;
  private shakeStrength: number = 0;

  constructor(private readonly screen: ScreenDom) {}

  public animate(
    initialize: boolean,
    millisecondsSinceLastAnimateCall: number,
    radarAnouncementDuration: number,
    shakeStrength: number,
  ): void {
    if (true === initialize) {
      this.shakeInitialize(shakeStrength, radarAnouncementDuration);
      return;
    }
    if (0 === this.remainingShakeTime) {
      return;
    }
    this.shakeElapsed += millisecondsSinceLastAnimateCall;
    this.remainingShakeTime = Math.max(
      0,
      this.remainingShakeTime - millisecondsSinceLastAnimateCall,
    );
    this.renderShakeOffset();
  }

  private shakeInitialize(
    shakeStrength: number,
    remainingShakeTime: number,
  ): void {
    const damageLevel = Math.max(0, Math.min(3, 3 - shakeStrength));
    this.shakeStrength = damageLevel * 2;
    this.shakeElapsed = 0;
    this.remainingShakeTime = remainingShakeTime;
    this.renderShakeOffset();
  }

  private renderShakeOffset(): void {
    if (0 === this.remainingShakeTime) {
      this.screen.getCanvas().style.transform = '';
      return;
    }

    const progress = this.shakeElapsed / 240;
    const decay = this.remainingShakeTime / 240;
    const phase = progress * Math.PI * 4;
    const offsetX = this.shakeStrength * decay * Math.cos(phase);
    const offsetY = this.shakeStrength * 0.5 * decay * Math.sin(phase);
    this.screen.getCanvas().style.transform =
      'translate(calc(-50% + ' +
      offsetX +
      'px), calc(-50% + ' +
      offsetY +
      'px))';
  }
}
