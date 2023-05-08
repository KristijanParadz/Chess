class BlackPawn {
  htmlElement: HTMLDivElement;
  index: number;
  piece: string;
  constructor(square: Square) {
    this.htmlElement = square.htmlElement;
    this.index = square.index;
    const firstChild = this.htmlElement.children[0] as HTMLDivElement;
    this.piece = firstChild.innerText = "♟";
    this.addListener();
  }

  calculateFront(): Square[] {
    const index = this.index;
    if (getText(index + 8) !== "") return [];
    if (index >= 8 && index <= 15)
      return getText(index + 16) !== ""
        ? [squares[index + 8]]
        : [squares[index + 8], squares[index + 16]];
    return [squares[index + 8]];
  }

  calculateDiagonal(): Square[] {
    const index = this.index;
    const arrayOfMoves: Square[] = [];
    if (
      isBetween(-1, 64, index + 7) &&
      whitePieces.some(
        (whitePiece) =>
          whitePiece === getText(index + 7) &&
          squares[index + 7].row !== squares[index].row
      )
    )
      arrayOfMoves.push(squares[index + 7]);
    if (
      isBetween(-1, 64, index + 9) &&
      whitePieces.some((whitePiece) => whitePiece === getText(index + 9)) &&
      Math.abs(squares[index].row - squares[index + 9].row) === 1
    )
      arrayOfMoves.push(squares[index + 9]);
    return arrayOfMoves;
  }

  calculateMoves(): Square[] {
    return [...this.calculateFront(), ...this.calculateDiagonal()];
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

  handleQueenTransform(square: Square): void {
    const index = this.index;
    setText(squares[index], "");
    const newPawnElement = squares[index].htmlElement.cloneNode(
      true
    ) as HTMLDivElement;
    squares[index].htmlElement.replaceWith(newPawnElement);
    squares[index].htmlElement = newPawnElement;
    blackPiecesOnBoard = blackPiecesOnBoard.filter(
      (piece) => piece.index !== index
    );
    blackPiecesOnBoard.push(new BlackQueen(squares[square.index]));
    return;
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
              if (square.row === 1) this.handleQueenTransform(square);
              else {
                setText(squares[this.index], "");
                this.htmlElement = square.htmlElement;
                this.index = square.index;
                setText(square, this.piece);
                this.addListener();
              }
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
  new BlackPawn(squares[8]),
  new BlackPawn(squares[9]),
  new BlackPawn(squares[10]),
  new BlackPawn(squares[11]),
  new BlackPawn(squares[12]),
  new BlackPawn(squares[13]),
  new BlackPawn(squares[14]),
  new BlackPawn(squares[15])
);
