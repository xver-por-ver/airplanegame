export interface DashboardRadarInterface {
  animate(
    animateScreen: boolean,
    millisecondsSinceLastAnimateCall: number,
  ): void;
  getDisplayTime(): number;
}
