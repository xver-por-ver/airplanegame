export type GamePauseBlocker =
  'user-pause' | 'window-blur' | 'minimum-resolution' | 'gameplay-hold';

export type GameEvents = {
  'game.startRequested': undefined;
  'game.userPauseChanged': { paused: boolean };
  'window.availabilityChanged': {
    focused: boolean;
    meetsMinimumResolution: boolean;
  };
  'gameplay.holdChanged': { active: boolean; reason: 'base-hit' };
  'game.started': undefined;
  'game.paused': { blockers: GamePauseBlocker[] };
  'game.resumed': undefined;
  'game.defeated': undefined;
};
