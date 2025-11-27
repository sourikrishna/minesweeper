const boardEl = document.getElementById("board");
const mineCountEl = document.getElementById("mine-count");
const timerEl = document.getElementById("timer");
const resetBtn = document.getElementById("reset-btn");
const diffSelect = document.getElementById("difficulty");

let rows, cols, mines;
let board = [];
let revealed = 0;
let flagsLeft;
let gameOver = false;
let timer = 0;
let timerInt;
let firstClick = true;


function setDifficulty() {
  const d = diffSelect.value;
  if (d === "easy") [rows, cols, mines] = [9, 9, 10];
  if (d === "medium") [rows, cols, mines] = [16, 16, 40];
  if (d === "hard") [rows, cols, mines] = [16, 30, 99];
}


function createBoard() {
  board = [];
  for (let r = 0; r < rows; r++) {
    let row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        r, c,
        mine: false,
        revealed: false,
        flag: false,
        count: 0,
        el: null
      });
    }
    board.push(row);
  }
}


function placeMines(sr, sc) {
  let placed = 0;
  while (placed < mines) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine && !(r === sr && c === sc)) {
      board[r][c].mine = true;
      placed++;
    }
  }
}


function calculate() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nr = r + dr;
          let nc = c + dc;
          if (nr >= 0 && nc >= 0 && nr < rows && nc < cols) {
            if (board[nr][nc].mine) count++;
          }
        }
      }
      board[r][c].count = count;
    }
  }
}


function render() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 28px)`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      const div = document.createElement("div");
      div.className = "cell";

      
div.onclick = () => clickCell(cell);


div.oncontextmenu = e => {
  e.preventDefault();
  toggleFlag(cell);
};


let pressTimer;

div.addEventListener("touchstart", e => {
  e.preventDefault();
  pressTimer = setTimeout(() => {
    toggleFlag(cell);
  }, 450); 
});

div.addEventListener("touchend", () => {
  clearTimeout(pressTimer);
});


      cell.el = div;
      boardEl.appendChild(div);
    }
  }
}


function clickCell(cell) {
  if (cell.revealed || cell.flag || gameOver) return;

  if (firstClick) {
    placeMines(cell.r, cell.c);
    calculate();
    startTimer();
    firstClick = false;
  }

  if (cell.mine) {
    cell.el.classList.add("mine");
    endGame(false);
    return;
  }

  reveal(cell);
  checkWin();
}


function reveal(cell) {
  if (cell.revealed) return;
  cell.revealed = true;
  revealed++;
  cell.el.classList.add("revealed");

  if (cell.count > 0) {
    cell.el.textContent = cell.count;
    cell.el.classList.add("n" + cell.count);
  } else {
    flood(cell);
  }
}

function flood(cell) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      let nr = cell.r + dr;
      let nc = cell.c + dc;
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols) {
        const n = board[nr][nc];
        if (!n.revealed && !n.mine) reveal(n);
      }
    }
  }
}


function toggleFlag(cell) {
  if (cell.revealed || gameOver) return;
  cell.flag = !cell.flag;
  cell.el.textContent = cell.flag ? "🚩" : "";
  mineCountEl.textContent = (--flagsLeft).toString().padStart(3, "0");
}


function startTimer() {
  timerInt = setInterval(() => {
    timer++;
    timerEl.textContent = timer.toString().padStart(3, "0");
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInt);
}


function endGame(win) {
  gameOver = true;
  stopTimer();
  resetBtn.textContent = win ? "😎 You Win" : "💀 Game Over";

  board.flat().forEach(c => {
    if (c.mine) c.el.textContent = "💣";
  });
}


function checkWin() {
  if (revealed === rows * cols - mines) {
    endGame(true);
  }
}


function resetGame() {
  setDifficulty();
  createBoard();
  render();
  revealed = 0;
  flagsLeft = mines;
  gameOver = false;
  firstClick = true;
  timer = 0;
  timerEl.textContent = "000";
  mineCountEl.textContent = mines.toString().padStart(3, "0");
  resetBtn.textContent = "😃 New Game";
  stopTimer();
}

resetBtn.onclick = resetGame;
diffSelect.onchange = resetGame;
resetGame();
