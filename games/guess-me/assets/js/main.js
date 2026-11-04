var GUESSME = GUESSME || {};

const minigame = new Minigame();

// Generate list products
$.each(minigame.listProducts, (index, product) => {
  const productCard = `
      <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xs-6 product-list-content">
          <div class="product-card">
              <img src="${product.url}" alt="${product.title}" class="product-card-img" />
              <div class="number-correct">
                  <span>x</span>
                  <span>1</span>
              </div>
              <span class="product-card-name">${product.title}</span>
          </div>
      </div>
  `;

  $(".product-card-list").append(productCard);
});

// Generate list characters
$.each(minigame.listCharacters, (index, character) => {
  const characterCard = `
  <div class="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-6 character-list-content">
                    <img
                      src="${character.url}"
                      alt="character-${index + 1}-card"
                      class="character-card character-${index + 1}-card"
                    />
                    <img
                      src="${character.activeUrl}"
                      alt="character-${index + 1}-card-active"
                      class="character-card character-${index + 1}-card-active"
                    />
                    <div class="name-correct">
                      <span class="name-correct-number"></span>
                      <span class="name-correct-desc"></span>
                    </div>
                  </div>
    `;
  $(".character-card-list").append(characterCard);
});

// Declare variables
let checkAudioFail = true;
let timerInterval = minigame.gameTime.timerInterval;
let timeRemainder = minigame.gameTime.timeRemainder;
let finalScore = minigame.gameScore.finalScore;
let currentScore = minigame.gameScore.currentScore;
const maxVolumn = minigame.gameSound.maxVolumn;
let playTimes = minigame.playTimes;
let timeStep = minigame.gameTime.timeStep;
let audioRatio = minigame.gameSound.audioRatio;
let updatedTime =
  parseInt(getCookie("gameTime"), 10) * 10 || minigame.initTimeRemainder;

  // Check if already in game
let checked = false;

$(".audio-background").prop("autoplay", false);
$(".audio-background")
  .attr("src", minigame.gameSound.audioBackground)
  .prop("volume", minigame.gameSound.maxVolumn);
$(".audio-fail").attr("src", minigame.gameSound.audioFail);
$(".current-score").text(currentScore);

// ------------------------------------------------------------------------------------------------------
$(document).ready(() => {
  GUESSME.initialize();
});

// Close register modal
GUESSME.closeModal = () => {
  $(".modal-register").css("display", "none");
  $(".register-body").val("");
  $(location).attr("href", "/");
};

// Toggle mobile menu
GUESSME.toggleMobileMenu = (showed) => {
  $(".mobile-menu-modal").css("visibility", showed ? "hidden" : "visible");
  $("#header-navbar").css(
    "transform",
    showed ? "translateX(100%)" : "translateX(0)"
  );
};

// Handle sound effects
GUESSME.handleSound = () => {
  // Turn on/off background audio
  $(".music-icon").on("click", () => {
    $(".music-icon").toggleClass("toolbar-icon-toggle");
    $(".audio-background").trigger("play");
    $(".audio-background").prop(
      "volume",
      $(".music-icon").hasClass("toolbar-icon-toggle")
        ? 0
        : minigame.gameSound.maxVolumn
    );
  });

  // Turn on/off fail audio
  $(".volumn-icon").on("click", () => {
    $(".volumn-icon").toggleClass("toolbar-icon-toggle");
    checkAudioFail = !$(".volumn-icon").hasClass("toolbar-icon-toggle");
  });

  // Play/Pause background audio
  $(".pause-icon").on("click", () => {
    $(".pause-icon").toggleClass("toolbar-icon-toggle");
    $(".audio-background").trigger(
      $(".pause-icon").hasClass("toolbar-icon-toggle") ? "pause" : "play"
    );
  });
};

// Handle mobile menu actions
GUESSME.handleMobileMenu = () => {
  $(".mobile-menu-icon").on("click", () => {
    GUESSME.toggleMobileMenu();
  });

  $(".mobile-icon-close, .mobile-menu-modal").on("click", () => {
    GUESSME.toggleMobileMenu("showed");
  });
};

// Handle register form actions
GUESSME.handleRegisterForm = () => {
  // Redirect to rules page
  $(".checkbox-accept-rules a").on("click", () => {
    $.each($(".main-site > div"), (index, page) => {
      if (page.id === "rules-page") {
        $(page).css("display", "block");
        $.each($("#header-navbar .nav-link"), (index, item) => {
          $(item).removeClass("header-item-active");
          if ($(item).attr("href") === "#rules-page") {
            $(item).addClass("header-item-active");
          }
        });
        checked = false;
        $(".modal-register").css("display", "none");
      } else $(page).css("display", "none");
    });
  });

  // Submit form & Save to localstorage
  $(".register-body").on("submit", function (event) {
    event.preventDefault();
    const getFullName = $('[name="fullName"]').val();
    const getPhoneNumber = $('[name="phoneNumber"]').val();
    const getEmail = $('[name="email"]').val();
    if (!getFullName || !getPhoneNumber || !getEmail) {
      alert($.i18n("requiredFields"));
      return;
    }
    const phoneRegex = /^[0-9]{10,12}$/;
    if (!phoneRegex.test(getPhoneNumber)) {
      alert($.i18n("invalidPhoneNumber"));
      return;
    }
    const userData = {
      fullName: getFullName,
      phoneNumber: getPhoneNumber,
      email: getEmail,
      currentScore: localStorage.getItem("final-score"),
    };
    if (userData && $(".checkbox-icon").hasClass("checkbox-icon-active")) {
      localStorage.setItem("user-data", JSON.stringify(userData));
      GUESSME.closeModal();
      $(".checkbox-icon").removeClass("checkbox-icon-active");
    }
  });

  $(".register-wrapper").on("click", (e) => {
    e.stopPropagation();
  });

  $(".checkbox-icon").on("click", () => {
    $(".checkbox-icon").toggleClass("checkbox-icon-active");
  });

  $(".modal-register, .register-button-close, .back-button").on("click", () => {
    GUESSME.closeModal();
  });
};

