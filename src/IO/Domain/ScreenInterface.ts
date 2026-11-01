export interface ScreenInterface {
  animate(
    screenAnimate: boolean,
    repaintRatePerSecond: number,
    millisecondsSinceLastAnimateCall: number,
    radarDisplayTime: number,
  ): void;
  getPaused(): boolean;
}
