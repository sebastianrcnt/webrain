// list-content 실험 타입 선택
$(".list-content-header-ul > li").on("click", function () {
  $(".list-content-header-ul > li").removeClass("list-content-header-active");
  $(this).addClass("list-content-header-active");
  /*
click후 class list-content-thumbnail에 컨텐츠 업데이트

*/
});

// list 마우스 오버
$(".list-content-thumbnail > li")
  .mouseover(function () {
    const href = $(this).children("a").attr("href");
    $(this).children(".pageOption").children("a").attr("href", href);
    $(this)
      .children("a")
      .children(".list-content-thumbnail-title")
      .children("span")
      .addClass("list-over");
  })
  .mouseleave(function () {
    $(this)
      .children("a")
      .children(".list-content-thumbnail-title")
      .children("span")
      .removeClass("list-over");
  });

// completed 에 이미지 넣기
const img =
  "<img class='completed-img' src='../images/completed.png' alt='완료'/>";
$(".completed").append(img);

// lockec 클릭 , 잠긴 프로젝트 클릭
$(".locked").on("click", function (e) {
  e.preventDefault();
  Toastify({
    text: "잠긴 프로젝트 입니다.",
    duration: 3000,
    // destination: "/",
    newWindow: true,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
    stopOnFocus: true,
    onClick: function () {},
  }).showToast();
});

// resize function
const width = $(".pageOption").width();
$(" .list-content-thumbnail>li ").width(width);
$(window).resize(function () {
  const width = $(".pageOption").width();
  $(" .list-content-thumbnail>li ").width(width);
});
