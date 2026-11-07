import { EventBusInterface } from '../Domain/EventBusInterface';
import { GameEvents } from '../Domain/GameEventsInterface';

export type MenuView =
  'welcome' | 'paused' | 'resolution-warning' | 'hidden' | 'game-over';

type ViewListener = (view: MenuView) => void;

export class MenuPresentation {
  private view: MenuView = 'welcome';
  private readonly viewListeners = new Set<ViewListener>();
  private menuPausedOpen: boolean = false;
  private gameStarted: boolean = false;
  private gamePaused: boolean = false;
  private resolutionWarningOpen: boolean = false;
  private gameDefeated: boolean = false;
  private delayTillGameOverMenu: number = 3000;

  constructor(events: EventBusInterface<GameEvents>) {
    events.on('game.started', () => {
      this.gameStarted = true;
      this.menuPausedOpen = false;
      this.setView('hidden');
    });
    events.on('game.paused', ({ blockers }) => {
      this.gamePaused = true;
      if (blockers.some((blocker) => 'gameplay-hold' !== blocker)) {
        this.menuPausedOpen = true;
        this.setView('paused');
      }
    });
    events.on('game.resumed', () => {
      this.gamePaused = false;
      if (this.menuPausedOpen) {
        this.menuPausedOpen = false;
        this.setView('hidden');
      }
    });
    events.on('window.availabilityChanged', ({ meetsMinimumResolution }) => {
      if (!meetsMinimumResolution) {
        this.resolutionWarningOpen = true;
        this.setView('resolution-warning');
        return;
      }
      if (this.resolutionWarningOpen) {
        this.resolutionWarningOpen = false;
        if (this.gameDefeated && this.gameOverDisplayed()) {
          this.setView('game-over');
        } else if (!this.gameStarted) {
          this.setView('welcome');
        } else if (this.gamePaused) {
          this.menuPausedOpen = true;
          this.setView('paused');
        } else {
          this.setView('hidden');
        }
      }
    });
    events.on('game.defeated', () => {
      this.gameDefeated = true;
    });
  }

  public onViewChanged(listener: ViewListener): void {
    this.viewListeners.add(listener);
    listener(this.view);
  }

  public animate(millisecondsSinceLastAnimateCall: number): void {
    if (!this.gameDefeated || 'game-over' === this.view) {
      return;
    }

    this.delayTillGameOverMenu -= millisecondsSinceLastAnimateCall;
    if (0 >= this.delayTillGameOverMenu) {
      this.setView('game-over');
    }
  }

  public getView(): MenuView {
    return this.view;
  }

  public gameOverDisplayed(): boolean {
    return 0 >= this.delayTillGameOverMenu;
  }

  private setView(view: MenuView): void {
    if (this.view === view) {
      return;
    }
    this.view = view;
    this.viewListeners.forEach((listener) => listener(view));
  }
}
