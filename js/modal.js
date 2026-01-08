document.addEventListener("DOMContentLoaded", () => {

/* =====================
   ELEMENTS
===================== */
const loginBtn = document.querySelector('.login-btn');
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.login-modal');
const closeBtn = document.querySelector('.close-btn');
const pageContent = document.querySelector('.page-content');

const phoneStep = document.getElementById("phoneStep");
const otpStep = document.getElementById("otpStep");

const phoneInput = document.querySelector('.phone-input-field');
const continueBtn = document.querySelector('.continue-btn');

const maskedPhone = document.getElementById("maskedPhone");
const timerEl = document.getElementById("timer");

const otpInputs = document.querySelectorAll(".otp-inputs input");
const verifyBtn = document.querySelector(".verify-btn");

/* =====================
   OPEN / CLOSE MODAL
===================== */
loginBtn.addEventListener('click', () => {
  overlay.classList.add('active');
  modal.classList.add('active');
  pageContent.classList.add('blur');
  document.body.style.overflow = 'hidden';

  // reset to phone step
  phoneStep.classList.add("active");
  otpStep.classList.remove("active");
});

function closeModal() {
  overlay.classList.remove('active');
  modal.classList.remove('active');
  pageContent.classList.remove('blur');
  document.body.style.overflow = '';
}

overlay.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);

/* =====================
   PHONE INPUT VALIDATION
===================== */
phoneInput.addEventListener('input', () => {
  phoneInput.value = phoneInput.value.replace(/\D/g, '');

  if (phoneInput.value.length === 10) {
    continueBtn.classList.add('active');
    continueBtn.disabled = false;
  } else {
    continueBtn.classList.remove('active');
    continueBtn.disabled = true;
  }
});

/* =====================
   PHONE → OTP SWITCH
===================== */
continueBtn.addEventListener("click", () => {
  const phone = phoneInput.value;
  if (phone.length !== 10) return;

  maskedPhone.textContent = `+91 ••••${phone.slice(-4)}`;

  phoneStep.classList.remove("active");
  otpStep.classList.add("active");

setTimeout(() => {
  startTimer();
}, 100); // allow DOM to render
});

/* =====================
   OTP TIMER (30s)
===================== */
const resendBtn = document.getElementById("resendBtn");
const resendText = document.getElementById("resendText");

let interval;
let timeLeft = 30;

function startTimer() {
  clearInterval(interval);
  timeLeft = 30;

  // show timer, hide resend
  resendBtn.style.display = "none";
  resendText.style.display = "block";

  timerEl.textContent = timeLeft;

  interval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(interval);

      // hide timer, show resend
      resendText.style.display = "none";
      resendBtn.style.display = "block";
    }
  }, 1000);
}


/* =====================
   OTP INPUT HANDLING
===================== */
otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");

    if (input.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }

    checkOTP();
  });
});

// BACKSPACE HANDLING
otpInputs.forEach((input, index) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      if (input.value === "" && index > 0) {
        otpInputs[index - 1].focus();
        otpInputs[index - 1].value = "";
      }
    }
  });
});

function checkOTP() {
  const otp = Array.from(otpInputs).map(i => i.value).join("");

  if (otp.length === 6) {
    verifyBtn.classList.add("active");
    verifyBtn.disabled = false;
  } else {
    verifyBtn.classList.remove("active");
    verifyBtn.disabled = true;
  }
}

/* =====================
   VERIFY (TEMP FAKE)
===================== */
verifyBtn.addEventListener("click", () => {
  if (!verifyBtn.classList.contains("active")) return;

  // TEMP SUCCESS FLOW
  closeModal();
  alert("Login successful (OTP verified)");
});

resendBtn.addEventListener("click", () => {
  // Clear OTP inputs
  otpInputs.forEach(input => input.value = "");
  otpInputs[0].focus();

  verifyBtn.classList.remove("active");
  verifyBtn.disabled = true;

  // Restart timer
  startTimer();

  // 🔥 Later yahan real resend OTP API call lagega
});

});