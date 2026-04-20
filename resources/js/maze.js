import axios from 'axios';

const rows = 21, cols = 21, cellSize = 24;
let maze = [];
let start = [1, 1];
let end = [rows - 2, cols - 2];
let animationTimeouts = [];
let selectingStart = true;

// Utility functions
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateEmptyMaze(r, c) {
    return Array.from({ length: r }, () => Array(c).fill(1));
}

function recursiveBacktrack(maze, r, c) {
    maze[r][c] = 0;
    const directions = shuffle([[0, 2], [2, 0], [0, -2], [-2, 0]]);
    for (let [dr, dc] of directions) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && maze[nr][nc] === 1) {
            maze[r + dr / 2][c + dc / 2] = 0;
            recursiveBacktrack(maze, nr, nc);
        }
    }
}

function addRandomLoops(maze, loopCount = 30) {
    let added = 0, attempts = 0;
    while (added < loopCount && attempts < 5000) {
        let r = Math.floor(Math.random() * (rows - 2)) + 1;
        let c = Math.floor(Math.random() * (cols - 2)) + 1;
        if (maze[r][c] === 1 && ((r % 2 === 1 && c % 2 === 0) || (r % 2 === 0 && c % 2 === 1))) {
            let dr = 0, dc = 0;
            if (r % 2 === 0) dr = 1;
            if (c % 2 === 0) dc = 1;
            const r1 = r - dr, r2 = r + dr;
            const c1 = c - dc, c2 = c + dc;
            if (r1 >= 0 && r2 < rows && c1 >= 0 && c2 < cols && maze[r1][c1] === 0 && maze[r2][c2] === 0) {
                maze[r][c] = 0;
                added++;
            }
        }
        attempts++;
    }
}

function generateRandomMazeWithLoops() {
    maze = generateEmptyMaze(rows, cols);
    recursiveBacktrack(maze, 1, 1);
    addRandomLoops(maze, 30);
}

function drawMaze(canvasId, maze, colorMap = {}) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const key = `${r},${c}`;
            ctx.fillStyle = colorMap[key] || (maze[r][c] === 0 ? 'white' : 'black');
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
    }

    ctx.fillStyle = 'green';
    ctx.fillRect(start[1] * cellSize, start[0] * cellSize, cellSize, cellSize);
    ctx.fillStyle = 'orange';
    ctx.fillRect(end[1] * cellSize, end[0] * cellSize, cellSize, cellSize);
}

function clearAnimations() {
    animationTimeouts.forEach(clearTimeout);
    animationTimeouts = [];
}

window.generateMaze = function () {
    clearAnimations();
    generateRandomMazeWithLoops();
    drawMaze('mazeCanvas', maze);
    document.getElementById('searchStats').innerHTML = '';
}

window.animateSearch = function (method) {
    clearAnimations();
    axios.post('/solve', {
        maze: maze,
        start: start,
        end: end
    }).then(response => {
        const { bfs, dfs, bfsTime, dfsTime } = response.data;
        const path = method === 'bfs' ? bfs : dfs;
        const color = method === 'bfs' ? 'blue' : 'red';
        const time = method === 'bfs' ? bfsTime : dfsTime;
        const label = method === 'bfs' ? 'BFS (Shortest Path)' : 'DFS (Quickest Path)';
        let colorMap = {};
        let i = 0;

        function step() {
            if (i >= path.length) {
                document.getElementById('searchStats').innerHTML =
                    `<p><strong>${label}</strong></p>
                     <p>🧭 Steps: <b>${path.length}</b></p>
                     <p>⏱️ Estimated Time: <b>${time.toFixed(2)} ms</b></p>`;
                drawMaze('mazeCanvas', maze, colorMap);
                return;
            }

            const [r, c] = path[i];
            colorMap[`${r},${c}`] = color;
            drawMaze('mazeCanvas', maze, colorMap);
            animationTimeouts.push(setTimeout(step, 30));
            i++;
        }

        step();
    });
}

window.showOverlap = function () {
    clearAnimations();
    axios.post('/solve', {
        maze: maze,
        start: start,
        end: end
    }).then(response => {
        const { bfs, dfs } = response.data;
        const colorMap = {};
        const bfsSet = new Set(bfs.map(([r, c]) => `${r},${c}`));
        const dfsSet = new Set(dfs.map(([r, c]) => `${r},${c}`));

        for (let key of bfsSet) {
            colorMap[key] = dfsSet.has(key) ? 'purple' : 'blue';
        }
        for (let key of dfsSet) {
            if (!bfsSet.has(key)) colorMap[key] = 'red';
        }

        drawMaze('mazeCanvas', maze, colorMap);
        document.getElementById('searchStats').innerHTML =
            `<p><strong>Overlap View</strong></p>
             <p>BFS: <span style="color:blue;">Blue</span>, 
             DFS: <span style="color:red;">Red</span>, 
             Overlap: <span style="color:purple;">Purple</span></p>`;
    });
}

// Interactive Canvas
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mazeCanvas');
    canvas.addEventListener('click', function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        if (maze[row][col] === 0) {
            if (selectingStart) {
                start = [row, col];
                selectingStart = false;
            } else {
                end = [row, col];
                selectingStart = true;
            }
            drawMaze('mazeCanvas', maze);
        }
    });

    generateMaze();
});
