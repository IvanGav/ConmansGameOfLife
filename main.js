let boardExists = false;
let board_height;
let heightOffset;
let board_width;
let widthOffset;
let alive_cells = new Map(); // Map[x,y] = state
let stepInterval;
let activeStepInterval = false;
let speed = 500;
let genSpeed = 25;
let satisfyingMode = false;
let points;
let activeScoringCategories = []; //list of {category: String, mult: number}
let displayScoreConditions = ["", "Free Round", ""];

generateBoard();

function generateBoard(width=16, height=16) {
    if(boardExists) {
        document.getElementById("board").remove();
        document.getElementById("rulesContainer").remove();
    }
    boardExists = true;
    
    board_height = height;
    heightOffset = 0;
    board_width = width;
    widthOffset = 0;
    alive_cells = new Map(); // Map[x,y] = state
    points = 0;
    
    stopSteps();
    
    let gameDiv = document.getElementById("game");
    let board = document.createElement("div");
    board.id = "board";
    for(i = 0; i < width; i++) {
        let line = document.createElement("div");
        line.className = "line";
        for (let j = 0; j < height; j++) {
            let space = document.createElement("div");
            space.id = `${j},${i}`;
            space.onclick = function() { setStateWithElement(this, (Number(space.className.split("state-")[1]) + 1) % 5); };
            line.append(space);
            setTimeout(function () {
                space.className = "space pop-out state-0";
            }, i*genSpeed + j*genSpeed);
        }
        board.append(line);
    }
    let rulesPage = document.createElement("div");
    rulesPage.id = "rulesContainer";
    gameDiv.append(board);
    gameDiv.append(rulesPage);

    let score = document.createElement("div");
    score.id = "score";
    rulesPage.append(score);
    let scoreTitle = document.createElement("h1");
    scoreTitle.innerHTML = "Score: 0";
    score.append(scoreTitle);
    let scoresPre = document.createElement("pre");
    scoresPre.id = "scorePre";
    score.append(scoresPre);

    let rules = document.createElement("div");
    rules.id = "rules";
    rulesPage.append(rules);
    let rulesTitle = document.createElement("h1");
    rulesTitle.innerHTML = "Rules";
    rules.append(rulesTitle);
    resetRules();

    for(let i = 0; i < 4; i++) {
        let arrow = document.createElement("div");
        arrow.className = "arrow";
        if(i == 0) arrow.onclick = function() { moveBoard(1, 0); };
        if(i == 1) arrow.onclick = function() { moveBoard(-1, 0); };
        if(i == 2) arrow.onclick = function() { moveBoard(0, -1); };
        if(i == 3) arrow.onclick = function() { moveBoard(0, 1); };
        board.append(arrow);
    }

    console.log("finished generating board");
}

// function randRule() {
    //     addRandRule();
// }

function getAlive() { return alive_cells; }

function randBoard() {
    let rand = Math.floor(Math.random() * (board_width*board_height));
    for(let i = 0; i < rand; i++) {
        setStateWithPos((Math.floor(Math.random() * (board_width-widthOffset))),(Math.floor(Math.random() * (board_height-widthOffset))),Math.ceil(Math.random() * 4));
    }
    if(activeStepInterval) startSteps();
}

function setStateWithPos(x, y, state) { // pass virtual coords
    updateAliveCellsForSetState([x+widthOffset, y+heightOffset].toString(), state);
    // console.log();
    space = getSpace(x, y);
    setAnimationsForSetState(space, state);
}

//takes a space == virtual coords
function setStateWithElement(space, state) {
    let coordOfStrs = space.id.split(',');
    updateAliveCellsForSetState([(parseInt(coordOfStrs[0],10))+widthOffset, (parseInt(coordOfStrs[1],10))+heightOffset].toString(), state);
    setAnimationsForSetState(space, state);
}

//takes in real coords
function updateAliveCellsForSetState(coordStr, state) {
    let coordOfStrs = coordStr.split(',');
    let coordStrMod = [(parseInt(coordOfStrs[0],10)), (parseInt(coordOfStrs[1],10))].toString();
    if(state == DEAD_STATE) {
        alive_cells.delete(coordStrMod);
    } else {
        alive_cells.set(coordStrMod,state);
    }
}
function setStateVisually(x, y, state, skipAnimation=false) { // pass virtuall coords
    let space = getSpace(x+widthOffset,y+heightOffset);
    setAnimationsForSetState(space,state,skipAnimation);
}
function setAnimationsForSetState(space, state, skipAnimation=false) {
    if(skipAnimation) {
        space.className = `space state-${state}`;
        return;
    }
    space.classList.add("shrink");
    setTimeout(() => {
        space.className = `space pop-out state-${state}`;
    }, 150);
}

