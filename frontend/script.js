const socket = io();





// DOM references

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const userName = document.getElementById('userName');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

const cells = document.querySelectorAll("td");
let whitePieces = document.querySelectorAll(".white-piece");
let blackPieces = document.querySelectorAll(".black-piece");
const whiteTurnText = document.querySelectorAll(".white-turn-text");
const blackTurnText = document.querySelectorAll(".black-turn-text");
const divider = document.querySelector("#divider")
const player1div = document.getElementById('player1');
const player2div = document.getElementById('player2');
const namediv = document.getElementById('name_div');
const gameCodeDiv = document.getElementById('game_code_div');


newGameBtn.addEventListener('click',newGame);
joinGameBtn.addEventListener('click',joinGame);



socket.on('init',handleInit);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('gameCode',handleGameCode);
socket.on('makeMove_server',handlemakeMove);
socket.on('makeMoveForBlock_server',handleMakeMoveForBlock);
socket.on('givePiecesEventListener',givePiecesEventListeners);
socket.on('White_won',handleWhiteWon);
socket.on('Black_won',handleBlackWon);
socket.on('ChangePlayer',changePlayer);
socket.on('y',y);
socket.on('div_name',handlediv_name);

function handlediv_name({player1,player2}){
    
    player1div.innerText = player1 + `'s` + 'Turn';
    player2div.innerText = player2 + `'s` + 'Turn';
    gameCodeDiv.style.display = "none";
    namediv.style.display = "block";
    namediv.style.display = "flex";
    namediv.style.justifyContent = "space-between";

}




let gameActive = false;
let playerNumber;



function handleGameCode(roomName){
    gameCodeDisplay.innerText = roomName;
}

function handleInit(number){
    playerNumber = number;
}

function handleUnknownCode() {
    reset();
    alert('Unknown Game Code')
}

function handleTooManyPlayers() {
    reset();
    alert('This game is already in progress');
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}




function newGame() {
    const name = userName.value;
    socket.emit('newGame',name);
    init();
}

function joinGame() {

  const code = gameCodeInput.value;
  const name = userName.value;
  console.log(`game code from script is ${code}`)
  
  socket.emit('joinGame', ({code,name}));
  init();
}





function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
    gameActive = true;
  }

  const board = [
    null,null,null,1,null,null,2,null,null,null,
    null,null,null,null,null,null,null,null,null,null,
    null,null,null,null,null,null,null,null,null,null,
    3,null,null,null,null,null,null,null,null,4,
    null,null,null,null,null,null,null,null,null,null,
    null,null,null,null,null,null,null,null,null,null,
    5,null,null,null,null,null,null,null,null,6,
    null,null,null,null,null,null,null,null,null,null,
    null,null,null,null,null,null,null,null,null,null,
    null,null,null,7,null,null,8,null,null,null
]






let turn = true;
let playerPieces;
let available_moves;
available_moves = [];
let temp_id;
let secondmove = false;

let selectedPiece = {
    pieceID: -1,
    x_pos: -1,
    y_pos: -1,
    
}


//initailize event listeners on pieces
function givePiecesEventListeners(){
    if(turn){
        for(let i=0;i< whitePieces.length;i++){
            whitePieces[i].addEventListener("click",getPlayerPieces);
        }
    }else{
        for(let i=0;i<blackPieces.length;i++){
            blackPieces[i].addEventListener("click",getPlayerPieces);
        }
    }
}



function getPlayerPieces(event){
    temp_id = event.target.id;
    if(turn){
        playerPieces = whitePieces;
    }else{
        playerPieces = blackPieces;
    }

    removeCellonClick();
    resetBorders();
}

function removeCellonClick(){
    for(let i=0;i<cells.length;i++){
        cells[i].removeAttribute("onclick");
        cells[i].style.cursor = 'default';
    }
}

function resetBorders(){
    for(let i =0;i<playerPieces.length;i++){
        playerPieces[i].style.border = "3px solid white";
        
    }
    resetSelectedPieceProperties();
    getSelectedPiece();
}

function resetSelectedPieceProperties(){
    
    selectedPiece.pieceID = -1;
    selectedPiece.x_pos = -1;
    selectedPiece.y_pos = -1;
    available_moves = [];
    
}

function getSelectedPiece(){
    console.log('getSelectePiece')
    resetSelectedPieceProperties();
    resetSelectedPieceProperties();
    selectedPiece.pieceID = parseInt(temp_id);
    selectedPiece.x_pos = findx(temp_id);
    
    selectedPiece.y_pos = findy(temp_id);
    
    getAvailablePieces();
}

