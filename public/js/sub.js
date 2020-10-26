// to the list
$(".to-the-list").on("click", function () {
  const href = $(this).attr("data-type");
  location.href = href;
});

// mobile-menu-click
$(".mobile-menu-bar").on("click", function () {
  $(".list-nav").toggle();
});

$(window).resize(function () {
  const width = $(this).width();
  if (width > 1207) {
    $(".list-nav").show();
  } else {
    $(".list-nav").hide();
  }
});
