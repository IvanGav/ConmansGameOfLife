# Ruleset: Mazemerizer (Ivan)
```
[{"type":0,"numCells":2,"comparison":0,"neighborState":1},{"type":1,"numCells":2,"comparison":2,"neighborState":1},{"type":1,"numCells":3,"comparison":2,"neighborState":1},{"type":0,"numCells":3,"comparison":4,"neighborState":1},{"type":2,"numCells":3,"comparison":2,"neighborState":1,"babyState":1},{"type":1,"comparison":0,"numCells":5,"neighborState":1}]
```

Minimalistic ruleset that tends to make rigid maze-like structure. Easy to take off, stay alive and grow. After stabilizing will remain locally still.

## Shape: Star (Ivan)
```
111
```

Expands for 7 turns and then stabilizes in a star shape.

## Shape: Fork (Ivan)
```
10001
00100
10001
```

Expands outwards with lots of straight lines with 1 cell gap. Grows indefinitely.