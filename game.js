import { faker } from "@faker-js/faker";

function getCurrentCategory(place) {
  const categories = ["Pop", "Science", "Sports", "Rock"];
  return (
    categories[place % categories.length] || categories[categories.length - 1]
  );
}

function createQuestion(category, idx) {
  return `${category} Question ${idx}`;
}

function initQuestions() {
  const popQuestions = [];
  const scienceQuestions = [];
  const sportsQuestions = [];
  const rockQuestions = [];
  for (let i = 0; i < 50; i++) {
    popQuestions.push(createQuestion("Pop", i));
    scienceQuestions.push(createQuestion("Science", i));
    sportsQuestions.push(createQuestion("Sports", i));
    rockQuestions.push(createQuestion("Rock", i));
  }
  return {
    popQuestions,
    scienceQuestions,
    sportsQuestions,
    rockQuestions,
  };
}

const didPlayerWin = function (purse) {
  return !(purse === 6);
};

// impure, need to refactor
function askQuestion(questionMap, place) {
  const currentCategory = getCurrentCategory(place);
  const questions = questionMap[currentCategory];
  const question = questions.shift();
  console.log(question);
}

export function Game() {
  const playerNames = [];
  const players = [];

  const { popQuestions, scienceQuestions, sportsQuestions, rockQuestions } =
    initQuestions();

  const questionMap = {
    Pop: popQuestions,
    Science: scienceQuestions,
    Sports: sportsQuestions,
    Rock: rockQuestions,
  };

  let currentPlayerIdx = 0;
  let isGettingOutOfPenaltyBox = false;

  this.addPlayer = function (playerName) {
    playerNames.push(playerName);
    if (playerNames.length === 1) {
      players.push({
        name: playerName,
        purse: NaN,
        place: NaN,
        inPenaltyBox: false,
      });
    } else {
      players.push({
        name: playerName,
        purse: 0,
        place: 0,
        inPenaltyBox: false,
      });
    }

    console.log(playerName + " was added");
    console.log("They are player number " + playerNames.length);

    return true;
  };

  function movePlayer(roll) {
    const currentPlayer = players[currentPlayerIdx];
    currentPlayer.place = currentPlayer.place + roll;
    if (currentPlayer.place > 11) {
      currentPlayer.place = currentPlayer.place - 12;
    }
  }

  function nextPlayer() {
    currentPlayerIdx += 1;
    if (currentPlayerIdx === playerNames.length) currentPlayerIdx = 0;
  }
  this.nextPlayer = nextPlayer;

  this.roll = function (roll) {
    console.log(playerNames[currentPlayerIdx] + " is the current player");
    console.log("They have rolled a " + roll);

    const canEscapePenalty = roll % 2 !== 0;
    const currentPlayerHasPenalty = players[currentPlayerIdx].inPenaltyBox;

    if (currentPlayerHasPenalty && !canEscapePenalty) {
      console.log(
        playerNames[currentPlayerIdx] + " is not getting out of the penalty box"
      );
      isGettingOutOfPenaltyBox = false;
      return;
    }

    if (currentPlayerHasPenalty) {
      isGettingOutOfPenaltyBox = true;
      console.log(
        playerNames[currentPlayerIdx] + " is getting out of the penalty box"
      );
    }

    movePlayer(roll);
    const currentPlace = players[currentPlayerIdx].place;
    console.log(
      playerNames[currentPlayerIdx] + "'s new location is " + currentPlace
    );
    console.log("The category is " + getCurrentCategory(currentPlace));
    askQuestion(questionMap, currentPlace);
  };

  this.wasCorrectlyAnswered = function () {
    const currentPlayerHasPenalty = players[currentPlayerIdx].inPenaltyBox;

    if (currentPlayerHasPenalty && isGettingOutOfPenaltyBox) {
      console.log("Answer was correct!!!!");
      players[currentPlayerIdx].purse += 1;
      console.log(
        `${playerNames[currentPlayerIdx]} now has ${players[currentPlayerIdx].purse} Gold Coins.`
      );

      return didPlayerWin(players[currentPlayerIdx].purse);
    }

    if (currentPlayerHasPenalty) {
      return true;
    }

    console.log("Answer was corrent!!!!");
    players[currentPlayerIdx].purse += 1;
    console.log(
      playerNames[currentPlayerIdx] +
        " now has " +
        players[currentPlayerIdx].purse +
        " Gold Coins."
    );

    return didPlayerWin(players[currentPlayerIdx].purse);
  };

  this.wrongAnswer = function () {
    console.log("Question was incorrectly answered");
    console.log(playerNames[currentPlayerIdx] + " was sent to the penalty box");
    players[currentPlayerIdx].inPenaltyBox = true;

    nextPlayer();
    return true;
  };
}

export function run(seed) {
  faker.seed(seed);

  let notAWinner = false;
  const game = new Game();

  game.addPlayer("Chet");
  game.addPlayer("Pat");
  game.addPlayer("Sue");

  do {
    game.roll(Math.floor(faker.datatype.float({ min: 0, max: 1 }) * 6) + 1);
    if (Math.floor(faker.datatype.float({ min: 0, max: 1 }) * 10) === 7) {
      notAWinner = game.wrongAnswer();
    } else {
      notAWinner = game.wasCorrectlyAnswered();
      game.nextPlayer();
    }
  } while (notAWinner);
}
