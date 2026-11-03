import { EventBusInterface } from '../../Domain/EventBusInterface';
import { GameEvents } from '../../Domain/GameEventsInterface';
import { MenuInterface } from '../../Domain/MenuInterface';
import { Dom } from './Dom';

export class MenuDom implements MenuInterface {
  private readonly menuOverlay: HTMLElement;
  private readonly menuContainer: HTMLElement;
  private menuPausedOpen: boolean = false;
  private gameStarted: boolean = false;
  private gamePaused: boolean = false;
  private resolutionWarningOpen: boolean = false;
  private gameDefeated: boolean = false;
  private delayTillGameOverMenu: number = 3000;

  constructor(events: EventBusInterface<GameEvents>) {
    const dom = new Dom();
    this.menuOverlay = dom.getElementById('infoOverlay');
    this.menuContainer = dom.getElementById('infoContainer');
    this.welcome();
    events.on('game.started', () => {
      this.gameStarted = true;
      this.closeMenu();
    });
    events.on('game.paused', ({ blockers }) => {
      this.gamePaused = true;
      if (blockers.some((blocker) => 'gameplay-hold' !== blocker)) {
        this.pause();
      }
    });
    events.on('game.resumed', () => {
      this.gamePaused = false;
      if (this.menuPausedOpen) {
        this.closeMenu();
      }
    });
    events.on('window.availabilityChanged', ({ meetsMinimumResolution }) => {
      if (!meetsMinimumResolution) {
        this.resolutionWarningOpen = true;
        this.loadMenu(
          '<div class="helpMenu"><h2>Screen too small</h2>' +
            '<p>Airplanegame requires a screen resolution of at least ' +
            '1033 × 760 pixels. Enlarge your browser window to continue.</p>' +
            '</div>',
        );
        return;
      }
      if (this.resolutionWarningOpen) {
        this.resolutionWarningOpen = false;
        if (!this.gameStarted) {
          this.welcome();
        } else if (this.gamePaused) {
          this.pause();
        } else {
          this.closeMenu();
        }
      }
    });
    events.on('game.defeated', () => {
      this.gameDefeated = true;
    });
  }

  public animate(millisecondsSinceLastAnimateCall: number): void {
    if (this.gameDefeated) {
      this.gameOver(millisecondsSinceLastAnimateCall);
    }
  }

  private welcome(): void {
    let menuContent: string = '';
    menuContent += '<a href="javascript:void();" id="gameStartButton">PLAY</a>';
    this.loadMenu('<p>' + menuContent + '</p>');
  }

  private pause(): void {
    this.menuPausedOpen = true;
    this.loadMenu(
      '<div class="helpMenu">' +
        '<h2>Help Menu</h2>' +
        '<table>' +
        '<thead><tr><th>Controls</th><th>Description</th></tr></thead>' +
        '<tbody>' +
        '<tr><td>Shift key or left mouse click</td><td>Fire missile</td></tr>' +
        '<tr><td>P key</td><td>Pause/unpause</td></tr>' +
        '<tr><td>Mouse move</td><td>Move airplane</td></tr>' +
        '</tbody>' +
        '</table>' +
        '<a href="javascript:void();" id="helpCloseButton">CLOSE</a>' +
        '</div>',
    );
  }

  private gameOver(millisecondsSinceLastAnimateCall: number): void {
    this.delayTillGameOverMenu -= millisecondsSinceLastAnimateCall;
    if (0 >= this.delayTillGameOverMenu) {
      this.loadMenu(
        '<p>GAME OVER<br /><a href="javascript:void(0);" onclick="window.location.reload(true);">PLAY AGAIN</a></p>',
      );
    }
  }

  private loadMenu(menuContent: string): void {
    this.menuContainer.innerHTML = menuContent;
    this.menuOverlay.style.visibility = 'visible';
  }

  public closeMenu(): void {
    this.menuPausedOpen = false;
    this.menuOverlay.style.visibility = 'hidden';
  }

  public gameOverDisplayed(): boolean {
    return 0 >= this.delayTillGameOverMenu;
  }
}
