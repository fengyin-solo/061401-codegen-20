<script setup lang="ts">
import type { ActionType } from '@/types/game'

interface ActionButton {
  type: ActionType
  label: string
  icon: string
  description: string
  bgClass: string
  hoverClass: string
}

interface Props {
  unlockedActions: ActionType[]
  actionEfficiency: Partial<Record<ActionType, number>>
  canPerformAction: (action: ActionType) => boolean
  disabled: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  gatherWood: []
  gatherStone: []
  hunt: []
  drink: []
  rest: []
  fish: []
  mine: []
  craft: []
  scout: []
  trap: []
}>()

const actionConfigs: Record<ActionType, Omit<ActionButton, 'type'>> = {
  gatherWood: {
    label: '采集木头',
    icon: '🪵',
    description: '获得木材，消耗体力',
    bgClass: 'bg-amber-900/40',
    hoverClass: 'hover:bg-amber-800/60',
  },
  gatherStone: {
    label: '采集石头',
    icon: '🪨',
    description: '获得石头，消耗体力',
    bgClass: 'bg-gray-700/40',
    hoverClass: 'hover:bg-gray-600/60',
  },
  hunt: {
    label: '打猎',
    icon: '🏹',
    description: '回复生命，增加饥饿',
    bgClass: 'bg-red-900/40',
    hoverClass: 'hover:bg-red-800/60',
  },
  drink: {
    label: '喝水',
    icon: '💧',
    description: '减少口渴，消耗木材',
    bgClass: 'bg-blue-900/40',
    hoverClass: 'hover:bg-blue-800/60',
  },
  rest: {
    label: '休息',
    icon: '😴',
    description: '大幅恢复生命',
    bgClass: 'bg-green-900/40',
    hoverClass: 'hover:bg-green-800/60',
  },
  fish: {
    label: '捕鱼',
    icon: '🐟',
    description: '减少饥饿和口渴',
    bgClass: 'bg-cyan-900/40',
    hoverClass: 'hover:bg-cyan-800/60',
  },
  mine: {
    label: '采矿',
    icon: '⛏️',
    description: '获得大量石头',
    bgClass: 'bg-stone-700/40',
    hoverClass: 'hover:bg-stone-600/60',
  },
  craft: {
    label: '制作',
    icon: '🔨',
    description: '加工资源提升效率',
    bgClass: 'bg-orange-900/40',
    hoverClass: 'hover:bg-orange-800/60',
  },
  scout: {
    label: '侦察',
    icon: '🔭',
    description: '探索周围环境',
    bgClass: 'bg-emerald-900/40',
    hoverClass: 'hover:bg-emerald-800/60',
  },
  trap: {
    label: '设陷阱',
    icon: '🪤',
    description: '设置陷阱获取食物',
    bgClass: 'bg-rose-900/40',
    hoverClass: 'hover:bg-rose-800/60',
  },
}

function getEfficiencyText(action: ActionType): string {
  const eff = props.actionEfficiency[action]
  if (!eff || eff === 1) return ''
  const percent = Math.round((eff - 1) * 100)
  return percent > 0 ? `+${percent}%` : `${percent}%`
}

function handleClick(action: ActionType) {
  if (props.disabled || !props.canPerformAction(action)) return
  switch (action) {
    case 'gatherWood':
      emit('gatherWood')
      break
    case 'gatherStone':
      emit('gatherStone')
      break
    case 'hunt':
      emit('hunt')
      break
    case 'drink':
      emit('drink')
      break
    case 'rest':
      emit('rest')
      break
    case 'fish':
      emit('fish')
      break
    case 'mine':
      emit('mine')
      break
    case 'craft':
      emit('craft')
      break
    case 'scout':
      emit('scout')
      break
    case 'trap':
      emit('trap')
      break
  }
}
</script>

<template>
  <div class="bg-game-card rounded-2xl p-6 border border-game-border shadow-xl">
    <h2 class="text-xl font-bold text-white mb-5 flex items-center gap-2">
      <span>⚡</span>
      <span>行动</span>
      <span class="text-xs text-gray-400 font-normal">({{ unlockedActions.length }} 个可用)</span>
    </h2>
    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="actionType in unlockedActions"
        :key="actionType"
        @click="handleClick(actionType)"
        :disabled="disabled || !canPerformAction(actionType)"
        :class="[
          actionConfigs[actionType].bgClass,
          'relative p-4 rounded-xl border border-game-border transition-all duration-200',
          'flex flex-col items-center justify-center gap-1.5 text-center',
          disabled || !canPerformAction(actionType)
            ? 'opacity-40 cursor-not-allowed'
            : [actionConfigs[actionType].hoverClass, 'hover:scale-[1.02] hover:shadow-lg cursor-pointer active:scale-[0.98]'],
        ]"
      >
        <span class="text-3xl">{{ actionConfigs[actionType].icon }}</span>
        <div class="flex items-center gap-1">
          <span class="text-white font-semibold text-sm">{{ actionConfigs[actionType].label }}</span>
          <span v-if="getEfficiencyText(actionType)" class="text-green-400 text-xs font-bold">
            {{ getEfficiencyText(actionType) }}
          </span>
        </div>
        <span class="text-gray-400 text-xs">{{ actionConfigs[actionType].description }}</span>
      </button>
    </div>
  </div>
</template>
