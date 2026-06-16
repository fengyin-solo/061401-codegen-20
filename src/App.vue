<script setup lang="ts">
import { computed } from 'vue'
import StatusPanel from '@/components/StatusPanel.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import EventLog from '@/components/EventLog.vue'
import CampUpgrade from '@/components/CampUpgrade.vue'
import GameOverModal from '@/components/GameOverModal.vue'
import { useGame } from '@/composables/useGame'
import type { UpgradeBranch } from '@/types/game'

const {
  state,
  highScore,
  branchHighScores,
  canPerformAction,
  unlockedActions,
  totalUpgradeEffects,
  maxHealth,
  dominantBranch,
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
  restart,
} = useGame()

const isNewRecord = computed(() => state.value.turn >= highScore.value && state.value.turn > 0)

const actionEfficiency = computed(() => totalUpgradeEffects.value.actionEfficiency || {})

function handleUpgrade(branch: UpgradeBranch) {
  upgradeBranch(branch)
}

function getDominantBranchName(): string {
  if (!dominantBranch.value) return '均衡发展'
  const branch = branchUpgrades.find((b) => b.branch === dominantBranch.value)
  return branch ? branch.name : '均衡发展'
}

function getDominantBranchIcon(): string {
  if (!dominantBranch.value) return '⚖️'
  const branch = branchUpgrades.find((b) => b.branch === dominantBranch.value)
  return branch ? branch.icon : '⚖️'
}
</script>

<template>
  <div class="min-h-screen bg-game-bg text-white">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-green-900/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 py-6">
      <header class="text-center mb-6">
        <h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
          🏕️ 荒野生存
        </h1>
        <p class="text-gray-400">在恶劣的荒野中尽可能生存更久</p>
      </header>

      <div class="flex flex-wrap justify-center gap-4 mb-6">
        <div class="bg-game-card/80 backdrop-blur px-5 py-3 rounded-xl border border-game-border min-w-[120px] text-center">
          <span class="text-gray-400 text-sm">当前回合</span>
          <p class="text-2xl font-bold text-white tabular-nums">{{ state.turn }}</p>
        </div>
        <div class="bg-game-card/80 backdrop-blur px-5 py-3 rounded-xl border border-game-border min-w-[120px] text-center">
          <span class="text-gray-400 text-sm">最高纪录</span>
          <p class="text-2xl font-bold text-yellow-400 tabular-nums">🏆 {{ highScore }}</p>
        </div>
        <div class="bg-game-card/80 backdrop-blur px-5 py-3 rounded-xl border border-game-border min-w-[140px] text-center">
          <span class="text-gray-400 text-sm">当前流派</span>
          <p class="text-xl font-bold text-emerald-400 flex items-center justify-center gap-1">
            <span>{{ getDominantBranchIcon() }}</span>
            <span>{{ getDominantBranchName() }}</span>
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="space-y-5">
          <StatusPanel
            :health="state.health"
            :hunger="state.hunger"
            :thirst="state.thirst"
            :wood="state.wood"
            :stone="state.stone"
            :max-health="maxHealth"
          />
        </div>

        <div class="space-y-5">
          <ActionButtons
            :unlocked-actions="unlockedActions"
            :action-efficiency="actionEfficiency"
            :can-perform-action="canPerformAction"
            :disabled="state.isGameOver"
            @gather-wood="gatherWood"
            @gather-stone="gatherStone"
            @hunt="hunt"
            @drink="drink"
            @rest="rest"
            @fish="fish"
            @mine="mine"
            @craft="craft"
            @scout="scout"
            @trap="trap"
          />
        </div>

        <div class="space-y-5">
          <EventLog :logs="state.logs" />
        </div>
      </div>

      <div class="mt-5">
        <CampUpgrade
          :upgrades="state.upgrades"
          :branch-data="branchUpgrades"
          :wood="state.wood"
          :stone="state.stone"
          :disabled="state.isGameOver"
          :branch-high-scores="branchHighScores"
          @upgrade="handleUpgrade"
        />
      </div>

      <footer class="mt-6 text-center text-gray-500 text-sm">
        <p>💡 提示：生命值归零或饥饿/口渴值满格则游戏结束。升级营地解锁更多行动和加成！</p>
      </footer>
    </div>

    <GameOverModal
      :show="state.isGameOver"
      :final-turn="state.turn"
      :high-score="highScore"
      :is-new-record="isNewRecord"
      @restart="restart"
    />
  </div>
</template>
