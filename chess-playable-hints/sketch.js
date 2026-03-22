/**
 * Playable chess: White & Black, light board, configurable-ply hint engine,
 * heuristic eval panel, hints toggle, board flips so the side to move
 * always sits at the bottom.
 *
 * Piece SVGs: Lichess “cburnett” set (bundled under pieces/), from
 * https://github.com/lichess-org/lila/tree/master/public/piece/cburnett
 */

const PIECE_VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

const PIECE_SVG = {
  P: 'wP',
  N: 'wN',
  B: 'wB',
  R: 'wR',
  Q: 'wQ',
  K: 'wK',
  p: 'bP',
  n: 'bN',
  b: 'bB',
  r: 'bR',
  q: 'bQ',
  k: 'bK',
};
const MATE_SCORE = 1e6;
/** Negamax plies for hints (root + replies). Higher = stronger, slower. */
const HINT_SEARCH_DEPTH = 3;

// Pawn PST: from white's view (row 7 = promotion); higher = better for that pawn
const PST_P = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
const PST_N = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

let board;
let turn; // 'w' | 'b'
let ep; // { r, c } or null
let castle; // { wK, wQ, bK, bQ }
let selected;
let legalForSelected;
let showHints = true;
let bestHint; // { primary, secondary?, lines }
let statusMsg = '';
let cell;
let boardOriginX, boardOriginY;
let uiH = 120;
let pieceImgs = {};

function preload() {
  for (const ch of Object.keys(PIECE_SVG)) {
    const id = PIECE_SVG[ch];
    pieceImgs[ch] = loadImage(`pieces/${id}.svg`);
  }
}

function initialBoard() {
  const rows = [
    'rnbqkbnr',
    'pppppppp',
    '        ',
    '        ',
    '        ',
    '        ',
    'PPPPPPPP',
    'RNBQKBNR',
  ];
  return rows.map((s) => s.split(''));
}

function cloneBoard(b) {
  return b.map((row) => row.slice());
}

function pieceColor(ch) {
  if (!ch || ch === ' ') return null;
  return ch === ch.toUpperCase() ? 'w' : 'b';
}

function opponent(c) {
  return c === 'w' ? 'b' : 'w';
}

function findKing(b, color) {
  const k = color === 'w' ? 'K' : 'k';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) if (b[r][c] === k) return { r, c };
  return null;
}

function squareAttacked(b, tr, tc, by) {
  const enemyP = by === 'w' ? 'P' : 'p';
  const pr = by === 'w' ? -1 : 1;
  for (const dc of [-1, 1]) {
    const r = tr - pr,
      c = tc - dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r][c] === enemyP) return true;
  }
  const kn = by === 'w' ? 'N' : 'n';
  const kr = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];
  for (const [dr, ddc] of kr) {
    const r = tr + dr,
      c = tc + ddc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r][c] === kn) return true;
  }
  const dirs = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dr, dc] of dirs) {
    let r = tr + dr,
      c = tc + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const ch = b[r][c];
      if (ch === ' ' || !ch) {
        r += dr;
        c += dc;
        continue;
      }
      const col = pieceColor(ch);
      if (col !== by) break;
      const t = ch.toLowerCase();
      const diag = dr !== 0 && dc !== 0;
      const orth = dr === 0 || dc === 0;
      if (t === 'q') return true;
      if (t === 'b' && diag) return true;
      if (t === 'r' && orth) return true;
      break;
    }
  }
  const king = by === 'w' ? 'K' : 'k';
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const r = tr + dr,
        c = tc + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r][c] === king) return true;
    }
  return false;
}

function inCheck(b, color) {
  const k = findKing(b, color);
  if (!k) return true;
  return squareAttacked(b, k.r, k.c, opponent(color));
}

function addMove(moves, fr, fc, tr, tc, extra = {}) {
  moves.push({ fr, fc, tr, tc, ...extra });
}

