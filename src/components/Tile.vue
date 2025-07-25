<script setup>
const props = defineProps({
  letter: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    validator: s => ['correct', 'present', 'absent', ''].includes(s),
    required: true,
  },
})
</script>

<template>
  <v-sheet
      class="wordle-tile"
      elevation="3"
      rounded
      :class="[
      { filled: letter !== '' },
      {
        'wordle-tile-green': status === 'correct',
        'wordle-tile-yellow': status === 'present',
        'wordle-tile-gray': status === 'absent',
      }
    ]"
  >
    <transition name="pop">
      <span v-if="letter" class="letter" role="presentation">{{ letter }}</span>
    </transition>
  </v-sheet>
</template>

<style scoped>
.wordle-tile {
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #121212;
  font-family: 'Fira Code', 'Roboto Mono', monospace;
  font-size: 2.5rem;
  border: 2px solid #ccc;
  transition: background-color 0.3s, border-color 0.3s;
}

.wordle-tile.filled {
  border-color: #999;
  background-color: #1e1e1e;
}

.wordle-tile.wordle-tile-green {
  background-color: green;
  border: none;
}

.wordle-tile.wordle-tile-yellow {
  background-color: gold;
  border: none;
}

.wordle-tile.wordle-tile-gray {
  background-color: #333;
  border: none;
}

.letter {
  animation: popIn 0.2s ease;
}

@keyframes popIn {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
