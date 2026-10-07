import { SpriteCordsInterface } from '../../Domain/SpriteCordsInterface';

export class SpriteCordsDom implements SpriteCordsInterface {
  constructor(
    private readonly positionX: number,
    private readonly positionY: number,
  ) {
    this.validPosition(positionX, positionY);
  }

  public getPositionX(): number {
    return this.positionX;
  }

  public getPositionY(): number {
    return this.positionY;
  }

  private validPosition(positionX: number, positionY: number): void {
    if (
      false === Number.isInteger(positionX) ||
      false === Number.isInteger(positionY)
    ) {
      throw new TypeError('Fatal: provided argument is not an interger');
    }
  }
}
