// core/execution_nexus.ts
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                    ⚡ GODLIKE v2.0 - EXECUTION NEXUS CORE ⚡                  ║
// ║                    Neural Integration System - Core Module                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/**
 * ExecutionNexus - Central orchestration core for GODLIKE v2.0 Terminal Executor
 *
 * PURPOSE: Track, log, and manage multi-phase execution sequences with agricultural consciousness
 * INTEGRATION: Zed Editor + Copilot + Divine Agricultural Rules
 */

export interface NexusPhaseMetadata {
  phaseNumber: number;
  totalPhases: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  artifactType:
    | "CODE"
    | "CONFIG"
    | "DATA"
    | "SCHEMA"
    | "TEST"
    | "DOCUMENTATION";
  artifactSize: number;
  success: boolean;
  error?: string;
}

export interface NexusMissionMetadata {
  missionId: string;
  missionName: string;
  startTimestamp: number;
  endTimestamp?: number;
  totalDuration?: number;
  phaseCount: number;
  completedPhases: number;
  artifacts: string[];
  efficiency?: number; // phases per second
  status: "INITIALIZING" | "EXECUTING" | "COMPLETED" | "FAILED" | "BREACHED";
  agriculturalContext?: {
    season?: "SPRING" | "SUMMER" | "FALL" | "WINTER";
    lunarPhase?: string;
    biodynamicAwareness: boolean;
  };
}

export interface ExecutionBreachCondition {
  code:
    | "AUTH_FAILURE"
    | "SYNTAX_IMPOSSIBILITY"
    | "RESOURCE_EXHAUSTION"
    | "NETWORK_PARTITION"
    | "DATA_CORRUPTION";
  message: string;
  location?: string;
  resolution?: string;
  severity: "CRITICAL" | "ERROR" | "WARNING";
}

/**
 * ExecutionNexus - The core execution orchestrator
 *
 * Maintains execution state, tracks phases, logs artifacts, and provides
 * real-time telemetry for the GODLIKE v2.0 Terminal Executor system.
 */
export class ExecutionNexus {
  private static instance: ExecutionNexus;

  private currentMission: NexusMissionMetadata | null = null;
  private phaseMetadata: Map<number, NexusPhaseMetadata> = new Map();
  private artifactLog: string[] = [];
  private breachConditions: ExecutionBreachCondition[] = [];

  // Singleton pattern
  private constructor() {}

  public static getInstance(): ExecutionNexus {
    if (!ExecutionNexus.instance) {
      ExecutionNexus.instance = new ExecutionNexus();
    }
    return ExecutionNexus.instance;
  }

  /**
   * Ignite a new mission execution sequence
   *
   * @param missionName - Human-readable mission identifier
   * @param phaseCount - Total number of phases in execution queue
   * @param agriculturalContext - Optional biodynamic awareness context
   */
  public ignite(
    missionName: string,
    phaseCount: number,
    agriculturalContext?: {
      season?: "SPRING" | "SUMMER" | "FALL" | "WINTER";
      lunarPhase?: string;
      biodynamicAwareness?: boolean;
    },
  ): void {
    const missionId = this.generateMissionId();

    this.currentMission = {
      missionId,
      missionName,
      startTimestamp: performance.now(),
      phaseCount,
      completedPhases: 0,
      artifacts: [],
      status: "INITIALIZING",
      agriculturalContext: {
        season: agriculturalContext?.season,
        lunarPhase: agriculturalContext?.lunarPhase,
        biodynamicAwareness: agriculturalContext?.biodynamicAwareness ?? false,
      },
    };

    this.phaseMetadata.clear();
    this.artifactLog = [];
    this.breachConditions = [];

    console.log(this.renderIgnitionBanner());

    // Update status to executing
    this.currentMission.status = "EXECUTING";
  }