// Handle actions when failing game
GUESSME.handleEndGame = () => {
  // Restart game
  $(".restart-game-text").on("click", () => {
    $(".modal-restart-game").css("display", "none");
    $(".audio-fail").prop("volume", 0);
    $(".game-content").css("display", "none");
    $(".modal-count-down").css("display", "block");
    minigame.showCountdownModal();
  });

  // Cancel game & Close button
  $(".cancel-game-text, .restart-game-button-close").on("click", () => {
    $(".modal-restart-game").css("display", "none");
    $(".restart-game-wrapper").css("display", "none");
    $(location).attr("href", "/");
  });
};

// Handle redirect actions
GUESSME.handleRedirect = () => {
  // Redirect to register form
  $(".register-toggle-label").on("click", () => {
    $(".modal-restart-game").css("display", "none");
    $(".modal-register").css("display", "block");
    $(".input-text:first-child input").focus();
  });

  // Redirect to play page
  $(".primary-button a[href='#play-page']").on("click", () => {
    $.each($(".main-site > div"), (index, page) => {
      if (page.id === "play-page") {
        $(page).css("display", "block");
        $.each($("#header-navbar .nav-link"), (index, item) => {
          if ($(item).attr("href") === "#play-page")
            $(item).addClass("header-item-active");
        });
        if (!checked) {
          minigame.showCountdownModal();
        }
        checked = true;
      } else $(page).css("display", "none");
    });
  });

  // Redirect to home page
  $(".brand-header-logo").on("click", () => {
    $.each($(".main-site > div"), (index, page) => {
      if (page.id === "home-page") {
        $(page).css("display", "block");
      } else $(page).css("display", "none");
    });
    $.each($("#header-navbar .nav-link"), (index, item) => {
      $(item).removeClass("header-item-active");
    });
  });

  // Redirect to home page in mobile
  $(".brand-header-logo-mobile").on("click", () => {
    $.each($(".main-site > div"), (index, page) => {
      if (page.id === "home-page") {
        $(page).css("display", "block");
      } else $(page).css("display", "none");
    });
    GUESSME.toggleMobileMenu("showed");
    $.each($("#header-navbar .nav-link"), (index, item) => {
      $(item).removeClass("header-item-active");
    });
  });

  // Redirect in header navbar
  $("#header-navbar .nav-link").on("click", function (event) {
    event.preventDefault();
    const targetPageId = $(this).attr("href");
    $(".main-site > div").each(function () {
      const page = $(this);
      if (page.attr("id") === targetPageId.slice(1)) {
        page.css("display", "block");
        if (page.attr("id") === "play-page") {
          if (!checked) {
            $(".game-content").css("display", "none");
            $(".modal-count-down").css("display", "block");
            minigame.showCountdownModal();
          }
          checked = true;
        }
      } else {
        page.css("display", "none");
      }
    });
    $("#header-navbar .nav-link").removeClass("header-item-active");
    $(this).addClass("header-item-active");
    window.location.hash = targetPageId;
    if ($("#header-navbar").css("flex-direction") === "column") {
      GUESSME.toggleMobileMenu("showed");
    }
    $(window).on("hashchange", () => {
      GUESSME.logOnPlayPageReload();
    });
  });
};

