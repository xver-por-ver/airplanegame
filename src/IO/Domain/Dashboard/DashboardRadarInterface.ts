export interface DashboardRadarInterface {
  animate(
    animateScreen: boolean,
    millisecondsSinceLastAnimateCall: number,
  ): void;
  getPaused(): boolean;
  getDisplayTime(): number;
}
