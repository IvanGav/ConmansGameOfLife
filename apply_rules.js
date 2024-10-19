const NO_STATE_CHANGE = -1;
const DEAD_STATE = 0;
const PROTECTED = 0.4;

let currentRules = [ // conways by default
    {type: 0, numCells: 2, comparison: 0, neighborState: 1},
    {type: 1, numCells: 2, comparison: 2, neighborState: 1},
    {type: 1, numCells: 3, comparison: 2, neighborState: 1},
    {type: 0, numCells: 3, comparison: 4, neighborState: 1},
    {type: 2, numCells: 3, comparison: 2, neighborState: 1, babyState: 1},
];

function resetRules() {
    currentRules = [ // conways by default
        {type: 0, numCells: 2, comparison: 0, neighborState: 1},
        {type: 1, numCells: 2, comparison: 2, neighborState: 1},
        {type: 1, numCells: 3, comparison: 2, neighborState: 1},
        {type: 0, numCells: 3, comparison: 4, neighborState: 1},
        {type: 2, numCells: 3, comparison: 2, neighborState: 1, babyState: 1},
    ];
    console.log(currentRules);
}

function addRandRule() {
    let type = Math.floor(Math.random()*4);
    switch(type) {
        case 0:
        case 1:
            currentRules.push({
                type: type,
                numCells: Math.floor(Math.random()*9),
                comparison: Math.floor(Math.random()*5),
                neighborState: Math.ceil(Math.random()*4),
            });
            break;
        case 2:
            currentRules.push({
                type: type,
                numCells: Math.floor(Math.random()*9),
                comparison: Math.floor(Math.random()*5),
                neighborState: Math.ceil(Math.random()*4),
                babyState: Math.ceil(Math.random()*4),
            });
            break;
        case 3:
            currentRules.push({
                type: type,
                numCells: Math.floor(Math.random()*9),
                comparison: Math.floor(Math.random()*5),
                neighborState: Math.ceil(Math.random()*4),
                myState: Math.ceil(Math.random()*4),
                babyState: Math.ceil(Math.random()*4),
            });
            break;
        
    }
}

// Any variables with `Map` at the end, are maps.
// Any variables with `Coord` at the end, are [x,y] arrays.
// Any variables with `State` at the end, are numbers, representing the states of a cell.

// applyRules should be a function pointer such that:
// returns: number checkAtNewState
// params:  Map curStateMap, [number, number] checkAtCoord
let applyRules = function(curStateMap, checkAtCoord) {
    let max = NO_STATE_CHANGE;
    for(let rule of currentRules) {
        let result = max;
        switch (rule.type) {
            case 0:
                result = generalDead(rule.numCells, rule.comparison, rule.neighborState, curStateMap, checkAtCoord);
                break;
            case 1:
                result = generalStay(rule.numCells, rule.comparison, rule.neighborState, curStateMap, checkAtCoord);
                break;
            case 2:
                result = generalRepr(rule.numCells, rule.comparison, rule.neighborState, rule.babyState, curStateMap, checkAtCoord);
                break;
            case 3:
                result = generalEvol(rule.numCells, rule.comparison, rule.neighborState, rule.myState, rule.babyState, curStateMap, checkAtCoord);
                break;
        }

        max = (max > result) ? max : result;
    }
    return max;
};

let generalDead = function(numCells, comparison, neighborState, curStateMap, checkAtCoord) {
    if (curStateMap.has(checkAtCoord.toString())) {
        let sum = sumNeighbor(curStateMap, checkAtCoord, neighborState);
        switch (comparison) {
            case 0:
                return (sum < numCells) ? DEAD_STATE : NO_STATE_CHANGE;
            case 1:
                return (sum <= numCells) ? DEAD_STATE : NO_STATE_CHANGE;
                case 2:
                return (sum == numCells) ? DEAD_STATE : NO_STATE_CHANGE;
                case 3:
                return (sum >= numCells) ? DEAD_STATE : NO_STATE_CHANGE;
                case 4:
                return (sum > numCells) ? DEAD_STATE : NO_STATE_CHANGE;
            }
    }
    return DEAD_STATE;
}

