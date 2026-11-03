import { EnemyDom } from '../../../Enemy/Infrastructure/Dom/EnemyDom';
import { HitDom } from '../../../Hit/Infrastructure/Dom/HitDom';
import { PlayerDom } from '../../../Player/Infrastructure/Dom/PlayerDom';
import { ScreenInterface } from '../../Domain/ScreenInterface';
import { FrameTiming } from '../../../FrameTiming';
import { Dom } from './Dom';
import { ScrollingBackgroundDom } from './ScrollingBackgroundDom';
import { ScreenElementDom } from './ScreenElementDom';
import { ScreenShakeDom } from './ScreenShakeDom';

export class ScreenDom implements ScreenInterface {
  private readonly canvas: HTMLCanvasElement;
  private readonly canvasContext: CanvasRenderingContext2D;
  private readonly background = new ScrollingBackgroundDom();
  private readonly shake = new ScreenShakeDom(this);
  private shakeInitialize: boolean = false;

  constructor(
    private readonly player: PlayerDom,
    private readonly enemy: EnemyDom,
    private readonly hit: HitDom,
  ) {
    const dom = new Dom();
    this.canvas = dom.getCanvasById('game');
    this.canvasContext = dom.getCanvasContext2d(this.canvas);
  }

  public animate(
    screenAnimate: boolean,
    frameTiming: FrameTiming,
    radarAnouncementDuration: number,
  ): void {
    this.shake.animate(
      this.shakeInitialize,
      frameTiming.millisecondsSincePreviousFrame,
      radarAnouncementDuration,
      this.player.getBase().getHealth(),
    );
    this.shakeInitialize = false;
    if (false === screenAnimate) {
      return;
    }
    this.drawElements(frameTiming);
    this.background.animate(
      this.canvasContext,
      this.canvas.width,
      this.canvas.height,
      frameTiming.millisecondsSincePreviousFrame,
    );
    this.hit.hasHits(this.canvas.width);
    this.shakeInitialize = this.player.getBase().radarAnnounce();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  private drawElements(frameTiming: FrameTiming): void {
    const screenElements: ScreenElementDom[] = [];
    screenElements.push(
      ...this.player.animate(
        frameTiming.framesPerSecond,
        frameTiming.millisecondsSincePreviousFrame,
      ),
      ...this.enemy.animate(
        frameTiming.framesPerSecond,
        frameTiming.millisecondsSincePreviousFrame,
        this.canvas.height,
        this.canvas.width,
      ),
    );
    this.canvasContext.reset();
    screenElements.forEach((element: ScreenElementDom) => {
      if (element.getLoaded()) {
        this.canvasContext.globalCompositeOperation =
          element.getGlobalCompositeOperation();
        this.canvasContext.drawImage(
          element.getGraphic(),
          element.getSpriteCords().getPositionX(),
          element.getSpriteCords().getPositionY(),
          element.getDimension().getWidth(),
          element.getDimension().getHeight(),
          element.getPosition().getPositionX(),
          element.getPosition().getPositionY(),
          element.getDimension().getWidth(),
          element.getDimension().getHeight(),
        );
      }
    });
    this.canvasContext.globalCompositeOperation = 'destination-over';
  }
}
