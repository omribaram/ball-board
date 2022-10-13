const WALL = 'WALL'
const FLOOR = 'FLOOR'
const PORTAL = 'PORTAL'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = 'gamer.png'
const BALL_IMG = 'ball.png'
const GLUE_IMG = 'candy.png'
const BALL_COLLCET = new Audio('aud/ball.mp3')

const gIntervals = {
  ball: null,
  glue: null,
  stopwatch: null,
}

var gBoard
var gGamerPos
var gGlueTimeout
var gBallCount
var gCollectedBallCount
var isGlued

function initGame() {
  gBoard = buildBoard(10, 12)
  isGlued = false
  gBallCount = 0
  gCollectedBallCount = 0
  renderBoard(gBoard)
  document.querySelector('.game-over').classList.remove('shown')
  document.querySelector('.collected-balls').innerText = gCollectedBallCount
  document.querySelector('.ball-count').innerText = gBallCount
  startBallInterval()
  gIntervals.glue = setInterval(addGlue, 5000)
  startStopwatch()
}

function buildBoard(rows, cols) {
  const board = []

  for (var i = 0; i < rows; i++) {
    const row = []
    for (var j = 0; j < cols; j++) {
      const cell = { type: FLOOR, gameElement: null }

      if (i === 0 || i === rows - 1 || j === 0 || j === cols - 1) {
        if (i === rows / 2 || j === cols / 2) cell.type = PORTAL
        else cell.type = WALL
      }
      row.push(cell)
    }
    board.push(row)
  }

  gGamerPos = getEmptyCell(board)
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
  return board
}

function renderBoard(board) {
  var strHTML = ''

  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[i].length; j++) {
      const currCell = board[i][j]
      const className = getClassName({ i, j }, currCell.type)

      strHTML += `<td class="cell ${className}" onclick="moveTo(${i},${j})"></td>`
    }
    strHTML += '</tr>'
  }

  document.querySelector('.board').innerHTML = strHTML
  renderCell(gGamerPos, GAMER_IMG)
}

function moveTo(i, j) {
  const targetCell = gBoard[i][j]
  const iAbsDiff = Math.abs(i - gGamerPos.i)
  const jAbsDiff = Math.abs(j - gGamerPos.j)
  const isAllowed = (iAbsDiff === 1 && !jAbsDiff) || (jAbsDiff === 1 && !iAbsDiff)

  if (targetCell.type === WALL || isGlued || !isAllowed) return

  if (targetCell.type === PORTAL) {
    if (i === gBoard.length / 2) j = j === 0 ? gBoard[0].length - 2 : 1
    else i = i === 0 ? gBoard.length - 2 : 1
  }

  switch (targetCell.gameElement) {
    case BALL:
      gBallCount--
      gCollectedBallCount++
      if (gBallCount === 0) victory()
      document.querySelector('.collected-balls').innerText = gCollectedBallCount
      document.querySelector('.ball-count').innerText = gBallCount
      BALL_COLLCET.play()
      break
    case GLUE:
      isGlued = true
      setTimeout(() => {
        isGlued = false
      }, 3000)
      clearTimeout(gGlueTimeout)
      break
  }

  gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
  renderCell(gGamerPos, '')

  gGamerPos.i = i
  gGamerPos.j = j
  gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
  renderCell(gGamerPos, GAMER_IMG)
}

function renderCell(pos, value) {
  document.querySelector(`.cell-${pos.i}-${pos.j}`).innerHTML = value ? `<img src="img/${value}"/>` : ''
}

function victory() {
  isGlued = true
  clearInterval(gIntervals.ball)
  clearInterval(gIntervals.glue)
  clearInterval(gIntervals.stopwatch)
  document.querySelector('.game-over').classList.add('shown')
}

function addGlue() {
  const cellPos = getEmptyCell()
  if (!cellPos) return
  gBoard[cellPos.i][cellPos.j].gameElement = GLUE
  renderCell(cellPos, GLUE_IMG)
  gGlueTimeout = setTimeout(removeGlue, 3000, cellPos)
}

function removeGlue(gluePos, currEl = { type: FLOOR, gameElement: null }) {
  gBoard[gluePos.i][gluePos.j].gameElement = currEl.gameElement
  renderCell(gluePos, '')
}

function addBall() {
  const emptyCell = getEmptyCell()
  if (!emptyCell) return
  gBoard[emptyCell.i][emptyCell.j].gameElement = BALL
  gBallCount++
  renderCell(emptyCell, BALL_IMG)
  document.querySelector('.ball-count').innerText = gBallCount
}

function handleKey(event) {
  const i = gGamerPos.i
  const j = gGamerPos.j

  switch (event.key) {
    case 'ArrowLeft':
      if (j !== 0) moveTo(i, j - 1)
      else moveTo(i, gBoard[0].length - 2)
      break
    case 'ArrowRight':
      if (j !== gBoard[0].length - 1) moveTo(i, j + 1)
      else moveTo(i, 0)
      break
    case 'ArrowUp':
      if (i !== 0) moveTo(i - 1, j)
      else moveTo(gBoard.length - 1, j)
      break
    case 'ArrowDown':
      if (i !== gBoard.length - 1) moveTo(i + 1, j)
      else moveTo(0, j)
      break
  }
}

function getEmptyCell(board = gBoard) {
  const emptyCells = []

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      const currCell = board[i][j]
      if (currCell.type === FLOOR && currCell.gameElement === null) emptyCells.push({ i, j })
    }
  }

  return emptyCells[getRandomInt(0, emptyCells.length - 1)]
}

function getClassName(pos, type) {
  const className = `cell-${pos.i}-${pos.j} ${type === FLOOR ? 'floor' : type === WALL ? 'wall' : 'portal'}`
  return className
}

function startStopwatch() {
  const startTime = Date.now()
  gIntervals.stopwatch = setInterval(() => {
    const elapsedTime = (Date.now() - startTime) / 1000
    document.querySelector('.stopwatch span').innerText = elapsedTime.toFixed(3)
  }, 31)
}

function startBallInterval(speed = 1000) {
  gIntervals.ball = setInterval(() => {
    addBall()
    if (gBallCount % 15 === 0) {
      clearInterval(gIntervals.ball)
      startBallInterval(1000 - gBallCount * 10)
      console.log(1000 - gBallCount * 10)
    }
  }, speed)
}
