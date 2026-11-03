export class FrameTiming {
  private constructor(
    public readonly millisecondsSincePreviousFrame: number,
    public readonly framesPerSecond: number,
  ) {}

  public static between(
    timestamp: number,
    previousTimestamp: number,
  ): FrameTiming {
    const millisecondsSincePreviousFrame = Math.round(
      timestamp - previousTimestamp,
    );
    const framesPerSecond =
      0 === millisecondsSincePreviousFrame
        ? 0
        : Math.round(1000 / millisecondsSincePreviousFrame);

    return new FrameTiming(millisecondsSincePreviousFrame, framesPerSecond);
  }
}