let findx = function(pieceId){
    let parsed = parseInt(pieceId);
    return (board.indexOf(parsed)%10);
}

let findy = function(pieceId){
    let parsed = parseInt(pieceId);
    return Math.floor(board.indexOf(parsed)/10);
}

function getAvailablePieces(){
    let x = selectedPiece.x_pos
    let y = selectedPiece.y_pos
    let flag = true
    let temp_index;
    //for left side horizontally
    x--;
    flag = true;
    
    while(x>=0 && flag){
        temp_index = 10*y + x;
        if(board[temp_index]===null){
            available_moves.push(temp_index);
            x--;
        }else{
            flag = false;
        }
    }

    
    //for right side horizntally
    flag = true;
    x = selectedPiece.x_pos
    y = selectedPiece.y_pos
    x++;
    while(x<=9 && flag){
        temp_index = 10*y + x;
        if(board[temp_index]===null){
            available_moves.push(temp_index);
            x++;
        }else{
            flag = false;
        }
    }
    //for up side vertically

    flag = true;
    x = selectedPiece.x_pos
    y = selectedPiece.y_pos

    y--;
    while(y>=0 && flag){
        temp_index = 10*y + x;
        if(board[temp_index]===null){
            available_moves.push(temp_index);
            y--;
        }else{
            flag = false;
        }
    }

    //for downside vertically

    flag = true;
    x = selectedPiece.x_pos
    y = selectedPiece.y_pos

    y++;
    while(y<=9 && flag){
        temp_index = 10*y + x;
        if(board[temp_index]===null){
            available_moves.push(temp_index);
            y++;
        }else{
            flag = false;
        }
    }
    //for left top side diagonally

    flag = true;
    x = selectedPiece.x_pos
    y = selectedPiece.y_pos

    x--;
    y--;
    while(x>=0 &&  y>=0 && flag){
        temp_index = 10*y + x;
        if(board[temp_index]===null){
            available_moves.push(temp_index);
            x--;
            y--;
        }else{
            flag = false;
        }
    }
    //for right down side diagonally
    flag = true;

    x = selectedPiece.x_pos
    y = selectedPiece.y_pos

    x++;
    y++;
    while(x<=9 && y<=9 && flag){
        temp_index = 10*y + x;
        if(board[temp_index]===null){
            available_moves.push(temp_index);
            x++;
            y++;
        }else{
            flag = false;
        }
    }
    //for left down side diagonally

    flag = true;
    x = selectedPiece.x_pos
    y = selectedPiece.y_pos
    y++;
    x--;
    while(x>=0 && y<=9 && flag){
        temp_index = 10*y + x;
        if(board[temp_index]===null){
            available_moves.push(temp_index);
            y++;
            x--;
        }else{
            flag = false;
        }
    }
    //for right up side diagonally
    flag = true;

    x = selectedPiece.x_pos
    y = selectedPiece.y_pos
    x++;
    y--;
    while(x<=9 && y>=0 && flag){
        temp_index = 10*y + x;
        if(board[temp_index]===null){
            available_moves.push(temp_index);
            x++;
            y--;
        }else{
            flag = false;
        }
    }  
    if(secondmove){
        giveCellsClickForBlock();
        secondmove = false;
    }else{
    givePieceBorder();  
        
    }
}



function givePieceBorder(){
    if(available_moves.length !== 0){
        document.getElementById(selectedPiece.pieceID).style.border = "3px solid green";
        giveCellsClick();
    }else{
        return;
    }
}

function giveCellsClickForBlock(){
    if(available_moves.length !== 0){
        for(let i=0;i<available_moves.length;i++){
            cells[available_moves[i]].setAttribute("onclick",`makeMoveForBlock(${available_moves[i]})`);
            cells[available_moves[i]].style.cursor = 'pointer';
        }
    }
    else{
        return;
    }
}

function giveCellsClick(){
    for(let i=0;i<available_moves.length;i++){
        cells[available_moves[i]].setAttribute("onclick",`makeMove(${available_moves[i]})`);
        cells[available_moves[i]].style.cursor = 'pointer';
    }
}

function handleMakeMoveForBlock(number){
    cells[number].innerHTML = `<span class="circle"></span>`;
    board[number] = -1;
}

function makeMoveForBlock(number){
    socket.emit('makeMoveForBlock_server',number);
    resetSelectedPieceProperties();
    removeCellonClick();
    secondmove = false;
    checkForWin();
    
}