let generalStay = function(numCells, comparison, neighborState, curStateMap, checkAtCoord) {
    if (curStateMap.has(checkAtCoord.toString())) {
        let sum = sumNeighbor(curStateMap, checkAtCoord, neighborState);
        // console.log(sum);
        switch (comparison) {
            case 0:
                return (sum < numCells) ? PROTECTED : DEAD_STATE;
            case 1:
                return (sum <= numCells) ? PROTECTED : DEAD_STATE;
            case 2:
                return (sum == numCells) ? PROTECTED : DEAD_STATE;
            case 3:
                return (sum >= numCells) ? PROTECTED : DEAD_STATE;
            case 4:
                return (sum > numCells) ? PROTECTED : DEAD_STATE;
        }
    }
    return DEAD_STATE;
}

let generalRepr = function(numCells, comparison, neighborState, babyState, curStateMap, checkAtCoord) {
    if (!curStateMap.has(checkAtCoord.toString())) {
        let sum = sumNeighbor(curStateMap, checkAtCoord, neighborState);
        switch (comparison) {
            case 0:
                return (sum < numCells) ? babyState : DEAD_STATE;
            case 1:
                return (sum <= numCells) ? babyState : DEAD_STATE;
            case 2:
                return (sum == numCells) ? babyState : DEAD_STATE;
            case 3:
                return (sum >= numCells) ? babyState : DEAD_STATE;
            case 4:
                return (sum > numCells) ? babyState : DEAD_STATE;
        }
    }
    return NO_STATE_CHANGE;
}

let generalEvol = function(numCells, comparison, neighborState, myState, babyState, curStateMap, checkAtCoord) {
    if (curStateMap.has(checkAtCoord.toString()) && curStateMap.get(checkAtCoord.toString()) == myState) {
        let sum = sumNeighbor(curStateMap, checkAtCoord, neighborState);
        switch (comparison) {
            case 0:
                return (sum < numCells) ? babyState : NO_STATE_CHANGE;
            case 1:
                return (sum <= numCells) ? babyState : NO_STATE_CHANGE;
            case 2:
                return (sum == numCells) ? babyState : NO_STATE_CHANGE;
            case 3:
                return (sum >= numCells) ? babyState : NO_STATE_CHANGE;
            case 4:
                return (sum > numCells) ? babyState : NO_STATE_CHANGE;
        }
    }
    return NO_STATE_CHANGE;
}


// number sumNeighbor(Map, [number, number], number)
function sumNeighbor(curStateMap, checkAtCoord, value) {
    let sum = 
    (curStateMap.has([checkAtCoord[0]-1, checkAtCoord[1]-1].toString()) && curStateMap.get([checkAtCoord[0]-1, checkAtCoord[1]-1].toString()) == value) +
    (curStateMap.has([checkAtCoord[0], checkAtCoord[1]-1].toString()) && curStateMap.get([checkAtCoord[0], checkAtCoord[1]-1].toString()) == value) +
    (curStateMap.has([checkAtCoord[0]+1, checkAtCoord[1]-1].toString()) && curStateMap.get([checkAtCoord[0]+1, checkAtCoord[1]-1].toString()) == value) +
    (curStateMap.has([checkAtCoord[0]-1, checkAtCoord[1]].toString()) && curStateMap.get([checkAtCoord[0]-1, checkAtCoord[1]].toString()) == value) +
    (curStateMap.has([checkAtCoord[0]+1, checkAtCoord[1]].toString()) && curStateMap.get([checkAtCoord[0]+1, checkAtCoord[1]].toString()) == value) +
    (curStateMap.has([checkAtCoord[0]-1, checkAtCoord[1]+1].toString()) && curStateMap.get([checkAtCoord[0]-1, checkAtCoord[1]+1].toString()) == value) +
    (curStateMap.has([checkAtCoord[0], checkAtCoord[1]+1].toString()) && curStateMap.get([checkAtCoord[0], checkAtCoord[1]+1].toString()) == value) +
    (curStateMap.has([checkAtCoord[0]+1, checkAtCoord[1]+1].toString()) && curStateMap.get([checkAtCoord[0]+1, checkAtCoord[1]+1].toString()) == value);
    // let above = curStateMap.has([checkAtCoord[0], checkAtCoord[1]-1].toString());
    // console.log(`for coord: (${checkAtCoord}), sum: ${sum}, above: ${[checkAtCoord[0], checkAtCoord[1]-1].toString()} ${above}`);
    return sum;
}

