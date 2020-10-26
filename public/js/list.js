// list-content 실험 타입
$(".list-content-header-ul > li").on("click", function () {
  $(".list-content-header-ul > li").removeClass("list-content-header-active");
  $(this).addClass("list-content-header-active");
  /*
 click후 class list-content-thumbnail에 컨텐츠 업데이트

*/
});

// 이미지 오버
$(".list-content-thumbnail > li").hover(
  function () {
    const imgWidth = $(this)
      .children(".list-link")
      .children(".image-container")
      .children("img")
      .width();
    const imgHeight = $(this)
      .children(".list-link")
      .children(".image-container")
      .children("img")
      .height();
    const txt = $(this)
      .children(".list-link")
      .children(".image-container")
      .siblings(".list-content-thumbnail-title")
      .children(".item-title")
      .text();

    $(this)
      .children(".image-cover")
      .css({
        width: imgWidth,
        height: imgHeight,
        display: "flex",
      })
      .animate(
        {
          opacity: 0.8,
        },
        400
      )
      .show()
      .offset(
        $(this).children(".list-link").children(".image-container").offset()
      )
      .children(".image-cover-content")
      .children(".title")
      .text(txt);
  },
  function () {
    $(".image-cover").stop().hide().css({
      opacity: 0,
    });
  }
);
