import { ScreenElementPositionInterface } from '../../Domain/ScreenElementPositionInterface';

export class ScreenElementPositionDom implements ScreenElementPositionInterface {
  constructor(
    private positionX: number = 0,
    private positionY: number = 0,
  ) {
    this.validPostion(positionX, positionY);
  }

  public getPositionX(): number {
    return this.positionX;
  }

  public getPositionY(): number {
    return this.positionY;
  }

  public setPositionX(positionX: number): void {
    this.validPostion(positionX, this.getPositionY());
    this.positionX = positionX;
  }

  public setPositionY(positionY: number): void {
    this.validPostion(this.getPositionX(), positionY);
    this.positionY = positionY;
  }

  private validPostion(positionX: number, positionY: number): void {
    if (
      false === Number.isInteger(positionX) ||
      false === Number.isInteger(positionY)
    ) {
      throw new TypeError('Fatal: provided argument is not an interger');
    }
  }
}
