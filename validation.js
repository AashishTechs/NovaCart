// =========================
// Form Validation
// =========================

const forms = document.querySelectorAll("form");

forms.forEach(form=>{

form.addEventListener("submit",(e)=>{

const inputs = form.querySelectorAll("input");

for(let input of inputs){

if(input.value.trim()===""){

e.preventDefault();

alert("Please fill all fields");

return;

}

}

});

});