// Play game actions
GUESSME.handleProductClick = () => {
  $(".product-card").each(function () {
    let trueClickedTimes = 0;
    const productCard = $(this);
    productCard.on("click", function () {
      const getNumberCorrect = productCard.find(".number-correct");
      const getNumberCorrectTimesClicked =
        getNumberCorrect.find("span:nth-child(2)");
      const getProductCardName = productCard
        .find(".product-card-name")
        .text()
        .toLowerCase();
      const getCurrentNameCorrect = $(".name-correct[style='display: block;']");
      const getCurrentNameCorrectDesc = getCurrentNameCorrect
        .find(".name-correct-desc")
        .text()
        .toLowerCase();
      const getCurrentNameCorrectNumber = getCurrentNameCorrect
        .find(".name-correct-number")
        .text();
      if (getProductCardName === getCurrentNameCorrectDesc) {
        trueClickedTimes += 1;
        getNumberCorrect.css("display", "flex");
        getNumberCorrectTimesClicked.text(trueClickedTimes);
        const productIndex =
          minigame.listProductNames.indexOf(getProductCardName);
        const productScore = minigame.listProductScore[productIndex];
        currentScore += productScore;
        finalScore = currentScore;
        $(".current-score").text(currentScore);
      } else {
        finalScore = currentScore;
        minigame.openFalseClickedModal();
        setTimeout(() => {
          $(".audio-fail").prop(
            "volume",
            checkAudioFail ? 0 : minigame.gameSound.maxVolumn
          );
          $(".false-clicked-modal").css("display", "none");
          minigame.endGame();
          minigame.showRandomNameCorrect();
        }, 4000);
      }
      if (trueClickedTimes === parseInt(getCurrentNameCorrectNumber)) {
        playTimes += 1;
        const maxPlayTimes = minigame.maxPlayTimes;
        if (playTimes > 0 && playTimes % maxPlayTimes === 0) {
          updatedTime -= minigame.difficultyLevel;
          // console.log(updatedTime);
        }
        $(".current-score").text(currentScore);
        timeRemainder = 100;
        setTimeout(function () {
          trueClickedTimes = 0;
          minigame.restartGamePlay();
        }, 100);
        minigame.showRandomNameCorrect();
      }
    });
  });
};

// Init
GUESSME.initialize = () => {
  GUESSME.translation();
  GUESSME.settingTools();
  GUESSME.createSettingPage();
  GUESSME.saveSetting();
  GUESSME.handleRedirect();
  GUESSME.addProduct();
  GUESSME.deleteProduct();
  GUESSME.addCharacter();
  GUESSME.deleteCharacter();
  GUESSME.previewProduct();
  GUESSME.previewCharacter();
  GUESSME.validateForms();
  GUESSME.logOnPlayPageReload();
  GUESSME.handleSound();
  GUESSME.handleMobileMenu();
  GUESSME.handleRegisterForm();
  GUESSME.handleEndGame();
  GUESSME.handleRedirect();
  GUESSME.handleProductClick();
  GUESSME.inputFileHandler();
  
  // Handle reload page
  const hash = window.location.hash;
  const targetPageId = hash.slice(1);
  if (targetPageId) {
    const targetPageId = hash.slice(1);
    $.each($(".main-site > div"), (index, page) => {
      $(page).css("display", page.id === targetPageId ? "block" : "none");
    });
    $.each($("#header-navbar .nav-link"), (index, item) => {
      const itemTargetPageId = $(item).attr("href").slice(1);
      $(item).toggleClass(
        "header-item-active",
        itemTargetPageId === targetPageId
      );
    });
  }

  // Scroll table along the x axis
  $(".table-wrapper").scroll(function () {
    var scrollLeft = $(this).scrollLeft();

    if (scrollLeft > 0) {
      $(".fixed-column").addClass("active-column");
    } else {
      $(".fixed-column").removeClass("active-column");
    }
  });
};

// Handle upload file & input data
GUESSME.inputFileHandler = () => {
  $("input[id^='upload-product-img']").change(function () {
    var fileName = $(this).val().split("\\").pop();
    $(this)
      .next("span")
      .text("assets/img/products/" + fileName);
    if ($(this).parent().parent().hasClass("empty-element"))
      $(this).parent().parent().removeClass("empty-element");
  });

  $(".product-name-input").on("input", function () {
    if ($(this).parent().hasClass("empty-element")) {
      $(this).parent().removeClass("empty-element");
    }
    if ($(this).val() === "") {
      $(this).parent().addClass("empty-element");
    }
  });

  $("input[id^='upload-character-img']").change(function () {
    var fileName = $(this).val().split("\\").pop();
    $(this)
      .next("span")
      .text("assets/img/characters/" + fileName);
    if ($(this).parent().parent().hasClass("empty-element"))
      $(this).parent().parent().removeClass("empty-element");
  });
};

// Scroll to random element in character list slider
GUESSME.scrollToRandomElement = (randomNumber) => {
  const element = $(`.character-card-list > div:nth-child(${randomNumber})`)[0];
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      inline: "center",
    });
  }
};

// Resetgame when reload page
GUESSME.logOnPlayPageReload = () => {
  if (window.location.hash === "#play-page") {
    if (!checked) {
      $(".music-icon").toggleClass("toolbar-icon-toggle");
      minigame.showCountdownModal();
      checked = true;
    }
  }
};

