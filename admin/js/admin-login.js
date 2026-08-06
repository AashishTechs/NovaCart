const loginForm = document.getElementById("admin-login-form");


if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();


        const email = document.getElementById("email").value.trim();

        const password = document.getElementById("password").value;


        try {


            const response = await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })

                }
            );


            const data = await response.json();


            if (!response.ok) {

                alert(data.message || "Login Failed");

                return;

            }



            // Admin Role Check

            if (!data.user || data.user.role !== "admin") {

                alert("❌ Access Denied! Admin only.");

                return;

            }



            // Save JWT Token

            localStorage.setItem(
                "token",
                data.token
            );


            // Save Admin Data

            localStorage.setItem(
                "admin",
                JSON.stringify(data.user)
            );



            alert(
                "🎉 Admin Login Successful"
            );


            window.location.href =
            "dashboard.html";



        }
        catch(error){

            console.log(
                "Login Error:",
                error
            );

            alert(
                "❌ Server Error"
            );

        }


    });

}