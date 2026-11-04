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
let updatedTime = GAME_SETTINGS.get("gameTime") * 10;

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
  GUESSME.resetSetting();
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
      .text("Image")
      .attr("data-i18n", "imageLabel")
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
      .text("Product name")
      .attr("data-i18n", "productNameLabel")
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

  if ($("input[id^='upload-product-img']").length >= GAME_CONFIG.limits.maxProducts) {
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
      .text("Image")
      .attr("data-i18n", "imageLabel")
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

  if ($("input[id^='upload-character-img']").length >= GAME_CONFIG.limits.maxCharacters) {
    $("#character-add-button").css("display", "none");
    $("#character-add-button").parent().css("display", "none");
  } else {
    $("#character-add-button").parent().css("display", "block");
    $("#character-add-button").css("display", "block");
  }

  // Form values: the player's saved value, else the default from config.json
  Object.keys(GUESSME.settingInputs).forEach((name) => {
    $(GUESSME.settingInputs[name]).val(GAME_SETTINGS.get(name));
  });
};

// Settings stored per name, and the form input that edits each
GUESSME.settingInputs = {
  countDownTime: "#count-down-input",
  gameTime: "#game-time-input",
  productScore: "#product-score-input",
  maxRequiredProducts: "#max-product-input",
  levelTime: "#level-time-input",
  difficultyLevel: "#difficulty-level-input",
};

// Save setting(s)
GUESSME.saveSetting = () => {
  // Save values on button click
  $("#save-setting-button").on("click", (e) => {
    e.preventDefault();
    let checkDataInputs = true;
    let checkProductEmpty = false;
    let checkCharacterEmpty = false;

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
      const values = {};
      Object.keys(GUESSME.settingInputs).forEach((name) => {
        values[name] = parseInt($(GUESSME.settingInputs[name]).val(), 10);
      });

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
          score: values.productScore,
        });
      });
      const arrCharacters = [];
      $.each($("input[id^='upload-character-img']"), (index, item) => {
        const url = $(item).next().text();
        // Keep the active picture of a character whose normal picture did not change
        const known = minigame.listCharacters.find((c) => c.url === url);
        arrCharacters.push({
          url: url,
          activeUrl: known ? known.activeUrl : url,
        });
      });

      GAME_SETTINGS.setMany(
        Object.assign(values, {
          products: arrProducts,
          characters: arrCharacters,
        })
      );

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

// Restore defaults: forget everything the player saved
GUESSME.resetSetting = () => {
  $("#reset-setting-button").on("click", (e) => {
    e.preventDefault();
    alertify
      .confirm($.i18n("resetConfirm"), function () {
        GAME_SETTINGS.reset();
        alertify.success($.i18n("resetDone") + "<br>" + $.i18n("reloadPage"));
      })
      .set({
        title: $.i18n("alertTitle"),
        labels: { ok: $.i18n("ok"), cancel: $.i18n("cancel") },
      });
  });
};

// Add character
GUESSME.addCharacter = () => {
  // Character handler
  let maxCharacterIndex = GAME_SETTINGS.get("characters").length;
  $("#character-add-button").on("click", () => {
    maxCharacterIndex += 1;

    const settingItemWrapper = $("#setting-item-wrapper-2");

    const settingItemContent = $("<div>").addClass("setting-item-content");
    const settingItem = $("<div>").addClass(
      "setting-item setting-item-character"
    );
    const label = $("<label>")
      .text("Image")
      .attr("data-i18n", "imageLabel")
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

    if ($("input[id^='upload-character-img']").length >= GAME_CONFIG.limits.maxCharacters) {
      $("#character-add-button").css("display", "none");
      $("#character-add-button").parent().css("display", "none");
    }

    GUESSME.inputFileHandler();
    GUESSME.deleteCharacter();
    GUESSME.previewCharacter();
    GUESSME.applyLanguage();
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
            const arrCharacters = GAME_SETTINGS.get("characters").slice();
            arrCharacters.splice(index, 1);
            GAME_SETTINGS.set("characters", arrCharacters);
            alertify.success(
              $.i18n("deleteSuccess") + "<br>" + $.i18n("reloadPage")
            );
          },
          function () {
            alertify.error($.i18n("deleteFail"));
          }
        ).set({
          title: $.i18n("alertTitle"),
          labels: { ok: $.i18n("ok"), cancel: $.i18n("cancel") },
        });
      });
  });
};

