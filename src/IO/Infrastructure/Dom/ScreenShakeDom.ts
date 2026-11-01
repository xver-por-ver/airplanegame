import { ScreenShakeInterface } from '../../Domain/ScreenShakeInterface';
import { ScreenDom } from './ScreenDom';

export class ScreenShakeDom implements ScreenShakeInterface {
  private shakeRemaining: number = 0;
  private shakeElapsed: number = 0;
  private shakeStrength: number = 0;

  constructor(private readonly screen: ScreenDom) {}

  public startShake(
    remainingBaseHealth: number,
    radarDisplayTime: number,
  ): void {
    const damageLevel = Math.max(0, Math.min(3, 3 - remainingBaseHealth));
    this.shakeStrength = damageLevel * 2;
    this.shakeElapsed = 0;
    this.shakeRemaining = radarDisplayTime;
    this.renderShakeOffset();
  }

  public animate(millisecondsSinceLastAnimateCall: number): void {
    if (0 === this.shakeRemaining) {
      return;
    }
    this.shakeElapsed += millisecondsSinceLastAnimateCall;
    this.shakeRemaining = Math.max(
      0,
      this.shakeRemaining - millisecondsSinceLastAnimateCall,
    );
    this.renderShakeOffset();
  }

  private renderShakeOffset(): void {
    if (0 === this.shakeRemaining) {
      this.screen.getCanvas().style.transform = '';
      return;
    }

    const progress = this.shakeElapsed / 240;
    const decay = this.shakeRemaining / 240;
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
