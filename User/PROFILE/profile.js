// =========================AUTH GUARD=========================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "../../index.html";
}

// =========================DOM ELEMENTS=========================

const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

// ========================= PROFILE ELEMENTS =========================

const profileInitial = document.getElementById("profileInitial");

const profileHeroName = document.getElementById("profileHeroName");
const profileHeroEmail = document.getElementById("profileHeroEmail");

const profileName = document.getElementById("profileName");
const profilePhone = document.getElementById("profilePhone");
const profileEmail = document.getElementById("profileEmail");
const profileAddress = document.getElementById("profileAddress");
const addressBtn = document.querySelector(
    '[data-action="edit-address"]'
);
const orderHistoryBtn = document.querySelector(
    '[data-action="order-history"]'
);

// ========================= EDIT NAME ELEMENTS =========================

const editNameBtn = document.getElementById("editNameBtn");
const editNameModal = document.getElementById("editNameModal");

const closeEditNameBtn = document.getElementById("closeEditNameBtn");
const cancelEditNameBtn = document.getElementById("cancelEditNameBtn");

const nameInput = document.getElementById("nameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
// ========================= EDIT PHONE ELEMENTS =========================

const editPhoneBtn = document.getElementById("editPhoneBtn");
const editPhoneModal = document.getElementById("editPhoneModal");

const closeEditPhoneBtn = document.getElementById("closeEditPhoneBtn");
const cancelEditPhoneBtn = document.getElementById("cancelEditPhoneBtn");

const phoneInput = document.getElementById("phoneInput");
const savePhoneBtn = document.getElementById("savePhoneBtn");

// ========================= CHANGE PASSWORD ELEMENTS =========================

const changePasswordBtn = document.getElementById("changePasswordBtn");
const changePasswordModal = document.getElementById("changePasswordModal");

const closeChangePasswordBtn = document.getElementById("closeChangePasswordBtn");
const cancelChangePasswordBtn = document.getElementById("cancelChangePasswordBtn");

const currentPasswordInput = document.getElementById("currentPasswordInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");

const savePasswordBtn = document.getElementById("savePasswordBtn");

const passwordToggles = document.querySelectorAll(".password-toggle");
// =========================FUNCTIONS=========================

function openLogoutModal() {
    logoutModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeLogoutModal() {
    logoutModal.classList.add("hidden");
    document.body.style.overflow = "";
}

function logout() {

    confirmLogoutBtn.disabled = true;
    confirmLogoutBtn.textContent = "Logging out...";

    setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.clear();

        window.location.href = "../../index.html";
    }, 300);

}

// ========================= EDIT NAME =========================

function openEditNameModal() {

    nameInput.value = profileName.textContent.trim();

    editNameModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
        nameInput.focus();
        nameInput.select();
    }, 100);

}

function closeEditNameModal() {

    editNameModal.classList.add("hidden");
    document.body.style.overflow = "";

}

// ========================= EDIT PHONE =========================

function openEditPhoneModal() {

    phoneInput.value = profilePhone.textContent.trim();

    editPhoneModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
        phoneInput.focus();
        phoneInput.select();
    }, 100);

}

function closeEditPhoneModal() {

    editPhoneModal.classList.add("hidden");
    document.body.style.overflow = "";

}

// ========================= CHANGE PASSWORD =========================

function openChangePasswordModal() {

    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";

    changePasswordModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
        currentPasswordInput.focus();
    }, 100);

}


function closeChangePasswordModal() {

    changePasswordModal.classList.add("hidden");

    document.body.style.overflow = "";

    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";

    currentPasswordInput.type = "password";
    newPasswordInput.type = "password";
    confirmPasswordInput.type = "password";

    passwordToggles.forEach((toggle) => {
        toggle.querySelector("img").src =
            "../../Assets/Images/Symbols/eye.svg";
    });

}
// ========================= PASSWORD VISIBILITY =========================

passwordToggles.forEach((toggle) => {

    toggle.addEventListener("click", () => {

        const input = document.getElementById(toggle.dataset.target);

        if (input.type === "password") {

            input.type = "text";

            toggle.querySelector("img").src =
                "../../Assets/Images/Symbols/eye-off.svg";

        } else {

            input.type = "password";

            toggle.querySelector("img").src =
                "../../Assets/Images/Symbols/eye.svg";

        }

    });

});
async function saveName() {

    const name = nameInput.value.trim();

    if (name === profileName.textContent.trim()) {
        closeEditNameModal();
        return;
    }

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    saveNameBtn.disabled = true;
    saveNameBtn.textContent = "Saving...";

    try {

        const response = await fetch("https://snackment-backend.onrender.com/api/profile/name", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update name.");
        }
        renderProfile(data.user);
        const localUser = JSON.parse(localStorage.getItem("user"));

        localUser.name = data.user.name;

        localStorage.setItem(
            "user",
            JSON.stringify(localUser)
        );

        closeEditNameModal();

    } catch (err) {

        alert(err.message || "Failed to update name.");

    } finally {

        saveNameBtn.disabled = false;
        saveNameBtn.textContent = "Save Changes";

    }

}