function pseudoLegalMoves(b, color, epSq, cast) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const ch = b[r][c];
      if (!ch || ch === ' ') continue;
      if (pieceColor(ch) !== color) continue;
      const t = ch.toLowerCase();
      if (t === 'p') {
        const dir = color === 'w' ? -1 : 1;
        const start = color === 'w' ? 6 : 1;
        const nr = r + dir;
        if (nr >= 0 && nr < 8 && b[nr][c] === ' ') {
          if (nr === 0 || nr === 7) addMove(moves, r, c, nr, c, { promo: 'q' });
          else addMove(moves, r, c, nr, c);
          if (r === start && b[r + 2 * dir][c] === ' ')
            addMove(moves, r, c, r + 2 * dir, c);
        }
        for (const dc of [-1, 1]) {
          const nc = c + dc;
          if (nc < 0 || nc > 7 || nr < 0 || nr > 7) continue;
          const target = b[nr][nc];
          if (target && target !== ' ' && pieceColor(target) !== color) {
            if (nr === 0 || nr === 7) addMove(moves, r, c, nr, nc, { promo: 'q' });
            else addMove(moves, r, c, nr, nc);
          }
          if (
            epSq &&
            epSq.r === nr &&
            epSq.c === nc &&
            (!target || target === ' ')
          ) {
            addMove(moves, r, c, nr, nc, { ep: true });
          }
        }
      } else if (t === 'n') {
        const jumps = [
          [-2, -1],
          [-2, 1],
          [-1, -2],
          [-1, 2],
          [1, -2],
          [1, 2],
          [2, -1],
          [2, 1],
        ];
        for (const [dr, dc] of jumps) {
          const tr = r + dr,
            tc = c + dc;
          if (tr < 0 || tr > 7 || tc < 0 || tc > 7) continue;
          const target = b[tr][tc];
          if (!target || target === ' ' || pieceColor(target) !== color)
            addMove(moves, r, c, tr, tc);
        }
      } else if (t === 'k') {
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const tr = r + dr,
              tc = c + dc;
            if (tr < 0 || tr > 7 || tc < 0 || tc > 7) continue;
            const target = b[tr][tc];
            if (!target || target === ' ' || pieceColor(target) !== color)
              addMove(moves, r, c, tr, tc);
          }
        if (!inCheck(b, color)) {
          if (color === 'w' && r === 7 && c === 4) {
            if (
              cast.wK &&
              b[7][5] === ' ' &&
              b[7][6] === ' ' &&
              b[7][7] === 'R' &&
              !squareAttacked(b, 7, 5, 'b') &&
              !squareAttacked(b, 7, 6, 'b')
            )
              addMove(moves, r, c, 7, 6, { castle: 'K' });
            if (
              cast.wQ &&
              b[7][3] === ' ' &&
              b[7][2] === ' ' &&
              b[7][1] === ' ' &&
              b[7][0] === 'R' &&
              !squareAttacked(b, 7, 3, 'b') &&
              !squareAttacked(b, 7, 2, 'b')
            )
              addMove(moves, r, c, 7, 2, { castle: 'Q' });
          }
          if (color === 'b' && r === 0 && c === 4) {
            if (
              cast.bK &&
              b[0][5] === ' ' &&
              b[0][6] === ' ' &&
              b[0][7] === 'r' &&
              !squareAttacked(b, 0, 5, 'w') &&
              !squareAttacked(b, 0, 6, 'w')
            )
              addMove(moves, r, c, 0, 6, { castle: 'k' });
            if (
              cast.bQ &&
              b[0][3] === ' ' &&
              b[0][2] === ' ' &&
              b[0][1] === ' ' &&
              b[0][0] === 'r' &&
              !squareAttacked(b, 0, 3, 'w') &&
              !squareAttacked(b, 0, 2, 'w')
            )
              addMove(moves, r, c, 0, 2, { castle: 'q' });
          }
        }
      } else {
        const slides =
          t === 'b'
            ? [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1],
              ]
            : t === 'r'
              ? [
                  [-1, 0],
                  [1, 0],
                  [0, -1],
                  [0, 1],
                ]
              : [
                  [-1, -1],
                  [-1, 1],
                  [1, -1],
                  [1, 1],
                  [-1, 0],
                  [1, 0],
                  [0, -1],
                  [0, 1],
                ];
        for (const [dr, dc] of slides) {
          let tr = r + dr,
            tc = c + dc;
          while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
            const target = b[tr][tc];
            if (!target || target === ' ') {
              addMove(moves, r, c, tr, tc);
              tr += dr;
              tc += dc;
              continue;
            }
            if (pieceColor(target) !== color) addMove(moves, r, c, tr, tc);
            break;
          }
        }
      }
    }
  }
  return moves;
}