// Add product
GUESSME.addProduct = () => {
  // Product handler
  let maxProductIndex = GAME_SETTINGS.get("products").length;
  maxProductIndex += 1;

  $("#product-add-button").on("click", () => {
    const settingItemWrapper1 = $("#setting-item-wrapper-1");

    const settingItemContent = $("<div>").addClass("setting-item-content");

    const settingItem1 = $("<div>").addClass("setting-item setting-item-1");
    const imageLabel = $("<label>")
      .text("Image")
      .attr("data-i18n", "imageLabel")
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
      .text("Product name")
      .attr("data-i18n", "productNameLabel")
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

    if ($("input[id^='upload-product-img']").length >= GAME_CONFIG.limits.maxProducts) {
      $("#product-add-button").css("display", "none");
      $("#product-add-button").parent().css("display", "none");
    }

    GUESSME.inputFileHandler();
    GUESSME.deleteProduct();
    GUESSME.previewProduct();
    GUESSME.applyLanguage();
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
            const arrProducts = GAME_SETTINGS.get("products").slice();
            arrProducts.splice(index, 1);
            GAME_SETTINGS.set("products", arrProducts);
            alertify.success(
              $.i18n("deleteSuccess") + "<br>" + $.i18n("reloadPage")
            );
          },
          function () {
            alertify.error($.i18n("deleteFail"));
          }
        ).set({
          title: $.i18n("alertTitle"),
          labels: { ok: $.i18n("ok"), cancel: $.i18n("cancel") },
        });
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
    { name: "countdowninput", labelKey: "countDownLabel", min: 0 },
    { name: "gametimeinput", labelKey: "gameTimeLabel", min: 0 },
    { name: "productscoreinput", labelKey: "productScoreLabel", min: 0 },
    { name: "maxproductinput", labelKey: "maxProductLabel", min: 0 },
    { name: "leveltimeinput", labelKey: "levelTimeLabel", min: 0 },
    { name: "difficultylevelinput", labelKey: "difficultyLabel", min: 0 },
  ];

  // Messages are functions so they use the language chosen at the time of the error.
  fields.forEach((field) => {
    const label = () => $.i18n(field.labelKey);

    $("#settingForm")
      .find(`[name="${field.name}"]`)
      .rules("add", {
        required: true,
        digits: true,
        min: field.min,
        messages: {
          required: () => $.i18n("valueRequired", label()),
          digits: () => $.i18n("mustBeDigits", label()),
          min: () => $.i18n("mustBeMin", label(), field.min),
        },
      });
  });
};

// Text of the page in the chosen language. Markup carries English text and a
// data-i18n / data-i18n-placeholder / data-i18n-title key; see shared/i18n.js.
GUESSME.applyLanguage = () => {
  $.i18n().locale = MiniLang.get();
  MiniLang.apply(document, (key) => {
    const text = $.i18n(key);
    return text === key || text.indexOf("⧼") === 0 ? "" : text;
  });
  alertify.defaults.glossary = {
    title: $.i18n("alertTitle"),
    ok: $.i18n("ok"),
    cancel: $.i18n("cancel"),
  };
};

// Language files and the language selector
GUESSME.translation = () => {
  const languageSelect = $("#language-select");
  const files = {};

  Object.keys(MiniLang.LANGUAGES).forEach((code) => {
    files[code] = `assets/lang/${code}.json`;
    languageSelect.append(
      $("<option>").val(code).text(MiniLang.LANGUAGES[code])
    );
  });
  languageSelect.val(MiniLang.get());

  $.i18n().load(files).done(GUESSME.applyLanguage);

  languageSelect.on("change", function () {
    MiniLang.set($(this).val());
    GUESSME.applyLanguage();
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