class WhiteKnight {
  htmlElement: HTMLDivElement;
  index: number;
  piece: string;
  constructor(square: Square) {
    this.htmlElement = square.htmlElement;
    this.index = square.index;
    const firstChild = this.htmlElement.children[0] as HTMLDivElement;
    this.piece = firstChild.innerText = "♘";
    this.addListener();
  }

  calculateMoves(): Square[] {
    const index = this.index;
    const moves: Square[] = [];
    squares.forEach((square) => {
      if (
        whitePieces.some((whitePiece) => whitePiece === getText(square.index))
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
        if (!calculateAllMoves("black").includes(squares[whiteKingIndex]))
          verifiedMoves.push(move);
        setText(move, "");
        setText(squares[this.index], this.piece);
      } else {
        let originalBlackPiecesOnBoard = [...blackPiecesOnBoard];
        blackPiecesOnBoard = blackPiecesOnBoard.filter(
          (piece) => piece.htmlElement !== move.htmlElement
        );
        let originalMoveText = getText(move.index);
        setText(move, this.piece);
        setText(squares[this.index], "");
        if (!calculateAllMoves("black").includes(squares[whiteKingIndex]))
          verifiedMoves.push(move);
        setText(move, originalMoveText);
        setText(squares[this.index], this.piece);
        blackPiecesOnBoard = [...originalBlackPiecesOnBoard];
      }
    });
    return verifiedMoves;
  }

  addListener(): void {
    const mainController = new AbortController();
    this.htmlElement.addEventListener(
      "click",
      () => {
        if (playerToMove !== "white") return;
        if (whiteActiveMovesAbortController)
          whiteActiveMovesAbortController.abort();
        const movesController = new AbortController();
        removeBackground();
        lastChoosenSquare = squares[this.index];
        this.htmlElement.classList.add("choosen-piece");
        whiteActiveMovesAbortController = movesController;
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
              squares[whiteKingIndex].htmlElement.classList.remove("checked");
              this.htmlElement.classList.remove("choosen-piece");
              if (getText(square.index) !== "") {
                blackPiecesOnBoard = blackPiecesOnBoard.filter(
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
              playerToMove = "black";
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
              isBlackKingMatedOrStalemate();
            },
            { signal: movesController.signal }
          );
        });
      },
      { signal: mainController.signal }
    );
  }
}

whitePiecesOnBoard.push(
  new WhiteKnight(squares[57]),
  new WhiteKnight(squares[62])
);
