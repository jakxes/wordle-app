<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import Tile from '@/components/Tile.vue'
import { useWordleGame } from '@/scripts/useWordleGame.js'

const {
  boardState,
  gameStatus,
  insertLetter,
  removeLetter,
  handleGuessSubmit,
  resetGame,
  loadAllowedWords,
  initializeBoard,
} = useWordleGame()


function handleKey(event) {
  if (gameStatus.value.over || !event.key) return

  const key = event.key.toUpperCase()
  if (/^[A-Z]$/.test(key)) {
    insertLetter(key)
  } else if (key === 'BACKSPACE') {
    removeLetter()
  } else if (key === 'ENTER') {
    handleGuessSubmit()
  }
}

onMounted(async () => {
  await loadAllowedWords()
  initializeBoard()
  window.addEventListener('keydown', handleKey)
})


onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey)
})
</script>


<template>
  <h1 class="text-h1 wordle-title text-center mt-3">Wordle</h1>
  <div class="board">
    <div v-for="(row, rowIndex) in boardState" :key="rowIndex" class="row">
      <Tile
          v-for="(tile, colIndex) in row"
          :key="colIndex"
          :letter="tile.letter"
          :status="tile.status"/>
    </div>
  </div>

  <v-snackbar
      v-model="gameStatus.showSnackbar"
      timeout="3000"
      color="indigo darken-3"
      multi-line>
    {{ gameStatus.message }}
    <template v-slot:actions>
      <v-btn
          v-if="gameStatus.over"
          text
          color="white"
          @click="resetGame">
        Play Again
      </v-btn>
      <v-btn
          text
          color="white"
          @click="gameStatus.showSnackbar = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>


<style scoped>
.board {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  margin-top: 50px;
}

.row {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.wordle-title {
  text-align: center;
  margin-top: 12px;
}
</style>
