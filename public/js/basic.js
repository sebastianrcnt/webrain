// // 메뉴 오버
// $(".main-menu > li")
//   .mouseover(function () {
//     const width = $(this).width()
//     const deviceWidth = $(window).width()
//     if (deviceWidth > 1023) {
//       $(this).children(".main-menu-child").width(width).fadeIn(150)
//     }
//   })
//   .mouseleave(function () {
//     const deviceWidth = $(window).width()
//     if (deviceWidth > 1023) {
//       $(".main-menu-child").hide()
//     }
//   })

// // 메뉴 클릭
// $(".main-menu > li").click(function () {
//   $(".main-menu-child").hide()
//   const width = $(this).width()
//   $(this).children(".main-menu-child").width(width).slideDown(200)
// })

// // mobile menu toggle
// $(".mobile-menu-trigger").click(function () {
//   $(".menu-wrap").toggle("fast", function () {
//     // Animation complete.
//   })
// })

// // loading시 메뉴 숨김처리
// const deviceWidth = $(window).width()
// if (deviceWidth > 1023) {
//   $(".menu-wrap").show()
// } else {
//   $(".menu-wrap").hide()
// }

// // 창 크기 변경시 보정
// $(window).resize(function () {
//   const deviceWidth = $(window).width()
//   if (deviceWidth > 1023) {
//     $(".menu-wrap").show()
//   } else {
//     $(".menu-wrap").hide()
//   }
// })

// $(".main-menu > li > a").click(function (e) {
//   const deviceWidth = $(window).width()
//   if (deviceWidth < 1023) {
//     e.preventDefault()
//   }
// })

let isMenuVisible = false;

function updateMenuVisibillityStatus() {
  if ($(window).width() > 1023) {
    $(".menu-wrap").show();
  } else {
    if (isMenuVisible) {
      $(".menu-wrap").show();
    } else {
      $(".menu-wrap").hide();
    }
  }
}

$(window).on("load", () => {
  if ($(window).width() > 1023) {
    isMenuVisible = true;
  }
  updateMenuVisibillityStatus();
  $(".mobile-menu-trigger").on("click", () => {
    isMenuVisible = !isMenuVisible;
    updateMenuVisibillityStatus();
  });
  $(window).on("resize", () => {
    if ($(window).width() > 1023) {
      isMenuVisible = true;
    } else {
      isMenuVisible = false;
    }

    updateMenuVisibillityStatus();
  });
});
