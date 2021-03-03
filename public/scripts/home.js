$("#logout").on("click", function() {
  $.ajax({
    url: "/logout",
    type: "DELETE"
  }).done(function(res) {
    console.log("Delete session");
  }).fail(function(err) {
    console.log(err);
  });
});
