class BlackKnight {
  htmlElement: HTMLDivElement;
  index: number;
  piece: string;
  constructor(square: Square) {
    this.htmlElement = square.htmlElement;
    this.index = square.index;
    const firstChild = this.htmlElement.children[0] as HTMLDivElement;
    this.piece = firstChild.innerText = "♞";
    this.addListener();
  }

  calculateMoves(): Square[] {
    const index = this.index;
    const moves: Square[] = [];
    squares.forEach((square) => {
      if (
        blackPieces.some((blackPiece) => blackPiece === getText(square.index))
      )
        return;

      if (
        Math.abs(
          square.column.charCodeAt(0) - squares[index].column.charCodeAt(0)
        ) === 1 &&
        Math.abs(square.row - squares[index].row) === 2
      )
        moves.push(square);
      else if (
        Math.abs(
          square.column.charCodeAt(0) - squares[index].column.charCodeAt(0)
        ) === 2 &&
        Math.abs(square.row - squares[index].row) === 1
      )
        moves.push(square);
    });
    return moves;
  }

  verifyMoves(): Square[] {
    let moves = this.calculateMoves();
    let verifiedMoves: Square[] = [];
    moves.forEach((move) => {
      if (getText(move.index) === "") {
        setText(move, this.piece);
        setText(squares[this.index], "");
        if (!calculateAllMoves("white").includes(squares[blackKingIndex]))
          verifiedMoves.push(move);
        setText(move, "");
        setText(squares[this.index], this.piece);
      } else {
        let originalWhitePiecesOnBoard = [...whitePiecesOnBoard];
        whitePiecesOnBoard = whitePiecesOnBoard.filter(
          (piece) => piece.htmlElement !== move.htmlElement
        );
        let originalMoveText = getText(move.index);
        setText(move, this.piece);
        setText(squares[this.index], "");
        if (!calculateAllMoves("white").includes(squares[blackKingIndex]))
          verifiedMoves.push(move);
        setText(move, originalMoveText);
        setText(squares[this.index], this.piece);
        whitePiecesOnBoard = [...originalWhitePiecesOnBoard];
      }
    });
    return verifiedMoves;
  }

  addListener(): void {
    const mainController = new AbortController();
    this.htmlElement.addEventListener(
      "click",
      () => {
        if (playerToMove !== "black") return;
        if (blackActiveMovesAbortController)
          blackActiveMovesAbortController.abort();
        const movesController = new AbortController();
        removeBackground();
        lastChoosenSquare = squares[this.index];
        this.htmlElement.classList.add("choosen-piece");
        blackActiveMovesAbortController = movesController;
        const moves = this.verifyMoves();
        movesToRemoveBackground = [...moves];
        moves.forEach((square) => {
          if (getText(square.index) === "")
            square.htmlElement.lastElementChild.classList.add("active");
          else {
            square.htmlElement.lastElementChild.classList.add(
              "active",
              "with-piece"
            );
            square.htmlElement.classList.add("with-piece");
          }
          square.htmlElement.addEventListener(
            "click",
            () => {
              squares[blackKingIndex].htmlElement.classList.remove("checked");
              this.htmlElement.classList.remove("choosen-piece");
              if (getText(square.index) !== "") {
                whitePiecesOnBoard = whitePiecesOnBoard.filter(
                  (piece) => piece.htmlElement !== square.htmlElement
                );
              }
              const new_element = square.htmlElement.cloneNode(
                true
              ) as HTMLDivElement;
              square.htmlElement.replaceWith(new_element);
              square.htmlElement = new_element;
              setText(squares[this.index], "");
              this.htmlElement = square.htmlElement;
              this.index = square.index;
              setText(square, this.piece);
              playerToMove = "white";
              mainController.abort();
              movesController.abort();
              moves.forEach((e) => {
                e.htmlElement.lastElementChild.classList.remove(
                  "active",
                  "with-piece"
                );
                e.htmlElement.classList.remove("with-piece");
              });
              this.addListener();
              isWhiteKingMatedOrStalemate();
            },
            { signal: movesController.signal }
          );
        });
      },
      { signal: mainController.signal }
    );
  }
}

blackPiecesOnBoard.push(
  new BlackKnight(squares[1]),
  new BlackKnight(squares[6])
);
