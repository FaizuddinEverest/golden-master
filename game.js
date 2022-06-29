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

  this.roll = function (roll) {
    console.log(`${players[currentPlayerIdx].name} is the current player`);
    console.log("They have rolled a " + roll);

    const currentPlayerHasPenalty = players[currentPlayerIdx].inPenaltyBox;
    const canEscapePenalty = roll % 2 !== 0;

    if (currentPlayerHasPenalty && !canEscapePenalty) {
      console.log(
        `${players[currentPlayerIdx].name} is not getting out of the penalty box`
      );
      isGettingOutOfPenaltyBox = false;
      return;
    }

    if (currentPlayerHasPenalty) {
      isGettingOutOfPenaltyBox = true;
      console.log(
        `${players[currentPlayerIdx].name} is getting out of the penalty box`
      );
    }

    movePlayer(roll);
    const currentPlace = players[currentPlayerIdx].place;
    console.log(
      players[currentPlayerIdx].name + "'s new location is " + currentPlace
    );
    console.log("The category is " + getCurrentCategory(currentPlace));
    askQuestion(questionMap, currentPlace);
  };

  this.correctAnswer = function () {
    const currentPlayerHasPenalty = players[currentPlayerIdx].inPenaltyBox;

    if (currentPlayerHasPenalty && isGettingOutOfPenaltyBox) {
      console.log("Answer was correct!!!!");
      players[currentPlayerIdx].purse += 1;
      console.log(
        `${players[currentPlayerIdx].name} now has ${players[currentPlayerIdx].purse} Gold Coins.`
      );

      return didPlayerWin(players[currentPlayerIdx].purse);
    }

    if (currentPlayerHasPenalty) {
      return true;
    }

    console.log("Answer was corrent!!!!");
    players[currentPlayerIdx].purse += 1;
    console.log(
      `${players[currentPlayerIdx].name} now has ${players[currentPlayerIdx].purse} Gold Coins.`
    );

    return didPlayerWin(players[currentPlayerIdx].purse);
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
