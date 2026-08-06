const addProductForm = document.getElementById("addProductForm");


if (addProductForm) {

    addProductForm.addEventListener("submit", async (e) => {

        e.preventDefault();


        const product = {

            name: document.getElementById("name").value.trim(),

            category: document.getElementById("category").value.trim(),

            price: Number(
                document.getElementById("price").value
            ),

            stock: Number(
                document.getElementById("stock").value
            ),

            image: normalizeImagePath(document.getElementById("image").value.trim()),

            description: document.getElementById("description").value.trim()

        };


        try {


            const token = localStorage.getItem("token");


            const response = await fetch(
                `${API_BASE_URL}/api/admin/products`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        "Authorization": `Bearer ${token}`

                    },

                    body: JSON.stringify(product)

                }
            );


            const data = await response.json();


            if(response.ok){

                alert("✅ Product Added Successfully!");

                addProductForm.reset();

            }
            else{

                alert(data.message || "Product Add Failed");

            }


        } catch(error){

            console.log(error);

            alert("Server Error");

        }


    });

}