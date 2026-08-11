const logoutBtn = document.getElementById("logout");


if(logoutBtn){

    logoutBtn.addEventListener(
        "click",
        function(e){

            e.preventDefault();


            // Remove Admin Session

            localStorage.removeItem(
                "admin"
            );


            localStorage.removeItem(
                "token"
            );


            localStorage.removeItem(
                "adminLoggedIn"
            );


            alert(
                "Logout Successful ✅"
            );


            window.location.href =
            "login.html";


        }
    );

}