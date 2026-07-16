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

function renderSummary() {

    const bill = checkoutData.bill;

    itemCount.textContent = `(${checkoutData.itemCount} item${checkoutData.itemCount > 1 ? "s" : ""})`;

    itemsTotal.textContent = `₹${bill.subtotal}`;

    deliveryCharge.textContent =
        bill.delivery === 0
            ? "FREE"
            : `₹${bill.delivery}`;

    grandTotal.textContent = `₹${bill.total}`;
}

renderSummary();

// ==========================================
// CONTINUE BUTTON
// ==========================================

continueBtn.addEventListener("click", createOrder);

// ==========================================
// CREATE ORDER (Frontend Simulation)
// ==========================================

function createOrder() {

    continueBtn.disabled = true;

    continueBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Creating Order...
    `;

    setTimeout(() => {
        const now = new Date().toISOString();

        const order = {
            
            orderId:
                "SNK" +
                Date.now(),

            createdAt:now,

            updatedAt: now,

            orderStatus:
                "PACKING",

            statusHistory: [
                {
                    status: "PACKING",
                    time: now
                }
            ],
            
            paymentStatus:
                "PENDING",

            paymentMethod:
                "Scan on Delivery",

            ...checkoutData,

            deliveryAddress:
                checkoutData.selectedAddress

        };

        delete order.selectedAddress;

        // Save latest order

        OrderStore.set(order);

        // Future order history

        const orders = JSON.parse(
            localStorage.getItem("snackment_orders")
        ) || [];

        orders.unshift(order);

        localStorage.setItem(
            "snackment_orders",
            JSON.stringify(orders)
        );

        // Clear temporary data

        // Backend will clear cart
        // localStorage.removeItem("snackment_cart");

        localStorage.removeItem("snackment_checkout");

        // Redirect

        window.location.replace("order-success.html");

    }, 1200);

}