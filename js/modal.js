document.addEventListener("DOMContentLoaded", () => {

  // 🔐 AUTO LOGIN CHECK
  const token = localStorage.getItem("token");

  // 🔐 AUTH CHECK HELPER
  window.isLoggedIn = function () {
    return !!localStorage.getItem("token");
  };


  if (token) {
    // User already logged in
    // Ensure modal never opens
    document.body.classList.remove("blur");
  }

  /* =====================
     ELEMENTS
  ===================== */
  const loginBtn = document.querySelector('.login-btn');
  const logoutBtn = document.querySelector('.logout-btn');

  // 🔐 Toggle buttons based on token
  if (localStorage.getItem("token")) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-flex";
  } else {
    loginBtn.style.display = "inline-flex";
    logoutBtn.style.display = "none";
  }

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

  const welcomeStep = document.getElementById("welcomeStep");
  const welcomeContinue = document.getElementById("welcomeContinue");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("snackment_logged_in");
    sessionStorage.removeItem("free_delivery_celebrated");
    location.reload();
  });


  /* =====================
     OPEN / CLOSE MODAL
  ===================== */
  loginBtn.addEventListener('click', () => {
    if (localStorage.getItem("token")) {
      // Already logged in → do nothing
      return;
    }

    overlay.classList.remove('active');

    overlay.classList.add('active');
    modal.classList.add('active');
    pageContent.classList.add('blur');
    document.body.style.overflow = 'hidden';

    phoneStep.classList.add("active");
    otpStep.classList.remove("active");
    welcomeStep.classList.remove("active");
  });
  // 🔐 OPEN LOGIN MODAL (REUSABLE)
  window.openLoginModal = function () {
    // 🔥 FIX 3 again
    overlay.classList.remove('active');

    overlay.classList.add('active');
    modal.classList.add('active');
    pageContent.classList.add('blur');
    document.body.style.overflow = 'hidden';

    phoneStep.classList.add("active");
    otpStep.classList.remove("active");
    welcomeStep.classList.remove("active");
  };

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
  continueBtn.addEventListener("click", async (e) => {
    e.preventDefault(); // 🔥 THIS IS THE FIX

    const phone = phoneInput.value;
    if (phone.length !== 10) return;

    await fetch("http://localhost:5001/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });

    maskedPhone.textContent = `+91 ••••${phone.slice(-4)}`;
    phoneStep.classList.remove("active");
    otpStep.classList.add("active");

    setTimeout(startTimer, 100);
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
     WELCOME BACK
  ===================== */
  function showWelcomeBack() {
    otpStep.classList.remove("active");
    welcomeStep.classList.add("active");
  }


  /* =====================
   VERIFY OTP (FINAL FIX)
===================== */
  verifyBtn.addEventListener("click", async () => {
    if (!verifyBtn.classList.contains("active")) return;

    const phone = phoneInput.value;
    const otp = Array.from(otpInputs).map(i => i.value).join("");

    try {
      const res = await fetch("http://localhost:5001/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone, otp })
      });

      const data = await res.json();

      // ❌ INVALID / EXPIRED / WRONG OTP
      if (!res.ok) {
        alert(data.message || "Invalid or expired OTP");
        return;
      }

      // ✅ SUCCESS
      localStorage.setItem("token", data.token);

      // 🔄 MERGE GUEST CART AFTER LOGIN
      const guestCart = JSON.parse(localStorage.getItem("snackment_cart"));

      if (guestCart && guestCart.items?.length) {
        fetch(`${API_BASE}/cart/merge`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`
          },
          body: JSON.stringify({
            items: guestCart.items.map(item => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              qty: item.qty
            }))
          })
        }).then(() => {
          localStorage.removeItem("snackment_cart"); // clear guest cart

          // ✅ IMPORTANT: stop celebration from re-triggering
          sessionStorage.removeItem("free_delivery_celebrated");
        });
      }


      if (data.isProfileComplete) {
        showWelcomeBack();
      } else {
        window.location.href = "auth.html";
      }

    } catch (err) {
      alert("Network error. Please try again.");
    }
  });
  /* =====================
   RESEND OTP
===================== */
  resendBtn.addEventListener("click", async () => {
    const phone = phoneInput.value;
    if (phone.length !== 10) return;

    otpInputs.forEach(input => input.value = "");
    otpInputs[0].focus();

    verifyBtn.classList.remove("active");
    verifyBtn.disabled = true;

    try {
      const res = await fetch("http://localhost:5001/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Please wait before resending OTP");
        return;
      }

      startTimer();
    } catch {
      alert("Network error. Please try again.");
    }
  });

  /* =====================
     WELCOME CONTINUE
  ===================== */
  welcomeContinue.addEventListener("click", () => {
    closeModal();

    if (localStorage.getItem("token")) {
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-flex";
    }
  });

  continueBtn.addEventListener("click", () => {
    console.log("CONTINUE CLICKED");
  });

});