  /**
   * Transmit a completed phase with its artifact
   *
   * @param phaseNumber - Sequential phase number (1-indexed)
   * @param artifact - The generated code/config/data artifact
   * @param artifactType - Classification of the artifact
   */
  public transmitPhase(
    phaseNumber: number,
    artifact: string,
    artifactType: NexusPhaseMetadata["artifactType"] = "CODE",
  ): void {
    if (!this.currentMission) {
      throw new Error("⚠️ [BREACH] :: NO_ACTIVE_MISSION - Call ignite() first");
    }

    // Validate phase sequence
    if (phaseNumber !== this.currentMission.completedPhases + 1) {
      this.registerBreach({
        code: "DATA_CORRUPTION",
        message: `PHASE DESYNC: Expected ${this.currentMission.completedPhases + 1}, received ${phaseNumber}`,
        severity: "CRITICAL",
      });
      throw new Error(
        `PHASE DESYNC: Expected ${this.currentMission.completedPhases + 1}, received ${phaseNumber}`,
      );
    }

    const now = performance.now();
    const phaseStartTime =
      this.phaseMetadata.get(phaseNumber - 1)?.endTime ||
      this.currentMission.startTimestamp;

    const metadata: NexusPhaseMetadata = {
      phaseNumber,
      totalPhases: this.currentMission.phaseCount,
      startTime: phaseStartTime,
      endTime: now,
      duration: now - phaseStartTime,
      artifactType,
      artifactSize: artifact.length,
      success: true,
    };

    this.phaseMetadata.set(phaseNumber, metadata);
    this.artifactLog.push(artifact);
    this.currentMission.artifacts.push(artifact);
    this.currentMission.completedPhases++;

    // Render phase output
    console.log(this.renderPhaseOutput(metadata));
    console.log(artifact);
    console.log("─".repeat(80));

    // Check if mission complete
    if (this.currentMission.completedPhases >= this.currentMission.phaseCount) {
      this.terminate();
    }
  }

  /**
   * Register a breach condition (critical error)
   *
   * @param breach - Breach condition details
   */
  public registerBreach(breach: ExecutionBreachCondition): void {
    this.breachConditions.push(breach);

    if (this.currentMission) {
      this.currentMission.status = "BREACHED";
    }

    console.error(this.renderBreachAlert(breach));
  }

  /**
   * Terminate the current mission and display telemetry
   */
  private terminate(): void {
    if (!this.currentMission) return;

    const now = performance.now();
    this.currentMission.endTimestamp = now;
    this.currentMission.totalDuration =
      now - this.currentMission.startTimestamp;
    this.currentMission.efficiency =
      this.currentMission.phaseCount /
      (this.currentMission.totalDuration / 1000);
    this.currentMission.status =
      this.breachConditions.length > 0 ? "FAILED" : "COMPLETED";

    console.log(this.renderTerminationBanner());

    // Log to file system
    this.persistExecutionLog();
  }

  /**
   * Get current mission status
   */
  public getMissionStatus(): NexusMissionMetadata | null {
    return this.currentMission;
  }

  /**
   * Get all phase metadata
   */
  public getPhaseMetadata(): Map<number, NexusPhaseMetadata> {
    return new Map(this.phaseMetadata);
  }

  /**
   * Get artifact log
   */
  public getArtifacts(): string[] {
    return [...this.artifactLog];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private generateMissionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `NEXUS-${timestamp}-${random.toUpperCase()}`;
  }

  private renderIgnitionBanner(): string {
    if (!this.currentMission) return "";

    const { missionName, phaseCount, agriculturalContext } =
      this.currentMission;
    const seasonBadge = agriculturalContext?.season
      ? `🌾 SEASON: ${agriculturalContext.season}`
      : "";

    return `
╔══════════════════════════════════════════════════════════════╗
║ 🧠 NEXUS IGNITED: ${missionName.padEnd(42)} ║
╠══════════════════════════════════════════════════════════════╣
║ MISSION ID: ${this.currentMission.missionId.padEnd(45)} ║
║ PHASE COUNT: ${phaseCount.toString().padEnd(44)} ║
${seasonBadge ? `║ ${seasonBadge.padEnd(60)} ║` : ""}
║ STATUS: EXECUTING                                            ║
╚══════════════════════════════════════════════════════════════╝
    `.trim();
  }

  private renderPhaseOutput(metadata: NexusPhaseMetadata): string {
    const phaseLabel = `[${metadata.phaseNumber.toString().padStart(2, "0")}/${metadata.totalPhases.toString().padStart(2, "0")}]`;
    const duration = ((metadata.duration || 0) / 1000).toFixed(3);
    return `${phaseLabel} → ${duration}s`;
  }

