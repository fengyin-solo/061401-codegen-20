import { ref, computed } from 'vue'
import type {
  GameState,
  LogEntry,
  RandomEvent,
  ActionType,
  ActionEffect,
  UpgradeBranch,
  UpgradeEffects,
} from '@/types/game'
import { randomEvents } from '@/data/events'
import { branchUpgrades } from '@/data/upgrades'

const STORAGE_KEY_HIGH_SCORE = 'survival_game_high_score'
const STORAGE_KEY_BRANCH_HIGH_SCORE = 'survival_game_branch_high_score'
const BASE_MAX_STAT = 100

const actionEffects: Record<ActionType, ActionEffect> = {
  gatherWood: { health: -5, hunger: 5, thirst: 3, wood: 10, stone: 0 },
  gatherStone: { health: -8, hunger: 6, thirst: 4, wood: 0, stone: 8 },
  hunt: { health: 15, hunger: -20, thirst: 5, wood: -5, stone: 0 },
  drink: { health: 0, hunger: 2, thirst: -25, wood: -3, stone: 0 },
  rest: { health: 20, hunger: 8, thirst: 5, wood: -2, stone: 0 },
  fish: { health: -3, hunger: -15, thirst: -8, wood: -2, stone: 0 },
  mine: { health: -10, hunger: 8, thirst: 5, wood: 0, stone: 15 },
  craft: { health: -5, hunger: 4, thirst: 2, wood: -8, stone: -5 },
  scout: { health: -3, hunger: 5, thirst: 4, wood: 0, stone: 0 },
  trap: { health: 5, hunger: -15, thirst: 3, wood: -8, stone: -3 },
}

const actionNames: Record<ActionType, string> = {
  gatherWood: '采集木头',
  gatherStone: '采集石头',
  hunt: '打猎',
  drink: '喝水',
  rest: '休息',
  fish: '捕鱼',
  mine: '采矿',
  craft: '制作',
  scout: '侦察',
  trap: '设陷阱',
}

const actionDescriptions: Record<ActionType, string> = {
  gatherWood: '获得木材，消耗体力',
  gatherStone: '获得石头，消耗体力',
  hunt: '回复生命，增加饥饿，消耗木材',
  drink: '减少口渴，消耗木材烧水',
  rest: '大幅恢复生命，消耗木材取暖',
  fish: '减少饥饿和口渴，消耗木材',
  mine: '获得大量石头，消耗更多体力',
  craft: '加工资源，提升后续采集效率',
  scout: '探索周围，提高好事件概率',
  trap: '设置陷阱，获得食物和材料',
}