function applyMove(b, m) {
  const piece = b[m.fr][m.fc];
  let captured = ' ';
  let epCap = null;
  let epCaptured = null;
  if (m.ep) {
    epCap = { r: m.fr + (pieceColor(piece) === 'w' ? 1 : -1), c: m.tc };
    epCaptured = b[epCap.r][epCap.c];
    captured = ' ';
  } else {
    const t = b[m.tr][m.tc];
    captured = t && t !== ' ' ? t : ' ';
  }
  const newPiece = m.promo
    ? pieceColor(piece) === 'w'
      ? 'Q'
      : 'q'
    : piece;
  b[m.tr][m.tc] = newPiece;
  b[m.fr][m.fc] = ' ';
  if (m.ep && epCap) b[epCap.r][epCap.c] = ' ';
  if (m.castle === 'K') {
    b[7][5] = 'R';
    b[7][7] = ' ';
  }
  if (m.castle === 'Q') {
    b[7][3] = 'R';
    b[7][0] = ' ';
  }
  if (m.castle === 'k') {
    b[0][5] = 'r';
    b[0][7] = ' ';
  }
  if (m.castle === 'q') {
    b[0][3] = 'r';
    b[0][0] = ' ';
  }
  return { captured, epCaptured, epCap };
}

function undoMove(b, m, snap) {
  const moved = b[m.tr][m.tc];
  if (m.promo) {
    b[m.fr][m.fc] = pieceColor(moved) === 'w' ? 'P' : 'p';
  } else {
    b[m.fr][m.fc] = moved;
  }
  b[m.tr][m.tc] =
    snap.captured && snap.captured !== ' ' ? snap.captured : ' ';
  if (m.ep && snap.epCap) {
    b[snap.epCap.r][snap.epCap.c] = snap.epCaptured || 'p';
  }
  if (m.castle === 'K') {
    b[7][7] = 'R';
    b[7][5] = ' ';
  }
  if (m.castle === 'Q') {
    b[7][0] = 'R';
    b[7][3] = ' ';
  }
  if (m.castle === 'k') {
    b[0][7] = 'r';
    b[0][5] = ' ';
  }
  if (m.castle === 'q') {
    b[0][0] = 'r';
    b[0][3] = ' ';
  }
}

function updateCastleRights(cast, m, before) {
  const c = { ...cast };
  const ch = before.board[m.fr][m.fc];
  if (ch === 'K') {
    c.wK = false;
    c.wQ = false;
  }
  if (ch === 'k') {
    c.bK = false;
    c.bQ = false;
  }
  if (ch === 'R' && m.fr === 7 && m.fc === 0) c.wQ = false;
  if (ch === 'R' && m.fr === 7 && m.fc === 7) c.wK = false;
  if (ch === 'r' && m.fr === 0 && m.fc === 0) c.bQ = false;
  if (ch === 'r' && m.fr === 0 && m.fc === 7) c.bK = false;
  const cap = before.captured;
  if (cap === 'R' && m.tr === 7 && m.tc === 0) c.wQ = false;
  if (cap === 'R' && m.tr === 7 && m.tc === 7) c.wK = false;
  if (cap === 'r' && m.tr === 0 && m.tc === 0) c.bQ = false;
  if (cap === 'r' && m.tr === 0 && m.tc === 7) c.bK = false;
  return c;
}

function nextEp(m, color) {
  if (
    (color === 'w' && m.fr === 6 && m.tr === 4) ||
    (color === 'b' && m.fr === 1 && m.tr === 3)
  )
    return { r: (m.fr + m.tr) >> 1, c: m.fc };
  return null;
}

function legalMoves(state) {
  const pseudo = pseudoLegalMoves(
    state.board,
    state.turn,
    state.ep,
    state.castle
  );
  const out = [];
  for (const m of pseudo) {
    const nb = cloneBoard(state.board);
    applyMove(nb, m);
    const kingColor = state.turn;
    if (!inCheck(nb, kingColor)) out.push(m);
    // undo not needed; we cloned
  }
  return out;
}

function makeState(board, turn, ep, castle) {
  return { board, turn, ep, castle };
}

function materialAndPST(b) {
  let matW = 0,
    matB = 0,
    pstW = 0,
    pstB = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const ch = b[r][c];
      if (!ch || ch === ' ') continue;
      const col = pieceColor(ch);
      const t = ch.toLowerCase();
      const v = PIECE_VAL[t] || 0;
      if (col === 'w') {
        matW += t === 'k' ? 0 : v;
        if (t === 'p') pstW += PST_P[r][c];
        if (t === 'n') pstW += PST_N[r][c];
      } else {
        matB += t === 'k' ? 0 : v;
        if (t === 'p') pstB += PST_P[7 - r][c];
        if (t === 'n') pstB += PST_N[7 - r][c];
      }
    }
  }
  return { matW, matB, pstW, pstB };
}