//Map step(Map)
function step(prevStateMap) {
    let nextStateMap = new Map();
    let nextEmptyMap = new Map();
    prevStateMap.forEach((cellState, coordStrOriginal) => {
        let coordOfStrs = coordStrOriginal.split(',');
        let coord = [parseInt(coordOfStrs[0],10), parseInt(coordOfStrs[1],10)];
        let stateChange = false;
        //we could've already looked at it from its alive neighbors
        let cstr = coord.toString();
        if(!nextStateMap.has(cstr) && !nextEmptyMap.has(cstr)) {
            let newState = applyRules(prevStateMap, coord);
            stateChange = prevStateMap.get(cstr) != newState;
            updateCoord(cstr, coord, prevStateMap, nextStateMap, nextEmptyMap);
        }
        //if the cell didn't change, we don't need to update the neighbors
        if(stateChange) {
            //look at neighbors
            let c = [coord[0]-1, coord[1]-1];
            let cstr = c.toString();
            if(!prevStateMap.has(cstr)) updateCoord(cstr, c, prevStateMap, nextStateMap, nextEmptyMap);
            c = [coord[0], coord[1]-1];
            cstr = c.toString();
            if(!prevStateMap.has(cstr)) updateCoord(cstr, c, prevStateMap, nextStateMap, nextEmptyMap);
            c = [coord[0]+1, coord[1]-1];
            cstr = c.toString();
            if(!prevStateMap.has(cstr)) updateCoord(cstr, c, prevStateMap, nextStateMap, nextEmptyMap);

            c = [coord[0]-1, coord[1]];
            cstr = c.toString();
            if(!prevStateMap.has(cstr)) updateCoord(cstr, c, prevStateMap, nextStateMap, nextEmptyMap);
            c = [coord[0]+1, coord[1]];
            cstr = c.toString();
            if(!prevStateMap.has(cstr)) updateCoord(cstr, c, prevStateMap, nextStateMap, nextEmptyMap);

            c = [coord[0]-1, coord[1]+1];
            cstr = c.toString();
            if(!prevStateMap.has(cstr)) updateCoord(cstr, c, prevStateMap, nextStateMap, nextEmptyMap);
            c = [coord[0], coord[1]+1];
            cstr = c.toString();
            if(!prevStateMap.has(cstr)) updateCoord(cstr, c, prevStateMap, nextStateMap, nextEmptyMap);
            c = [coord[0]+1, coord[1]+1];
            cstr = c.toString();
            if(!prevStateMap.has(cstr)) updateCoord(cstr, c, prevStateMap, nextStateMap, nextEmptyMap);
        }
    });
    return nextStateMap;
}

// void updateCoord(string coordStr, [number,number] coord, Map prevStateMap, Map nextStateMap, Map nextEmptyMap)
function updateCoord(coordStr, coord, prevStateMap, nextStateMap, nextEmptyMap) {
    if(!nextStateMap.has(coordStr) && !nextEmptyMap.has(coordStr)) {
        let newState = applyRules(prevStateMap, coord);
        if(newState == DEAD_STATE) {
            nextEmptyMap.set(coordStr, DEAD_STATE);
        } else if(newState == NO_STATE_CHANGE || newState == PROTECTED) {
            // console.log(`no change for ${coordStr}`);
            if(prevStateMap.get(coordStr) == DEAD_STATE) {
                nextEmptyMap.set(coordStr, DEAD_STATE);
            } else {
                nextStateMap.set(coordStr, prevStateMap.get(coordStr));
            }
        } else {
            nextStateMap.set(coordStr, newState);
        }
    }
}
