$("#getEmail").on("click", function() {
    $.ajax({
        url: "/api/google",
        type: "PUT"
    });
});