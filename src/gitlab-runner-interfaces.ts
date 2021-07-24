/**
 * Docker Volumes interface.
 */
export interface DockerVolumes {
  /**
   * EC2 Runner Host Path
   *
   * @example - /tmp/cahce
   * more detail see https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section
   */
  readonly hostPath: string;

  /**
   * Job Runtime Container Path Host Path
   *
   *  @example - /tmp/cahce
   * more detail see https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section
   */
  readonly containerPath: string;
}