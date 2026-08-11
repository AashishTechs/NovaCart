const changePasswordForm = document.getElementById(
    "change-password-form"
);


if (changePasswordForm) {


    changePasswordForm.addEventListener(
        "submit",
        function(e){


            e.preventDefault();



            const currentPassword =
            document.getElementById(
                "currentPassword"
            ).value;



            const newPassword =
            document.getElementById(
                "newPassword"
            ).value;



            const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value;



            // Temporary old password check
            const savedPassword =
            localStorage.getItem(
                "adminPassword"
            ) || "admin123";



            if(currentPassword !== savedPassword){

                alert(
                    "Current password is incorrect ❌"
                );

                return;

            }



            if(newPassword !== confirmPassword){

                alert(
                    "New password and confirm password do not match ❌"
                );

                return;

            }



            if(newPassword.length < 6){

                alert(
                    "Password must be at least 6 characters long ❌"
                );

                return;

            }



            localStorage.setItem(
                "adminPassword",
                newPassword
            );



            alert(
                "Password changed successfully ✅"
            );



            changePasswordForm.reset();


        }
    );

}