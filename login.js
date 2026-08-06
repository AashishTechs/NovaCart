// =========================
// Login
// =========================

const loginForm = document.querySelector("form");


if(loginForm){

loginForm.addEventListener("submit", async (e)=>{

    e.preventDefault();


    const email = loginForm.email.value;
    const password = loginForm.password.value;


    try {


        const response = await fetch(
            `${API_BASE_URL}/api/auth/login`,
            {
                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({
                    email,
                    password
                })
            }
        );


        const data = await response.json();


        if(response.ok){


            // Save user data
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            // Save token
            localStorage.setItem(
                "token",
                data.token
            );


            alert("🎉 Login Successful");


            window.location.href="index.html";


        }
        else{

            alert(data.message);

        }


    }catch(error){

        console.log(error);

        alert("Server Error");

    }


});

}