// Generate setting page
GUESSME.createSettingPage = () => {
  const settingItemWrapper1 = $("#setting-item-wrapper-1");

  minigame.listProducts.forEach((product, index) => {
    const settingItemContent = $("<div>").addClass("setting-item-content");

    const settingItem1 = $("<div>").addClass("setting-item setting-item-1");
    const imageLabel = $("<label>")
      .text("Hình ảnh")
      .addClass("imageLabel-settingPage");

    const imageInputWrapper = $("<div>").addClass("setting-item-input");
    const imageInput = $("<input>").attr({
      type: "file",
      id: `upload-product-img-${index + 1}`,
      style: "display: none",
    });

    const imageName = $("<span>")
      .addClass("product-image-upload-url")
      .text(product.url);

    const imageLabelButton = $("<label>").attr(
      "for",
      `upload-product-img-${index + 1}`
    );
    const uploadIcon = $("<i>").addClass("fa-solid fa-upload upload-icon");

    const imageInputContent = $("<div>").addClass("image-input-content");

    imageLabelButton.append(uploadIcon);
    imageInputWrapper.append(imageInput, imageName, imageLabelButton);
    imageInputContent.append(imageInputWrapper);
    settingItem1.append(imageLabel, imageInputContent);

    const settingItem2 = $("<div>").addClass("setting-item setting-item-2");
    const productNameLabel = $("<label>")
      .text("Tên sản phẩm")
      .addClass("productName-settingPage");

    const productNameInputWrapper = $("<div>").addClass(
      "setting-item-input-wrapper"
    );
    const productNameInput = $("<input>")
      .attr("type", "text")
      .addClass("setting-item-input product-name-input")
      .val(product.title);

    const deleteIcon = $("<img>").attr({
      src: "assets/img/register/ico-close.48084f2c.svg",
      alt: "delete-icon",
    });

    deleteIcon.addClass("delete-icon");

    const previewIcon = $("<img>").attr({
      src: "assets/img/play-page/game-element-15-1.svg",
      alt: "preview-product-icon",
    });

    previewIcon.addClass("preview-product-icon");

    const imagePreview = $("<img>")
      .attr({
        src: "",
        alt: "preview-product-image",
      })
      .addClass("preview-product-image");

    const productNameInputContent = $("<div>").addClass("image-input-content");

    productNameInputContent.append(productNameInput);
    productNameInputWrapper.append(
      productNameInputContent,
      deleteIcon,
      previewIcon
    );
    settingItem2.append(productNameLabel, productNameInputWrapper);

    settingItemContent.append(settingItem1, settingItem2, imagePreview);
    settingItemWrapper1.append(settingItemContent);
  });

  const addButtonContent1 = $("<div>").addClass("setting-item-content");
  const addButton1 = $("<button>")
    .addClass("setting-add-button")
    .attr({ id: "product-add-button" });
  const plusIcon = $("<i>").addClass("fa-solid fa-plus");

  addButton1.append(plusIcon);
  addButtonContent1.append(addButton1);
  settingItemWrapper1.append(addButtonContent1);

  if ($("input[id^='upload-product-img']").length >= 4) {
    $("#product-add-button").css("display", "none");
    $("#product-add-button").parent().css("display", "none");
  } else {
    $("#product-add-button").parent().css("display", "block");
    $("#product-add-button").css("display", "block");
  }

  const settingItemWrapper = $("#setting-item-wrapper-2");

  minigame.listCharacters.forEach((character, index) => {
    const settingItemContent = $("<div>").addClass("setting-item-content");
    const settingItem = $("<div>").addClass(
      "setting-item setting-item-character"
    );
    const label = $("<label>")
      .text("Hình ảnh")
      .addClass("imageLabel-settingPage");
    const settingItemInputWrapper = $("<div>")
      .addClass("setting-item-input-wrapper")
      .css("width", "100%");
    const settingItemInput = $("<div>").addClass("setting-item-input");
    const input = $("<input>")
      .attr("type", "file")
      .attr("id", `upload-character-img-${index}`)
      .css("display", "none");
    const span = $("<span>").text(character.url);
    const labelForInput = $("<label>").attr(
      "for",
      `upload-character-img-${index}`
    );
    const imgUpload = $("<i>").addClass("fa-solid fa-upload upload-icon");

    const imgDelete = $("<img>")
      .attr("src", "assets/img/register/ico-close.48084f2c.svg")
      .attr("alt", "delete-icon")
      .addClass("delete-icon");

    const previewIcon = $("<img>").attr({
      src: "assets/img/play-page/game-element-15-1.svg",
      alt: "preview-character-icon",
    });

    previewIcon.addClass("preview-character-icon");

    const imagePreview = $("<img>")
      .attr({
        src: "",
        alt: "preview-character-image",
      })
      .addClass("preview-character-image");

    const imageInputContent = $("<div>")
      .addClass("image-input-content")
      .css("width", "78%");

    labelForInput.append(imgUpload);
    settingItemInput.append(input, span, labelForInput);
    imageInputContent.append(settingItemInput);
    settingItemInputWrapper.append(imageInputContent, imgDelete, previewIcon);
    settingItem.append(label, settingItemInputWrapper);
    settingItemContent.append(settingItem, imagePreview);
    settingItemWrapper.append(settingItemContent);
  });

  const addButtonContent = $("<div>").addClass("setting-item-content");
  const addButton = $("<button>")
    .addClass("setting-add-button")
    .attr({ id: "character-add-button" });
  const addButtonIcon = $("<i>").addClass("fa-solid fa-plus");

  addButton.append(addButtonIcon);
  addButtonContent.append(addButton);
  settingItemWrapper.append(addButtonContent);

  if ($("input[id^='upload-character-img']").length >= 4) {
    $("#character-add-button").css("display", "none");
    $("#character-add-button").parent().css("display", "none");
  } else {
    $("#character-add-button").parent().css("display", "block");
    $("#character-add-button").css("display", "block");
  }

  // Load values from cookies or fallback to default
  const countDownTimeCookie = getCookie("countDownTime");
  const productScoreCookie = getCookie("productScore");
  const difficultyLevelCookie = getCookie("difficultyLevel");
  const maxRequiredProductsCookie = getCookie("maxRequiredProducts");
  const levelTimeCookie = getCookie("levelTime");
  const gameTimeCookie = getCookie("gameTime");

  if (countDownTimeCookie !== "") {
    $("#count-down-input").val(countDownTimeCookie);
  } else {
    $("#count-down-input").val(minigame.gameTime.countDownTime);
  }

  if (productScoreCookie !== "") {
    $("#product-score-input").val(productScoreCookie);
  } else {
    $("#product-score-input").val(minigame.productScore);
  }

  if (difficultyLevelCookie !== "") {
    $("#difficulty-level-input").val(difficultyLevelCookie);
  } else {
    $("#difficulty-level-input").val(minigame.difficultyLevel);
  }

  if (maxRequiredProductsCookie !== "") {
    $("#max-product-input").val(maxRequiredProductsCookie);
  } else {
    $("#max-product-input").val(minigame.maxRequiredProducts);
  }

  if (levelTimeCookie !== "") {
    $("#level-time-input").val(levelTimeCookie);
  } else {
    $("#level-time-input").val(
      (minigame.initTimeRemainder * minigame.maxPlayTimes) / 10
    );
  }

  if (gameTimeCookie !== "") {
    $("#game-time-input").val(gameTimeCookie);
  } else {
    $("#game-time-input").val(minigame.initTimeRemainder / 10);
  }
};

