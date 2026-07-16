document.addEventListener("DOMContentLoaded", () => {

  if (!localStorage.getItem("token")) {
    window.location.href = "index.html";
  }

  // 🔹 Elements
  const form = document.querySelector(".auth-form");
  const submitBtn = document.querySelector(".submit-btn");
  const fullName = document.getElementById("fullname");
  const email = document.getElementById("email");
  const address = document.getElementById("address");
  const hostelInput = document.querySelector('input[placeholder="e.g., Hostel A"]');
  const roomInput = document.querySelector('input[placeholder="e.g., 204"]');
  const continueBtn = document.getElementById("continueShopping");

  continueBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });


  // 🔹 Helpers
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function validateForm() {
    const isNameValid = fullName.value.trim().length >= 2;
    const isEmailValid = isValidEmail(email.value.trim());
    const isHostelValid = hostelInput.value.trim().length > 0;
    const isRoomValid = roomInput.value.trim().length > 0;
    const isAddressValid = address.value.trim().length >= 10;

    // ❌ Email invalid → show error
    if (email.value.trim() !== "" && !isEmailValid) {
      document.getElementById("emailError").style.display = "block";
    } else {
      document.getElementById("emailError").style.display = "none";
    }

    // ✅ Enable submit only if ALL valid
    if (
      isNameValid &&
      isEmailValid &&
      isHostelValid &&
      isRoomValid &&
      isAddressValid
    ) {
      submitBtn.classList.add("active");
      submitBtn.disabled = false;
    } else {
      submitBtn.classList.remove("active");
      submitBtn.disabled = true;
    }
  }

  // 🔹 Input listeners
  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", validateForm);
  });

  // 🔹 Submit flow (REAL BACKEND)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;

    submitBtn.classList.add("loading");
    submitBtn.textContent = "Creating account…";
    submitBtn.disabled = true;

    const userName = fullName.value.trim();

    try {
      const res = await fetch("http://localhost:5001/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: userName,
          email: email.value.trim(),
          hostel: hostelInput.value.trim(),
          room: roomInput.value.trim(),
          address: address.value.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Profile save failed");
        submitBtn.textContent = "Create account";
        submitBtn.disabled = false;
        return;
      }

      // ✅ SUCCESS UI (same UI as before)
      document.querySelector(".auth-form").classList.add("hidden");
      document.querySelector(".auth-icon").style.display = "none";
      document.querySelector(".auth-sub").style.display = "none";
      document.querySelector(".phone-pill").style.display = "none";
      document.querySelector("h1").style.display = "none";
      document.getElementById("successName").textContent = userName;
      document.getElementById("successScreen").classList.add("active");
      document.querySelector(".terms").style.display = "none";
      document.querySelector(".help").style.display = "none";

      // 🔁 Redirect back to main site after short delay
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);


    } catch (err) {
      alert("Server error. Please try again.");
      submitBtn.textContent = "Create account";
      submitBtn.disabled = false;
    }
  });


});
