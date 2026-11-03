export interface DashboardInterface {
  animate(
    animateScreen: boolean,
    millisecondsSinceLastAnimateCall: number,
  ): void;
  getRadarAnouncementDisplayTime(): number;
}