// Function to set a cookie
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to get a cookie value
function getCookie(name) {
  const cookieName = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return "";
}

// Save setting(s)
GUESSME.saveSetting = () => {
  // Save values to cookies on button click
  $("#save-setting-button").on("click", (e) => {
    e.preventDefault();
    let checkDataInputs = true;
    let checkProductEmpty = false;
    let checkCharacterEmpty = false;
    const countDownTime = $("#count-down-input").val();
    const productScore = $("#product-score-input").val();
    const difficultyLevel = $("#difficulty-level-input").val();
    const maxRequiredProducts = $("#max-product-input").val();
    const levelTime = $("#level-time-input").val();
    const gameTime = $("#game-time-input").val();

    $.each($("input[id^='upload-product-img']"), (index, item) => {
      if (
        $(item).next().text() === "" ||
        $(item)
          .parent()
          .parent()
          .parent()
          .next()
          .find(".setting-item-input")
          .val() === ""
      ) {
        checkDataInputs = false;
        checkProductEmpty = true;
        if ($(item).next().text() === "") {
          $(item).parent().parent().addClass("empty-element");
        }
        if (
          $(item)
            .parent()
            .parent()
            .parent()
            .next()
            .find(".setting-item-input")
            .val() === ""
        ) {
          $(item)
            .parent()
            .parent()
            .parent()
            .next()
            .find(".setting-item-input")
            .parent()
            .addClass("empty-element");
        }
      }
    });

    $.each($("input[id^='upload-character-img']"), (index, item) => {
      if ($(item).next().text() == "") {
        checkDataInputs = false;
        checkCharacterEmpty = true;
        $(item).parent().parent().addClass("empty-element");
      }
    });

    if ($("#settingForm").valid() && checkDataInputs === true) {
      // Save values to cookies with a 365-day expiration
      setCookie("countDownTime", countDownTime, 365);
      setCookie("productScore", productScore, 365);
      setCookie("difficultyLevel", difficultyLevel, 365);
      setCookie("maxRequiredProducts", maxRequiredProducts, 365);
      setCookie("levelTime", levelTime, 365);
      setCookie("gameTime", gameTime, 365);

      const arrProducts = [];
      $.each($("input[id^='upload-product-img']"), (index, item) => {
        arrProducts.push({
          url: $(item).next().text(),
          title: $(item)
            .parent()
            .parent()
            .parent()
            .next()
            .find(".setting-item-input")
            .val(),
          score:
            parseInt(getCookie("productScore"), 10) || minigame.productScore,
        });
      });
      const arrCharacters = [];
      $.each($("input[id^='upload-character-img']"), (index, item) => {
        arrCharacters.push({
          url: $(item).next().text(),
          activeUrl: $(item).next().text(),
        });
      });

      setCookie("arrCharacters", JSON.stringify(arrCharacters), 365);
      setCookie("arrProducts", JSON.stringify(arrProducts), 365);

      alertify.success($.i18n("saveSuccess") + "<br>" + $.i18n("reloadPage"));

      $.each($("input[id^='upload-character-img']"), (index, item) => {
        if ($(item).parent().hasClass("empty-element")) {
          $(item).parent().removeClass("empty-element");
        }
      });
    } else {
      if (checkProductEmpty || checkCharacterEmpty) {
        if (checkProductEmpty && checkCharacterEmpty) {
          alertify.error($.i18n("requiredEnterProductAndCharacter"));
        } else if (checkProductEmpty) {
          alertify.error($.i18n("requiredEnterProduct"));
        } else {
          alertify.error($.i18n("requiredEnterCharacter"));
        }
      } else {
        alertify.error($.i18n("requiredEnterGeneral"));
      }
    }
  });
};

