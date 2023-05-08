const board = Array.from(
  document.querySelectorAll(".square")
) as HTMLDivElement[];
const blackPieces = ["♜", "♞", "♝", "♛", "♚", "♟"];
const whitePieces = ["♖", "♘", "♗", "♕", "♔", "♙"];

const boardElement = document.querySelector(".board") as HTMLDivElement;

let whitePiecesOnBoard: any[] = [];
let blackPiecesOnBoard: any[] = [];

interface Square {
  htmlElement: HTMLDivElement;
  index: number;
  color: string;
  row: number;
  column: string;
}

let playerToMove = "white";
let whiteActiveMovesAbortController: AbortController;
let blackActiveMovesAbortController: AbortController;
let movesToRemoveBackground: Square[] = [];
let lastChoosenSquare: Square | undefined;

function removeBackground(): void {
  lastChoosenSquare?.htmlElement.classList.remove("choosen-piece");
  movesToRemoveBackground.forEach((move) => {
    move.htmlElement.lastElementChild.classList.remove("active");
    move.htmlElement.classList.remove("with-piece");
  });
}

let whiteKingIndex = 60;
let blackKingIndex = 4;

function createSquares(): Square[] {
  let counter = -1;

  let squares = board.map((htmlDiv) => {
    counter++;
    return {
      htmlElement: htmlDiv,
      index: counter,
      color: htmlDiv.classList[1],
      row: Math.floor(Math.abs(Math.floor(counter / 8) - 8)),
      column: String.fromCharCode(97 + (counter % 8)),
    };
  });
  return squares;
}

const squares = createSquares();

function getText(index: number): string {
  const firstChild = squares[index].htmlElement.children[0] as HTMLDivElement;
  return firstChild.innerText;
}

function setText(square: Square, piece: string): void {
  const firstChild = square.htmlElement.children[0] as HTMLDivElement;
  firstChild.innerText = piece;
}

const isBetween = (num1: number, num2: number, value: number): boolean =>
  value > num1 && value < num2;

function calculateAllMoves(color: string): Square[] {
  let set = new Set<Square>();
  if (color === "white") {
    whitePiecesOnBoard.forEach((piece) => {
      const possibleSquares =
        piece.piece !== "♙"
          ? (piece.calculateMoves() as Square[])
          : (piece.calculateDiagonal() as Square[]);
      possibleSquares.forEach((move) => set.add(move));
    });
    return Array.from(set);
  }

  blackPiecesOnBoard.forEach((piece) => {
    const possibleSquares =
      piece.piece !== "♟"
        ? (piece.calculateMoves() as Square[])
        : (piece.calculateDiagonal() as Square[]);
    possibleSquares.forEach((move) => set.add(move));
  });
  return Array.from(set);
}

function areThereAnyMoves(color: string): boolean {
  if (color === "white") {
    for (let i = 0; i < whitePiecesOnBoard.length; i++) {
      if (whitePiecesOnBoard[i].verifyMoves().length > 0) return true;
    }
    return false;
  }

  for (let i = 0; i < blackPiecesOnBoard.length; i++) {
    if (blackPiecesOnBoard[i].verifyMoves().length > 0) return true;
  }
  return false;
}

function isBlackKingChecked(): boolean {
  if (calculateAllMoves("white").includes(squares[blackKingIndex])) {
    squares[blackKingIndex].htmlElement.classList.add("checked");
    return true;
  }
  return false;
}

function isBlackKingMatedOrStalemate(): void {
  if (isBlackKingChecked() && !areThereAnyMoves("black")) {
    popupContent.innerText = "White just checkmated Black!";
    handlePopup();
    return;
  }

  if (!areThereAnyMoves("black")) {
    popupContent.innerText = "Stalemate!";
    handlePopup();
    return;
  }

  checkDraw();
}

function isWhiteKingChecked(): boolean {
  if (calculateAllMoves("black").includes(squares[whiteKingIndex])) {
    squares[whiteKingIndex].htmlElement.classList.add("checked");
    return true;
  }
  return false;
}

function isWhiteKingMatedOrStalemate(): void {
  if (isWhiteKingChecked() && !areThereAnyMoves("white")) {
    popupContent.innerText = "Black just checkmated White!";
    handlePopup();
    return;
  }

  if (!areThereAnyMoves("white")) {
    popupContent.innerText = "Stalemate!";
    handlePopup();
    return;
  }

  checkDraw();
}

function handleDraw() {
  popupContent.innerText = "Draw!";
  setTimeout(handlePopup, 500);
}

function checkDraw() {
  const numberOfWhitePieces = whitePiecesOnBoard.length;
  const numberOfBlackPieces = blackPiecesOnBoard.length;

  if (numberOfWhitePieces + numberOfBlackPieces > 4) return;
  if (numberOfWhitePieces > 2 || numberOfBlackPieces > 2) return;

  if (numberOfWhitePieces + numberOfBlackPieces === 2) {
    handleDraw();
    return;
  }

  if (numberOfBlackPieces + numberOfWhitePieces === 4) {
    if (!isSameColorBishopRemained()) return;
    handleDraw();
    return;
  }

  if (isKingVsKingAndMinorPiece()) {
    handleDraw();
    return;
  }
}

function isSameColorBishopRemained(): boolean {
  const whiteBishop = whitePiecesOnBoard.find((figure) => figure.piece === "♗");
  const blackBishop = blackPiecesOnBoard.find((figure) => figure.piece === "♝");
  if (!whiteBishop || !blackBishop) return false;
  if (
    whiteBishop.htmlElement.classList.contains("black") &&
    blackBishop.htmlElement.classList.contains("black")
  )
    return true;
  if (
    whiteBishop.htmlElement.classList.contains("white") &&
    blackBishop.htmlElement.classList.contains("white")
  )
    return true;
  return false;
}

function isKingVsKingAndMinorPiece(): boolean {
  const numberOfWhitePieces = whitePiecesOnBoard.length;
  const numberOfBlackPieces = blackPiecesOnBoard.length;

  if (
    numberOfBlackPieces === 1 &&
    numberOfWhitePieces === 2 &&
    whitePiecesOnBoard.some(
      (figure) => figure.piece === "♗" || figure.piece === "♘"
    )
  )
    return true;
  if (
    numberOfWhitePieces === 1 &&
    numberOfBlackPieces === 2 &&
    blackPiecesOnBoard.some(
      (figure) => figure.piece === "♞" || figure.piece === "♝"
    )
  )
    return true;
  return false;
}

const background = document.querySelector(".background") as HTMLDivElement;
const closeButton = document.querySelector(
  ".close-button"
) as HTMLButtonElement;
const popup = document.querySelector(".popup") as HTMLDivElement;
const popupContent = document.querySelector(".content") as HTMLHeadingElement;
closeButton.addEventListener("click", () => {
  location.reload();
});

function handlePopup(): void {
  popup.classList.toggle("active");
  boardElement.classList.toggle("nonactive");
  background.classList.toggle("transparent");
}
