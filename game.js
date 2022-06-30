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

function initQuestions(categories) {
  const questionMap = {};
  for (let i = 0; i < 50; i++) {
    categories.forEach((category) => {
      if (!questionMap[category]) {
        questionMap[category] = [];
      }
      questionMap[category].push(createQuestion(category, i));
    });
  }
  return questionMap;
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

function handleWrongAnswer(player) {
  console.log("Question was incorrectly answered");
  console.log(player.name + " was sent to the penalty box");
  player.inPenaltyBox = true;
}

export function Game() {
  const players = [];
  const questionMap = initQuestions(["Pop", "Science", "Sports", "Rock"]);

  let currentPlayerIdx = 0;
  let isGettingOutOfPenaltyBox = false;

  this.addPlayer = function (player) {
    players.push(player);
    console.log(`${player.name} was added`);
    console.log(`They are player number ${players.length}`);
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
    if (currentPlayerIdx === players.length) currentPlayerIdx = 0;
  }
  this.nextPlayer = nextPlayer;

  this.handlePenalty = function (roll) {
    const player = players[currentPlayerIdx];
    const currentPlayerHasPenalty = player.inPenaltyBox;
    const canEscapePenalty = roll % 2 !== 0;

    if (currentPlayerHasPenalty && !canEscapePenalty) {
      console.log(`${player.name} is not getting out of the penalty box`);
      isGettingOutOfPenaltyBox = false;
      return false;
    }

    if (currentPlayerHasPenalty) {
      isGettingOutOfPenaltyBox = true;
      console.log(`${player.name} is getting out of the penalty box`);
    }
    return true;
  };

  this.roll = function (roll) {
    const player = players[currentPlayerIdx];
    console.log(`${player.name} is the current player`);
    console.log("They have rolled a " + roll);

    if (!this.handlePenalty(roll)) {
      return;
    }

    movePlayer(roll);
    const currentPlace = player.place;
    console.log(player.name + "'s new location is " + currentPlace);
    console.log("The category is " + getCurrentCategory(currentPlace));
    askQuestion(questionMap, currentPlace);
  };

  this.correctAnswer = function () {
    const player = players[currentPlayerIdx];
    const currentPlayerHasPenalty = player.inPenaltyBox;

    if (currentPlayerHasPenalty && isGettingOutOfPenaltyBox) {
      console.log("Answer was correct!!!!");
      player.purse += 1;
      console.log(`${player.name} now has ${player.purse} Gold Coins.`);

      return didPlayerWin(player.purse);
    }

    if (currentPlayerHasPenalty) {
      return true;
    }

    console.log("Answer was corrent!!!!");
    player.purse += 1;
    console.log(`${player.name} now has ${player.purse} Gold Coins.`);

    return didPlayerWin(player.purse);
  };

  this.wrongAnswer = function () {
    handleWrongAnswer(players[currentPlayerIdx]);
    return true;
  };
}

export function run(seed) {
  faker.seed(seed);

  let notAWinner = false;
  const game = new Game();

  game.addPlayer({ name: "Chet", purse: NaN, place: NaN, inPenaltyBox: false });
  game.addPlayer({ name: "Pat", purse: 0, place: 0, inPenaltyBox: false });
  game.addPlayer({ name: "Sue", purse: 0, place: 0, inPenaltyBox: false });

  do {
    game.roll(Math.floor(faker.datatype.float({ min: 0, max: 1 }) * 6) + 1);
    const won = Math.floor(faker.datatype.float({ min: 0, max: 1 }) * 10) === 7;
    if (won) {
      notAWinner = game.wrongAnswer();
    } else {
      notAWinner = game.correctAnswer();
    }
    game.nextPlayer();
  } while (notAWinner);
}
