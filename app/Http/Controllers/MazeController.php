<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MazeController extends Controller
{
    public function index()
    {
        return view('maze');
    }

    public function solve(Request $request)
    {
        try {
            $maze = json_decode(json_encode($request->input('maze')), true);
            $start = json_decode(json_encode($request->input('start')), true);
            $end = json_decode(json_encode($request->input('end')), true);

            $bfs = $this->bfs($maze, $start, $end);
            $dfs = $this->dfs($maze, $start, $end);

            return response()->json([
                'bfs' => $bfs,
                'dfs' => $dfs,
                'bfsTime' => count($bfs) * 30,
                'dfsTime' => count($dfs) * 30,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }

    private function bfs($maze, $start, $end)
    {
        $rows = count($maze);
        $cols = count($maze[0]);
        $queue = [[$start, [$start]]];
        $visited = [];

        while (!empty($queue)) {
            [$current, $path] = array_shift($queue);
            [$r, $c] = $current;

            if ($r === $end[0] && $c === $end[1]) return $path;
            $visited["$r,$c"] = true;

            foreach ([[0,1], [1,0], [0,-1], [-1,0]] as [$dr, $dc]) {
                $nr = $r + $dr;
                $nc = $c + $dc;

                if ($nr >= 0 && $nc >= 0 && $nr < $rows && $nc < $cols &&
                    $maze[$nr][$nc] === 0 && !isset($visited["$nr,$nc"])) {
                    $queue[] = [[$nr, $nc], [...$path, [$nr, $nc]]];
                    $visited["$nr,$nc"] = true;
                }
            }
        }

        return [];
    }

    private function dfs($maze, $start, $end)
    {
        $rows = count($maze);
        $cols = count($maze[0]);
        $stack = [[$start, [$start]]];
        $visited = [];

        while (!empty($stack)) {
            [$current, $path] = array_pop($stack);
            [$r, $c] = $current;

            if ($r === $end[0] && $c === $end[1]) return $path;
            $visited["$r,$c"] = true;

            foreach ([[0,1], [1,0], [0,-1], [-1,0]] as [$dr, $dc]) {
                $nr = $r + $dr;
                $nc = $c + $dc;

                if ($nr >= 0 && $nc >= 0 && $nr < $rows && $nc < $cols &&
                    $maze[$nr][$nc] === 0 && !isset($visited["$nr,$nc"])) {
                    $stack[] = [[$nr, $nc], [...$path, [$nr, $nc]]];
                    $visited["$nr,$nc"] = true;
                }
            }
        }

        return [];
    }
}
