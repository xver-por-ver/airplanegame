import { EventBusInterface } from '../../Domain/EventBusInterface';
import { GameEvents } from '../../Domain/GameEventsInterface';
import { MenuInterface } from '../../Domain/MenuInterface';
import { MenuPresentation, MenuView } from '../MenuPresentation';
import { Dom } from './Dom';

export class MenuDom implements MenuInterface {
  private readonly menuOverlay: HTMLElement;
  private readonly menuContainer: HTMLElement;
  private readonly presentation: MenuPresentation;

  constructor(events: EventBusInterface<GameEvents>) {
    const dom = new Dom();
    this.menuOverlay = dom.getElementById('infoOverlay');
    this.menuContainer = dom.getElementById('infoContainer');
    this.presentation = new MenuPresentation(events);
    this.presentation.onViewChanged(this.render.bind(this));
  }

  public animate(millisecondsSinceLastAnimateCall: number): void {
    this.presentation.animate(millisecondsSinceLastAnimateCall);
  }

  public gameOverDisplayed(): boolean {
    return this.presentation.gameOverDisplayed();
  }

  private render(view: MenuView): void {
    if ('hidden' === view) {
      this.menuOverlay.style.visibility = 'hidden';
      return;
    }

    this.menuContainer.innerHTML = this.getContent(view);
    this.menuOverlay.style.visibility = 'visible';
  }

  private getContent(view: Exclude<MenuView, 'hidden'>): string {
    switch (view) {
      case 'welcome':
        return '<p><a href="javascript:void();" id="gameStartButton">PLAY</a></p>';
      case 'paused':
        return (
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
          '</div>'
        );
      case 'resolution-warning':
        return (
          '<div class="helpMenu"><h2>Screen too small</h2>' +
          '<p>Airplanegame requires a screen resolution of at least ' +
          '1033 × 760 pixels. Enlarge your browser window to continue.</p>' +
          '</div>'
        );
      case 'game-over':
        return (
          '<p>GAME OVER<br /><a href="javascript:void(0);" ' +
          'onclick="window.location.reload(true);">PLAY AGAIN</a></p>'
        );
    }
  }
}
