document.addEventListener("DOMContentLoaded", () => {

    // ==========================================================
    // CONFIG
    // ==========================================================

    const API_URL = "https://snackment-backend.onrender.com/api/address";

    // ==========================================================
    // AUTH
    // ==========================================================

    const token = localStorage.getItem("token");

    if (!token) {

        window.location.href = "../../index.html";

        return;

    }

    // ==========================================================
    // STATE
    // ==========================================================

    let addresses = [];

    let isEditing = false;

    let editingAddressId = null;

    let deletingAddressId = null;

    // ==========================================================
    // ELEMENTS
    // ==========================================================

    const backBtn =
        document.querySelector(".back-btn");

    const addAddressBtn =
        document.querySelector(".add-address-btn");

    const addressesContainer =
        document.getElementById("addressesContainer");

    const addressCount =
        document.getElementById("addressCount");

    // =========================
    // ADDRESS MODAL
    // =========================

    const overlay =
        document.getElementById("addressOverlay");

    const addressModal =
        document.getElementById("addressModal");

    const closeModalBtn =
        document.querySelector(".close-modal");

    const modalTitle =
        document.getElementById("modalTitle");

    const addressForm =
        document.getElementById("addressForm");

    const saveAddressBtn =
        document.getElementById("saveAddressBtn");

    // =========================
    // FORM
    // =========================

    const hostelInput =
        document.getElementById("hostelInput");

    const roomInput =
        document.getElementById("roomInput");

    const addressInput =
        document.getElementById("addressInput");

    const defaultSwitch =
        document.getElementById("defaultSwitch");

    // =========================
    // DELETE MODAL
    // =========================

    const deleteOverlay =
        document.getElementById("deleteOverlay");

    const deleteModal =
        document.getElementById("deleteModal");

    const cancelDeleteBtn =
        document.getElementById("cancelDeleteBtn");

    const confirmDeleteBtn =
        document.getElementById("confirmDeleteBtn");

    // ==========================================================
    // EVENTS
    // ==========================================================

    backBtn.addEventListener("click", () => {

        window.location.href =
            "../PROFILE/profile.html";

    });

    addAddressBtn.addEventListener(

        "click",

        openAddModal

    );

    closeModalBtn.addEventListener(

        "click",

        closeAddressModal

    );

    overlay.addEventListener(

        "click",

        closeAddressModal

    );

    cancelDeleteBtn.addEventListener(

        "click",

        closeDeleteModal

    );

    deleteOverlay.addEventListener(

        "click",

        closeDeleteModal

    );

    addressForm.addEventListener(

        "submit",

        saveAddress

    );

    addressesContainer.addEventListener(

        "click",

        handleCardActions

    );

    confirmDeleteBtn.addEventListener(

        "click",

        deleteAddress

    );

    document.addEventListener("keydown", e => {

        if (e.key === "Escape") {

            closeAddressModal();

            closeDeleteModal();

        }

    });
    // ==========================================================
    // OPEN ADD MODAL
    // ==========================================================

    function openAddModal() {

        isEditing = false;

        editingAddressId = null;

        modalTitle.textContent =
            "Add Address";

        saveAddressBtn.textContent =
            "Save Address";

        addressForm.reset();


        defaultSwitch.checked = false;
        document.querySelector(".default-switch-row").style.display = "flex";

        overlay.classList.add("active");

        addressModal.classList.add("active");

        document.body.style.overflow = "hidden";

    }

    // ==========================================================
    // CLOSE ADDRESS MODAL
    // ==========================================================

    function closeAddressModal() {

        overlay.classList.remove("active");

        addressModal.classList.remove("active");

        document.body.style.overflow = "";

        addressForm.reset();

        isEditing = false;

        editingAddressId = null;
        document.querySelector(".default-switch-row").style.display = "flex";

    }

    // ==========================================================
    // OPEN DELETE MODAL
    // ==========================================================

    function openDeleteModal(id) {

        deletingAddressId = id;

        deleteOverlay.classList.add("active");

        deleteModal.classList.add("active");

        document.body.style.overflow = "hidden";

    }

    // ==========================================================
    // CLOSE DELETE MODAL
    // ==========================================================

    function closeDeleteModal() {

        deleteOverlay.classList.remove("active");

        deleteModal.classList.remove("active");

        document.body.style.overflow = "";

        deletingAddressId = null;

    }


    // ==========================================================
    // LOAD ADDRESSES
    // ==========================================================

    async function loadAddresses() {

        try {

            const response = await fetch(

                API_URL,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            if (!response.ok) {

                throw new Error("Failed to fetch addresses.");

            }

            addresses = await response.json();

            renderAddresses();

        }

        catch (err) {

            console.error(err);

        }

    }

    // ==========================================================
    // RENDER ADDRESSES
    // ==========================================================

    function renderAddresses() {

        addressesContainer.innerHTML = "";

        addressCount.textContent =
            `${addresses.length}/5`;

        if (addresses.length === 0) {

            addressesContainer.innerHTML = `

                <div class="empty-address">

                    <h3>

                        No Saved Addresses

                    </h3>

                    <p>

                        Add your first hostel address.

                    </p>

                </div>

            `;

            return;

        }

        addresses.sort((a, b) => {

            return b.isDefault - a.isDefault;

        });

        addresses.forEach(address => {

            addressesContainer.innerHTML += createCard(address);

        });

    }

    // ==========================================================
    // CREATE CARD
    // ==========================================================

    function createCard(address) {

        return `

        <div class="address-card ${address.isDefault ? "default-card" : ""}">

            <div class="address-top">

                <div class="address-icon">

                    <img
                        src="../../Assets/Images/Auth logos/house.svg"
                        alt="Home">

                </div>

                <div class="address-info">

                    <div class="address-title-row">

                        <h3>

                            ${address.hostel}

                        </h3>

                        ${address.isDefault ?

                `

                        <span class="default-badge">

                            ✓ Default

                        </span>

                        `

                :

                ""

            }

                    </div>

                    <p>

                        <img
                            src="../../Assets/Images/Symbols/door-closed.svg">

                        Room ${address.room}

                    </p>

                    <div class="address-line">

                        <img
                            src="../../Assets/Images/Auth logos/marker.svg">

                        <span>

                            ${address.address}

                        </span>

                    </div>

                </div>

            </div>

            <div class="address-actions">

                ${!address.isDefault ?

                `

                <button
                    class="default-btn"
                    data-action="default"
                    data-id="${address._id}">

                    Make Default

                </button>

                `

                :

                ""

            }

                <button
                    class="edit-btn"
                    data-action="edit"
                    data-id="${address._id}">

                    Edit

                </button>

                ${!address.isDefault ?

                `

                <button
                    class="delete-btn"
                    data-action="delete"
                    data-id="${address._id}">

                    Delete

                </button>

                `

                :

                ""

            }

            </div>

        </div>

        `;

    }

    // ==========================================================
    // INITIAL LOAD
    // ==========================================================

    loadAddresses();
    // ==========================================================
    // SAVE ADDRESS
    // ==========================================================

    async function saveAddress(e) {

        e.preventDefault();

        const hostel = hostelInput.value;

        if (
            !hostel ||
            !roomInput.value.trim() ||
            !addressInput.value.trim()
        ) {

            alert("Please fill all fields.");

            return;

        }

        const body = {

            hostel,

            room: roomInput.value.trim(),

            address: addressInput.value.trim(),

            isDefault: defaultSwitch.checked

        };

        const url = isEditing

            ? `${API_URL}/${editingAddressId}`

            : API_URL;

        const method = isEditing

            ? "PATCH"

            : "POST";

        try {

            const response = await fetch(

                url,

                {

                    method,

                    headers: {

                        "Content-Type": "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body: JSON.stringify(body)

                }

            );

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);

                return;

            }

            closeAddressModal();

            loadAddresses();

        }

        catch (err) {

            console.error(err);

            alert("Something went wrong.");

        }

    }

    // ==========================================================
    // HANDLE CARD ACTIONS
    // ==========================================================

    function handleCardActions(e) {

        const button = e.target.closest("button");

        if (!button) return;

        const action = button.dataset.action;

        const id = button.dataset.id;

        if (action === "edit") {

            openEditModal(id);

        }

        if (action === "delete") {

            openDeleteModal(id);

        }

        if (action === "default") {

            makeDefault(id);

        }

    }

    // ==========================================================
    // OPEN EDIT MODAL
    // ==========================================================

    function openEditModal(id) {

        const address =
            addresses.find(a => a._id === id);

        if (!address) return;

        isEditing = true;

        editingAddressId = id;

        modalTitle.textContent =
            "Edit Address";

        saveAddressBtn.textContent =
            "Update Address";

        hostelInput.value = address.hostel;
        roomInput.value = address.room;

        addressInput.value = address.address;

        defaultSwitch.checked = address.isDefault;
        const switchRow =
            document.querySelector(".default-switch-row");

        if (address.isDefault) {

            switchRow.style.display = "none";

        }

        else {

            switchRow.style.display = "flex";

        }


        overlay.classList.add("active");

        addressModal.classList.add("active");

        document.body.style.overflow =
            "hidden";

    }
    // ==========================================================
    // MAKE DEFAULT
    // ==========================================================

    async function makeDefault(id) {

        try {

            const response = await fetch(

                `${API_URL}/default/${id}`,

                {

                    method: "PATCH",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);

                return;

            }

            loadAddresses();

        }

        catch (err) {

            console.error(err);

            alert("Failed to update default address.");

        }

    }

    // ==========================================================
    // DELETE ADDRESS
    // ==========================================================

    async function deleteAddress() {

        if (!deletingAddressId) return;

        try {

            const response = await fetch(

                `${API_URL}/${deletingAddressId}`,

                {

                    method: "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);

                return;

            }

            closeDeleteModal();

            loadAddresses();

        }

        catch (err) {

            console.error(err);

            alert("Failed to delete address.");

        }

    }

});