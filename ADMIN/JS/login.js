/* ==========================================================
   API Configuration
========================================================== */

const API_BASE_URL =
    "http://localhost:5001/api/admin";


/* ==========================================================
   Elements
========================================================== */

const phoneForm = document.getElementById("phone-form");

const otpForm = document.getElementById("otp-form");

const loadingState = document.getElementById("loading-state");

const continueButton = document.getElementById("continue-button");

const verifyButton = document.getElementById("verify-button");

const phoneInput = document.getElementById("phone-number");

const maskedNumber = document.getElementById("masked-phone-number");

const resendButton = document.getElementById("resend-otp");

const phoneError = document.getElementById("phone-error");

const otpError = document.getElementById("otp-error");

const otpInputs = document.querySelectorAll(".otp-input");

const changeNumber = document.getElementById("change-number");


/* ==========================================================
   Store Current Phone Number
========================================================== */

let currentPhone = "";


/* ==========================================================
   Allow Numbers Only
========================================================== */

phoneInput.addEventListener("input", function(){

    this.value =
        this.value.replace(/\D/g, "");

});


/* ==========================================================
   Phone Continue
========================================================== */

phoneForm.addEventListener("submit", async function(event){

    event.preventDefault();

    phoneError.classList.add("hidden");

    const phone =
        phoneInput.value.trim();


    /* --------------------------------------------------
       Validate Phone Length
    -------------------------------------------------- */

    if(phone.length !== 10){

        phoneError.textContent =
            "Please enter a valid 10-digit phone number.";

        phoneError.classList.remove("hidden");

        phoneInput.focus();

        return;

    }


    /* --------------------------------------------------
       Disable Continue Button
    -------------------------------------------------- */

    continueButton.disabled = true;

    continueButton.classList.add("loading");


    try {

        /* --------------------------------------------------
           Send OTP Request
        -------------------------------------------------- */

        const response =
            await fetch(
                `${API_BASE_URL}/send-otp`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        phone: phone

                    })

                }
            );


        const data =
            await response.json();


        /* --------------------------------------------------
           Handle Backend Error
        -------------------------------------------------- */

        if(!response.ok){

            phoneError.textContent =
                data.message ||
                "Unable to send OTP.";

            phoneError.classList.remove("hidden");

            return;

        }


        /* --------------------------------------------------
           Store Phone Number
        -------------------------------------------------- */

        currentPhone = phone;


        /* --------------------------------------------------
           Mask Phone Number
        -------------------------------------------------- */

        const lastFour =
            phone.slice(-4);


        maskedNumber.textContent =
            `+91 ••••••${lastFour}`;


        /* --------------------------------------------------
           Switch To OTP Screen
        -------------------------------------------------- */

        phoneForm.classList.add("hidden");

        otpForm.classList.remove("hidden");


        /* --------------------------------------------------
           Clear Previous OTP
        -------------------------------------------------- */

        otpInputs.forEach(function(input){

            input.value = "";

        });


        /* --------------------------------------------------
           Focus First OTP Input
        -------------------------------------------------- */

        otpInputs[0].focus();


        /* --------------------------------------------------
           Start OTP Timer
        -------------------------------------------------- */

        startTimer();

    } catch(error){

        console.error(
            "Send OTP Error:",
            error
        );


        phoneError.textContent =
            "Unable to connect to the server. Please try again.";

        phoneError.classList.remove("hidden");

    } finally {

        continueButton.disabled = false;

        continueButton.classList.remove("loading");

    }

});


/* ==========================================================
   OTP Input
========================================================== */

otpInputs.forEach(function(input, index){

    input.addEventListener("input", function(){

        this.value =
            this.value.replace(/\D/g, "");


        if(
            this.value &&
            index < otpInputs.length - 1
        ){

            otpInputs[index + 1].focus();

        }

    });

});


/* ==========================================================
   OTP Backspace
========================================================== */

otpInputs.forEach(function(input, index){

    input.addEventListener("keydown", function(event){

        if(
            event.key === "Backspace" &&
            this.value === "" &&
            index > 0
        ){

            otpInputs[index - 1].focus();

        }

    });

});


/* ==========================================================
   OTP Paste
========================================================== */

otpInputs[0].addEventListener("paste", function(event){

    event.preventDefault();


    const data =
        event.clipboardData
            .getData("text")
            .replace(/\D/g, "");


    if(data.length !== 6){

        return;

    }


    otpInputs.forEach(function(input, index){

        input.value =
            data[index];

    });


    otpInputs[5].focus();

});


