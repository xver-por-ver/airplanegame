import { describe, expect, test } from '@jest/globals';
import { EventBus } from '../../../../src/IO/Infrastructure/EventBus';
import { GameEvents } from '../../../../src/IO/Domain/GameEventsInterface';
import { MenuPresentation } from '../../../../src/IO/Infrastructure/MenuPresentation';

describe('MenuPresentation', () => {
  test('tracks pause, resolution warning, and recovery without DOM', () => {
    const events = new EventBus<GameEvents>();
    const presentation = new MenuPresentation(events);
    const views: string[] = [];
    presentation.onViewChanged((view) => views.push(view));

    events.emit('game.started', undefined);
    events.emit('game.paused', { blockers: ['gameplay-hold'] });
    events.emit('game.paused', { blockers: ['user-pause'] });
    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: false,
    });
    events.emit('game.paused', { blockers: ['user-pause', 'minimum-resolution'] });
    expect(presentation.getView()).toBe('resolution-warning');
    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: true,
    });
    events.emit('game.resumed', undefined);

    expect(views).toEqual([
      'welcome',
      'hidden',
      'paused',
      'resolution-warning',
      'paused',
      'hidden',
    ]);
  });

  test('restores game over after resolution recovers following defeat', () => {
    const events = new EventBus<GameEvents>();
    const presentation = new MenuPresentation(events);
    events.emit('game.started', undefined);
    events.emit('game.paused', { blockers: ['minimum-resolution'] });
    events.emit('game.defeated', undefined);

    presentation.animate(3000);
    expect(presentation.getView()).toBe('game-over');

    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: false,
    });
    expect(presentation.getView()).toBe('resolution-warning');

    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: true,
    });
    expect(presentation.getView()).toBe('game-over');
  });

  test('shows game over after the existing delay', () => {
    const events = new EventBus<GameEvents>();
    const presentation = new MenuPresentation(events);
    const views: string[] = [];
    presentation.onViewChanged((view) => views.push(view));
    events.emit('game.defeated', undefined);

    presentation.animate(2999);
    expect(presentation.gameOverDisplayed()).toBe(false);
    presentation.animate(1);

    expect(presentation.getView()).toBe('game-over');
    expect(presentation.gameOverDisplayed()).toBe(true);
    expect(views[views.length - 1]).toBe('game-over');
  });
});