function handleWhiteWon(){
    divider.style.display = "none";
    for(let i=0;i<whiteTurnText.length;i++){
        whiteTurnText[i].style.color = "black";
        blackTurnText[i].style.display = "none";
        whiteTurnText[i].textContent = "White WINS!!";
        let btn = document.createElement("button");
        btn.innerHTML = "Play Again";
        btn.setAttribute("onclick","location.reload()");
        whiteTurnText[i].appendChild(btn);
    }
}
function handleBlackWon(){
    divider.style.display = "none";
    for(let i=0;i<blackTurnText.length;i++){
        blackTurnText[i].style.color = "black";
        whiteTurnText[i].style.display = "none";
        blackTurnText[i].textContent = "Black WINS!!"
        let btn = document.createElement("button");
        btn.innerHTML = "Play Again";
        btn.setAttribute("onclick","location.reload()");
        blackTurnText[i].appendChild(btn);
    }
}
function checkForWin(){
    let temp_flag;
    let arr;
    if(turn){
        arr = [1,2,3,4]
        temp_flag = checkifmovesavailable(arr);
        if(temp_flag){
            socket.emit('White_won');
        }
    }else{
        arr = [5,6,7,8];
        temp_flag = checkifmovesavailable(arr);
        if(temp_flag){
            socket.emit('Black_won');
        }
    }
    if(!temp_flag){
        socket.emit('ChangePlayer');
    }
    
}
function checkifmovesavailable(arr){
    let x;
    let y;
    let temp_x;
    let temp_y;
    let flag = true;
    for(let i=0;i<arr.length;i++){
        if(!flag){break;}
        temp_x = findx(arr[i]);
        temp_y = findy(arr[i]);
        for(let j=0;j<3;j++){
            if(!flag){break;}
            x = temp_x - 1 + j;
            for(let k=0;k<3;k++){
                if(!flag){break;}
                y = temp_y - 1 + k;
                if(x>=0 && y>=0 && x<=9 && y<=9 && (x!=temp_x || y!=temp_y)){
                    if(board[y*10 + x]===null){
                        flag = false;
                        break;
                    }
                }
            }
        }
    }
    return flag;
}


function handlemakeMove(data){
    console.log('handlemakeMove');
    let piece = data;
    cells[piece.selectedPiece.y_pos*10 + piece.selectedPiece.x_pos].innerHTML = "";
    board[piece.selectedPiece.y_pos*10 + piece.selectedPiece.x_pos] = null;
    if(turn){
        cells[piece.number].innerHTML =  `<div class="white-piece" id="${piece.selectedPiece.pieceID}">♕</div>`;
        board[piece.number] = piece.selectedPiece.pieceID;
        whitePieces = document.querySelectorAll(".white-piece");
        
    }else{
        cells[piece.number].innerHTML = `<div class="black-piece" id="${piece.selectedPiece.pieceID}">♛</div>`;
        board[piece.number] = piece.selectedPiece.pieceID;
        blackPieces = document.querySelectorAll(".black-piece");
        
    }
    
}


function makeMove(number){
    let data = {number: number,
    selectedPiece: selectedPiece}
    console.log(data)
    socket.emit('makeMove_server',data);
}
function y(){
    removeCellonClick();
    removeEventListeners();
    updateavailablemoves();
}

function updateavailablemoves(){
    console.log('updateavailablemoves');
    secondmove = true;
    console.log("updateavaialablemoves working");
    console.log(selectedPiece);
    console.log(temp_id);
    temp_id = selectedPiece.pieceID;
    resetSelectedPieceProperties();
    getSelectedPiece();

}

function removeEventListeners(){
    if(turn){
        for(let i=0;i<whitePieces.length;i++){
            whitePieces[i].removeEventListener("click",getPlayerPieces);
        }
    }else{
        for(let i=0;i<blackPieces.length;i++){
            blackPieces[i].removeEventListener("click",getPlayerPieces);
        }
    }
}

function changePlayer(){
    if(turn){
        turn = false;
    
        for(let i=0;i< whiteTurnText.length;i++){
            whiteTurnText[i].style.color = "lightGrey";
            blackTurnText[i].style.color = "black";
        }
        removeborder(whitePieces);
    }else{
        turn = true;
        for(let i=0;i<blackTurnText.length;i++){
            blackTurnText[i].style.color = "lightGrey";
            whiteTurnText[i].style.color = "black";
        }
        
        removeborder(blackPieces);
    }
}
function removeborder(pieces){
    for(let i=0;i<pieces.length;i++){
        pieces[i].style.border = "";
    }
}



