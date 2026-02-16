export {};

declare global {
  interface CreepMemory {
    role: "harvester" | "upgrader" | "builder";
    working?: boolean;
  }

  interface Memory {
    bootstrapped?: boolean;
  }
}
