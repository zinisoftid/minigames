const audioAssetsPath = "assets/music/";

class Minigame {
  constructor() {
    this.requiredNumberProducts = 0;
    // Product score
    this.productScore = GAME_SETTINGS.get("productScore");
    // Max products required to click
    this.maxRequiredProducts = GAME_SETTINGS.get("maxRequiredProducts");
    this.initTimeRemainder = 100;
    this.playTimes = 0;
    // PLay times to level-up
    this.maxPlayTimes = GAME_SETTINGS.get("levelTime") / 10;
    // Difficulty level
    this.difficultyLevel = GAME_SETTINGS.get("difficultyLevel");
    this.gameScore = {
      finalScore: 0,
      currentScore: 0,
    };
    this.gameTime = {
      timerInterval: null,
      timeRemainder: this.initTimeRemainder,
      countDownTime: GAME_SETTINGS.get("countDownTime"),
      timeStep: this.initTimeRemainder / GAME_SETTINGS.get("gameTime"),
    };
    this.gameSound = {
      audioBackground: audioAssetsPath + "bg_sound.wav",
      audioFail: audioAssetsPath + "wrong.wav",
      maxVolumn: 1,
      // Audio ratio (speed up when level-up)
      audioRatio: 1,
    };
    // Defaults live in config.json; the player's own list replaces them once saved.
    this.listProducts = GAME_SETTINGS.get("products");
    this.listCharacters = GAME_SETTINGS.get("characters");
    this.listProductNames = this.listProducts.map((product) =>
      product.title?.toLowerCase()
    );
    this.listProductScore = this.listProducts.map((product) => product.score);
  }
  endGame() {
    updatedTime = this.initTimeRemainder;
    $(".audio-background").trigger("pause");
    clearInterval(this.gameTime.timerInterval);
    setTimeout(() => {
      playTimes = 0;
      $(".level-site span").text(1);
      audioRatio = 1;
      timeStep = this.gameTime.timeStep;
      this.gameTime.timeRemainder = this.initTimeRemainder;
      $(".timer-range").css("width", this.gameTime.timeRemainder + "%");
      $(".number-correct[style='display: flex;']")
        .css("display", "none")
        .find("span:nth-child(2)")
        .text("1");
      currentScore = 0;
      $(".current-score").text(currentScore.toString());
      $(".modal-restart-game").css("display", "flex");
      $(".restart-game-wrapper ").css("display", "flex");
      localStorage.setItem("final-score", finalScore);
      $(".final-score-text").text(`${finalScore}`);
      finalScore = 0;
    }, 10);
  }

  startGamePlay() {
    let width = this.gameTime.timeRemainder;
    const maxPlayTimes = this.maxPlayTimes;
    if (playTimes > 0 && playTimes % maxPlayTimes === 0) {
      $("#level").text(parseInt($("#level").text(), 10) + 1);
      timeStep = (this.initTimeRemainder / updatedTime) * 10;
      // console.log(updatedTime, timeStep)
      audioRatio += (this.gameSound.audioRatio * this.difficultyLevel) / 100;
      $(".audio-background").prop("playbackRate", audioRatio);
    }
    this.gameTime.timerInterval = setInterval(() => {
      width -= timeStep;
      this.gameTime.timeRemainder -= timeStep;
      $(".timer-range").css("width", width + "%");
      if (width <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  restartGamePlay() {
    clearInterval(this.gameTime.timerInterval);
    this.gameTime.timeRemainder = this.initTimeRemainder;
    $(".timer-range").css("width", this.gameTime.timeRemainder + "%");
    const getAllNumberCorrectFlex = $(
      ".number-correct[style='display: flex;']"
    );
    getAllNumberCorrectFlex.css("display", "none");
    getAllNumberCorrectFlex.find("span:nth-child(2)").text("1");
    this.gameScore.currentScore = 0;
    this.gameScore.finalScore = 0;
    this.startGamePlay();
  }

  showRandomNameCorrect() {
    const nameCorrectElements = $(".name-correct");
    const randomIndex = Math.floor(Math.random() * nameCorrectElements.length);
    const maxRequiredProducts = this.maxRequiredProducts;
    nameCorrectElements.each(function (index) {
      if (index === randomIndex) {
        GUESSME.scrollToRandomElement(randomIndex + 1);
        $.each($(".character-card-list > div img:first-child"), (i, item) => {
          $(item).css("display", i === index ? "none" : "block");
        });
        $.each($(".character-card-list > div img:nth-child(2)"), (i, item) => {
          $(item).css("display", i === index ? "block" : "none");
        });
        $(this).css("display", "block");
        const numberCorrect = $(this).find(".name-correct-number");
        const descCorrect = $(this).find(".name-correct-desc");
        const randomNumber =
          Math.floor(Math.random() * maxRequiredProducts) + 1;
        numberCorrect.text(randomNumber);
        minigame.requiredNumberProducts = randomNumber;
        const randomDesc = minigame.getRandomNameCorrect(
          minigame.listProductNames
        );
        descCorrect.text(randomDesc);
      } else {
        $(this).css("display", "none");
      }
    });
  }

  showCountdownModal() {
    const getCountDownModalText = $(".modal-count-down h1");
    const initCountDownTime = this.gameTime.countDownTime;
    getCountDownModalText.text(initCountDownTime);
    let countDownTime = this.gameTime.countDownTime;

    const intervalId = setInterval(function () {
      countDownTime -= 1;
      getCountDownModalText.text(countDownTime.toString());
      if (countDownTime === 1) {
        clearInterval(intervalId);
        setTimeout(function () {
          $(".modal-count-down").css("display", "none");
          $(".game-content").css("display", "flex");
          countDownTime = initCountDownTime;
          getCountDownModalText.text(countDownTime.toString());
          $(".music-icon").hasClass("toolbar-icon-toggle")
            ? $(".audio-background").trigger("pause")
            : ($(".audio-background").trigger("play"),
              $(".audio-background").prop("playbackRate", audioRatio));

          minigame.showRandomNameCorrect();
          minigame.startGamePlay();
        }, 1000);
      }
    }, 1000);
  }

  getRandomNameCorrect(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  openFalseClickedModal() {
    clearInterval(this.gameTime.timerInterval);
    $(".audio-background").trigger("pause");
    $(".audio-fail")
      .prop("volume", checkAudioFail ? this.gameSound.maxVolumn : 0)
      .trigger("play");
    $(".false-clicked-modal").css("display", "flex");
  }
}
