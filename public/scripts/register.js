$("form").on("submit", function(event) {
  event.preventDefault();
  
  $.ajax({
    url: "/auth/register",
    type: "POST",
    data: $(this).serialize()
  }).done((resp)=> {
    if(resp.id) {
      /*Redirect to log in page if signing in is successful*/
      location.assign("/auth/login");
    } else {
      /*Show the error messages*/
      $(".email").text(resp.email);
      $(".password").text(resp.password);
    }
  }).fail((err)=> {
    console.log(err);
  });
});
