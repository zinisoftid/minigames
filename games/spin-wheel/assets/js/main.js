var SPIN_WHEEL = SPIN_WHEEL || {};
// Defaults come from config.json through shared/boot.js (GAME_SETTINGS, GAME_CONFIG).
SPIN_WHEEL.countDownTimer = GAME_SETTINGS.get("countDownTimer");
SPIN_WHEEL.countRotation = GAME_SETTINGS.get("countRotation");
let USER_SPIN = GAME_SETTINGS.get("initialSpins");
let USER_POINT = 0;
// Wheel segments in clockwise order; title, message and gift are language keys.
const PARTS = {};
GAME_CONFIG.parts.forEach(function (part, index) {
  PARTS["part" + (index + 1)] = part;
});

$(document).ready(function () {
  SPIN_WHEEL.initLanguage();
  SPIN_WHEEL.navigate();
  SPIN_WHEEL.startGame();
  SPIN_WHEEL.showUserSpin();
  SPIN_WHEEL.showUserPoint();
  SPIN_WHEEL.spin();
  SPIN_WHEEL.closePopup();
  SPIN_WHEEL.navigateLogin();
  SPIN_WHEEL.navigateSignup();
  SPIN_WHEEL.toggleMenu();
  SPIN_WHEEL.openMenu();
  SPIN_WHEEL.closeMenu();
  SPIN_WHEEL.music();
  SPIN_WHEEL.sound();
});

SPIN_WHEEL.navigate = function () {
  $("#to-play").on("click", function () {
    SPIN_WHEEL.handleNavigate("play", "titlePlay");
  });

  $("#to-rules").on("click", function () {
    SPIN_WHEEL.handleNavigate("rules", "titleRules");
  });

  $("#show-rules").on("click", function () {
    SPIN_WHEEL.removeTransition().then(() => {
      $(".circle-inner").css(
        "transition",
        "transform 5s cubic-bezier(.45, .58, .17, .93)"
      );
      $("#popup").removeClass("open-popup");
      $(".popup-gift").removeClass("active");
      $(".popup-login").removeClass("active");
      $(".popup-signup").removeClass("active");
    });
    SPIN_WHEEL.handleNavigate("rules", "titleRules");
  });

  $("#to-price").on("click", function () {
    SPIN_WHEEL.handleNavigate("price", "titlePrize");
  });

  $("#to-rank").on("click", function () {
    SPIN_WHEEL.handleNavigate("rank", "titleRank");
  });
};

SPIN_WHEEL.handleNavigate = function (href, titleKey) {
  $(".title-heading").attr("data-i18n", titleKey).text(SPIN_WHEEL.t(titleKey));
  $(".item-right-bar").removeClass("active");
  $(`#to-${href}`).addClass("active");
  $(".section").removeClass("active");
  $(`.section-${href}`).addClass("active");
  $(".box-audio").removeClass("active");
  $("#musicPlayer")[0].pause();
  $("#musicPlayer")[0].currentTime = 0;
};

SPIN_WHEEL.startGame = function () {
  $("#btn-start").on("click", function () {
    $(".section-play").removeClass("active");
    $(".section-playing").addClass("active");
    $(".countdown-play").addClass("active");
    $(".playing").removeClass("active");
    SPIN_WHEEL.countdown();
  });
};

SPIN_WHEEL.countdown = function () {
  let count = SPIN_WHEEL.countDownTimer;
  function updateCountdown() {
    $(".countdown").text(count);
    count--;
    if (count < 0) {
      clearInterval(countdownInterval);
      $(".countdown-play").removeClass("active");
      $(".playing").addClass("active");
      $(".countdown").text(SPIN_WHEEL.countDownTimer);
    }
  }
  const countdownInterval = setInterval(updateCountdown, 1000);
};

SPIN_WHEEL.spin = function () {
  let isSpinning = false;
  $("#spin").on("click", function () {
    if (USER_SPIN > 0) {
      if (!isSpinning) {
        isSpinning = true;
        USER_SPIN = USER_SPIN - 1;
        SPIN_WHEEL.showUserSpin();
        SPIN_WHEEL.calcThePrice(PARTS);

        setTimeout(SPIN_WHEEL.openPopup, 6000);
        setTimeout(() => {
          isSpinning = false;
        }, 6000);
      }
    } else {
      SPIN_WHEEL.openPopup();
      $("#no-spin").addClass("active");
    }
  });
};

