import { describe, expect, jest, test } from '@jest/globals';
import { PlayerDom } from '../../../../src/Player/Infrastructure/Dom/PlayerDom';
import { EventBus } from '../../../../src/IO/Infrastructure/EventBus';
import { GameEvents } from '../../../../src/IO/Domain/GameEventsInterface';
import { PlayerControlPolicy } from '../../../../src/IO/Infrastructure/PlayerControlPolicy';

describe('PlayerControlPolicy', () => {
  test('centers the player and gates actions on lifecycle transitions', () => {
    const player = {
      fly: jest.fn(),
      fire: jest.fn(),
    } as unknown as PlayerDom;
    const events = new EventBus<GameEvents>();
    const policy = new PlayerControlPolicy(player, events, 1024, 658);

    expect(player.fly).toHaveBeenCalledWith(1024, 329, 658);
    policy.steer(200);
    policy.fire();
    expect(player.fly).toHaveBeenCalledTimes(1);
    expect(player.fire).not.toHaveBeenCalled();

    events.emit('game.started', undefined);
    policy.steer(200);
    policy.fire();
    events.emit('game.paused', { blockers: ['user-pause'] });
    policy.steer(250);
    policy.fire();
    events.emit('game.resumed', undefined);
    policy.fire();
    events.emit('game.defeated', undefined);
    policy.fire();

    expect(player.fly).toHaveBeenLastCalledWith(1024, 200, 658);
    expect(player.fire).toHaveBeenCalledTimes(2);
  });

  test('publishes only changed pause intent and toggles from local user state', () => {
    const player = { fly: jest.fn(), fire: jest.fn() } as unknown as PlayerDom;
    const events = new EventBus<GameEvents>();
    const policy = new PlayerControlPolicy(player, events, 1024, 658);
    const pauseChanges: boolean[] = [];
    events.on('game.userPauseChanged', ({ paused }) =>
      pauseChanges.push(paused),
    );

    policy.setUserPause(true);
    policy.setUserPause(true);
    policy.toggleUserPause();
    policy.toggleUserPause();

    expect(pauseChanges).toEqual([true, false, true]);
  });
});
