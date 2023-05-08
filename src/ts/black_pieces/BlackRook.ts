class BlackRook {
  htmlElement: HTMLDivElement;
  index: number;
  piece: string;
  isMoved: boolean;
  constructor(square: Square) {
    this.htmlElement = square.htmlElement;
    this.index = square.index;
    const firstChild = this.htmlElement.children[0] as HTMLDivElement;
    this.piece = firstChild.innerText = "♜";
    this.isMoved = false;
    this.addListener();
  }

  calculateLeftOrRight(leftOrRight: string): Square[] {
    const arrayOfMoves: Square[] = [];
    let currentIndex = leftOrRight === "left" ? this.index - 1 : this.index + 1;
    while (true) {
      if (
        !isBetween(-1, 64, currentIndex) ||
        squares[currentIndex].row !== squares[this.index].row
      )
        return arrayOfMoves;

      if (getText(currentIndex) !== "") {
        return whitePieces.some(
          (whitePiece) => whitePiece === getText(currentIndex)
        )
          ? [...arrayOfMoves, squares[currentIndex]]
          : arrayOfMoves;
      }
      arrayOfMoves.push(squares[currentIndex]);
      leftOrRight === "left" ? currentIndex-- : currentIndex++;
    }
  }

  calculateUpOrDown(upOrDown: string): Square[] {
    const arrayOfMoves: Square[] = [];
    let currentIndex = upOrDown === "up" ? this.index - 8 : this.index + 8;
    while (true) {
      if (!isBetween(-1, 64, currentIndex)) return arrayOfMoves;

      if (getText(currentIndex) !== "")
        return whitePieces.some(
          (whitePiece) => whitePiece === getText(currentIndex)
        )
          ? [...arrayOfMoves, squares[currentIndex]]
          : arrayOfMoves;
      arrayOfMoves.push(squares[currentIndex]);
      upOrDown === "up" ? (currentIndex -= 8) : (currentIndex += 8);
    }
  }

  calculateMoves(): Square[] {
    return [
      ...this.calculateLeftOrRight("left"),
      ...this.calculateLeftOrRight("right"),
      ...this.calculateUpOrDown("up"),
      ...this.calculateUpOrDown("down"),
    ];
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
              this.isMoved = true;
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

blackPiecesOnBoard.push(new BlackRook(squares[0]), new BlackRook(squares[7]));
