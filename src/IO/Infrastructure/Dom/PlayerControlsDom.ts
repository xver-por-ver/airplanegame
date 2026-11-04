import { PlayerDom } from '../../../Player/Infrastructure/Dom/PlayerDom';
import { EventBusInterface } from '../../Domain/EventBusInterface';
import { GameEvents } from '../../Domain/GameEventsInterface';
import { PlayerControlPolicy } from '../PlayerControlPolicy';
import { Dom } from './Dom';
import { ScreenDom } from './ScreenDom';

export class PlayerControlsDom {
  private readonly canvasWidth: number;
  private readonly canvasHeight: number;
  private readonly dom: Dom;
  private readonly policy: PlayerControlPolicy;

  constructor(
    private readonly screen: ScreenDom,
    private readonly player: PlayerDom,
    private readonly events: EventBusInterface<GameEvents>,
  ) {
    this.dom = new Dom();
    this.canvasWidth = this.screen.getCanvas().width;
    this.canvasHeight = this.screen.getCanvas().height;
    this.policy = new PlayerControlPolicy(
      this.player,
      this.events,
      this.canvasWidth,
      this.canvasHeight,
    );
    this.dom.addEventListener(
      window,
      'mousemove',
      this.mouseMoveEvent.bind(this),
    );
    this.dom.addEventListener(window, 'keydown', this.keyDownEvent.bind(this));
    this.dom.addEventListener(
      window,
      'mousedown',
      this.mouseDownEvent.bind(this),
    );
  }

  private mouseDownEvent(ev: MouseEvent): void {
    if (this.dom.assertEventTarget(ev, 'gameStartButton')) {
      this.events.emit('game.startRequested', undefined);
      return;
    }

    if (this.dom.assertEventTarget(ev, 'helpButton')) {
      this.policy.setUserPause(true);
      return;
    }

    if (this.dom.assertEventTarget(ev, 'helpCloseButton')) {
      this.policy.setUserPause(false);
      return;
    }

    this.policy.fire();
  }

  private mouseMoveEvent(ev: MouseEvent): void {
    const canvasRect = this.screen.getCanvas().getBoundingClientRect();
    const canvasY = Math.round(
      ((ev.clientY - canvasRect.top) * this.canvasHeight) / canvasRect.height,
    );
    this.policy.steer(canvasY);
  }

  private keyDownEvent(ev: KeyboardEvent): void {
    if ('Shift' === ev.key) {
      this.policy.fire();
    }
    if ('p' === ev.key) {
      this.policy.toggleUserPause();
    }
  }
}
