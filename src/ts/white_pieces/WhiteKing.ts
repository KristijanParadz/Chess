class WhiteKing {
  htmlElement: HTMLDivElement;
  index: number;
  piece: string;
  isMoved: boolean;

  constructor(square: Square) {
    this.htmlElement = square.htmlElement;
    this.index = square.index;
    const firstChild = this.htmlElement.children[0] as HTMLDivElement;
    this.piece = firstChild.innerText = "♔";
    this.isMoved = false;
    this.addListener();
  }

  calculateCastleH(): Square[] {
    const rookH1 = whitePiecesOnBoard.find(
      (piece) =>
        piece.index === 63 && piece.piece === "♖" && piece.isMoved === false
    );
    if (
      this.isMoved === true ||
      !rookH1 ||
      isWhiteKingChecked() ||
      getText(61) !== "" ||
      getText(62) !== ""
    )
      return [];
    const blackMoves = calculateAllMoves("black");
    if (blackMoves.includes(squares[61]) || blackMoves.includes(squares[62]))
      return [];
    return [squares[62]];
  }

  calculateCastleA(): Square[] {
    const rookA1 = whitePiecesOnBoard.find(
      (piece) =>
        piece.index === 56 && piece.piece === "♖" && piece.isMoved === false
    );
    if (
      this.isMoved === true ||
      !rookA1 ||
      isWhiteKingChecked() ||
      getText(59) !== "" ||
      getText(58) !== "" ||
      getText(57) !== ""
    )
      return [];
    const blackMoves = calculateAllMoves("black");
    if (blackMoves.includes(squares[59]) || blackMoves.includes(squares[58]))
      return [];
    return [squares[58]];
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
          whitePieces.some((piece) => piece === getText(ind))
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
        whiteKingIndex = move.index;
        if (!calculateAllMoves("black").includes(squares[whiteKingIndex]))
          verifiedMoves.push(move);
        setText(move, "");
        setText(squares[this.index], this.piece);
        whiteKingIndex = this.index;
      } else {
        let originalBlackPiecesOnBoard = [...blackPiecesOnBoard];
        blackPiecesOnBoard = blackPiecesOnBoard.filter(
          (piece) => piece.htmlElement !== move.htmlElement
        );
        let originalMoveText = getText(move.index);
        setText(move, this.piece);
        setText(squares[this.index], "");
        whiteKingIndex = move.index;
        if (!calculateAllMoves("black").includes(squares[whiteKingIndex]))
          verifiedMoves.push(move);
        setText(move, originalMoveText);
        setText(squares[this.index], this.piece);
        blackPiecesOnBoard = [...originalBlackPiecesOnBoard];
        whiteKingIndex = this.index;
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
    if (square.index === 62) {
      setText(squares[63], "");
      const newRookElement = squares[63].htmlElement.cloneNode(
        true
      ) as HTMLDivElement;
      squares[63].htmlElement.replaceWith(newRookElement);
      squares[63].htmlElement = newRookElement;
      whitePiecesOnBoard = whitePiecesOnBoard.filter(
        (piece) => piece.index !== 63
      );
      whitePiecesOnBoard.push(new WhiteRook(squares[61]));
      return;
    }

    setText(squares[56], "");
    const newRookElement = squares[56].htmlElement.cloneNode(
      true
    ) as HTMLDivElement;
    squares[56].htmlElement.replaceWith(newRookElement);
    squares[56].htmlElement = newRookElement;
    whitePiecesOnBoard = whitePiecesOnBoard.filter(
      (piece) => piece.index !== 56
    );
    whitePiecesOnBoard.push(new WhiteRook(squares[59]));
    return;
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
              this.isMoved = true;
              squares[whiteKingIndex].htmlElement.classList.remove("checked");
              this.htmlElement.classList.remove("choosen-piece");
              if (getText(square.index) !== "") {
                blackPiecesOnBoard = blackPiecesOnBoard.filter(
                  (piece) => piece.htmlElement !== square.htmlElement
                );
              }
              const newElement = square.htmlElement.cloneNode(
                true
              ) as HTMLDivElement;
              square.htmlElement.replaceWith(newElement);
              square.htmlElement = newElement;
              this.handleCastle(square);
              setText(squares[this.index], "");
              this.htmlElement = square.htmlElement;
              this.index = square.index;
              setText(square, this.piece);
              whiteKingIndex = this.index;
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

whitePiecesOnBoard.push(new WhiteKing(squares[60]));
