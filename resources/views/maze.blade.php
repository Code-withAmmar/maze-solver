<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Maze Solver Visualizer</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    @vite(['resources/css/maze.css', 'resources/js/maze.js'])
</head>
<body>
    <header>Maze Solver Visualizer</header>

    <div class="container">
        <canvas id="mazeCanvas" width="504" height="504"></canvas>

        <div class="button-group">
            <button onclick="generateMaze()">Generate Maze</button>
            <button onclick="animateSearch('bfs')">Run BFS</button>
            <button onclick="animateSearch('dfs')">Run DFS</button>
            <button onclick="showOverlap()">Show Overlap</button>
        </div>

        <div class="stats" id="searchStats"></div>
    </div>

    <div class="footer">
        &copy; 2025 Maze Visualizer | Designed for performance visualization of BFS vs DFS.
    </div>
</body>
</html>
