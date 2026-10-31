export class ScrollingBackgroundDom {
  private static readonly TILE_WIDTH = 1024;
  private static readonly SCROLL_SPEED = 20;
  private scrollOffset: number = 0;

  public animate(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    millisecondsSinceLastAnimateCall: number,
  ): void {
    this.scrollOffset =
      (this.scrollOffset +
        (ScrollingBackgroundDom.SCROLL_SPEED *
          millisecondsSinceLastAnimateCall) /
          1000) %
      ScrollingBackgroundDom.TILE_WIDTH;

    const tilesOnScreen = Math.ceil(width / ScrollingBackgroundDom.TILE_WIDTH);
    for (let tile = -1; tile <= tilesOnScreen; tile += 1) {
      context.save();
      context.translate(
        this.scrollOffset + tile * ScrollingBackgroundDom.TILE_WIDTH,
        0,
      );
      this.drawLandmass(context, height, 150, 0.22);
      this.drawLandmass(context, height, 480, 0.34);
      this.drawLandmass(context, height, 790, 0.2);
      context.restore();
    }
    context.fillStyle = '#071c2b';
    context.fillRect(0, 0, width, height);
  }

  private drawLandmass(
    context: CanvasRenderingContext2D,
    height: number,
    x: number,
    scale: number,
  ): void {
    const centerY = height * (0.2 + scale);
    const radiusX = 120 * scale;
    const radiusY = height * scale * 0.55;

    context.beginPath();
    context.moveTo(x - radiusX, centerY - radiusY * 0.55);
    context.bezierCurveTo(
      x - radiusX * 0.8,
      centerY - radiusY * 1.25,
      x - radiusX * 0.1,
      centerY - radiusY * 1.05,
      x + radiusX * 0.2,
      centerY - radiusY * 0.7,
    );
    context.bezierCurveTo(
      x + radiusX * 1.15,
      centerY - radiusY * 0.4,
      x + radiusX * 0.85,
      centerY + radiusY * 0.55,
      x + radiusX * 0.3,
      centerY + radiusY * 0.8,
    );
    context.bezierCurveTo(
      x - radiusX * 0.25,
      centerY + radiusY * 1.15,
      x - radiusX * 1.2,
      centerY + radiusY * 0.25,
      x - radiusX,
      centerY - radiusY * 0.55,
    );
    context.closePath();
    context.fillStyle = '#173b3c';
    context.fill();
    context.strokeStyle = '#244b43';
    context.lineWidth = 3;
    context.stroke();
  }
}
