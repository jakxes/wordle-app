/*jslint browser, node*/
import { ref, computed } from "vue";

const GAME_CONFIG = Object.freeze({
    MAX_ATTEMPTS: 6,
    WORD_LENGTH: 5,
    WORD_LIST_PATH: "/valid-wordle-words.txt"
});

export function useWordleGame() {
    const boardState = ref([]);
    const currentRowIndex = ref(0);
    const currentColIndex = ref(0);
    /** @type {import('vue').Ref<string[]>} */
    const allowedWords = ref([]);
    /** @type {import('vue').Ref<string>} */
    const targetWord = ref("");
    const targetLetters = computed(() => targetWord.value.split(""));

    const gameStatus = ref({
        won: false,
        over: false,
        message: "",
        showSnackbar: false
    });

    function setGameStatus(
        { won = false, over = false, message = "", showSnackbar = true }) {
        gameStatus.value = { won, over, message, showSnackbar };
    }

    async function loadAllowedWords () {
        try {
            const res = await fetch(GAME_CONFIG.WORD_LIST_PATH);
            if (!res.ok) {
                setGameStatus({ message: "Failed to load word list." });
                console.error("Bad response:", res.status);
                return;
            }
            const text = await res.text();
            allowedWords.value = text
                .split("\n")
                .map((word) => word.trim().toUpperCase())
                .filter((word) => word.length === GAME_CONFIG.WORD_LENGTH);

            targetWord.value = allowedWords.value
                [Math.floor(Math.random() * allowedWords.value.length)];
        } catch (error) {
            setGameStatus({ message: "Error loading word list." });
            console.error(error);
        }
    }

    function initializeBoard() {
        boardState.value = Array.from(
            { length: GAME_CONFIG.MAX_ATTEMPTS }, () =>
            Array.from({ length: GAME_CONFIG.WORD_LENGTH }, () => (
                { letter: "", status: "" }))
        );
    }

    async function resetGame() {
        initializeBoard();
        currentRowIndex.value = 0;
        currentColIndex.value = 0;
        setGameStatus({ message: "", showSnackbar: false });
        await loadAllowedWords();
    }

    function insertLetter(letter) {

        const row = currentRowIndex.value;
        const col = currentColIndex.value;

        if (!(/^[A-Z]$/).test(letter))  {
            return;
        }
        if (row >= GAME_CONFIG.MAX_ATTEMPTS || col >= GAME_CONFIG.WORD_LENGTH) {
            return;
        }

        boardState.value[row][col].letter = letter;
        currentColIndex.value += 1;

    }

    function removeLetter() {
        const row = currentRowIndex.value;
        const col = currentColIndex.value - 1;

        if (col < 0)  {
            return;
        }

        boardState.value[row][col] = { letter: "", status: "" };
        currentColIndex.value -= 1;
    }

    function validateGuess() {
        const guess = boardState.value[currentRowIndex.value]
            .map((t) => t.letter).join("");
        return allowedWords.value.includes(guess);
    }

    function evaluateGuess() {
        const guessTiles = boardState.value[currentRowIndex.value];
        const answerCopy = [...targetLetters.value];

        // Correct positions
        guessTiles.forEach(function(tile, i)  {
            if (tile.letter === targetLetters.value[i]) {
                tile.status = "correct";
                answerCopy[i] = null;
            }
        });

        // Present letters
        guessTiles.forEach(function (tile) {
        if (tile.status === "") {
            const index = answerCopy.indexOf(tile.letter);
            if (index !== -1) {
                tile.status = "present";
                answerCopy[index] = null;
            } else {
                tile.status = "absent";
            }
        }
    });
    }

    function handleGuessSubmit() {
        if (currentColIndex.value !== GAME_CONFIG.WORD_LENGTH) {
            return;
        }

        if (!validateGuess()) {
            setGameStatus({ message: "Invalid word." });
            return;
        }

        evaluateGuess();

        const correct = boardState.value[currentRowIndex.value]
            .every((tile) => tile.status === "correct");
        if (correct) {
            setGameStatus({ won: true, over: true, message: "You won!" });
            return;
        }

        currentRowIndex.value += 1;
        currentColIndex.value = 0;

        if (currentRowIndex.value >= GAME_CONFIG.MAX_ATTEMPTS) {
            setGameStatus(
                { over: true
                    , message: `Game Over. Word was: ${targetWord.value}`});
        }
    }

    return ({
        boardState,
        currentRowIndex,
        currentColIndex,
        gameStatus,
        insertLetter,
        removeLetter,
        handleGuessSubmit,
        resetGame,
        loadAllowedWords,
        initializeBoard
    });
}
