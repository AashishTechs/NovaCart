// =========================
// Users Management
// =========================


const table = document.getElementById("usersTable");

let users = [];


// =========================
// Load Users
// =========================

async function loadUsers(){

    try{


        const response = await fetch(
            `${API_BASE_URL}/api/admin/users`,
            {
                headers:{
                    "Authorization":
                    "Bearer " + localStorage.getItem("token")
                }
            }
        );



        if(!response.ok){

            throw new Error(
                "Failed to load users"
            );

        }



        users = await response.json();


        displayUsers(users);



    }catch(error){


        console.error(
            "Users Error:",
            error
        );


        alert(
            "Failed to load users"
        );


    }

}





// =========================
// Display Users
// =========================

function displayUsers(data){


    if(!table) return;


    table.innerHTML="";



    if(data.length===0){

        table.innerHTML=`

        <tr>
            <td colspan="6">
                No Users Found
            </td>
        </tr>

        `;

        return;

    }



    table.innerHTML = data.map(user => `

        <tr>

            <td>${user.id}</td>

            <td>${user.name}</td>

            <td>${user.email}</td>

            <td>${user.role}</td>

            <td>
                ${new Date(user.created_at)
                .toLocaleDateString()}
            </td>


            <td>


                <button onclick="changeRole(${user.id})">
                    🔄 Role
                </button>


                <button onclick="deleteUser(${user.id})">
                    🗑 Delete
                </button>


            </td>


        </tr>

    `).join("");


}






// =========================
// Change Role
// =========================

async function changeRole(id){


    const role = prompt(
        "Enter role:\nadmin or user"
    );


    if(!role) return;



    try{


        const response = await fetch(

            `${API_BASE_URL}/api/admin/users/${id}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":
                    "application/json",

                    "Authorization":
                    "Bearer " + localStorage.getItem("token")

                },


                body:JSON.stringify({

                    role:role

                })

            }

        );



        const data = await response.json();



        if(!response.ok){

            throw new Error(data.message);

        }



        alert(
            "Role updated successfully"
        );


        loadUsers();



    }catch(error){


        console.error(error);


        alert(
            "Failed to update role"
        );


    }


}







// =========================
// Delete User
// =========================

async function deleteUser(id){


    const confirmDelete = confirm(
        "Delete this user?"
    );


    if(!confirmDelete) return;



    try{


        const response = await fetch(

            `${API_BASE_URL}/api/admin/users/${id}`,

            {

                method:"DELETE",

                headers:{

                    "Authorization":
                    "Bearer " + localStorage.getItem("token")

                }

            }

        );



        const data = await response.json();



        if(!response.ok){

            throw new Error(data.message);

        }



        alert(
            "User deleted successfully"
        );


        loadUsers();



    }catch(error){


        console.error(error);


        alert(
            "Failed to delete user"
        );


    }


}







// =========================
// Search User
// =========================


const searchUser =
document.getElementById("searchUser");



if(searchUser){


    searchUser.addEventListener(
        "keyup",
        function(){


            const value =
            this.value.toLowerCase();



            const filtered =
            users.filter(user=>{


                return (

                    user.name
                    .toLowerCase()
                    .includes(value)


                    ||

                    user.email
                    .toLowerCase()
                    .includes(value)


                );


            });



            displayUsers(filtered);



        }
    );


}







// =========================
// Start
// =========================

loadUsers();