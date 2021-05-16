const username = document.querySelector("#username");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const cpassword = document.querySelector("#cpassword");
const regform = document.querySelector("#registration-container");

function checkUser(){
    let valid = false;

    if(!isUserValid(username.value)){
        showError(username, 'Username must begin with a character and have 3 or more alphanumeric characters');
    }
    else{
        showSuccess(username);
        valid = true;
    }

    return valid;
}

function isUserValid(username_){
    if( username_.match(/^[0-9a-zA-Z]+$/) &&
        username_.charAt(0).match(/[a-zA-Z]/) &&
        username_.length >= 3){
            return true;
        }
    else{
        return false;
    }
}

function checkEmail(){
    let valid = false;

    if(!isEmailValid(email.value)){
        showError(email, 'Email is not valid');
    }
    else{
        showSuccess(email);
        valid = true;
    }

    return valid;
}

function isEmailValid(email_){
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email_);
}

function checkPassword(){
    let valid = false;

    if(!isPasswordSecure(password.value)){
        showError(password, 'Password must have 8 or more characters that contains at least 1 upper case letter, 1 number, and 1 of the following special characters (/*-+!@#$^&*)');
    }
    else{
        showSuccess(password);
        valid = true;
    }

    return valid;
}

function isPasswordSecure (password_){
    if( password_.match(/[A-Z]/g) &&
        password_.match(/[0-9]/g) &&
        password_.match(/[^a-zA-Z\d]/g) &&
        password_.length >= 8){
            return true;
        }
    else{
        return false;
    }
};

function checkConPassword(){
    let valid = false; 

    if(password.value !== cpassword.value){
        showError(cpassword, 'The password does not match');
    }
    else{
        showSuccess(cpassword);
        valid = true;
    }

    return valid;
}


function showError(input, message){
    const formField = input.parentElement;
    formField.classList.remove("success");
    formField.classList.add("error");

    formField.querySelector("small").textContent = message;
}

function showSuccess(input){
    const formField = input.parentElement;
    formField.classList.remove("error");
    formField.classList.add("success");

    formField.querySelector("small").textContent = '';
}

regform.addEventListener("input", function(event){
    switch(event.target.id){
        case "username":
            checkUser();
            break;
        case "email":
            checkEmail();
            break;
        case "password":
            checkPassword();
            break;
        case "cpassword":
            checkConPassword();
            break;
    }
})