function mobility(b, color, ep, castle) {
  return pseudoLegalMoves(b, color, ep, castle).filter((m) => {
    const nb = cloneBoard(b);
    applyMove(nb, m);
    return !inCheck(nb, color);
  }).length;
}

function evaluatePosition(state, explain, forSearch) {
  const b = state.board;
  const { matW, matB, pstW, pstB } = materialAndPST(b);
  const matDiff = matW - matB;
  const pstDiff = pstW - pstB;
  let mobDiff = 0;
  if (!forSearch) {
    const mobW = mobility(b, 'w', state.ep, state.castle);
    const mobB = mobility(b, 'b', state.ep, state.castle);
    mobDiff = (mobW - mobB) * 2;
  }
  const base = matDiff + pstDiff + mobDiff;
  const side = state.turn === 'w' ? 1 : -1;
  const score = base * side;
  if (explain) {
    return {
      score,
      lines: [
        `Material (P=100,N≈320,B≈330,R=500,Q=900): white ${matW} vs black ${matB} → Δ ${matDiff}`,
        `Pawn/knight PST: advanced pawns & centralized knights (Δ ${pstDiff})`,
        `Mobility: ~2 centipawns per legal move (Δ ${mobDiff})`,
        `Hint search: negamax depth ${HINT_SEARCH_DEPTH} plies; leaf = material + PST only.`,
        `Panel total (material + PST + mobility): ${score.toFixed(0)} cp for ${state.turn === 'w' ? 'White' : 'Black'} to move.`,
      ],
    };
  }
  return score;
}

