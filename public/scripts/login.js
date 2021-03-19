$("form").on("submit", function(event) {
  event.preventDefault();

  $.ajax({
    url: "/auth/login",
    type: "POST",
    data: $(this).serialize()
  }).done((resp)=> {
    if(resp.id) {
      /*Redirect to log in page if signing in is successful*/
      location.assign("/");
    } else {
      /*Show the error messages*/
      $(".email").text(resp.email);
      $(".password").text(resp.password);
    }
  }).fail((err)=> {
    console.log(err);
  });
});