export function useGame() {
  const state = ref<GameState>({
    health: 80,
    hunger: 30,
    thirst: 30,
    wood: 10,
    stone: 5,
    turn: 0,
    isGameOver: false,
    logs: [],
    upgrades: {
      survival: 0,
      gathering: 0,
      hunting: 0,
    },
    maxHealth: BASE_MAX_STAT,
  })

  const highScore = ref<number>(0)
  const branchHighScores = ref<Record<UpgradeBranch, number>>({
    survival: 0,
    gathering: 0,
    hunting: 0,
  })
  let logIdCounter = 0

  const canAct = computed(() => !state.value.isGameOver)

  const totalUpgradeEffects = computed<UpgradeEffects>(() => {
    const effects: UpgradeEffects = {
      actionEfficiency: {},
      unlockActions: [],
      eventModifier: {
        goodChance: 0,
        badChance: 0,
        effectMultiplier: 1,
      },
      stats: {
        maxHealth: 0,
        healthRegenPerTurn: 0,
        hungerDecayReduction: 0,
        thirstDecayReduction: 0,
      },
      resourceMultiplier: {
        wood: 1,
        stone: 1,
      },
    }

    for (const branch of branchUpgrades) {
      const level = state.value.upgrades[branch.branch]
      for (let i = 0; i < level; i++) {
        const levelData = branch.levels[i]
        if (!levelData) continue

        if (levelData.effects.actionEfficiency) {
          for (const [action, eff] of Object.entries(levelData.effects.actionEfficiency)) {
            const current = effects.actionEfficiency![action as ActionType] || 1
            effects.actionEfficiency![action as ActionType] = current * eff!
          }
        }

        if (levelData.effects.unlockActions) {
          for (const action of levelData.effects.unlockActions) {
            if (!effects.unlockActions!.includes(action)) {
              effects.unlockActions!.push(action)
            }
          }
        }

        if (levelData.effects.eventModifier) {
          if (levelData.effects.eventModifier.goodChance) {
            effects.eventModifier!.goodChance! += levelData.effects.eventModifier.goodChance
          }
          if (levelData.effects.eventModifier.badChance) {
            effects.eventModifier!.badChance! += levelData.effects.eventModifier.badChance
          }
          if (levelData.effects.eventModifier.effectMultiplier) {
            effects.eventModifier!.effectMultiplier! *= levelData.effects.eventModifier.effectMultiplier
          }
        }

        if (levelData.effects.stats) {
          if (levelData.effects.stats.maxHealth) {
            effects.stats!.maxHealth! += levelData.effects.stats.maxHealth
          }
          if (levelData.effects.stats.healthRegenPerTurn) {
            effects.stats!.healthRegenPerTurn! += levelData.effects.stats.healthRegenPerTurn
          }
          if (levelData.effects.stats.hungerDecayReduction) {
            effects.stats!.hungerDecayReduction! += levelData.effects.stats.hungerDecayReduction
          }
          if (levelData.effects.stats.thirstDecayReduction) {
            effects.stats!.thirstDecayReduction! += levelData.effects.stats.thirstDecayReduction
          }
        }

        if (levelData.effects.resourceMultiplier) {
          if (levelData.effects.resourceMultiplier.wood) {
            effects.resourceMultiplier!.wood! *= levelData.effects.resourceMultiplier.wood
          }
          if (levelData.effects.resourceMultiplier.stone) {
            effects.resourceMultiplier!.stone! *= levelData.effects.resourceMultiplier.stone
          }
        }
      }
    }

    return effects
  })

  const maxHealth = computed(() => BASE_MAX_STAT + (totalUpgradeEffects.value.stats?.maxHealth || 0))

  const unlockedActions = computed<ActionType[]>(() => {
    const baseActions: ActionType[] = ['gatherWood', 'gatherStone', 'hunt', 'drink']
    const unlocked = totalUpgradeEffects.value.unlockActions || []
    return [...baseActions, ...unlocked]
  })

  const dominantBranch = computed<UpgradeBranch | null>(() => {
    const { survival, gathering, hunting } = state.value.upgrades
    const maxLevel = Math.max(survival, gathering, hunting)
    if (maxLevel === 0) return null

    let branches: UpgradeBranch[] = []
    if (survival === maxLevel) branches.push('survival')
    if (gathering === maxLevel) branches.push('gathering')
    if (hunting === maxLevel) branches.push('hunting')

    return branches.length === 1 ? branches[0] : null
  })

  function loadHighScores() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIGH_SCORE)
      if (saved) {
        highScore.value = parseInt(saved, 10) || 0
      }

      const savedBranch = localStorage.getItem(STORAGE_KEY_BRANCH_HIGH_SCORE)
      if (savedBranch) {
        branchHighScores.value = JSON.parse(savedBranch)
      }
    } catch (e) {
      highScore.value = 0
    }
  }

  function saveHighScores() {
    if (state.value.turn > highScore.value) {
      highScore.value = state.value.turn
      try {
        localStorage.setItem(STORAGE_KEY_HIGH_SCORE, String(highScore.value))
      } catch (e) {
        // ignore
      }
    }

    if (dominantBranch.value) {
      const branch = dominantBranch.value
      if (state.value.turn > branchHighScores.value[branch]) {
        branchHighScores.value[branch] = state.value.turn
        try {
          localStorage.setItem(STORAGE_KEY_BRANCH_HIGH_SCORE, JSON.stringify(branchHighScores.value))
        } catch (e) {
          // ignore
        }
      }
    }
  }

  function addLog(text: string, type: LogEntry['type'] = 'action') {
    state.value.logs.unshift({
      id: ++logIdCounter,
      text,
      type,
      turn: state.value.turn,
    })
    if (state.value.logs.length > 50) {
      state.value.logs.pop()
    }
  }

  function clampStat(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }

  function applyEffects(effects: ActionEffect, applyResourceMultiplier = false) {
    const multiplier = totalUpgradeEffects.value.resourceMultiplier || { wood: 1, stone: 1 }

    if (effects.health !== undefined) {
      state.value.health = clampStat(state.value.health + effects.health, 0, maxHealth.value)
    }
    if (effects.hunger !== undefined) {
      const hungerReduction = totalUpgradeEffects.value.stats?.hungerDecayReduction || 0
      let hungerChange = effects.hunger
      if (hungerChange > 0) {
        hungerChange = hungerChange * (1 - hungerReduction)
      }
      state.value.hunger = clampStat(state.value.hunger + hungerChange, 0, BASE_MAX_STAT)
    }
    if (effects.thirst !== undefined) {
      const thirstReduction = totalUpgradeEffects.value.stats?.thirstDecayReduction || 0
      let thirstChange = effects.thirst
      if (thirstChange > 0) {
        thirstChange = thirstChange * (1 - thirstReduction)
      }
      state.value.thirst = clampStat(state.value.thirst + thirstChange, 0, BASE_MAX_STAT)
    }
    if (effects.wood !== undefined) {
      let woodChange = effects.wood
      if (applyResourceMultiplier && woodChange > 0) {
        woodChange = woodChange * (multiplier.wood || 1)
      }
      state.value.wood = Math.max(0, state.value.wood + woodChange)
    }
    if (effects.stone !== undefined) {
      let stoneChange = effects.stone
      if (applyResourceMultiplier && stoneChange > 0) {
        stoneChange = stoneChange * (multiplier.stone || 1)
      }
      state.value.stone = Math.max(0, state.value.stone + stoneChange)
    }
  }

  function getModifiedActionEffects(action: ActionType): ActionEffect {
    const base = { ...actionEffects[action] }
    const efficiency = totalUpgradeEffects.value.actionEfficiency?.[action]

    if (efficiency && efficiency !== 1) {
      for (const key of Object.keys(base) as (keyof ActionEffect)[]) {
        if (base[key] !== undefined) {
          const value = base[key]!
          if (value > 0) {
            base[key] = Math.round(value * efficiency)
          } else if (value < 0) {
            base[key] = Math.round(value / efficiency)
          }
        }
      }
    }

    return base
  }

  function getRandomEvent(): RandomEvent {
    const goodEvents = randomEvents.filter((e) => e.type === 'good')
    const badEvents = randomEvents.filter((e) => e.type === 'bad')
    const neutralEvents = randomEvents.filter((e) => e.type === 'neutral')

    const goodChanceMod = totalUpgradeEffects.value.eventModifier?.goodChance || 0
    const badChanceMod = totalUpgradeEffects.value.eventModifier?.badChance || 0

    const baseGoodChance = 0.4
    const baseBadChance = 0.4
    const baseNeutralChance = 0.2

    let goodChance = Math.max(0.1, Math.min(0.7, baseGoodChance + goodChanceMod))
    let badChance = Math.max(0.1, Math.min(0.7, baseBadChance + badChanceMod))
    let neutralChance = Math.max(0, 1 - goodChance - badChance)

    const total = goodChance + badChance + neutralChance
    goodChance /= total
    badChance /= total
    neutralChance /= total

    const rand = Math.random()
    let eventPool: RandomEvent[]

    if (rand < goodChance) {
      eventPool = goodEvents
    } else if (rand < goodChance + badChance) {
      eventPool = badEvents
    } else {
      eventPool = neutralEvents
    }

    const index = Math.floor(Math.random() * eventPool.length)
    return eventPool[index]
  }

  function applyEventEffects(event: RandomEvent): RandomEvent {
    const multiplier = totalUpgradeEffects.value.eventModifier?.effectMultiplier || 1

    if (multiplier === 1) return event

    const modifiedEvent: RandomEvent = {
      ...event,
      effects: { ...event.effects },
    }

    for (const key of Object.keys(modifiedEvent.effects) as (keyof typeof modifiedEvent.effects)[]) {
      if (modifiedEvent.effects[key] !== undefined) {
        const val = modifiedEvent.effects[key]!
        modifiedEvent.effects[key] = Math.round(val * multiplier)
      }
    }

    return modifiedEvent
  }

  function checkGameOver() {
    if (state.value.health <= 0 || state.value.hunger >= BASE_MAX_STAT || state.value.thirst >= BASE_MAX_STAT) {
      state.value.isGameOver = true
      saveHighScores()
      addLog('你没能在荒野中生存下来...', 'system')
    }
  }

  function canPerformAction(action: ActionType): boolean {
    if (state.value.isGameOver) return false
    if (!unlockedActions.value.includes(action)) return false

    const effects = getModifiedActionEffects(action)
    if (effects.wood !== undefined && state.value.wood + effects.wood < 0) {
      return false
    }
    if (effects.stone !== undefined && state.value.stone + effects.stone < 0) {
      return false
    }
    return true
  }

  function performAction(action: ActionType) {
    if (!canPerformAction(action)) return

    const effects = getModifiedActionEffects(action)
    applyEffects(effects, true)
    state.value.turn++

    addLog(`第 ${state.value.turn} 回合：${actionNames[action]}`, 'action')

    const healthRegen = totalUpgradeEffects.value.stats?.healthRegenPerTurn || 0
    if (healthRegen > 0) {
      state.value.health = clampStat(state.value.health + healthRegen, 0, maxHealth.value)
    }

    const event = getRandomEvent()
    const modifiedEvent = applyEventEffects(event)
    applyEffects(modifiedEvent.effects)

    const eventLogType = event.type === 'good' ? 'good' : event.type === 'bad' ? 'bad' : 'event'
    addLog(modifiedEvent.text, eventLogType)

    checkGameOver()
  }

  function gatherWood() {
    performAction('gatherWood')
  }

  function gatherStone() {
    performAction('gatherStone')
  }

  function hunt() {
    performAction('hunt')
  }

  function drink() {
    performAction('drink')
  }

  function rest() {
    performAction('rest')
  }

  function fish() {
    performAction('fish')
  }

  function mine() {
    performAction('mine')
  }

  function craft() {
    performAction('craft')
  }

  function scout() {
    performAction('scout')
  }

  function trap() {
    performAction('trap')
  }

  function canUpgrade(branch: UpgradeBranch): boolean {
    if (state.value.isGameOver) return false
    const branchData = branchUpgrades.find((b) => b.branch === branch)
    if (!branchData) return false

    const currentLevel = state.value.upgrades[branch]
    if (currentLevel >= branchData.levels.length) return false

    const nextLevel = branchData.levels[currentLevel]
    return state.value.wood >= nextLevel.cost.wood && state.value.stone >= nextLevel.cost.stone
  }

  function upgradeBranch(branch: UpgradeBranch) {
    if (!canUpgrade(branch)) return

    const branchData = branchUpgrades.find((b) => b.branch === branch)
    if (!branchData) return

    const currentLevel = state.value.upgrades[branch]
    const nextLevel = branchData.levels[currentLevel]

    state.value.wood -= nextLevel.cost.wood
    state.value.stone -= nextLevel.cost.stone
    state.value.upgrades[branch] = currentLevel + 1

    addLog(`🔧 ${branchData.name}升级到 ${nextLevel.name}！`, 'good')

    if (nextLevel.effects.unlockActions && nextLevel.effects.unlockActions.length > 0) {
      const actionNamesStr = nextLevel.effects.unlockActions.map((a) => actionNames[a]).join('、')
      addLog(`✨ 解锁新行动：${actionNamesStr}`, 'good')
    }
  }

  function getNextUpgrade(branch: UpgradeBranch) {
    const branchData = branchUpgrades.find((b) => b.branch === branch)
    if (!branchData) return null

    const currentLevel = state.value.upgrades[branch]
    if (currentLevel >= branchData.levels.length) return null

    return branchData.levels[currentLevel]
  }

  function restart() {
    state.value = {
      health: 80,
      hunger: 30,
      thirst: 30,
      wood: 10,
      stone: 5,
      turn: 0,
      isGameOver: false,
      logs: [],
      upgrades: {
        survival: 0,
        gathering: 0,
        hunting: 0,
      },
      maxHealth: BASE_MAX_STAT,
    }
    logIdCounter = 0
    addLog('你醒来发现自己身处荒野中，需要想办法生存下去...', 'system')
  }

  loadHighScores()
  addLog('你醒来发现自己身处荒野中，需要想办法生存下去...', 'system')

  return {
    state,
    highScore,
    branchHighScores,
    canAct,
    canPerformAction,
    unlockedActions,
    totalUpgradeEffects,
    maxHealth,
    dominantBranch,
    actionNames,
    actionDescriptions,
    branchUpgrades,
    gatherWood,
    gatherStone,
    hunt,
    drink,
    rest,
    fish,
    mine,
    craft,
    scout,
    trap,
    canUpgrade,
    upgradeBranch,
    getNextUpgrade,
    restart,
  }
}