/* ==========================================================
   Verify OTP
========================================================== */

otpForm.addEventListener("submit", async function(event){

    event.preventDefault();

    otpError.classList.add("hidden");


    /* --------------------------------------------------
       Collect OTP
    -------------------------------------------------- */

    let otp = "";


    otpInputs.forEach(function(input){

        otp += input.value;

    });


    /* --------------------------------------------------
       Validate OTP Length
    -------------------------------------------------- */

    if(otp.length !== 6){

        otpError.textContent =
            "Please enter the complete OTP.";

        otpError.classList.remove("hidden");

        return;

    }


    /* --------------------------------------------------
       Disable Verify Button
    -------------------------------------------------- */

    verifyButton.disabled = true;

    verifyButton.classList.add("loading");


    try {

        /* --------------------------------------------------
           Verify OTP Request
        -------------------------------------------------- */

        const response =
            await fetch(
                `${API_BASE_URL}/verify-otp`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        phone: currentPhone,

                        otp: otp

                    })

                }
            );


        const data =
            await response.json();


        /* --------------------------------------------------
           Handle Verification Error
        -------------------------------------------------- */

        if(!response.ok){

            otpError.textContent =
                data.message ||
                "Invalid or expired OTP.";

            otpError.classList.remove("hidden");

            return;

        }


        /* --------------------------------------------------
           Save Admin Authentication
        -------------------------------------------------- */

        localStorage.setItem(
            "snackmentAdminToken",
            data.token
        );


        localStorage.setItem(
            "snackmentAdmin",
            JSON.stringify(data.admin)
        );


        /* --------------------------------------------------
           Show Loading Screen
        -------------------------------------------------- */

        otpForm.classList.add("hidden");

        loadingState.classList.remove("hidden");


        /* --------------------------------------------------
           Redirect To Admin Dashboard
        -------------------------------------------------- */

        setTimeout(function(){

            window.location.href =
                "index.html";

        }, 1200);

    } catch(error){

        console.error(
            "Verify OTP Error:",
            error
        );


        otpError.textContent =
            "Unable to connect to the server. Please try again.";

        otpError.classList.remove("hidden");

    } finally {

        verifyButton.disabled = false;

        verifyButton.classList.remove("loading");

    }

});


/* ==========================================================
   Change Phone Number
========================================================== */

changeNumber.addEventListener("click", function(){

    clearInterval(timer);


    otpForm.classList.add("hidden");

    phoneForm.classList.remove("hidden");


    phoneInput.focus();

});


/* ==========================================================
   OTP Timer
========================================================== */

let timer;


function startTimer(){

    clearInterval(timer);


    let seconds = 30;


    resendButton.disabled = true;

    resendButton.textContent =
        "00:30";


    timer = setInterval(function(){

        seconds--;


        const minute =
            String(
                Math.floor(seconds / 60)
            ).padStart(2, "0");


        const second =
            String(
                seconds % 60
            ).padStart(2, "0");


        resendButton.textContent =
            `${minute}:${second}`;


        if(seconds <= 0){

            clearInterval(timer);


            resendButton.disabled =
                false;


            resendButton.textContent =
                "Resend OTP";

        }

    }, 1000);

}


/* ==========================================================
   Resend OTP
========================================================== */

resendButton.addEventListener("click", async function(){

    if(this.disabled){

        return;

    }


    if(!currentPhone){

        return;

    }


    this.disabled = true;

    this.textContent =
        "Sending...";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/send-otp`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        phone: currentPhone

                    })

                }
            );


        const data =
            await response.json();


        if(!response.ok){

            otpError.textContent =
                data.message ||
                "Unable to resend OTP.";

            otpError.classList.remove("hidden");

            this.disabled = false;

            this.textContent =
                "Resend OTP";

            return;

        }


        /* --------------------------------------------------
           Restart Timer
        -------------------------------------------------- */

        startTimer();

    } catch(error){

        console.error(
            "Resend OTP Error:",
            error
        );


        otpError.textContent =
            "Unable to connect to the server.";

        otpError.classList.remove("hidden");


        this.disabled = false;

        this.textContent =
            "Resend OTP";

    }

});


/* ==========================================================
   Initial Focus
========================================================== */

window.addEventListener("load", function(){

    phoneInput.focus();

});