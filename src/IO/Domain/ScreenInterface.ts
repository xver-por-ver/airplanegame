import { FrameTiming } from '../../FrameTiming';

export interface ScreenInterface {
  animate(
    screenAnimate: boolean,
    frameTiming: FrameTiming,
    radarAnouncementDuration: number,
  ): void;
}
