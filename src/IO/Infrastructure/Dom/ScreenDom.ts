import { EnemyDom } from '../../../Enemy/Infrastructure/Dom/EnemyDom';
import { HitDom } from '../../../Hit/Infrastructure/Dom/HitDom';
import { PlayerDom } from '../../../Player/Infrastructure/Dom/PlayerDom';
import { EventBusInterface } from '../../Domain/EventBusInterface';
import { GameEvents } from '../../Domain/GameEvents';
import { ScreenInterface } from '../../Domain/ScreenInterface';
import { Dom } from './Dom';
import { ScrollingBackgroundDom } from './ScrollingBackgroundDom';
import { ScreenElementDom } from './ScreenElementDom';
import { ScreenShakeDom } from './ScreenShakeDom';

export class ScreenDom implements ScreenInterface {
  private readonly canvas: HTMLCanvasElement;
  private readonly canvasContext: CanvasRenderingContext2D;
  private windowFocused: boolean = true;
  private meetsMinimumResolution: boolean = true;
  private windowAvailabilityInitialized: boolean = false;
  private lastPublishedWindowFocus: boolean = true;
  private readonly background = new ScrollingBackgroundDom();
  private readonly shake = new ScreenShakeDom(this);
  private shakeInitiate: boolean = false;

  constructor(
    private readonly player: PlayerDom,
    private readonly enemy: EnemyDom,
    private readonly hit: HitDom,
    private readonly events: EventBusInterface<GameEvents>,
  ) {
    const dom = new Dom();
    this.canvas = dom.getCanvasById('game');
    this.canvasContext = dom.getCanvasContext2d(this.canvas);
    this.publishWindowAvailability();

    dom.addEventListener(window, 'resize', this.windowResize.bind(this));
    dom.addEventListener(window, 'focus', this.windowFocus.bind(this));
    dom.addEventListener(window, 'blur', this.windowBlur.bind(this));
  }

  public animate(
    screenAnimate: boolean,
    repaintRatePerSecond: number,
    millisecondsSinceLastAnimateCall: number,
    radarDisplayTime: number,
  ): void {
    if (true === this.shakeInitiate) {
      this.shake.startShake(
        this.player.getBase().getHealth(),
        radarDisplayTime,
      );
      this.shakeInitiate = false;
    } else {
      this.shake.animate(millisecondsSinceLastAnimateCall);
    }
    if (false === screenAnimate) {
      return;
    }
    this.drawElements(repaintRatePerSecond, millisecondsSinceLastAnimateCall);
    this.background.animate(
      this.canvasContext,
      this.canvas.width,
      this.canvas.height,
      millisecondsSinceLastAnimateCall,
    );
    this.hit.hasHits(this.canvas.width);
    this.shakeInitiate = this.player.getBase().radarAnnounce();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  private windowResize(): void {
    this.publishWindowAvailability();
  }

  private windowFocus(): void {
    this.windowFocused = true;
    this.publishWindowAvailability();
  }

  private windowBlur(): void {
    this.windowFocused = false;
    this.publishWindowAvailability();
  }

  private publishWindowAvailability(): void {
    const meetsMinimumResolution =
      window.innerHeight >= 760 && window.innerWidth > 1032;
    if (
      this.windowAvailabilityInitialized &&
      this.meetsMinimumResolution === meetsMinimumResolution &&
      this.windowFocused === this.lastPublishedWindowFocus
    ) {
      return;
    }

    this.windowAvailabilityInitialized = true;
    this.lastPublishedWindowFocus = this.windowFocused;
    this.meetsMinimumResolution = meetsMinimumResolution;
    this.events.emit('window.availabilityChanged', {
      focused: this.windowFocused,
      meetsMinimumResolution,
    });
  }

  private drawElements(
    repaintRatePerSecond: number,
    millisecondsSinceLastAnimateCall: number,
  ): void {
    const screenElements: ScreenElementDom[] = [];
    screenElements.push(
      ...this.player.animate(
        repaintRatePerSecond,
        millisecondsSinceLastAnimateCall,
      ),
      ...this.enemy.animate(
        repaintRatePerSecond,
        millisecondsSinceLastAnimateCall,
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