// Add character
GUESSME.addCharacter = () => {
  // Character handler
  let maxCharacterIndex =
    getCookie("arrCharacters") !== ""
      ? JSON.parse(getCookie("arrCharacters")).length
      : 4;
  $("#character-add-button").on("click", () => {
    maxCharacterIndex += 1;

    const settingItemWrapper = $("#setting-item-wrapper-2");

    const settingItemContent = $("<div>").addClass("setting-item-content");
    const settingItem = $("<div>").addClass(
      "setting-item setting-item-character"
    );
    const label = $("<label>")
      .text("Hình ảnh")
      .addClass("imageLabel-settingPage");
    const settingItemInputWrapper = $("<div>")
      .addClass("setting-item-input-wrapper")
      .css("width", "100%");
    const settingItemInput = $("<div>").addClass("setting-item-input");
    const input = $("<input>")
      .attr("type", "file")
      .attr("id", `upload-character-img-${maxCharacterIndex}`)
      .css("display", "none");
    const span = $("<span>").text("");
    const labelForInput = $("<label>").attr(
      "for",
      `upload-character-img-${maxCharacterIndex}`
    );
    const imgUpload = $("<i>").addClass("fa-solid fa-upload upload-icon");

    const imgDelete = $("<img>")
      .attr("src", "./assets/img/register/ico-close.48084f2c.svg")
      .attr("alt", "delete-icon")
      .addClass("delete-icon");

    const imageInputContent = $("<div>")
      .addClass("image-input-content")
      .css({ width: "78%", flex: 1 });

    labelForInput.append(imgUpload);
    settingItemInput.append(input, span, labelForInput);
    imageInputContent.append(settingItemInput);
    settingItemInputWrapper.append(imageInputContent, imgDelete);
    settingItem.append(label, settingItemInputWrapper);
    settingItemContent.append(settingItem);
    settingItemWrapper.append(settingItemContent);

    if ($("input[id^='upload-character-img']").length >= 4) {
      $("#character-add-button").css("display", "none");
      $("#character-add-button").parent().css("display", "none");
    }

    GUESSME.inputFileHandler();
    GUESSME.deleteCharacter();
    GUESSME.previewCharacter();
    GUESSME.translation();
  });
};

// Delete character
GUESSME.deleteCharacter = () => {
  // Delete character
  $("input[id^='upload-character-img']").each((index, item) => {
    $(item)
      .parent()
      .parent()
      .next()
      .on("click", () => {
        alertify.confirm(
          $.i18n("confirmDeleteCharacter"),
          function () {
            const arrCharactersCookie = getCookie("arrCharacters");
            if (arrCharactersCookie !== "") {
              const arrCharacters = JSON.parse(arrCharactersCookie);
              arrCharacters.splice(index, 1);
              setCookie("arrCharacters", JSON.stringify(arrCharacters), 365);
            } else {
              const arrCharacters = minigame.listCharacters;
              arrCharacters.splice(index, 1);

              setCookie("arrCharacters", JSON.stringify(arrCharacters), 365);
            }
            alertify.success(
              $.i18n("deleteSuccess") + "<br>" + $.i18n("reloadPage")
            );
          },
          function () {
            alertify.error($.i18n("deleteFail"));
          }
        );
      });
  });
};

// Add product
GUESSME.addProduct = () => {
  // Product handler
  let maxProductIndex =
    getCookie("arrProducts") !== ""
      ? JSON.parse(getCookie("arrProducts")).length
      : 4;
  maxProductIndex += 1;

  $("#product-add-button").on("click", () => {
    const settingItemWrapper1 = $("#setting-item-wrapper-1");

    const settingItemContent = $("<div>").addClass("setting-item-content");

    const settingItem1 = $("<div>").addClass("setting-item setting-item-1");
    const imageLabel = $("<label>")
      .text("Hình ảnh")
      .addClass("imageLabel-settingPage");

    const imageInputWrapper = $("<div>").addClass("setting-item-input");
    const imageInput = $("<input>").attr({
      type: "file",
      id: `upload-product-img-${maxProductIndex + 1}`,
      style: "display: none",
    });

    const imageName = $("<span>").addClass("product-image-upload-url").text("");

    const imageLabelButton = $("<label>").attr(
      "for",
      `upload-product-img-${maxProductIndex + 1}`
    );

    const uploadIcon = $("<i>").addClass("fa-solid fa-upload upload-icon");

    const imageInputContent = $("<div>").addClass("image-input-content");

    imageLabelButton.append(uploadIcon);
    imageInputWrapper.append(imageInput, imageName, imageLabelButton);
    imageInputContent.append(imageInputWrapper);
    settingItem1.append(imageLabel, imageInputContent);

    const settingItem2 = $("<div>").addClass("setting-item setting-item-2");
    const productNameLabel = $("<label>")
      .text("Tên sản phẩm")
      .addClass("productName-settingPage");

    const productNameInputWrapper = $("<div>").addClass(
      "setting-item-input-wrapper"
    );
    const productNameInput = $("<input>")
      .attr("type", "text")
      .addClass("setting-item-input product-name-input")
      .val("");

    const deleteIcon = $("<img>").attr({
      src: "./assets/img/register/ico-close.48084f2c.svg",
      alt: "delete-icon",
    });

    deleteIcon.addClass("delete-icon");

    const productNameInputContent = $("<div>").addClass("image-input-content");

    productNameInputContent.append(productNameInput);
    productNameInputWrapper.append(productNameInputContent, deleteIcon);

    settingItem2.append(productNameLabel, productNameInputWrapper);

    settingItemContent.append(settingItem1, settingItem2);
    settingItemWrapper1.append(settingItemContent);

    if ($("input[id^='upload-product-img']").length >= 4) {
      $("#product-add-button").css("display", "none");
      $("#product-add-button").parent().css("display", "none");
    }

    GUESSME.inputFileHandler();
    GUESSME.deleteProduct();
    GUESSME.previewProduct();
    GUESSME.translation();
  });
};

