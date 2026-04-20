<?php

use App\Http\Controllers\MazeController;

Route::get('/', function () {
    return view('maze');
});

Route::post('/solve', [MazeController::class, 'solve']);
