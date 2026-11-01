export interface DashboardInterface {
  animate(
    animateScreen: boolean,
    millisecondsSinceLastAnimateCall: number,
  ): void;
  getPaused(): boolean;
  getRadarAnouncementDisplayTime(): number;
}
