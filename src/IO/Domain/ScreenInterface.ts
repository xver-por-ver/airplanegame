export interface ScreenInterface {
  animate(
    screenAnimate: boolean,
    repaintRatePerSecond: number,
    millisecondsSinceLastAnimateCall: number,
    radarAnouncementDuration: number,
  ): void;
}
