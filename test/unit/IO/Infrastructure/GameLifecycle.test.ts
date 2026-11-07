import { describe, expect, test } from '@jest/globals';
import { GameEvents } from '../../../../src/IO/Domain/GameEventsInterface';
import { EventBus } from '../../../../src/IO/Infrastructure/EventBus';
import { GameLifecycle } from '../../../../src/IO/Infrastructure/GameLifecycle';

describe('GameLifecycle', () => {
  test('starts running when unblocked and publishes transitions only on change', () => {
    const events = new EventBus<GameEvents>();
    const lifecycle = new GameLifecycle(events);
    const transitions: string[] = [];
    events.on('game.started', () => transitions.push('started'));
    events.on('game.paused', () => transitions.push('paused'));
    events.on('game.resumed', () => transitions.push('resumed'));

    lifecycle.start();
    lifecycle.start();
    events.emit('game.userPauseChanged', { paused: true });
    events.emit('game.userPauseChanged', { paused: true });
    events.emit('game.userPauseChanged', { paused: false });

    expect(transitions).toEqual(['started', 'paused', 'resumed']);
  });

  test('publishes updated blockers while already paused', () => {
    const events = new EventBus<GameEvents>();
    const lifecycle = new GameLifecycle(events);
    const pauses: string[][] = [];
    events.on('game.paused', ({ blockers }) =>
      pauses.push(blockers),
    );

    lifecycle.start();
    events.emit('gameplay.holdChanged', { active: true, reason: 'base-hit' });
    events.emit('game.userPauseChanged', { paused: true });
    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: false,
    });

    expect(pauses).toEqual([
      ['gameplay-hold'],
      ['user-pause', 'gameplay-hold'],
      ['user-pause', 'minimum-resolution', 'gameplay-hold'],
    ]);
  });

  test('starts paused and resumes only after every blocker clears', () => {
    const events = new EventBus<GameEvents>();
    const lifecycle = new GameLifecycle(events);
    const transitions: string[] = [];
    events.on('game.started', () => transitions.push('started'));
    events.on('game.paused', ({ blockers }) =>
      transitions.push(`paused:${blockers.join(',')}`),
    );
    events.on('game.resumed', () => transitions.push('resumed'));

    events.emit('window.availabilityChanged', {
      focused: false,
      meetsMinimumResolution: false,
    });
    lifecycle.start();
    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: false,
    });
    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: true,
    });

    expect(transitions).toEqual([
      'started',
      'paused:window-blur,minimum-resolution',
      'paused:minimum-resolution',
      'resumed',
    ]);
  });
});