//takes real coords
function getSpace(x, y) {
    return document.getElementById(`${x-widthOffset},${y-heightOffset}`);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function moveBoard(x, y) {
    subtractMap(alive_cells, true);
    widthOffset += x;
    heightOffset += y;
    addMap(alive_cells, true);
}

// void subtractMap(Map)
function subtractMap(map, skipAnimation=false) {
    map.forEach((value, coordStrOriginal) => {
        //coord[0] is x, coord[1] is y
        let coordOfStrs = coordStrOriginal.split(',');
        let coord = [parseInt(coordOfStrs[0],10), parseInt(coordOfStrs[1],10)];
        if(coord[0] >= widthOffset && coord[0] < board_width+widthOffset && coord[1] >= heightOffset && coord[1] < board_height+heightOffset) {
            setStateVisually(coord[0]-widthOffset,coord[1]-heightOffset, 0,skipAnimation);
        }
    });
}

// void addMap(Map)
function addMap(map, skipAnimation=false) {
    map.forEach((value, coordStrOriginal) => {
        //coord[0] is x, coord[1] is y
        let coordOfStrs = coordStrOriginal.split(',');
        let coord = [parseInt(coordOfStrs[0],10), parseInt(coordOfStrs[1],10)];
        if(coord[0] >= widthOffset && coord[0] < board_width+widthOffset && coord[1] >= heightOffset && coord[1] < board_height+heightOffset && value != getSpace(coord[0], coord[1]).className.split("state-")[1]) {
            setStateVisually(coord[0]-widthOffset,coord[1]-heightOffset, value,skipAnimation);
        }
    });
}

//call once to make a step
function doStep() {
    // console.log("Before:");
    // console.log(alive_cells);
    let new_alive_cells = step(alive_cells);
    let old_alive_cells = mapDifference(alive_cells, new_alive_cells);
    subtractMap(old_alive_cells);
    addMap(new_alive_cells);
    alive_cells = new_alive_cells;
    if(alive_cells.size === 0 && satisfyingMode) {
        stopSteps();
        setTimeout(() => { 
            randBoard();
            startSteps(); 
        }, speed);
    }
    scorePoints();
    updateScore();
    assignNewScoringCategories();
    // console.log("After:");
    // console.log(alive_cells);
    // console.log("____________");
}

//call after a step; score appropriate points
function scorePoints() {
    let i = 0;
    for(let cat of activeScoringCategories) {
        switch(cat.category) {
            case "cellBorn": 
                points += scoringCategories.cellBorn * cat.mult;
                displayScoreConditions[i++] = "cellBorn";
                break;
            case "cellDies":
                points += scoringCategories.cellDies * cat.mult;
                displayScoreConditions[i++] = "cellDies";
                break;
            case "cellAlive":
                points += scoringCategories.cellAlive * cat.mult;
                displayScoreConditions[i++] = "cellAlive";
                break;
            case "maxYDist":
                points += scoringCategories.maxYDist * cat.mult;
                displayScoreConditions[i++] = "maxYDist";
                break;
            case "maxXDist":
                points += scoringCategories.maxXDist * cat.mult;
                displayScoreConditions[i++] = "maxXDist";
                break;
            case "colorBalance":
                points += scoringCategories.colorBalance * cat.mult;
                displayScoreConditions[i++] = "colorBalance";
                break;
            case "colorDominance":
                points += scoringCategories.colorDominance * cat.mult;
                displayScoreConditions[i++] = "colorDominance";
                break;
            default: break;
        }
    }
    // console.log("cats:");
    // console.log(activeScoringCategories);
    // console.log("points:");
    // console.log(points);
    // console.log("_______________________");
}

//call once between two steps to choose new scoring categories
function assignNewScoringCategories() {
    activeScoringCategories = [];

    let cat1 = Math.floor(Math.random() * 7);
    let cat2 = cat1; while(cat1 == cat2) { cat2 = Math.floor(Math.random() * 7); }
    let cat3 = cat1; while(cat3 == cat1 || cat3 == cat2) { cat3 = Math.floor(Math.random() * 7); }

    let range = allScoringCategoryMultiplyers[cat1];
    let mult = Math.floor(Math.random() * (range[1]-range[0]))+range[0];
    activeScoringCategories.push({category: allScoringCategories[cat1], mult: mult});
    
    range = allScoringCategoryMultiplyers[cat2];
    mult = Math.floor(Math.random() * (range[1]-range[0]))+range[0];
    activeScoringCategories.push({category: allScoringCategories[cat2], mult: mult});
    
    range = allScoringCategoryMultiplyers[cat3];
    mult = Math.floor(Math.random() * (range[1]-range[0]))+range[0];
    activeScoringCategories.push({category: allScoringCategories[cat3], mult: mult});
}

function mapDifference(map1, map2) {
    const diff = new Map();
  
    // Check for keys in map1 that are not in map2
    for (const [key, value] of map1) {
        if (!map2.has(key) || map2.get(key) !== value) {
            diff.set(key, value);
        }
    }
  
    return diff;
}

function startSteps() {
    document.getElementById("goButton").style.display = "none";
    document.getElementById("stopButton").style.display = "flex";
    clearInterval(stepInterval);
    stepInterval = setInterval(() => { doStep() }, speed);
    activeStepInterval = true;
}
function stopSteps() {
    document.getElementById("stopButton").style.display = "none";
    document.getElementById("goButton").style.display = "flex";
    clearInterval(stepInterval);
    activeStepInterval = false;
}

function toggleTurbo() {
    if(speed === 500) {
        speed = 100;
        document.getElementById("turboButton").style.filter = "brightness(125%) hue-rotate(-45deg)";
        if(activeStepInterval) startSteps();
    }
    else if(speed === 100) {
        speed = 50;
        document.getElementById("turboButton").style.filter = "brightness(125%) hue-rotate(-120deg)";
        if(activeStepInterval) startSteps();
    }
    else if(speed === 50) {
        speed = 10;
        document.getElementById("turboButton").style.filter = "brightness(125%) hue-rotate(-180deg)";
        if(activeStepInterval) startSteps();
    }
    else {
        speed = 500;
        document.getElementById("turboButton").style.filter = "brightness(100%) hue-rotate(0)";
        if(activeStepInterval) startSteps();
    }
}