$("#getDrive").on("click", function() {
    $.ajax({
        url: "/api/google/drive",
        type: "PUT"
    }).done((resp) => { 
        // Not found, 401(invalid credentials), 403(No credentials)
        if(resp=="No google_id"||resp.authError=="Unauthorized"||resp.authError=="No credentials") {
            location.assign("/api/google/drive")
        } else {
            for(let i=0; i<resp.files.length; i++) {
                $(".content").append(`<li>${resp.files[i].name}</li>`);
            }
        }
        
    }).fail((err) => {
        console.log(err);
    });
});

$("#cancelAccess").on("click", function() {
    $.ajax({
        url: "/api/google/revoke",
        type: "DELETE"
    }).done((resp) => {
        console.log(resp);
    }).fail((err) => {
        console.log(err);
    })
});
