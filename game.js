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
  const players = [];
  const places = new Array(6);
  const purses = new Array(6);
  const inPenaltyBox = new Array(6);

  const { popQuestions, scienceQuestions, sportsQuestions, rockQuestions } =
    initQuestions();

  const questionMap = {
    Pop: popQuestions,
    Science: scienceQuestions,
    Sports: sportsQuestions,
    Rock: rockQuestions,
  };

  let currentPlayer = 0;
  let isGettingOutOfPenaltyBox = false;

  this.howManyPlayers = () => players.length;
  this.addPlayer = function (playerName) {
    players.push(playerName);
    places[this.howManyPlayers()] = 0;
    purses[this.howManyPlayers()] = 0;
    inPenaltyBox[this.howManyPlayers()] = false;

    console.log(playerName + " was added");
    console.log("They are player number " + players.length);

    return true;
  };

  function movePlayer(roll) {
    places[currentPlayer] = places[currentPlayer] + roll;
    if (places[currentPlayer] > 11) {
      places[currentPlayer] = places[currentPlayer] - 12;
    }
  }

  function nextPlayer() {
    currentPlayer += 1;
    if (currentPlayer === players.length) currentPlayer = 0;
  }
  this.nextPlayer = nextPlayer;

  this.roll = function (roll) {
    console.log(players[currentPlayer] + " is the current player");
    console.log("They have rolled a " + roll);

    const canEscapePenalty = roll % 2 !== 0;
    const currentPlayerHasPenalty = inPenaltyBox[currentPlayer];

    if (currentPlayerHasPenalty && !canEscapePenalty) {
      console.log(
        players[currentPlayer] + " is not getting out of the penalty box"
      );
      isGettingOutOfPenaltyBox = false;
      return;
    }

    if (currentPlayerHasPenalty) {
      isGettingOutOfPenaltyBox = true;
      console.log(
        players[currentPlayer] + " is getting out of the penalty box"
      );
    }

    movePlayer(roll);
    console.log(
      players[currentPlayer] + "'s new location is " + places[currentPlayer]
    );
    console.log("The category is " + getCurrentCategory(places[currentPlayer]));
    askQuestion(questionMap, places[currentPlayer]);
  };

  this.wasCorrectlyAnswered = function () {
    const currentPlayerHasPenalty = inPenaltyBox[currentPlayer];

    if (currentPlayerHasPenalty && isGettingOutOfPenaltyBox) {
      console.log("Answer was correct!!!!");
      purses[currentPlayer] += 1;
      console.log(
        `${players[currentPlayer]} now has ${purses[currentPlayer]} Gold Coins.`
      );

      return didPlayerWin(purses[currentPlayer]);
    }

    if (currentPlayerHasPenalty) {
      return true;
    }

    console.log("Answer was corrent!!!!");
    purses[currentPlayer] += 1;
    console.log(
      players[currentPlayer] +
        " now has " +
        purses[currentPlayer] +
        " Gold Coins."
    );

    return didPlayerWin(purses[currentPlayer]);
  };

  this.wrongAnswer = function () {
    console.log("Question was incorrectly answered");
    console.log(players[currentPlayer] + " was sent to the penalty box");
    inPenaltyBox[currentPlayer] = true;

    nextPlayer();
    return true;
  };
}

export function run(seed) {
  faker.seed(seed);

  var notAWinner = false;
  var game = new Game();

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