SPIN_WHEEL.getRandomRotation = function () {
  return Math.random() * 360 + SPIN_WHEEL.countRotation * 360;
};

SPIN_WHEEL.showPopupPrice = function (part) {
  if (part.point) {
    $("#price-point").addClass("active");
    $("#content-point-title").text(SPIN_WHEEL.t(part.title));
    $("#content-point-count").text(part.point);
    USER_POINT = USER_POINT + part.point;
    setTimeout(SPIN_WHEEL.showUserPoint, 6000);
  } else if (part.gift) {
    $("#price-gift").addClass("active");
    $("#content-gift-title").text(SPIN_WHEEL.t(part.title));
    $("#content-gift-name").text(SPIN_WHEEL.t("giftDrink", part.gift));
  } else if (part.message) {
    $("#price-message").addClass("active");
    $("#content-message-title").text(SPIN_WHEEL.t(part.title));
    $("#content-message-text").text(SPIN_WHEEL.t(part.message));
  } else {
    $("#price-spin").addClass("active");
    $("#content-spin-title").text(SPIN_WHEEL.t(part.title, part.spin));
    $("#content-spin-count").text(part.spin);
    USER_SPIN = USER_SPIN + part.spin;
    setTimeout(SPIN_WHEEL.showUserSpin, 6000);
  }
};

SPIN_WHEEL.calcThePrice = function (parts) {
  const totalPart = Object.keys(parts).length;
  const rotationAngle = SPIN_WHEEL.getRandomRotation();
  const rotation = rotationAngle - 10 * 360;
  $(".circle-inner").css("transform", `rotate(${rotationAngle}deg)`);

  for (i = 1; i <= totalPart; i++) {
    if (
      rotation >= (360 / totalPart) * (i - 1) &&
      rotation < (360 / totalPart) * i
    ) {
      SPIN_WHEEL.showPopupPrice(PARTS[`part${i}`]);
    }
  }
};

SPIN_WHEEL.openPopup = function () {
  $("#popup").addClass("open-popup");
};

SPIN_WHEEL.closePopup = function () {
  $(".btn-close").on("click", function () {
    SPIN_WHEEL.removeTransition().then(() => {
      $(".circle-inner").css(
        "transition",
        "transform 5s cubic-bezier(.45, .58, .17, .93)"
      );
      $("#popup").removeClass("open-popup");
      $(".popup-gift").removeClass("active");
      $(".popup-login").removeClass("active");
      $(".popup-signup").removeClass("active");
    });
  });
};

SPIN_WHEEL.removeTransition = function () {
  return new Promise((resolve) => {
    $(".circle-inner").css("transition", "none");
    $(".circle-inner").css("transform", "rotate(0deg)");
    setTimeout(() => {
      resolve();
    }, 0);
  });
};

SPIN_WHEEL.navigateLogin = function () {
  $(".btn-login").on("click", function () {
    $(".popup-gift").removeClass("active");
    $(".popup-login").addClass("active");
  });

  $(".btn-back").on("click", function () {
    $(".popup-signup").removeClass("active");
    $(".popup-login").addClass("active");
  });
};

SPIN_WHEEL.navigateSignup = function () {
  $(".btn-signup").on("click", function () {
    $(".popup-login").removeClass("active");
    $(".popup-signup").addClass("active");
  });
};

SPIN_WHEEL.music = function () {
  let isPlaying = false;
  $("#btn-start").on("click", function () {
    $(".box-audio").addClass("active");
    $(".icon-music-on").addClass("active");
    $(".icon-music-off").removeClass("active");
    $("#musicPlayer")[0].play();
    isPlaying = true;
  });
  $(".music").on("click", function () {
    $(".icon-music-on").toggleClass("active");
    $(".icon-music-off").toggleClass("active");
    if (isPlaying) {
      $("#musicPlayer")[0].pause();
    } else {
      $("#musicPlayer")[0].play();
    }
    isPlaying = !isPlaying;
  });
};