async function savePhone() {

    const phone = phoneInput.value.trim();

    if (!/^\d{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    savePhoneBtn.disabled = true;
    savePhoneBtn.textContent = "Saving...";

    try {

        const response = await fetch(
            "https://snackment-backend.onrender.com/api/profile/phone",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ phone })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        renderProfile(data.user);
        const localUser = JSON.parse(localStorage.getItem("user"));

        localUser.phone = data.user.phone;

        localStorage.setItem(
            "user",
            JSON.stringify(localUser)
        );

        closeEditPhoneModal();

    } catch (err) {

        alert(err.message || "Failed to update phone number.");

    } finally {

        savePhoneBtn.disabled = false;
        savePhoneBtn.textContent = "Save Changes";

    }

}

async function savePassword() {

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Please fill all fields.");
        return;
    }

    if (newPassword.length < 5) {
        alert("Password must be at least 5 characters.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    savePasswordBtn.disabled = true;
    savePasswordBtn.textContent = "Saving...";

    try {

        const response = await fetch(
            "https://snackment-backend.onrender.com/api/profile/password",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        alert(data.message);

        closeChangePasswordModal();

    } catch (err) {

        alert(err.message || "Failed to change password.");

    } finally {

        savePasswordBtn.disabled = false;
        savePasswordBtn.textContent = "Save Changes";

    }

}
// ========================= PROFILE =========================

function renderProfile(user) {

    profileHeroName.textContent = user.name || "Complete your profile";

    profileHeroEmail.textContent = user.email || user.phone;

    profileName.textContent = user.name || "-";

    profilePhone.textContent = user.phone || "-";

    profileEmail.textContent = user.email || "-";

    const addressParts = [
        user.hostel,
        user.room,
        user.address
    ].filter(Boolean);

    profileAddress.textContent =
        addressParts.length > 0
            ? addressParts.join(", ")
            : "-";

    const initial =
        (user.name || user.phone || "S")
            .trim()
            .charAt(0)
            .toUpperCase();

    profileInitial.textContent = initial;

}

async function loadProfile() {

    try {

        const response = await fetch("https://snackment-backend.onrender.com/api/profile", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.clear();

            window.location.href = "../../index.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load profile");
        }

        const user = await response.json();

        renderProfile(user);

    } catch (error) {

        console.error("Profile Error:", error);

    }

}
// =========================EVENT LISTENERS=========================

logoutBtn.addEventListener("click", openLogoutModal);

cancelLogoutBtn.addEventListener("click", closeLogoutModal);

confirmLogoutBtn.addEventListener("click", logout);
saveNameBtn.addEventListener("click", saveName);
logoutModal.addEventListener("click", (e) => {
    if (e.target === logoutModal) {
        closeLogoutModal();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !logoutModal.classList.contains("hidden")) {
        closeLogoutModal();
    }
});

editPhoneBtn.addEventListener("click", openEditPhoneModal);

closeEditPhoneBtn.addEventListener("click", closeEditPhoneModal);

cancelEditPhoneBtn.addEventListener("click", closeEditPhoneModal);

editPhoneModal.addEventListener("click", (e) => {
    if (e.target === editPhoneModal) {
        closeEditPhoneModal();
    }
});



editNameBtn.addEventListener("click", openEditNameModal);

closeEditNameBtn.addEventListener("click", closeEditNameModal);

cancelEditNameBtn.addEventListener("click", closeEditNameModal);
savePhoneBtn.addEventListener("click", savePhone);
savePasswordBtn.addEventListener("click", savePassword);
changePasswordBtn.addEventListener("click", openChangePasswordModal);

closeChangePasswordBtn.addEventListener("click", closeChangePasswordModal);

cancelChangePasswordBtn.addEventListener("click", closeChangePasswordModal);

changePasswordModal.addEventListener("click", (e) => {
    if (e.target === changePasswordModal) {
        closeChangePasswordModal();
    }
});
editNameModal.addEventListener("click", (e) => {
    if (e.target === editNameModal) {
        closeEditNameModal();
    }
});

addressBtn.addEventListener("click", () => {

    window.location.href =
        "../ADDRESS/address.html";

});
orderHistoryBtn.addEventListener("click", () => {

    window.location.href =
        "../ORDERS/orders.html";

});
loadProfile();
