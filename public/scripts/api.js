$("#getDrive").on("click", function() {
    $.ajax({
        url: "/api/google/drive",
        type: "PUT"
    }).done((resp) => { 
        // Not found or 403
        if(resp=="No google_id"||resp.authError=="Invalid tokens") {
            location.assign("/api/google/drive")
        }

        // 401
        if(resp.authError=="Unauthorized") {
            location.assign("/api/google/myDrive");
        }
        
    }).fail((err) => {
        console.log(err);
    });
});
