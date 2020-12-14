var
  stockFish = null,
  stateElem = document.getElementById("Chess State"),
  inputElem = document.getElementById("Chess Input"),
  hoverElem = document.getElementById("Chess Hover"),
  gameMoves = "position startpos moves ",
  tentativeGameMoves = gameMoves,
  lastFen = "",
  playersTurn = false,
  aiMovingPlayer = false,
  whiteSideAdvantage = 0.14,
  previousWhiteSideAdvantage = 0.14,
  currentDepth = 3,
  accumulateMove = "",
  accumulateBoard = "";

Stockfish().then(sf => {
  stockFish = sf;

  sf.addMessageListener(line => {
    
    if (line.startsWith("Fen: ")) {                  // Receive the latest board state
      if (line !== lastFen) {                        // The last move was valid
        lastFen   = line;                            // Records the last state
        gameMoves = tentativeGameMoves;              // Canonizes the last move
        stockFish.postMessage(tentativeGameMoves);   // Resets the board in-case the state is messed
        playersTurn = !playersTurn;                  // Sets it to the other side's turn

        if (!playersTurn || aiMovingPlayer) {
          stockFish.postMessage('go depth ' + currentDepth); // Asks the AI for its opinion on the next move
          aiMovingPlayer = false;
        }
      } else {
        console.error("You just made an illegal move!  Try again!  Moves are: "+gameMoves);
      }
      stateElem.innerHTML = accumulateBoard;
    }

    // Request 
    if (!playersTurn && line.startsWith("best")) {
      makeMove(line.slice(9, 14));
      stockFish.postMessage('eval');
    }

    // This is a gameboard line
    if (line.startsWith(" +") ||
        line.startsWith(" |")) {
      accumulateBoard += replacewithUnicodePieces(line) + "\n";
    } else if (line.startsWith("   a")) {
      accumulateBoard += line + "\n";
    } else {
      console.log(line);
    }

    if (line.startsWith("Final evaluation: ")) {
      previousWhiteSideAdvantage = whiteSideAdvantage;
      whiteSideAdvantage = parseFloat(line.slice("Final evaluation: ".length, -" (white side)".length));
    }
  });

  // Make the bot a little easier
  stockFish.postMessage('setoption name Skill Level value 1');
  stockFish.postMessage('d');
});

function makeMove(input) {
  tentativeGameMoves = gameMoves + input.trim() + " ";
  stockFish.postMessage(tentativeGameMoves);
  accumulateBoard = "";
  accumulateMove  = "";

  // Update the state of the visualization
  stockFish.postMessage('d');
}

stateElem.onmousedown = function dragStart(e) {
  if (e.preventDefault) e.preventDefault();
  if(e.preventDefault) e.preventDefault();
  accumulateMove += getCell(e);
}
stateElem.onmouseup = function dragEnd(e) {
  if(e.stopPropagation) e.stopPropagation();
  if(e.preventDefault) e.preventDefault();
  accumulateMove += getCell(e);
  if (accumulateMove.length >= 4) {
    makeMove(accumulateMove);
    accumulateMove = "";
  }
}

function getCell(e) {
  let rect = stateElem.getBoundingClientRect();
  let minDim = Math.min(rect.width, rect.height);
  let letters = "abcdefgh";
  let x = Math.floor(9.5 * ((e.clientX - rect.left)/minDim));
  let y = Math.floor(9   * ((e.clientY - rect.top )/minDim));
  x = Math.min(7, Math.max(0, x));
  y = Math.min(7, Math.max(0, y));
  return letters[x] + (8 - y);
}

function replacewithUnicodePieces(inputString = "") {
  let output = inputString;
  output = output.replace(/ P /g, ' <span class="specialchar">♙</span> ');
  output = output.replace(/ N /g, ' <span class="specialchar">♘</span> ');
  output = output.replace(/ B /g, ' <span class="specialchar">♗</span> ');
  output = output.replace(/ Q /g, ' <span class="specialchar">♕</span> ');
  output = output.replace(/ K /g, ' <span class="specialchar">♔</span> ');
  output = output.replace(/ R /g, ' <span class="specialchar">♖</span> ');
  output = output.replace(/ p /g, ' <span class="specialchar">♟</span> ');
  output = output.replace(/ n /g, ' <span class="specialchar">♞</span> ');
  output = output.replace(/ b /g, ' <span class="specialchar">♝</span> ');
  output = output.replace(/ q /g, ' <span class="specialchar">♛</span> ');
  output = output.replace(/ k /g, ' <span class="specialchar">♚</span> ');
  output = output.replace(/ r /g, ' <span class="specialchar">♜</span> ');
  return output;
}