// Delete product
GUESSME.deleteProduct = () => {
  // Delete product
  $("input[id^='upload-product-img']").each((index, item) => {
    $(item)
      .parent()
      .parent()
      .parent()
      .next()
      .find(".delete-icon")
      .on("click", () => {
        alertify.confirm(
          $.i18n("confirmDeleteProduct"),
          function () {
            const arrProductsCookie = getCookie("arrProducts");
            if (arrProductsCookie !== "") {
              const arrProducts = JSON.parse(arrProductsCookie);
              arrProducts.splice(index, 1);
              setCookie("arrProducts", JSON.stringify(arrProducts), 365);
            } else {
              const arrProducts = minigame.listProducts;
              arrProducts.splice(index, 1);

              setCookie("arrProducts", JSON.stringify(arrProducts), 365);
            }
            alertify.success(
              $.i18n("deleteSuccess") + "<br>" + $.i18n("reloadPage")
            );
          },
          function () {
            alertify.error($.i18n("deleteFail"));
          }
        );
      });
  });
};

// Preview product
GUESSME.previewProduct = () => {
  $.each($(".preview-product-icon"), (index, item) => {
    let previewed = false;
    $(item).on("click", () => {
      const imageInputWrapper = $(item)
        .parent()
        .parent()
        .prev()
        .find(".setting-item-input")
        .text();
      const previewImage = $(item).parent().parent().next();
      if (!previewed) {
        previewImage.attr("src", imageInputWrapper);
        previewImage.css("height", "160px");
        previewed = true;
      } else {
        previewImage.css("height", "0");
        previewed = false;
      }
    });
  });
};

// Preview character
GUESSME.previewCharacter = () => {
  $.each($(".preview-character-icon"), (index, item) => {
    let previewed = false;
    $(item).on("click", () => {
      const imageInputWrapper = $(item).prev().prev().find("span").text();
      const previewImage = $(item).parent().parent().next();
      if (!previewed) {
        previewImage.attr("src", imageInputWrapper);
        previewImage.css("height", "160px");
        previewed = true;
      } else {
        previewImage.css("height", "0");
        previewed = false;
      }
    });
  });
};

// Validation forms
GUESSME.validateForms = () => {
  $("#settingForm").validate();
  
  const fields = [
    {
      name: "countdowninput",
      label: "Thời gian đếm ngược (s)",
      min: 0,
    },
    {
      name: "gametimeinput",
      label: "Thời gian màn chơi (s)",
      min: 0,
    },
    {
      name: "productscoreinput",
      label: "Bước điểm",
      min: 0,
    },
    {
      name: "maxproductinput",
      label: "Số lượng sản phẩm tối đa",
      min: 0,
    },
    {
      name: "leveltimeinput",
      label: "Thời gian level (s)",
      min: 0,
    },
    {
      name: "difficultylevelinput",
      label: "Độ khó (%)",
      min: 0,
    },
  ];
  
  fields.forEach((field) => {
    const fieldName = field.name;
    const fieldLabel = field.label;
    
    $("#settingForm")
    .find(`[name="${fieldName}"]`)
    .rules("add", {
      required: true,
      digits: true,
      min: field.min,
      messages: {
        required: `Vui lòng nhập giá trị ${fieldLabel}`,
        digits: `${fieldLabel} phải là chữ số`,
        min: `${fieldLabel} phải lớn hơn hoặc bằng 0`,
        },
      });
  });
};

