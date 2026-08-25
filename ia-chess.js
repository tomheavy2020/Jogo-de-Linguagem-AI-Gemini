// ============ IA DE XADREZ COM 3 NÍVEIS ============

const PIECE_VALUES = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

let aiDifficulty = 'medio'; // 'facil', 'medio', 'dificil'

function setAIDifficulty(level) {
    aiDifficulty = level;
}

// Nível Fácil: movimentos aleatórios
function aiMoveEasy(legalMoves) {
    if (!legalMoves.length) return null;
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

// Nível Médio: escolhe capturas valiosas
function aiMoveMedium(legalMoves) {
    if (!legalMoves.length) return null;
    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of legalMoves) {
        let score = 0;
        const capturedPiece = board[move.r]?.[move.c];

        if (capturedPiece) {
            score += PIECE_VALUES[capturedPiece.type];
        }

        // Bônus por controle central
        const centerDist = Math.abs(3.5 - move.r) + Math.abs(3.5 - move.c);
        score += Math.max(0, 4 - centerDist) * 10;

        // Aleatoriedade para variedade
        score += Math.random() * 50;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove || legalMoves[0];
}

// Nível Difícil: minimax com profundidade 3
function aiMoveHard(legalMoves) {
    if (!legalMoves.length) return null;
    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of legalMoves) {
        const captured = board[move.r]?.[move.c];
        const originalPiece = board[aiSelectedFrom?.r]?.[aiSelectedFrom?.c];

        if (originalPiece) {
            board[move.r][move.c] = originalPiece;
            board[aiSelectedFrom.r][aiSelectedFrom.c] = null;

            const score = minimax(board, 3, -Infinity, Infinity, false);

            board[aiSelectedFrom.r][aiSelectedFrom.c] = originalPiece;
            board[move.r][move.c] = captured;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }

    return bestMove || legalMoves[0];
}

function minimax(board, depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
        return evaluateBoard(board);
    }

    const moves = getAllMovesForAI(board, isMaximizing ? 'b' : 'w');

    if (!moves.length) {
        return isMaximizing ? -Infinity : Infinity;
    }

    if (isMaximizing) {
        let maxScore = -Infinity;
        for (const move of moves) {
            const captured = board[move.r]?.[move.c];
            const piece = board[move.fromR]?.[move.fromC];

            if (piece) {
                board[move.r][move.c] = piece;
                board[move.fromR][move.fromC] = null;

                const score = minimax(board, depth - 1, alpha, beta, false);

                board[move.fromR][move.fromC] = piece;
                board[move.r][move.c] = captured;

                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        for (const move of moves) {
            const captured = board[move.r]?.[move.c];
            const piece = board[move.fromR]?.[move.fromC];

            if (piece) {
                board[move.r][move.c] = piece;
                board[move.fromR][move.fromC] = null;

                const score = minimax(board, depth - 1, alpha, beta, true);

                board[move.fromR][move.fromC] = piece;
                board[move.r][move.c] = captured;

                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
        }
        return minScore;
    }
}

function evaluateBoard(board) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r]?.[c];
            if (piece) {
                const value = PIECE_VALUES[piece.type] || 0;
                score += piece.color === 'b' ? value : -value;
            }
        }
    }
    return score;
}

function getAllMovesForAI(board, color) {
    const moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r]?.[c] && board[r][c].color === color) {
                const pieceMoves = getLegalMovesForAI(board, r, c);
                for (const move of pieceMoves) {
                    moves.push({...move, fromR: r, fromC: c});
                }
            }
        }
    }
    return moves;
}

function getLegalMovesForAI(board, r, c) {
    const piece = board[r]?.[c];
    if (!piece) return [];

    let moves = [];
    const slide = (dirs) => {
        for (const [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                const t = board[nr][nc];
                if (!t || t.color !== piece.color) moves.push({r: nr, c: nc, capture: !!t});
                if (t) break;
                nr += dr; nc += dc;
            }
        }
    };

    if (piece.type === 'P') {
        const dir = piece.color === 'w' ? -1 : 1;
        if (!board[r+dir]?.[c]) moves.push({ r: r+dir, c });
        for (const dc of [-1, 1]) {
            if (board[r+dir]?.[c+dc] && board[r+dir][c+dc].color !== piece.color) {
                moves.push({ r: r+dir, c: c+dc, capture: true });
            }
        }
    } else if (piece.type === 'R') slide([[-1,0],[1,0],[0,-1],[0,1]]);
    else if (piece.type === 'B') slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
    else if (piece.type === 'Q') slide([[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
    else if (piece.type === 'K') slide([[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
    else if (piece.type === 'N') {
        const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        for (const [dr, dc] of knightMoves) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                const t = board[nr][nc];
                if (!t || t.color !== piece.color) moves.push({r: nr, c: nc, capture: !!t});
            }
        }
    }

    return moves;
}

let aiSelectedFrom = null;

function makeAIMove() {
    if (turn !== 'b' || isGameOver) return;

    // Encontrar todas as peças pretas
    const allMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r]?.[c] && board[r][c].color === 'b') {
                const moves = getLegalMoves(r, c);
                for (const move of moves) {
                    allMoves.push({...move, fromR: r, fromC: c});
                }
            }
        }
    }

    if (!allMoves.length) return;

    let chosenMove = null;

    if (aiDifficulty === 'facil') {
        chosenMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    } else if (aiDifficulty === 'medio') {
        let bestScore = -Infinity;
        for (const move of allMoves) {
            let score = 0;
            const capturedPiece = board[move.r]?.[move.c];
            if (capturedPiece) {
                score += PIECE_VALUES[capturedPiece.type];
            }
            score += Math.random() * 50;
            if (score > bestScore) {
                bestScore = score;
                chosenMove = move;
            }
        }
    } else {
        // Difícil
        let bestScore = -Infinity;
        for (const move of allMoves) {
            const captured = board[move.r]?.[move.c];
            const piece = board[move.fromR]?.[move.fromC];

            if (piece) {
                board[move.r][move.c] = piece;
                board[move.fromR][move.fromC] = null;

                const score = minimax(board, 2, -Infinity, Infinity, false);

                board[move.fromR][move.fromC] = piece;
                board[move.r][move.c] = captured;

                if (score > bestScore) {
                    bestScore = score;
                    chosenMove = move;
                }
            }
        }
    }

    if (chosenMove) {
        setTimeout(() => {
            applyMove(chosenMove.fromR, chosenMove.fromC, chosenMove.r, chosenMove.c, 'Q');
        }, 500);
    }
}
