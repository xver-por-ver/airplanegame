import { ScreenElementInterface } from '../../Domain/ScreenElementInterface';
import { Dom } from './Dom';
import { ScreenElementDimensionDom } from './ScreenElementDimensionDom';
import { ScreenElementPositionDom } from './ScreenElementPositionDom';
import { SpriteCordsDom } from './SpriteCordsDom';

export class ScreenElementDom implements ScreenElementInterface {
  private loaded: boolean = false;
  private readonly graphic: HTMLImageElement;
  private readonly position: ScreenElementPositionDom;
  private readonly dimension: ScreenElementDimensionDom;
  private readonly spriteCords: SpriteCordsDom;

  constructor(
    domId: string,
    elementId: string,
    height: number,
    width: number,
    spriteX: number,
    spriteY: number,
    private readonly globalCompositeOperation: GlobalCompositeOperation = 'source-over',
  ) {
    const dom = new Dom();

    this.position = new ScreenElementPositionDom();
    this.dimension = new ScreenElementDimensionDom(height, width);
    this.spriteCords = new SpriteCordsDom(spriteX, spriteY);

    this.graphic = dom.getClonedImageById(domId);
    this.graphic.id = elementId;
    this.graphic.width = this.dimension.getWidth();
    this.graphic.height = this.dimension.getHeight();
    this.graphic.onload = () => {
      this.loaded = true;
    };
  }

  public getLoaded(): boolean {
    return this.loaded;
  }

  public getGraphic(): HTMLImageElement {
    return this.graphic;
  }

  public getPosition(): ScreenElementPositionDom {
    return this.position;
  }

  public setPosition(x: number, y: number): void {
    this.position.setPositionX(x);
    this.position.setPositionY(y);
  }

  public getDimension(): ScreenElementDimensionDom {
    return this.dimension;
  }

  public getGlobalCompositeOperation(): GlobalCompositeOperation {
    return this.globalCompositeOperation;
  }

  public getSpriteCords(): SpriteCordsDom {
    return this.spriteCords;
  }
}
