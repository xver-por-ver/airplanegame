import {
  describe,
  expect,
  beforeEach,
  afterEach,
  test,
  jest,
} from '@jest/globals';
import { PlayerControlsDom } from '../../../../../src/IO/Infrastructure/Dom/PlayerControlsDom';
import { EventBus } from '../../../../../src/IO/Infrastructure/EventBus';
import { GameEvents } from '../../../../../src/IO/Domain/GameEventsInterface';
import { resetDocument } from '../../../../DomDocumentInit';

describe('PlayerControlsDom', () => {
  let canvas: HTMLCanvasElement;
  let screen: any;
  let player: any;
  let events: EventBus<GameEvents>;
  let startBtn: HTMLElement;
  let helpButton: HTMLElement;

  beforeEach(() => {
    canvas = document.getElementById('game') as HTMLCanvasElement;
    canvas.getBoundingClientRect = jest.fn(() => ({
      width: 300,
      height: 150,
      top: 10,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    })) as unknown as () => DOMRect;

    screen = { getCanvas: () => canvas };
    player = {
      fly: jest.fn(),
      fire: jest.fn(),
      defeated: jest.fn(() => false),
    };
    events = new EventBus<GameEvents>();

    startBtn = document.createElement('div');
    startBtn.id = 'gameStartButton';
    document.body.appendChild(startBtn);
    helpButton = document.getElementById('helpButton') as HTMLElement;

    new PlayerControlsDom(screen, player, events);
  });

  afterEach(() => {
    resetDocument();
    jest.clearAllMocks();
  });

  test('constructor calls player.fly with initial canvas center', () => {
    expect(player.fly).toHaveBeenCalledWith(1024, 329, 658);
  });

  test('uses integer canvas coordinates with fractional display bounds', () => {
    canvas.getBoundingClientRect = jest.fn(() => ({
      width: 300.5,
      height: 150.5,
      top: 10,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    })) as unknown as () => DOMRect;

    new PlayerControlsDom(screen, player, events);
    expect(player.fly).toHaveBeenLastCalledWith(1024, 329, 658);

    events.emit('game.started', undefined);
    canvas.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientY: 52 }),
    );
    expect(player.fly).toHaveBeenLastCalledWith(1024, 184, 658);
  });

  test('maps steering through the current canvas bounds after resize', () => {
    let rect = {
      width: 200,
      height: 100,
      top: 10,
      left: 0,
      bottom: 110,
      right: 200,
      x: 0,
      y: 10,
      toJSON: () => {},
    } as DOMRect;
    canvas.getBoundingClientRect = jest.fn(() => rect);
    new PlayerControlsDom(screen, player, events);

    events.emit('game.started', undefined);
    rect = {
      width: 400,
      height: 200,
      top: 20,
      left: 0,
      bottom: 220,
      right: 400,
      x: 0,
      y: 20,
      toJSON: () => {},
    } as DOMRect;
    canvas.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientY: 120 }),
    );

    expect(player.fly).toHaveBeenLastCalledWith(1024, 329, 658);
  });

  test('PLAY publishes a start request', () => {
    const startRequested = jest.fn();
    events.on('game.startRequested', startRequested);

    startBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(startRequested).toHaveBeenCalledWith(undefined);
    expect(player.fire).not.toHaveBeenCalled();
  });

  test('help controls publish explicit user-pause state changes', () => {
    const pauseChanges: boolean[] = [];
    events.on('game.userPauseChanged', ({ paused }) =>
      pauseChanges.push(paused),
    );

    helpButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    const helpCloseButton = document.createElement('a');
    helpCloseButton.id = 'helpCloseButton';
    document.body.appendChild(helpCloseButton);
    helpCloseButton.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );

    expect(pauseChanges).toEqual([true, false]);
  });

  test('mousedown elsewhere fires only while lifecycle allows gameplay', () => {
    events.emit('game.started', undefined);
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(player.fire).toHaveBeenCalledTimes(1);

    events.emit('game.paused', { blockers: ['window-blur'] });
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(player.fire).toHaveBeenCalledTimes(1);
  });

  test('Shift fires and mouse movement steers only while gameplay can run', () => {
    events.emit('game.started', undefined);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
    canvas.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientY: 52 }),
    );

    expect(player.fire).toHaveBeenCalledTimes(1);
    expect(player.fly).toHaveBeenLastCalledWith(1024, 184, 658);

    events.emit('game.paused', { blockers: ['user-pause'] });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
    expect(player.fire).toHaveBeenCalledTimes(1);
  });

  test('does not emit when the user-pause state is unchanged', () => {
    const pauseChanges: boolean[] = [];
    events.on('game.userPauseChanged', ({ paused }) =>
      pauseChanges.push(paused),
    );

    helpButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    helpButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(pauseChanges).toEqual([true]);
  });

  test('P toggles an explicit user-pause state', () => {
    const pauseChanges: boolean[] = [];
    events.on('game.userPauseChanged', ({ paused }) =>
      pauseChanges.push(paused),
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));

    expect(pauseChanges).toEqual([true, false]);
  });
});
