document.addEventListener("DOMContentLoaded", () => {
  const modeSelection = document.querySelector(".mode-selection");
  const gameContainer = document.querySelector(".game-container");
  const friendModeBtn = document.getElementById("friend-mode");
  const aiModeBtn = document.getElementById("ai-mode");
  const boxes = document.querySelectorAll(".box");
  const resetBtn = document.getElementById("reset-btn");
  const newGameBtn = document.getElementById("new-game-btn");
  const historyList = document.getElementById("history-list");
  const popup = document.querySelector(".popup");
  const popupMessage = document.getElementById("popup-message");
  let modeToggle = document.querySelector("#mode-toggle");
  let body = document.querySelector("body");
  let voiceBtn = document.getElementById("voice-btn");

  modeToggle.addEventListener("click", () => {
    body.classList.toggle("js-dark");
    body.classList.toggle("js-light");
  });

  let board = Array(9).fill(null);
  let turnO = true;
  let gameMode = "";
  let isGameOver = false;
  let isAiTurn = false;

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
  ];

  friendModeBtn.addEventListener("click", () => startGame("friend"));
  aiModeBtn.addEventListener("click", () => startGame("ai"));
  voiceBtn.addEventListener("click", startListening);

  function startGame(mode) {
    gameMode = mode;
    modeSelection.classList.add("hide");
    gameContainer.style.display = "block";
  }

  boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
      if (!isGameOver && !board[index] && !isAiTurn) {
        makeMove(index, turnO ? "O" : "X");
        if (gameMode === "ai" && !isGameOver) {
          isAiTurn = true;
          setTimeout(aiMove, 1000);
        }
      }
    });
  });

  function makeMove(index, player) {
    board[index] = player;
    boxes[index].innerText = player;
    boxes[index].disabled = true;

    if (checkWinner(player)) {
      endGame(`${player} Wins!`);
    } else if (board.every(cell => cell)) {
      endGame("It's a Draw!");
    } else {
      turnO = !turnO;
    }
  }

  function aiMove() {
    let availableSpots = board.map((val, idx) => (val === null ? idx : null)).filter(v => v !== null);
    if (availableSpots.length > 0) {
      makeMove(availableSpots[Math.floor(Math.random() * availableSpots.length)], "X");
    }
    isAiTurn = false;
  }

  function checkWinner(player) {
    return winPatterns.some(pattern => pattern.every(index => board[index] === player));
  }

  function endGame(message) {
    isGameOver = true;
    popupMessage.innerText = message;
    popup.classList.add("show");
    historyList.innerHTML += `<li>${message}</li>`;
    speak(message);
  }

  resetBtn.addEventListener("click", resetGame);
  newGameBtn.addEventListener("click", () => location.reload());

  function resetGame() {
    board.fill(null);
    turnO = true;
    isGameOver = false;
    isAiTurn = false;
    popup.classList.remove("show");

    boxes.forEach(box => {
      box.innerText = "";
      box.disabled = false;
    });
    speak("Game reset.");
  }

  // 🎙️ Voice Control
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = function (event) {
    const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
    console.log("Recognized command:", command);
    handleVoiceCommand(command);
  };

  function startListening() {
    recognition.start();
    speak("Voice control activated. Say a command.");
  }

  function handleVoiceCommand(command) {
    const positions = {
      "top left": 0, "top center": 1, "top right": 2,
      "middle left": 3, "center": 4, "middle right": 5,
      "bottom left": 6, "bottom center": 7, "bottom right": 8
    };

    if (command.includes("place")) {
      for (let key in positions) {
        if (command.includes(key)) {
          makeMove(positions[key], turnO ? "O" : "X");
          return;
        }
      }
    } else if (command.includes("reset")) {
      resetGame();
    } else if (command.includes("new game")) {
      location.reload();
    } else {
      speak("Invalid command. Try again.");
    }
  }

  function speak(text) {
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  const backBtn = document.getElementById("back-btn");

backBtn.addEventListener("click", () => {
  gameContainer.style.display = "none";
  modeSelection.classList.remove("hide");
 
});

});
