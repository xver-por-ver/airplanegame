export interface ScreenShakeInterface {
  animate(
    initialize: boolean,
    millisecondsSinceLastAnimateCall: number,
    shakeTime: number,
    t: number,
  ): void;
}