function negamax(state, depth, alpha, beta) {
  const moves = legalMoves(state);
  if (moves.length === 0) {
    if (inCheck(state.board, state.turn))
      return -(MATE_SCORE - depth);
    return 0;
  }
  if (depth === 0) return evaluatePosition(state, false, true);

  let best = -Infinity;
  for (const m of moves) {
    const nb = cloneBoard(state.board);
    const beforeBoard = cloneBoard(state.board);
    const cap = beforeBoard[m.tr][m.tc];
    applyMove(nb, m);
    const nep = m.ep ? null : nextEp(m, state.turn);
    const ncastle = updateCastleRights(state.castle, m, {
      board: beforeBoard,
      captured: m.ep ? ' ' : cap,
    });
    const child = makeState(nb, opponent(state.turn), nep, ncastle);
    const sc = -negamax(child, depth - 1, -beta, -alpha);
    if (sc > best) best = sc;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

/** All legal root moves scored and sorted best-first (for hints). */
function rankedRootMoves(state, depth) {
  const moves = legalMoves(state);
  if (!moves.length) return [];
  const scored = [];
  for (const m of moves) {
    const nb = cloneBoard(state.board);
    const beforeBoard = cloneBoard(state.board);
    const cap = beforeBoard[m.tr][m.tc];
    applyMove(nb, m);
    const nep = m.ep ? null : nextEp(m, state.turn);
    const ncastle = updateCastleRights(state.castle, m, {
      board: beforeBoard,
      captured: m.ep ? ' ' : cap,
    });
    const child = makeState(nb, opponent(state.turn), nep, ncastle);
    const sc = -negamax(child, depth - 1, -Infinity, Infinity);
    scored.push({ ...m, score: sc });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function fileChar(c) {
  return String.fromCharCode(97 + c);
}
function rankNum(r) {
  return 8 - r;
}
function sqLabel(r, c) {
  return fileChar(c) + rankNum(r);
}

function refreshHint() {
  const st = makeState(cloneBoard(board), turn, ep, { ...castle });
  const moves = legalMoves(st);
  if (!moves.length) {
    bestHint = null;
    return;
  }
  const ranked = rankedRootMoves(st, HINT_SEARCH_DEPTH);
  const bm = ranked[0];
  if (!bm) {
    bestHint = null;
    return;
  }
  const sm = ranked.length > 1 ? ranked[1] : null;
  const ev = evaluatePosition(st, true, false);
  let scoreNote = `${bm.score.toFixed(0)} cp for ${turn === 'w' ? 'White' : 'Black'} (${HINT_SEARCH_DEPTH}-ply search)`;
  if (Math.abs(bm.score) > MATE_SCORE / 2)
    scoreNote = bm.score > 0 ? 'Forced mate sequence (for side to move)' : 'Getting mated — best defense only';
  const lines = [
    `Best (blue): ${sqLabel(bm.fr, bm.fc)} → ${sqLabel(bm.tr, bm.tc)}`,
    scoreNote,
  ];
  if (sm)
    lines.push(
      `2nd (yellow): ${sqLabel(sm.fr, sm.fc)} → ${sqLabel(sm.tr, sm.tc)} (${sm.score.toFixed(0)} cp)`
    );
  lines.push(...ev.lines);
  bestHint = {
    primary: { fr: bm.fr, fc: bm.fc, tr: bm.tr, tc: bm.tc },
    secondary: sm
      ? { fr: sm.fr, fc: sm.fc, tr: sm.tr, tc: sm.tc }
      : null,
    lines,
  };
}

function resetGame() {
  board = initialBoard();
  turn = 'w';
  ep = null;
  castle = { wK: true, wQ: true, bK: true, bQ: true };
  selected = null;
  legalForSelected = [];
  statusMsg = "White to move — click a piece, then a destination.";
  refreshHint();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('system-ui, -apple-system, sans-serif');
  resetGame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/** Pixel width/height of one square (full board = 8 × this). */
function squarePixelSize() {
  const maxW = width - 24;
  const maxH = height - uiH - 24;
  const boardCap = min(maxW, maxH, 560);
  return max(24, floor(boardCap / 8));
}

function toScreen(r, c) {
  const S = cell;
  const flip = turn === 'b';
  const sr = flip ? 7 - r : r;
  const sc = flip ? 7 - c : c;
  return { x: boardOriginX + sc * S, y: boardOriginY + sr * S };
}

function screenToBoard(mx, my) {
  const S = cell;
  const flip = turn === 'b';
  const x = mx - boardOriginX;
  const y = my - boardOriginY;
  if (x < 0 || y < 0 || x >= 8 * S || y >= 8 * S) return null;
  let sc = floor(x / S);
  let sr = floor(y / S);
  let c = flip ? 7 - sc : sc;
  let r = flip ? 7 - sr : sr;
  if (r < 0 || r > 7 || c < 0 || c > 7) return null;
  return { r, c };
}

function drawChessPiece(ch, cx, cy, s) {
  const img = pieceImgs[ch];
  if (!img || !img.width) return;
  push();
  imageMode(CENTER);
  image(img, cx, cy + s * 0.02, s * 0.88, s * 0.88);
  imageMode(CORNER);
  pop();
}

function drawBoard() {
  cell = squarePixelSize();
  boardOriginX = (width - 8 * cell) / 2;
  boardOriginY = uiH + (height - uiH - 8 * cell) / 2;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const light = (r + c) % 2 === 0;
      const { x, y } = toScreen(r, c);
      fill(light ? color(245, 245, 248) : color(180, 185, 200));
      noStroke();
      rect(x, y, cell, cell);
    }
  }

  if (showHints && bestHint && bestHint.primary) {
    const drawHintMove = (m, strokeC, fillC, dotA, dotB) => {
      stroke(strokeC);
      strokeWeight(max(3, cell * 0.08));
      const a = toScreen(m.fr, m.fc);
      const b = toScreen(m.tr, m.tc);
      line(
        a.x + cell / 2,
        a.y + cell / 2,
        b.x + cell / 2,
        b.y + cell / 2
      );
      noStroke();
      fill(fillC);
      ellipse(a.x + cell / 2, a.y + cell / 2, cell * dotA);
      ellipse(b.x + cell / 2, b.y + cell / 2, cell * dotB);
    };
    if (bestHint.secondary)
      drawHintMove(
        bestHint.secondary,
        color(220, 175, 30, 230),
        color(220, 175, 30, 115),
        0.32,
        0.42
      );
    drawHintMove(
      bestHint.primary,
      color(40, 120, 220, 200),
      color(40, 120, 220, 120),
      0.35,
      0.45
    );
  }

  if (selected) {
    const { x, y } = toScreen(selected.r, selected.c);
    fill(255, 220, 80, 100);
    rect(x, y, cell, cell);
  }
  for (const m of legalForSelected) {
    const { x, y } = toScreen(m.tr, m.tc);
    fill(80, 200, 120, 90);
    ellipse(x + cell / 2, y + cell / 2, cell * 0.28);
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const ch = board[r][c];
      if (!ch || ch === ' ') continue;
      const { x, y } = toScreen(r, c);
      drawChessPiece(ch, x + cell / 2, y + cell / 2, cell);
    }
  }
}

function drawUI() {
  fill(40);
  noStroke();
  rect(0, 0, width, uiH);
  fill(250);
  textAlign(LEFT, TOP);
  textSize(14);
  let y = 10;
  text(statusMsg, 12, y);
  y += 20;
  text(
    `Turn: ${turn === 'w' ? 'White' : 'Black'}  ·  Board oriented for side to move`,
    12,
    y
  );
  y += 18;
  text('H — toggle hints  ·  R — new game', 12, y);

  const bx = width - 200;
  fill(showHints ? color(80, 160, 100) : color(90, 90, 95));
  rect(bx, 12, 180, 36, 6);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(showHints ? 'Hints ON' : 'Hints OFF', bx + 90, 30);

  fill(70, 70, 75);
  rect(bx, 54, 180, 36, 6);
  fill(255);
  text('New game', bx + 90, 72);

  if (showHints && bestHint && bestHint.lines) {
    textAlign(LEFT, TOP);
    textSize(11);
    fill(30);
    let hy = boardOriginY + 8 * cell + 8;
    if (hy + 80 > height) hy = boardOriginY - 6;
    for (let i = 0; i < bestHint.lines.length; i++) {
      text(bestHint.lines[i], 12, hy + i * 14);
    }
  }
}

function draw() {
  background(232, 232, 236);
  drawBoard();
  drawUI();
}

function keyPressed() {
  const k = key.toLowerCase();
  if (k === 'h') {
    showHints = !showHints;
    if (showHints) refreshHint();
  }
  if (k === 'r') resetGame();
}

function mousePressed() {
  const bx = width - 200;
  if (mouseX >= bx && mouseX <= bx + 180 && mouseY >= 12 && mouseY <= 48) {
    showHints = !showHints;
    if (showHints) refreshHint();
    return;
  }
  if (mouseX >= bx && mouseX <= bx + 180 && mouseY >= 54 && mouseY <= 90) {
    resetGame();
    return;
  }

  const pos = screenToBoard(mouseX, mouseY);
  if (!pos) return;

  const st = makeState(board, turn, ep, { ...castle });
  const allLegal = legalMoves(st);

  if (!allLegal.length) {
    if (inCheck(board, turn))
      statusMsg = `Checkmate — ${turn === 'w' ? 'Black' : 'White'} wins. Press R or New game.`;
    else statusMsg = 'Stalemate. Press R or New game.';
    return;
  }

  const ch = board[pos.r][pos.c];

  if (selected) {
    const hit = legalForSelected.find(
      (m) => m.tr === pos.r && m.tc === pos.c
    );
    if (hit) {
      const beforeBoard = cloneBoard(board);
      const cap = hit.ep ? ' ' : beforeBoard[hit.tr][hit.tc];
      applyMove(board, hit);
      ep = hit.ep ? null : nextEp(hit, turn);
      castle = updateCastleRights(castle, hit, {
        board: beforeBoard,
        captured: cap,
      });
      turn = opponent(turn);
      selected = null;
      legalForSelected = [];

      const st2 = makeState(board, turn, ep, { ...castle });
      const nextMoves = legalMoves(st2);
      if (!nextMoves.length) {
        if (inCheck(board, turn))
          statusMsg = `Checkmate — ${opponent(turn) === 'w' ? 'White' : 'Black'} wins.`;
        else statusMsg = 'Stalemate.';
      } else {
        statusMsg = `${turn === 'w' ? 'White' : 'Black'} to move.`;
        if (inCheck(board, turn)) statusMsg += ' In check.';
      }
      if (showHints) refreshHint();
      return;
    }
    if (ch && pieceColor(ch) === turn) {
      selected = pos;
      legalForSelected = allLegal.filter(
        (m) => m.fr === pos.r && m.fc === pos.c
      );
      return;
    }
    selected = null;
    legalForSelected = [];
    return;
  }

  if (ch && pieceColor(ch) === turn) {
    selected = pos;
    legalForSelected = allLegal.filter(
      (m) => m.fr === pos.r && m.fc === pos.c
    );
  }
}
