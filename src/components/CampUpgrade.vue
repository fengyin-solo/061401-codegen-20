<script setup lang="ts">
import type { UpgradeBranch, BranchUpgrade, UpgradeLevel } from '@/types/game'

interface Props {
  upgrades: Record<UpgradeBranch, number>
  branchData: BranchUpgrade[]
  wood: number
  stone: number
  disabled: boolean
  branchHighScores: Record<UpgradeBranch, number>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  upgrade: [branch: UpgradeBranch]
}>()

function getColorClasses(color: string, isActive: boolean) {
  const colorMap: Record<string, { bg: string; border: string; text: string; hover: string }> = {
    green: {
      bg: isActive ? 'bg-green-900/40' : 'bg-green-900/20',
      border: isActive ? 'border-green-500/60' : 'border-green-900/40',
      text: 'text-green-400',
      hover: 'hover:bg-green-800/40',
    },
    amber: {
      bg: isActive ? 'bg-amber-900/40' : 'bg-amber-900/20',
      border: isActive ? 'border-amber-500/60' : 'border-amber-900/40',
      text: 'text-amber-400',
      hover: 'hover:bg-amber-800/40',
    },
    red: {
      bg: isActive ? 'bg-red-900/40' : 'bg-red-900/20',
      border: isActive ? 'border-red-500/60' : 'border-red-900/40',
      text: 'text-red-400',
      hover: 'hover:bg-red-800/40',
    },
  }
  return colorMap[color] || colorMap.green
}

function getCurrentLevel(branch: UpgradeBranch): number {
  return props.upgrades[branch]
}

function getNextLevel(branch: UpgradeBranch): UpgradeLevel | null {
  const branchInfo = props.branchData.find((b) => b.branch === branch)
  if (!branchInfo) return null
  const currentLevel = props.upgrades[branch]
  if (currentLevel >= branchInfo.levels.length) return null
  return branchInfo.levels[currentLevel]
}

function canUpgrade(branch: UpgradeBranch): boolean {
  if (props.disabled) return false
  const next = getNextLevel(branch)
  if (!next) return false
  return props.wood >= next.cost.wood && props.stone >= next.cost.stone
}

function isMaxLevel(branch: UpgradeBranch): boolean {
  const branchInfo = props.branchData.find((b) => b.branch === branch)
  if (!branchInfo) return true
  return props.upgrades[branch] >= branchInfo.levels.length
}

function getBranchHighScore(branch: UpgradeBranch): number {
  return props.branchHighScores[branch] || 0
}

function handleUpgrade(branch: UpgradeBranch) {
  if (canUpgrade(branch)) {
    emit('upgrade', branch)
  }
}
</script>

<template>
  <div class="bg-game-card rounded-2xl p-6 border border-game-border shadow-xl">
    <h2 class="text-xl font-bold text-white mb-5 flex items-center gap-2">
      <span>🏕️</span>
      <span>营地升级</span>
    </h2>
    <div class="space-y-4">
      <div
        v-for="branch in branchData"
        :key="branch.branch"
        :class="[
          getColorClasses(branch.color, getCurrentLevel(branch.branch) > 0).bg,
          getColorClasses(branch.color, getCurrentLevel(branch.branch) > 0).border,
          'rounded-xl p-4 border transition-all duration-200',
        ]"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">{{ branch.icon }}</span>
            <div>
              <h3 :class="[getColorClasses(branch.color, true).text, 'font-bold text-sm']">
                {{ branch.name }}
              </h3>
              <p class="text-gray-400 text-xs">等级 {{ getCurrentLevel(branch.branch) }} / {{ branch.levels.length }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-yellow-400 text-xs">🏆 分支纪录</p>
            <p class="text-yellow-300 font-bold text-sm">{{ getBranchHighScore(branch.branch) }} 回合</p>
          </div>
        </div>

        <p class="text-gray-300 text-xs mb-3">{{ branch.description }}</p>

        <div class="flex gap-1 mb-3">
          <div
            v-for="(level, idx) in branch.levels"
            :key="idx"
            :class="[
              'flex-1 h-2 rounded-full',
              idx < getCurrentLevel(branch.branch)
                ? getColorClasses(branch.color, true).text.replace('text-', 'bg-')
                : 'bg-gray-700/50',
            ]"
          ></div>
        </div>

        <div v-if="!isMaxLevel(branch.branch)" class="space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">下一级: {{ getNextLevel(branch.branch)?.name }}</span>
          </div>
          <p class="text-gray-400 text-xs">{{ getNextLevel(branch.branch)?.description }}</p>
          <div class="flex items-center justify-between">
            <div class="flex gap-3 text-xs">
              <span :class="wood >= (getNextLevel(branch.branch)?.cost.wood || 0) ? 'text-amber-400' : 'text-red-400'">
                🪵 {{ getNextLevel(branch.branch)?.cost.wood }}
              </span>
              <span :class="stone >= (getNextLevel(branch.branch)?.cost.stone || 0) ? 'text-gray-300' : 'text-red-400'">
                🪨 {{ getNextLevel(branch.branch)?.cost.stone }}
              </span>
            </div>
            <button
              @click="handleUpgrade(branch.branch)"
              :disabled="!canUpgrade(branch.branch)"
              :class="[
                getColorClasses(branch.color, canUpgrade(branch.branch)).hover,
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                canUpgrade(branch.branch)
                  ? `${getColorClasses(branch.color, true).bg} border ${getColorClasses(branch.color, true).border} text-white cursor-pointer hover:scale-105 active:scale-95`
                  : 'bg-gray-700/30 border border-gray-600/30 text-gray-500 cursor-not-allowed',
              ]"
            >
              升级
            </button>
          </div>
        </div>

        <div v-else class="text-center py-2">
          <span :class="[getColorClasses(branch.color, true).text, 'text-sm font-medium']">
            ✨ 已达最高等级
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