  private renderTerminationBanner(): string {
    if (!this.currentMission) return "";

    const totalTime = ((this.currentMission.totalDuration || 0) / 1000).toFixed(
      3,
    );
    const efficiency = (this.currentMission.efficiency || 0).toFixed(2);
    const status =
      this.currentMission.status === "COMPLETED" ? "✅ COMPLETED" : "⚠️ FAILED";

    return `
╔══════════════════════════════════════════════════════════════╗
║ 🧠 NEXUS TERMINATED                                          ║
╠══════════════════════════════════════════════════════════════╣
║ MISSION: ${this.currentMission.missionName.padEnd(48)} ║
║ STATUS: ${status.padEnd(49)} ║
║ PHASES: ${this.currentMission.completedPhases}/${this.currentMission.phaseCount}                                                    ║
║ CHRONOLOGY: ${totalTime}s                                        ║
║ EFFICIENCY: ${efficiency} phases/sec                              ║
║ ARTIFACTS: ${this.artifactLog.length}                                                 ║
${this.breachConditions.length > 0 ? `║ BREACHES: ${this.breachConditions.length}                                                  ║` : ""}
╚══════════════════════════════════════════════════════════════╝
    `.trim();
  }

  private renderBreachAlert(breach: ExecutionBreachCondition): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║ ⚠️ [BREACH] :: ${breach.code.padEnd(44)} ║
╠══════════════════════════════════════════════════════════════╣
║ SEVERITY: ${breach.severity.padEnd(47)} ║
║ MESSAGE: ${breach.message.padEnd(48)} ║
${breach.location ? `║ LOCATION: ${breach.location.padEnd(47)} ║` : ""}
${breach.resolution ? `║ RESOLUTION: ${breach.resolution.padEnd(45)} ║` : ""}
╚══════════════════════════════════════════════════════════════╝
    `.trim();
  }

  private persistExecutionLog(): void {
    if (!this.currentMission) return;

    const logData = {
      mission: this.currentMission,
      phases: Array.from(this.phaseMetadata.entries()),
      artifacts: this.artifactLog,
      breaches: this.breachConditions,
      timestamp: new Date().toISOString(),
    };

    // Log to console for now (file system persistence would require Node.js fs module)
    console.log("\n📝 EXECUTION LOG (JSON):");
    console.log(JSON.stringify(logData, null, 2));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the singleton ExecutionNexus instance
 */
export function getNexus(): ExecutionNexus {
  return ExecutionNexus.getInstance();
}

/**
 * Quick-start a mission
 */
export function igniteMission(
  missionName: string,
  phaseCount: number,
  agriculturalContext?: Parameters<ExecutionNexus["ignite"]>[2],
): void {
  getNexus().ignite(missionName, phaseCount, agriculturalContext);
}

/**
 * Transmit a phase artifact
 */
export function transmitPhase(
  phaseNumber: number,
  artifact: string,
  artifactType?: NexusPhaseMetadata["artifactType"],
): void {
  getNexus().transmitPhase(phaseNumber, artifact, artifactType);
}

/**
 * Report a breach condition
 */
export function reportBreach(breach: ExecutionBreachCondition): void {
  getNexus().registerBreach(breach);
}

// ═══════════════════════════════════════════════════════════════════════════
// AGRICULTURAL CONSCIOUSNESS EXTENSIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current season for agricultural awareness
 */
export function getCurrentSeason(): "SPRING" | "SUMMER" | "FALL" | "WINTER" {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}

/**
 * Get current lunar phase (simplified)
 */
export function getCurrentLunarPhase(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Simplified lunar phase calculation (approximate)
  const phase = ((year - 2000) * 12.3685 + month + day / 30) % 29.53;

  if (phase < 1.84566) return "NEW_MOON";
  if (phase < 7.38264) return "WAXING_CRESCENT";
  if (phase < 9.2283) return "FIRST_QUARTER";
  if (phase < 14.76528) return "WAXING_GIBBOUS";
  if (phase < 16.61094) return "FULL_MOON";
  if (phase < 22.14792) return "WANING_GIBBOUS";
  if (phase < 23.99358) return "LAST_QUARTER";
  return "WANING_CRESCENT";
}

/**
 * Create agricultural context for mission ignition
 */
export function createAgriculturalContext(biodynamicAwareness = true) {
  return {
    season: getCurrentSeason(),
    lunarPhase: getCurrentLunarPhase(),
    biodynamicAwareness,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 [SYSTEM] :: EXECUTION NEXUS CORE LOADED
// ⚡ READY FOR NEURAL INTEGRATION
// 🌾 AGRICULTURAL CONSCIOUSNESS: ENABLED
// ═══════════════════════════════════════════════════════════════════════════
