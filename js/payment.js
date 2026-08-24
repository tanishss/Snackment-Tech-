// ==========================================
// DOM ELEMENTS
// ==========================================

const itemCount = document.getElementById("item-count");
const itemsTotal = document.getElementById("items-total");
const deliveryCharge = document.getElementById("delivery-charge");
const grandTotal = document.getElementById("grand-total");
const continueBtn = document.getElementById("continue-payment-btn");

// ==========================================
// LOAD CHECKOUT DATA
// ==========================================

const latestOrder = OrderStore.get();

const checkoutData = JSON.parse(
    localStorage.getItem("snackment_checkout")
);

// Order already placed
if (!checkoutData && latestOrder) {
    window.location.replace("order-success.html");
}

// Invalid access
if (!checkoutData) {
    window.location.replace("checkout.html");
}
// ==========================================
// RENDER ORDER SUMMARY
// ==========================================

async function renderSummary() {

    try {

        const token = localStorage.getItem("token");

        const couponCode =
            checkoutData.coupon?.code || "";

        const response = await fetch(

            `https://snackment-backend.onrender.com/api/orders/preview?deliveryMethod=${checkoutData.deliveryMethod}&coupon=${couponCode}`,

            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }


        itemCount.textContent =
            `(${data.itemCount} item${data.itemCount > 1 ? "s" : ""})`;

        itemsTotal.textContent =
            `₹${data.pricing.subtotal}`;

        deliveryCharge.textContent =
            data.pricing.deliveryFee === 0
                ? "FREE"
                : `₹${data.pricing.deliveryFee}`;

        grandTotal.textContent =
            `₹${data.pricing.total}`;

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

}

renderSummary();
// ==========================================
// CONTINUE BUTTON
// ==========================================

continueBtn.addEventListener("click", createOrder);

// ==========================================
// CREATE ORDER (Frontend Simulation)
// ==========================================



async function createOrder() {

    try {

        continueBtn.disabled = true;

        continueBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Creating Order...
        `;

        const token = localStorage.getItem("token");

        const response = await fetch(
            "https://snackment-backend.onrender.com/api/orders",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(checkoutData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        // Save latest order
        OrderStore.set(data.order);

        // Clear temporary checkout
        localStorage.removeItem("snackment_checkout");

        // Redirect
        window.location.replace("order-success.html");

    } catch (err) {

        console.error(err);

        alert(err.message);

        continueBtn.disabled = false;

        continueBtn.innerHTML = "Continue";

    }

}