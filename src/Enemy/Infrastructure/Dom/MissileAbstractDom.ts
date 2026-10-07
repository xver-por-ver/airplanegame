import { ScreenElementDimensionDom } from '../../../IO/Infrastructure/Dom/ScreenElementDimensionDom';
import { ScreenElementDom } from '../../../IO/Infrastructure/Dom/ScreenElementDom';
import { ScreenElementPositionDom } from '../../../IO/Infrastructure/Dom/ScreenElementPositionDom';
import { MissileInterface } from '../../Domain/MissileInterface';

export abstract class MissileAbstractDom implements MissileInterface {
  protected screenElement: ScreenElementDom;
  private pendingDamageAnnouncement: boolean = true;

  constructor(
    domId: string,
    elementId: string,
    missileHeight: number,
    missileWidth: number,
    spriteX: number,
    spriteY: number,
    screenHeight: number,
    protected speed: number = 160, // pixels/sec
    protected readonly destructionScore: number = 100,
    protected hitsTillDestruction: number = 1,
  ) {
    this.screenElement = new ScreenElementDom(
      domId,
      elementId,
      missileHeight,
      missileWidth,
      spriteX,
      spriteY,
      'destination-over',
    );
    const bottomLimit = Math.round(
      screenHeight - this.screenElement.getDimension().getHeight(),
    );
    this.screenElement.setPosition(
      Math.round(0 - this.screenElement.getDimension().getWidth()),
      this.getRandomInteger(bottomLimit),
    );
  }

  private getRandomInteger(maximum: number): number {
    const range = maximum + 1;
    const maxUnbiasedValue = 2 ** 32 - (2 ** 32 % range);
    const randomValue = new Uint32Array(1);

    do {
      globalThis.crypto.getRandomValues(randomValue);
    } while (randomValue[0] >= maxUnbiasedValue);

    return randomValue[0] % range;
  }

  public animate(repaintRatePerSecond: number): void {
    this.setPosition(
      this.screenElement.getPosition().getPositionX() +
        Math.round(this.speed / repaintRatePerSecond),
      this.screenElement.getPosition().getPositionY(),
    );
  }

  public getScreenElement(): ScreenElementDom {
    return this.screenElement;
  }

  public setPosition(x: number, y: number): void {
    this.screenElement.setPosition(x, y);
  }

  public getPosition(): ScreenElementPositionDom {
    return this.screenElement.getPosition();
  }

  public getDimension(): ScreenElementDimensionDom {
    return this.screenElement.getDimension();
  }

  public takeHit(): void {
    if (0 < this.hitsTillDestruction) {
      this.hitsTillDestruction--;
    }
  }

  public destroyed(): boolean {
    return 0 === this.hitsTillDestruction;
  }

  public getDestructionScore(): number {
    return this.destructionScore;
  }

  public damageAnnounce(): boolean {
    return this.pendingDamageAnnouncement && false === this.destroyed();
  }

  public unsetDamageAnnounce(): void {
    this.pendingDamageAnnouncement = false;
  }
}
