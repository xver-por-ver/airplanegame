import { PlayerDom } from '../../../Player/Infrastructure/Dom/PlayerDom';
import { EventBusInterface } from '../../Domain/EventBusInterface';
import { GameEvents } from '../../Domain/GameEventsInterface';
import { PlayerControlsInterface } from '../../Domain/PlayerControlsInterface';
import { Dom } from './Dom';
import { ScreenDom } from './ScreenDom';

export class PlayerControlsDom implements PlayerControlsInterface {
  private readonly canvasRect: DOMRect;
  private readonly canvasWidth: number;
  private readonly canvasHeight: number;
  private gameCanRun: boolean = false;
  private userRequestedPause: boolean = false;
  private readonly dom: Dom;

  constructor(
    private readonly screen: ScreenDom,
    private readonly player: PlayerDom,
    private readonly events: EventBusInterface<GameEvents>,
  ) {
    this.dom = new Dom();
    this.canvasRect = this.screen.getCanvas().getBoundingClientRect();
    this.canvasWidth = Math.round(this.canvasRect.width);
    this.canvasHeight = Math.round(this.canvasRect.height);
    this.events.on('game.started', () => {
      this.gameCanRun = true;
    });
    this.events.on('game.paused', () => {
      this.gameCanRun = false;
    });
    this.events.on('game.resumed', () => {
      this.gameCanRun = true;
    });
    this.events.on('game.defeated', () => {
      this.gameCanRun = false;
    });
    this.dom.addEventListener(
      this.screen.getCanvas(),
      'mousemove',
      this.mouseMoveEvent.bind(this),
    );
    this.dom.addEventListener(window, 'keydown', this.keyDownEvent.bind(this));
    this.dom.addEventListener(
      window,
      'mousedown',
      this.mouseDownEvent.bind(this),
    );
    this.player.fly(
      this.canvasWidth,
      Math.round(this.canvasHeight / 2),
      this.canvasHeight,
    );
  }

  private mouseDownEvent(ev: MouseEvent): void {
    if (this.dom.assertEventTarget(ev, 'gameStartButton')) {
      this.events.emit('game.startRequested', undefined);
      return;
    }

    if (this.dom.assertEventTarget(ev, 'helpButton')) {
      this.setUserPause(true);
      return;
    }

    if (this.dom.assertEventTarget(ev, 'helpCloseButton')) {
      this.setUserPause(false);
      return;
    }

    this.fire();
  }

  private mouseMoveEvent(ev: MouseEvent): void {
    this.fly(Math.round(ev.pageY - this.canvasRect.top));
  }

  private keyDownEvent(ev: KeyboardEvent): void {
    if ('Shift' === ev.key) {
      this.fire();
    }
    if ('p' === ev.key) {
      this.setUserPause(!this.userRequestedPause);
    }
  }

  private fly(y: number): void {
    if (this.animateScreen()) {
      this.player.fly(this.canvasWidth, y, this.canvasHeight);
    }
  }

  private fire(): void {
    if (this.animateScreen()) {
      this.player.fire();
    }
  }

  private setUserPause(paused: boolean): void {
    if (this.userRequestedPause === paused) {
      return;
    }
    this.userRequestedPause = paused;
    this.events.emit('game.userPauseChanged', { paused });
  }

  public animateScreen(): boolean {
    return this.gameCanRun;
  }
}
