import { PlayerDom } from '../../Player/Infrastructure/Dom/PlayerDom';
import { EventBusInterface } from '../Domain/EventBusInterface';
import { GameEvents } from '../Domain/GameEventsInterface';
import { PlayerControlsInterface } from '../Domain/PlayerControlsInterface';

export class PlayerControlPolicy implements PlayerControlsInterface {
  private gameCanRun: boolean = false;
  private userRequestedPause: boolean = false;

  constructor(
    private readonly player: PlayerDom,
    private readonly events: EventBusInterface<GameEvents>,
    private readonly canvasWidth: number,
    private readonly canvasHeight: number,
  ) {
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
    this.player.fly(
      this.canvasWidth,
      Math.round(this.canvasHeight / 2),
      this.canvasHeight,
    );
  }

  public steer(y: number): void {
    if (this.animateScreen()) {
      this.player.fly(this.canvasWidth, y, this.canvasHeight);
    }
  }

  public fire(): void {
    if (this.animateScreen()) {
      this.player.fire();
    }
  }

  public setUserPause(paused: boolean): void {
    if (this.userRequestedPause === paused) {
      return;
    }
    this.userRequestedPause = paused;
    this.events.emit('game.userPauseChanged', { paused });
  }

  public toggleUserPause(): void {
    this.setUserPause(!this.userRequestedPause);
  }

  public animateScreen(): boolean {
    return this.gameCanRun;
  }
}