SPIN_WHEEL.sound = function () {
  $(".sound").on("click", function () {
    $(".icon-sound-on").toggleClass("active");
    $(".icon-sound-off").toggleClass("active");
    $("#soundSpin")[0].muted = !$("#soundSpin")[0].muted;
    $("#soundPrice")[0].muted = !$("#soundPrice")[0].muted;
  });

  let isSpinning = false;
  $("#spin").on("click", function () {
    if (!isSpinning && USER_SPIN > 0) {
      isSpinning = true;
      $("#soundSpin")[0].play();
      setTimeout(() => {
        $("#soundPrice")[0].play();
        isSpinning = false;
      }, 5500);
    }
  });
};

// Show the side menu as a drawer on narrow screens
SPIN_WHEEL.toggleMenu = function () {
  let screenWidth = $(window).width();
  if (screenWidth < 768) {
    $("#right-box").addClass("right-menu");
    $("#right-box").removeClass("right-bar");
  } else {
    $("#right-box").removeClass("right-menu");
    $("#right-box").addClass("right-bar");
  }
};

// Open and close the drawer (mobile and tablet)
SPIN_WHEEL.openMenu = function () {
  $(".right-item-menu").on("click", function () {
    $(".right-menu").addClass("active");
  });
};

SPIN_WHEEL.closeMenu = function () {
  $(".item-close-menu").on("click", function () {
    $(".right-menu").removeClass("active");
  });
};

// Show the player's remaining spins and points
SPIN_WHEEL.showUserSpin = function () {
  $("#user-spin").text(USER_SPIN);
};

SPIN_WHEEL.showUserPoint = function () {
  $("#user-point").text(USER_POINT);
};

// Language: dictionaries are assets/lang/<code>.json. English is always loaded as the
// fallback so a missing key in another language still shows readable text.
SPIN_WHEEL.dictionary = {};
SPIN_WHEEL.fallback = {};

SPIN_WHEEL.t = function (key) {
  let text = SPIN_WHEEL.dictionary[key] || SPIN_WHEEL.fallback[key] || key;
  for (let i = 1; i < arguments.length; i++) {
    text = text.replace("$" + i, arguments[i]);
  }
  return text;
};

SPIN_WHEEL.loadDictionary = function (code) {
  return fetch("assets/lang/" + code + ".json").then(function (response) {
    return response.json();
  });
};

SPIN_WHEEL.applyLanguage = function () {
  MiniLang.apply(document, function (key) {
    return key === "playRule2"
      ? SPIN_WHEEL.t(key, GAME_SETTINGS.get("initialSpins"))
      : SPIN_WHEEL.t(key);
  });
  $("#lang-select").attr("aria-label", SPIN_WHEEL.t("language"));
};

SPIN_WHEEL.setLanguage = function (code) {
  MiniLang.set(code);
  const wanted = code === MiniLang.DEFAULT ? [] : [SPIN_WHEEL.loadDictionary(code)];
  return Promise.all(wanted)
    .then(function (loaded) {
      SPIN_WHEEL.dictionary = loaded[0] || SPIN_WHEEL.fallback;
      SPIN_WHEEL.applyLanguage();
    })
    .catch(function (error) {
      console.error("Could not load language", code, error);
    });
};

SPIN_WHEEL.initLanguage = function () {
  const select = $("#lang-select");
  Object.keys(MiniLang.LANGUAGES).forEach(function (code) {
    select.append($("<option>").val(code).text(MiniLang.LANGUAGES[code]));
  });
  select.val(MiniLang.get());
  select.on("change", function () {
    SPIN_WHEEL.setLanguage(select.val());
  });
  SPIN_WHEEL.loadDictionary(MiniLang.DEFAULT)
    .then(function (english) {
      SPIN_WHEEL.fallback = english;
      return SPIN_WHEEL.setLanguage(MiniLang.get());
    })
    .catch(function (error) {
      console.error("Could not load language files", error);
    });
};
