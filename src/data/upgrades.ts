import type { BranchUpgrade } from '@/types/game'

export const branchUpgrades: BranchUpgrade[] = [
  {
    branch: 'survival',
    name: '生存营地',
    icon: '🏕️',
    description: '提升生存能力，解锁休息和捕鱼行动',
    color: 'green',
    levels: [
      {
        level: 1,
        name: '简易帐篷',
        description: '提高生命上限，减少饥饿消耗',
        cost: { wood: 15, stone: 5 },
        effects: {
          stats: {
            maxHealth: 20,
            hungerDecayReduction: 0.1,
          },
          eventModifier: {
            badChance: -0.1,
          },
        },
      },
      {
        level: 2,
        name: '篝火营地',
        description: '解锁休息行动，每回合恢复生命',
        cost: { wood: 30, stone: 15 },
        effects: {
          unlockActions: ['rest'],
          stats: {
            healthRegenPerTurn: 2,
            maxHealth: 10,
          },
          eventModifier: {
            goodChance: 0.1,
          },
        },
      },
      {
        level: 3,
        name: '木制小屋',
        description: '解锁捕鱼行动，大幅减少坏事件',
        cost: { wood: 60, stone: 30 },
        effects: {
          unlockActions: ['fish'],
          stats: {
            maxHealth: 20,
            thirstDecayReduction: 0.15,
          },
          eventModifier: {
            badChance: -0.15,
            effectMultiplier: 0.8,
          },
        },
      },
      {
        level: 4,
        name: '坚固堡垒',
        description: '全面提升生存能力，大幅提高好事件概率',
        cost: { wood: 100, stone: 80 },
        effects: {
          stats: {
            maxHealth: 30,
            healthRegenPerTurn: 3,
            hungerDecayReduction: 0.2,
            thirstDecayReduction: 0.2,
          },
          eventModifier: {
            goodChance: 0.2,
            badChance: -0.2,
          },
        },
      },
    ],
  },
  {
    branch: 'gathering',
    name: '采集营地',
    icon: '⛏️',
    description: '提升资源采集效率，解锁采矿和制作行动',
    color: 'amber',
    levels: [
      {
        level: 1,
        name: '工具制作',
        description: '提高木材和石头采集效率',
        cost: { wood: 10, stone: 10 },
        effects: {
          actionEfficiency: {
            gatherWood: 1.2,
            gatherStone: 1.2,
          },
          resourceMultiplier: {
            wood: 1.1,
            stone: 1.1,
          },
        },
      },
      {
        level: 2,
        name: '矿脉探索',
        description: '解锁采矿行动，石头获取大幅提升',
        cost: { wood: 25, stone: 20 },
        effects: {
          unlockActions: ['mine'],
          resourceMultiplier: {
            stone: 1.3,
          },
          eventModifier: {
            goodChance: 0.05,
          },
        },
      },
      {
        level: 3,
        name: '工艺工坊',
        description: '解锁制作行动，资源效率全面提升',
        cost: { wood: 50, stone: 40 },
        effects: {
          unlockActions: ['craft'],
          actionEfficiency: {
            gatherWood: 1.3,
            gatherStone: 1.3,
            mine: 1.2,
          },
          resourceMultiplier: {
            wood: 1.2,
            stone: 1.2,
          },
        },
      },
      {
        level: 4,
        name: '资源帝国',
        description: '采集效率达到巅峰，资源事件收益翻倍',
        cost: { wood: 90, stone: 70 },
        effects: {
          actionEfficiency: {
            gatherWood: 1.5,
            gatherStone: 1.5,
            mine: 1.4,
            craft: 1.3,
          },
          resourceMultiplier: {
            wood: 1.5,
            stone: 1.5,
          },
          eventModifier: {
            effectMultiplier: 1.5,
            goodChance: 0.1,
          },
        },
      },
    ],
  },
  {
    branch: 'hunting',
    name: '狩猎营地',
    icon: '🏹',
    description: '提升狩猎和战斗能力，解锁侦察和陷阱行动',
    color: 'red',
    levels: [
      {
        level: 1,
        name: '猎人训练',
        description: '提高打猎效率和生命回复',
        cost: { wood: 12, stone: 8 },
        effects: {
          actionEfficiency: {
            hunt: 1.3,
          },
          stats: {
            maxHealth: 10,
          },
        },
      },
      {
        level: 2,
        name: '侦察技能',
        description: '解锁侦察行动，提高好事件概率',
        cost: { wood: 20, stone: 15 },
        effects: {
          unlockActions: ['scout'],
          eventModifier: {
            goodChance: 0.15,
            badChance: -0.05,
          },
        },
      },
      {
        level: 3,
        name: '陷阱大师',
        description: '解锁陷阱行动，打猎效率大幅提升',
        cost: { wood: 45, stone: 25 },
        effects: {
          unlockActions: ['trap'],
          actionEfficiency: {
            hunt: 1.5,
            scout: 1.2,
          },
          eventModifier: {
            goodChance: 0.1,
            effectMultiplier: 1.2,
          },
        },
      },
      {
        level: 4,
        name: '荒野霸主',
        description: '狩猎达到巅峰，好事件概率大幅提升',
        cost: { wood: 80, stone: 60 },
        effects: {
          actionEfficiency: {
            hunt: 1.8,
            trap: 1.5,
            scout: 1.4,
          },
          stats: {
            maxHealth: 25,
          },
          eventModifier: {
            goodChance: 0.25,
            badChance: -0.15,
            effectMultiplier: 1.3,
          },
        },
      },
    ],
  },
]
