class WhiteQueen {
  htmlElement: HTMLDivElement;
  index: number;
  piece: string;
  constructor(square: Square) {
    this.htmlElement = square.htmlElement;
    this.index = square.index;
    const firstChild = this.htmlElement.children[0] as HTMLDivElement;
    this.piece = firstChild.innerText = "♕";
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
        return blackPieces.some(
          (blackPiece) => blackPiece === getText(currentIndex)
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
        return blackPieces.some(
          (blackPiece) => blackPiece === getText(currentIndex)
        )
          ? [...arrayOfMoves, squares[currentIndex]]
          : arrayOfMoves;
      arrayOfMoves.push(squares[currentIndex]);
      upOrDown === "up" ? (currentIndex -= 8) : (currentIndex += 8);
    }
  }

  calculateUpLeftOrDownRight(upLeftOrDownRight: string) {
    const arrayOfMoves: Square[] = [];
    const index = this.index;
    let currentIndex = upLeftOrDownRight === "up-left" ? index - 9 : index + 9;
    while (true) {
      if (!isBetween(-1, 64, currentIndex)) return arrayOfMoves;

      if (
        Math.abs(
          squares[index].column.charCodeAt(0) -
            squares[currentIndex].column.charCodeAt(0)
        ) !== Math.abs(squares[index].row - squares[currentIndex].row)
      ) {
        upLeftOrDownRight === "up-left"
          ? (currentIndex -= 9)
          : (currentIndex += 9);
        continue;
      }

      if (getText(currentIndex) !== "")
        return blackPieces.some(
          (blackPiece) => blackPiece === getText(currentIndex)
        )
          ? [...arrayOfMoves, squares[currentIndex]]
          : arrayOfMoves;
      arrayOfMoves.push(squares[currentIndex]);
      upLeftOrDownRight === "up-left"
        ? (currentIndex -= 9)
        : (currentIndex += 9);
    }
  }

  calculateUpRightOrDownLeft(upRightOrDownLeft: string) {
    const arrayOfMoves: Square[] = [];
    const index = this.index;
    let currentIndex = upRightOrDownLeft === "up-right" ? index - 7 : index + 7;
    while (true) {
      if (!isBetween(-1, 64, currentIndex)) return arrayOfMoves;

      if (
        Math.abs(
          squares[index].column.charCodeAt(0) -
            squares[currentIndex].column.charCodeAt(0)
        ) !== Math.abs(squares[index].row - squares[currentIndex].row)
      ) {
        upRightOrDownLeft === "up-right"
          ? (currentIndex -= 7)
          : (currentIndex += 7);
        continue;
      }

      if (getText(currentIndex) !== "")
        return blackPieces.some(
          (blackPiece) => blackPiece === getText(currentIndex)
        )
          ? [...arrayOfMoves, squares[currentIndex]]
          : arrayOfMoves;
      arrayOfMoves.push(squares[currentIndex]);
      upRightOrDownLeft === "up-right"
        ? (currentIndex -= 7)
        : (currentIndex += 7);
    }
  }

  calculateBishopMoves(): Square[] {
    return [
      ...this.calculateUpLeftOrDownRight("up-left"),
      ...this.calculateUpLeftOrDownRight("down-right"),
      ...this.calculateUpRightOrDownLeft("up-right"),
      ...this.calculateUpRightOrDownLeft("down-left"),
    ];
  }

  calculateRookMoves(): Square[] {
    return [
      ...this.calculateLeftOrRight("left"),
      ...this.calculateLeftOrRight("right"),
      ...this.calculateUpOrDown("up"),
      ...this.calculateUpOrDown("down"),
    ];
  }

  calculateMoves(): Square[] {
    return [...this.calculateBishopMoves(), ...this.calculateRookMoves()];
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

whitePiecesOnBoard.push(new WhiteQueen(squares[59]));
