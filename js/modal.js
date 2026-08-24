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
  const navbarLoginBtn = document.querySelector(".login-btn");
  const loginText = navbarLoginBtn.querySelector(".login-text");

  const passwordLoginBtn = document.querySelector(".password-login-btn");

  if (token) {
    loginText.textContent = "Profile";
  } else {
    loginText.textContent = "Login";
  }
  const overlay = document.querySelector('.overlay');
  const modal = document.querySelector('.login-modal');
  const closeBtn = document.querySelector('.close-btn');
  const pageContent = document.querySelector('.page-content');
  const phoneInput = document.querySelector('.phone-input-field');
  const continueBtn = document.querySelector('.continue-btn');
  const phoneStep = document.getElementById("phoneStep");
  const passwordStep = document.getElementById("passwordStep");
  const loginPassword = document.getElementById("loginPassword");
  const toggleLoginPassword = document.querySelector(".toggle-login-password");
  const forgotPassword = document.querySelector(".forgot-password");

  const forgotEmailStep = document.getElementById("forgotEmailStep");
  const resetPasswordStep = document.getElementById("resetPasswordStep");

  const forgotEmail = document.getElementById("forgotEmail");
  const forgotEmailBtn = document.querySelector(".forgot-email-btn");

  const resetPassword = document.getElementById("resetPassword");
  const confirmResetPassword = document.getElementById("confirmResetPassword");

  const resetPasswordBtn = document.querySelector(".reset-password-btn");

  const toggleResetPassword = document.querySelector(".toggle-reset-password");
  const toggleConfirmResetPassword = document.querySelector(".toggle-confirm-reset-password");
  toggleLoginPassword.addEventListener("click", () => {

    if (loginPassword.type === "password") {

      loginPassword.type = "text";
      toggleLoginPassword.src = "Assets/Images/Symbols/eye.svg";

    } else {

      loginPassword.type = "password";
      toggleLoginPassword.src = "Assets/Images/Symbols/eye-off.svg";

    }

  });
  toggleResetPassword.addEventListener("click", () => {

    if (resetPassword.type === "password") {

      resetPassword.type = "text";
      toggleResetPassword.src = "Assets/Images/Symbols/eye.svg";

    } else {

      resetPassword.type = "password";
      toggleResetPassword.src = "Assets/Images/Symbols/eye-off.svg";

    }

  });

  toggleConfirmResetPassword.addEventListener("click", () => {

    if (confirmResetPassword.type === "password") {

      confirmResetPassword.type = "text";
      toggleConfirmResetPassword.src = "Assets/Images/Symbols/eye.svg";

    } else {

      confirmResetPassword.type = "password";
      toggleConfirmResetPassword.src = "Assets/Images/Symbols/eye-off.svg";

    }

  });
  function validateResetPasswords() {

    const newPass = resetPassword.value.trim();
    const confirmPass = confirmResetPassword.value.trim();

    if (
      newPass.length >= 5 &&
      newPass === confirmPass
    ) {

      resetPasswordBtn.disabled = false;
      resetPasswordBtn.classList.add("active");

    } else {

      resetPasswordBtn.disabled = true;
      resetPasswordBtn.classList.remove("active");

    }

  }

  resetPassword.addEventListener("input", validateResetPasswords);
  confirmResetPassword.addEventListener("input", validateResetPasswords);
  /* =====================
     OPEN / CLOSE MODAL
  ===================== */
  navbarLoginBtn.addEventListener('click', () => {
    if (localStorage.getItem("token")) {
      window.location.href = "User/PROFILE/profile.html";
      return;
    }

    overlay.classList.remove('active');

    overlay.classList.add('active');
    modal.classList.add('active');
    pageContent.classList.add('blur');
    document.body.style.overflow = 'hidden';

    phoneStep.classList.add("active");

    passwordStep.classList.remove("active");
    forgotEmailStep.classList.remove("active");
    resetPasswordStep.classList.remove("active");

    phoneInput.value = "";
    continueBtn.disabled = true;
    continueBtn.classList.remove("active");

    loginPassword.value = "";
    passwordLoginBtn.disabled = true;
    passwordLoginBtn.classList.remove("active");

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

    passwordStep.classList.remove("active");
    forgotEmailStep.classList.remove("active");
    resetPasswordStep.classList.remove("active");

    phoneInput.value = "";
    continueBtn.disabled = true;
    continueBtn.classList.remove("active");

    loginPassword.value = "";
    passwordLoginBtn.disabled = true;
    passwordLoginBtn.classList.remove("active");

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

  continueBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    const phone = phoneInput.value.trim();

    if (phone.length !== 10) return;

    continueBtn.disabled = true;
    continueBtn.textContent = "Checking...";

    try {

      const response = await fetch("https://snackment-backend.onrender.com/api/auth/check-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone
        })
      });

      const data = await response.json();

      console.log(data);
      if (data.exists) {
        sessionStorage.setItem("loginPhone", phone);

        phoneStep.classList.remove("active");
        passwordStep.classList.add("active");

        continueBtn.textContent = "Continue";

        // ✅ Cursor automatically password field mein aa jayega
        loginPassword.focus();
      } else {
        sessionStorage.setItem("registerPhone", phone);
        window.location.href = "auth.html";
      }

    } catch (err) {

      alert("Network Error");

    } finally {

      continueBtn.disabled = false;
      continueBtn.textContent = "Continue";

    }

  });
  loginPassword.addEventListener("input", () => {

    if (loginPassword.value.trim().length >= 5) {

      passwordLoginBtn.disabled = false;
      passwordLoginBtn.classList.add("active");

    } else {

      passwordLoginBtn.disabled = true;
      passwordLoginBtn.classList.remove("active");

    }

  });

  forgotPassword.addEventListener("click", () => {


    passwordStep.classList.remove("active");
    forgotEmailStep.classList.add("active");

    loginPassword.value = "";
    passwordLoginBtn.disabled = true;
    passwordLoginBtn.classList.remove("active");

    forgotEmail.value = "";
    forgotEmailBtn.disabled = true;
    forgotEmailBtn.classList.remove("active");

  });

  forgotEmail.addEventListener("input", () => {

    const email = forgotEmail.value.trim();

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (validEmail) {

      forgotEmailBtn.disabled = false;
      forgotEmailBtn.classList.add("active");

    } else {

      forgotEmailBtn.disabled = true;
      forgotEmailBtn.classList.remove("active");

    }

  });
  forgotEmailBtn.addEventListener("click", async () => {

    if (forgotEmailBtn.disabled) return;

    forgotEmailBtn.disabled = true;
    forgotEmailBtn.textContent = "Checking...";

    try {

      const response = await fetch(
        "https://snackment-backend.onrender.com/api/auth/check-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: forgotEmail.value.trim()
          })
        }
      );

      const data = await response.json();

      if (!data.exists) {

        alert("No account found with this email.");

        forgotEmailBtn.disabled = false;
        forgotEmailBtn.textContent = "Continue";

        return;

      }

      sessionStorage.setItem(
        "resetEmail",
        forgotEmail.value.trim()
      );
      resetPassword.value = "";
      confirmResetPassword.value = "";

      resetPasswordBtn.disabled = true;
      resetPasswordBtn.classList.remove("active");

      forgotEmailStep.classList.remove("active");
      resetPasswordStep.classList.add("active");
      resetPassword.focus();
    } catch (err) {

      alert("Server Error");

    } finally {

      forgotEmailBtn.disabled = false;
      forgotEmailBtn.textContent = "Continue";

    }

  });

  passwordLoginBtn.addEventListener("click", async () => {

    if (passwordLoginBtn.disabled) return;

    passwordLoginBtn.disabled = true;
    passwordLoginBtn.textContent = "Logging in...";

    try {

      const response = await fetch("https://snackment-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone: sessionStorage.getItem("loginPhone"),
          password: loginPassword.value
        })
      });

      const data = await response.json();

      if (!response.ok) {

        alert(data.message || "Login failed");

        passwordLoginBtn.disabled = false;
        passwordLoginBtn.textContent = "Login";
        return;

      }

      console.log(data);

      // ✅ Save login data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Remove temporary phone
      sessionStorage.removeItem("loginPhone");

      // ✅ Close modal
      closeModal();

      // ✅ Navbar button becomes Profile
      loginText.textContent = "Profile";

      // ✅ Refresh page
      window.location.reload();

    } catch (err) {

      alert("Server Error");

      passwordLoginBtn.disabled = false;
      passwordLoginBtn.textContent = "Login";

    }

  });

  resetPasswordBtn.addEventListener("click", async () => {

    if (resetPasswordBtn.disabled) return;

    resetPasswordBtn.disabled = true;
    resetPasswordBtn.textContent = "Updating...";

    try {

      const response = await fetch(
        "https://snackment-backend.onrender.com/api/auth/reset-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({

            email: sessionStorage.getItem("resetEmail"),
            password: resetPassword.value

          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        alert(data.message);

        resetPasswordBtn.disabled = false;
        resetPasswordBtn.textContent = "Reset Password";

        return;

      }

      // ✅ Auto Login

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      sessionStorage.removeItem("resetEmail");

      closeModal();

      loginText.textContent = "Profile";

      window.location.reload();

    } catch (err) {

      alert("Server Error");

      resetPasswordBtn.disabled = false;
      resetPasswordBtn.textContent = "Reset Password";

    }

  });

});