// Translation using i18n
GUESSME.translation = () => {
  const languageSelect = $("#language-select");

  var defaultLanguage = getCookie("defaultLanguage") || "en";

  languageSelect.val(defaultLanguage);

  function updateTranslation(language) {
    $.i18n().locale = language;

    // Update translated text
    // Setting page
    $("#setting-main-title").text($.i18n("setting"));
    $("#product-setting").text($.i18n("productSetting"));
    $("#character-setting").text($.i18n("characterSetting"));
    $("#general-setting").text($.i18n("generalSetting"));
    $(".imageLabel-settingPage").text($.i18n("imageLabel-settingPage"));
    $(".productName-settingPage").text($.i18n("productName-settingPage"));
    $("#count-down-input")
      .parent()
      .next()
      .text($.i18n("countDownLabel") + " (s)");
    $("#game-time-input")
      .parent()
      .next()
      .text($.i18n("gameTimeLabel") + " (s)");
    $("#product-score-input").parent().next().text($.i18n("productScoreLabel"));
    $("#max-product-input").parent().next().text($.i18n("maxProductLabel"));
    $("#level-time-input")
      .parent()
      .next()
      .text($.i18n("levelTimeLabel") + " (s)");
    $("#difficulty-level-input")
      .parent()
      .next()
      .text($.i18n("difficultyLevelLabel") + " (%)");
    languageSelect.parent().next().text($.i18n("displayLanguageLabel"));

    // Rank page
    $("#rank").text($.i18n("rank"));
    $("#stt-col").text($.i18n("###"));
    $("#name-col").text($.i18n("Full name"));
    $("#email-col").text($.i18n("E-mail"));
    $("#phone-col").text($.i18n("Phone"));
    $("#score-col").text($.i18n("Score"));

    // Prize page
    $("#prize").text($.i18n("prize"));

    // Rules page
    $("#rules").text($.i18n("rules"));

    // Play page
    $(".count-down-text").prev().text($.i18n("Game start after"));

    // Home page
    $("#play-game").text($.i18n("Play Game"));
    $(".primary-button").find("a[href='#play-page']").text($.i18n("Start Game"));
    $("#your-own-score").text($.i18n("Your Score"));
    $(".cancel-game-text").text($.i18n("Cancel"));
    $(".restart-game-text").text($.i18n("Restart Game"));
    $(".register-toggle-label").find("a").text($.i18n("register"));
    $(".register-header").find("h2").text($.i18n("register"));
    $(".back-button").text($.i18n("back"));
    $("#send-score").text($.i18n("sendScore"));

    $(".hub-back-text").text($.i18n("backToHub"));

    // Header navbar
    // $(".nav-item").find("a[href='#play-page']").text($.i18n("Play Game"));
    // $(".nav-item").find("a[href='#rules-page']").text($.i18n("rules"));
    // $(".nav-item").find("a[href='#prize-page']").text($.i18n("prize"));
    // $(".nav-item").find("a[href='#rank-page']").text($.i18n("rank"));
    // $(".nav-item").find("a[href='#setting-page']").text($.i18n("setting"));
  }

  $.i18n()
    .load({
      en: "assets/lang/en.json",
      vi: "assets/lang/vi.json",
    })
    .done(function () {
      // Default language
      updateTranslation(getCookie("defaultLanguage") || "en");
    });

  // Language selection change event
  languageSelect.on("change", function () {
    const selectedLanguage = $(this).val();
    updateTranslation(selectedLanguage);
    setCookie("defaultLanguage", selectedLanguage, 365);
  });
};

// Setting tools: alertify, tooltip
GUESSME.settingTools = () => {
  // Tooltip in setting page
  $.each($('[data-toggle="tooltip"]'), (index, item) => {
    $(item).tooltip();
  });

  // Custom alertify
  alertify.defaults = {
    autoReset: true,
    basic: false,
    closable: true,
    closableByDimmer: true,
    invokeOnCloseOff: false,
    frameless: false,
    defaultFocusOff: false,
    maintainFocus: true,
    maximizable: true,
    modal: true,
    movable: true,
    moveBounded: false,
    overflow: true,
    padding: true,
    pinnable: true,
    pinned: true,
    preventBodyShift: false,
    resizable: true,
    startMaximized: false,
    transition: "pulse",
    transitionOff: false,
    tabbable:
      'button:not(:disabled):not(.ajs-reset),[href]:not(:disabled):not(.ajs-reset),input:not(:disabled):not(.ajs-reset),select:not(:disabled):not(.ajs-reset),textarea:not(:disabled):not(.ajs-reset),[tabindex]:not([tabindex^="-"]):not(:disabled):not(.ajs-reset)',
    notifier: {
      delay: 3,
      position: "bottom-right",
      closeButton: false,
      classes: {
        base: "alertify-notifier",
        prefix: "ajs-",
        message: "ajs-message",
        top: "ajs-top",
        right: "ajs-right",
        bottom: "ajs-bottom",
        left: "ajs-left",
        center: "ajs-center",
        visible: "ajs-visible",
        hidden: "ajs-hidden",
        close: "ajs-close",
      },
    },
    glossary: {
      title: "Warning",
      ok: "OK",
      cancel: "Cancel",
    },
    theme: {
      input: "ajs-input",
      ok: "ajs-ok",
      cancel: "ajs-cancel",
    },
    hooks: {
      preinit: function (instance) {},
      postinit: function (instance) {},
    },
  };
};