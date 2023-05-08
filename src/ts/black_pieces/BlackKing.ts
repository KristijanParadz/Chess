class BlackKing {
  htmlElement: HTMLDivElement;
  index: number;
  piece: string;
  isMoved: boolean;

  constructor(square: Square) {
    this.htmlElement = square.htmlElement;
    this.index = square.index;
    const firstChild = this.htmlElement.children[0] as HTMLDivElement;
    this.piece = firstChild.innerText = "♚";
    this.isMoved = false;
    this.addListener();
  }

  calculateCastleH(): Square[] {
    const rookH8 = blackPiecesOnBoard.find(
      (piece) =>
        piece.index === 7 && piece.piece === "♜" && piece.isMoved === false
    );
    if (
      this.isMoved === true ||
      !rookH8 ||
      isBlackKingChecked() ||
      getText(5) !== "" ||
      getText(6) !== ""
    )
      return [];
    const whiteMoves = calculateAllMoves("white");
    if (whiteMoves.includes(squares[5]) || whiteMoves.includes(squares[6]))
      return [];
    return [squares[6]];
  }

  calculateCastleA(): Square[] {
    const rookA8 = blackPiecesOnBoard.find(
      (piece) =>
        piece.index === 0 && piece.piece === "♜" && piece.isMoved === false
    );
    if (
      this.isMoved === true ||
      !rookA8 ||
      isBlackKingChecked() ||
      getText(1) !== "" ||
      getText(2) !== "" ||
      getText(3) !== ""
    )
      return [];
    const whiteMoves = calculateAllMoves("white");
    if (whiteMoves.includes(squares[2]) || whiteMoves.includes(squares[3]))
      return [];
    return [squares[2]];
  }

  calculateMoves(): Square[] {
    const index = this.index;
    const indexsToConsider = [
      index - 1,
      index + 1,
      index - 7,
      index + 7,
      index - 8,
      index + 8,
      index - 9,
      index + 9,
    ];
    const moves = indexsToConsider
      .filter((ind) => {
        if (
          !isBetween(-1, 64, ind) ||
          blackPieces.some((piece) => piece === getText(ind))
        )
          return false;
        if (ind === index - 1 || ind === index + 1)
          return squares[ind].row === squares[index].row ? true : false;
        if (ind === index - 7 || ind === index + 7)
          return squares[ind].row !== squares[index].row ? true : false;
        if (ind === index - 9 || ind === index + 9)
          return Math.abs(squares[ind].row - squares[index].row) === 1
            ? true
            : false;
        return true;
      })
      .map((ind) => squares[ind]);
    return moves;
  }

  verifyMoves(): Square[] {
    let moves = this.calculateMoves();
    let verifiedMoves: Square[] = [];
    moves.forEach((move) => {
      if (getText(move.index) === "") {
        setText(move, this.piece);
        setText(squares[this.index], "");
        blackKingIndex = move.index;
        if (!calculateAllMoves("white").includes(squares[blackKingIndex]))
          verifiedMoves.push(move);
        setText(move, "");
        setText(squares[this.index], this.piece);
        blackKingIndex = this.index;
      } else {
        let originalWhitePiecesOnBoard = [...whitePiecesOnBoard];
        whitePiecesOnBoard = whitePiecesOnBoard.filter(
          (piece) => piece.htmlElement !== move.htmlElement
        );
        let originalMoveText = getText(move.index);
        setText(move, this.piece);
        setText(squares[this.index], "");
        blackKingIndex = move.index;
        if (!calculateAllMoves("white").includes(squares[blackKingIndex]))
          verifiedMoves.push(move);
        setText(move, originalMoveText);
        setText(squares[this.index], this.piece);
        whitePiecesOnBoard = [...originalWhitePiecesOnBoard];
        blackKingIndex = this.index;
      }
    });
    return [
      ...verifiedMoves,
      ...this.calculateCastleA(),
      ...this.calculateCastleH(),
    ];
  }

  handleCastle(square: Square): void {
    if (Math.abs(square.index - this.index) !== 2) return;
    if (square.index === 6) {
      setText(squares[7], "");
      const newRookElement = squares[7].htmlElement.cloneNode(
        true
      ) as HTMLDivElement;
      squares[7].htmlElement.replaceWith(newRookElement);
      squares[7].htmlElement = newRookElement;
      blackPiecesOnBoard = blackPiecesOnBoard.filter(
        (piece) => piece.index !== 7
      );
      blackPiecesOnBoard.push(new BlackRook(squares[5]));
      return;
    }

    setText(squares[0], "");
    const newRookElement = squares[0].htmlElement.cloneNode(
      true
    ) as HTMLDivElement;
    squares[0].htmlElement.replaceWith(newRookElement);
    squares[0].htmlElement = newRookElement;
    blackPiecesOnBoard = blackPiecesOnBoard.filter(
      (piece) => piece.index !== 0
    );
    blackPiecesOnBoard.push(new BlackRook(squares[3]));
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
              this.isMoved = true;
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
              this.handleCastle(square);
              setText(squares[this.index], "");
              this.htmlElement = square.htmlElement;
              this.index = square.index;
              setText(square, this.piece);
              blackKingIndex = this.index;
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

blackPiecesOnBoard.push(new BlackKing(squares[4]));
