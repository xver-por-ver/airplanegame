import { MenuInterface } from '../../Domain/MenuInterface';
import { Dom } from './Dom';

export class MenuDom implements MenuInterface {
  private readonly menuOverlay: HTMLElement;
  private readonly menuContainer: HTMLElement;
  private menuWelcomeOpen: boolean = false;
  private menuPausedOpen: boolean = false;
  private delayTillGameOverMenu: number = 3000;

  constructor() {
    const dom = new Dom();
    this.menuOverlay = dom.getElementById('infoOverlay');
    this.menuContainer = dom.getElementById('infoContainer');
    this.welcome();
  }

  public animate(
    millisecondsSinceLastAnimateCall: number,
    gameInitiated: boolean,
    animateScreen: boolean,
    isDashboardPause: boolean,
    defeated: boolean,
  ): void {
    if (defeated) {
      this.gameOver(millisecondsSinceLastAnimateCall);
      return;
    }

    if (gameInitiated && this.menuWelcomeOpen) {
      this.closeMenu();
      this.menuWelcomeOpen = false;
      return;
    }
    if (
      false === animateScreen &&
      !this.menuPausedOpen &&
      !this.menuWelcomeOpen &&
      !isDashboardPause
    ) {
      this.pause();
      return;
    }
    if (animateScreen && this.menuPausedOpen) {
      this.closeMenu();
    }
  }

  private welcome(): void {
    this.menuWelcomeOpen = true;
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
    this.menuWelcomeOpen = false;
    this.menuOverlay.style.visibility = 'hidden';
  }

  public gameOverDisplayed(): boolean {
    return 0 >= this.delayTillGameOverMenu;
  }
}
