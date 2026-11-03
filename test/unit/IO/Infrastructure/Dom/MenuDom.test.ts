import { describe, expect, beforeEach, afterEach, test } from '@jest/globals';
import { MenuDom } from '../../../../../src/IO/Infrastructure/Dom/MenuDom';
import { EventBus } from '../../../../../src/IO/Infrastructure/EventBus';
import { GameEvents } from '../../../../../src/IO/Domain/GameEvents';
import { resetDocument } from '../../../../DomDocumentInit';

describe('MenuDom', () => {
  let menu: MenuDom;
  let events: EventBus<GameEvents>;
  let overlay: HTMLElement;
  let container: HTMLElement;

  beforeEach(() => {
    overlay = document.getElementById('infoOverlay') as HTMLElement;
    container = document.getElementById('infoContainer') as HTMLElement;
    events = new EventBus<GameEvents>();
    menu = new MenuDom(events);
  });

  afterEach(() => {
    resetDocument();
  });

  test('constructor shows welcome menu (PLAY) and makes overlay visible', () => {
    expect(container.innerHTML).toContain('PLAY');
    expect(overlay.style.visibility).toBe('visible');
  });

  test('shows the minimum-resolution message and restores welcome when available', () => {
    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: false,
    });
    expect(container.innerHTML).toContain('1033 × 760');
    expect(overlay.style.visibility).toBe('visible');

    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: true,
    });
    expect(container.innerHTML).toContain('PLAY');
  });

  test('game.started closes the welcome menu', () => {
    events.emit('game.started', undefined);

    expect(overlay.style.visibility).toBe('hidden');
  });

  test('game.paused shows controls when a user or window blocks play', () => {
    events.emit('game.started', undefined);
    events.emit('game.paused', { blockers: ['user-pause'] });

    expect(container.innerHTML).toContain('Help Menu');
    expect(container.innerHTML).toContain('<th>Controls</th>');
    expect(container.innerHTML).toContain('helpCloseButton');
    expect(overlay.style.visibility).toBe('visible');
  });

  test('gameplay-only hold does not open the pause menu', () => {
    events.emit('game.started', undefined);
    events.emit('game.paused', { blockers: ['gameplay-hold'] });

    expect(overlay.style.visibility).toBe('hidden');
  });

  test('game.resumed closes the pause menu', () => {
    events.emit('game.started', undefined);
    events.emit('game.paused', { blockers: ['window-blur'] });

    events.emit('game.resumed', undefined);

    expect(overlay.style.visibility).toBe('hidden');
  });

  test('game-over menu is displayed after the delay following defeat', () => {
    events.emit('game.started', undefined);
    events.emit('game.defeated', undefined);

    menu.animate(1000);
    expect(menu.gameOverDisplayed()).toBe(false);
    expect(overlay.style.visibility).toBe('hidden');

    menu.animate(1000);
    expect(menu.gameOverDisplayed()).toBe(false);
    expect(overlay.style.visibility).toBe('hidden');

    menu.animate(1000);
    expect(menu.gameOverDisplayed()).toBe(true);
    expect(container.innerHTML).toContain('GAME OVER');
    expect(container.innerHTML).toContain('PLAY AGAIN');
    expect(overlay.style.visibility).toBe('visible');
  });
});
