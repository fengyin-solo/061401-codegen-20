export type UpgradeBranch = 'survival' | 'gathering' | 'hunting'

export interface UpgradeLevel {
  level: number
  name: string
  description: string
  cost: {
    wood: number
    stone: number
  }
  effects: UpgradeEffects
}

export interface UpgradeEffects {
  actionEfficiency?: Partial<Record<ActionType, number>>
  unlockActions?: ActionType[]
  eventModifier?: {
    goodChance?: number
    badChance?: number
    effectMultiplier?: number
  }
  stats?: {
    maxHealth?: number
    healthRegenPerTurn?: number
    hungerDecayReduction?: number
    thirstDecayReduction?: number
  }
  resourceMultiplier?: {
    wood?: number
    stone?: number
  }
}

export interface BranchUpgrade {
  branch: UpgradeBranch
  name: string
  icon: string
  description: string
  color: string
  levels: UpgradeLevel[]
}

export interface GameState {
  health: number
  hunger: number
  thirst: number
  wood: number
  stone: number
  turn: number
  isGameOver: boolean
  logs: LogEntry[]
  upgrades: Record<UpgradeBranch, number>
  maxHealth: number
}

export interface LogEntry {
  id: number
  text: string
  type: 'action' | 'event' | 'system' | 'good' | 'bad'
  turn: number
}

export interface RandomEvent {
  id: string
  text: string
  type: 'good' | 'bad' | 'neutral'
  effects: {
    health?: number
    hunger?: number
    thirst?: number
    wood?: number
    stone?: number
  }
}

export type ActionType =
  | 'gatherWood'
  | 'gatherStone'
  | 'hunt'
  | 'drink'
  | 'rest'
  | 'fish'
  | 'mine'
  | 'craft'
  | 'scout'
  | 'trap'

export interface ActionEffect {
  health?: number
  hunger?: number
  thirst?: number
  wood?: number
  stone?: number
}
