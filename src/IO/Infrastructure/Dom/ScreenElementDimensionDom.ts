import { ScreenElementDimensionInterface } from '../../Domain/ScreenElementDimensionInterface';

export class ScreenElementDimensionDom implements ScreenElementDimensionInterface {
  constructor(
    private readonly height: number,
    private readonly width: number,
  ) {
    this.validDimension(height, width);
  }

  public getHeight(): number {
    return this.height;
  }

  public getWidth(): number {
    return this.width;
  }

  private validDimension(height: number, width: number): void {
    if (
      false === Number.isInteger(height) ||
      false === Number.isInteger(width)
    ) {
      throw new TypeError('Fatal: provided argument is not an interger');
    }

    if (0 >= height || 0 >= width) {
      throw new Error('Fatal: provided argument is not positive number');
    }
  }
}
