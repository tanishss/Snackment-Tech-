// ==========================================================
// DOM ELEMENTS
// ==========================================================

const backBtn = document.querySelector(".back-btn");

const ordersContainer = document.getElementById("ordersContainer");

const emptyOrders = document.getElementById("emptyOrders");

const orderCount = document.getElementById("orderCount");

const startShoppingBtn = document.getElementById("startShoppingBtn");

// ==========================================================
// CONFIG
// ==========================================================

const API_BASE_URL = "http://localhost:5001/api";

const token = localStorage.getItem("token");

// ==========================================================
// AUTH CHECK
// ==========================================================

if (!token) {

    window.location.href = "../../HTML/index.html";

}

// ==========================================================
// BACK BUTTON
// ==========================================================

backBtn.addEventListener("click", () => {

    window.location.href = "../PROFILE/profile.html";

});

// ==========================================================
// START SHOPPING
// ==========================================================

startShoppingBtn.addEventListener("click", () => {

    window.location.href = "../../HTML/index.html";

});

// ==========================================================
// INITIALIZE
// ==========================================================

init();

async function init() {

    await loadOrders();

}

// ==========================================================
// LOAD ORDERS
// ==========================================================

async function loadOrders() {

    try {

        const response = await fetch(

            `${API_BASE_URL}/orders`,

            {
                headers: {

                    Authorization: `Bearer ${token}`

                }
            }

        );

        const orders = await response.json();

        console.log("Orders =", orders);

        console.log("First Order =", orders[0]);

        console.log("Items =", orders[0]?.items);

        console.log("Pricing =", orders[0]?.pricing);

        console.log("Delivery =", orders[0]?.deliveryMethod);

        console.log("Payment =", orders[0]?.paymentMethod);

        console.log("Status =", orders[0]?.orderStatus);

        if (!response.ok) {

            throw new Error(

                orders.message || "Failed to load orders."

            );

        }

        // ==========================
        // ORDER COUNT
        // ==========================

        orderCount.textContent =

            `${orders.length} ${orders.length === 1 ? "Order" : "Orders"}`;

        // ==========================
        // EMPTY STATE
        // ==========================

        if (orders.length === 0) {

            emptyOrders.classList.remove("hidden");

            ordersContainer.classList.add("hidden");

            return;

        }

        emptyOrders.classList.add("hidden");

        ordersContainer.classList.remove("hidden");

        // ==========================
        // RENDER
        // ==========================

        renderOrders(orders);

    }

    catch (error) {

        console.error(error);

        alert(

            error.message || "Unable to load your orders."

        );

    }

}
// ==========================================================
// RENDER ORDERS
// ==========================================================

function renderOrders(orders) {

    ordersContainer.innerHTML = "";

    orders.forEach(order => {

        const chips = renderItemChips(order.items);

        ordersContainer.innerHTML += `

        <article
            class="order-card">

            <!-- ================= TOP ================= -->

            <div class="order-top">

                <div class="order-meta">

                    <h3 class="order-id">

                        #${order.orderId}

                    </h3>

                    <p class="order-date">

                        ${formatDate(order.createdAt)}

                    </p>

                </div>

                <span class="order-status ${getStatusClass(order.orderStatus)}">

                    ${formatOrderStatus(order.orderStatus)}

                </span>

            </div>

            <!-- ================= ITEMS ================= -->

            <div class="order-items">

                ${chips}

            </div>

            <!-- ================= BOTTOM ================= -->

            <div class="order-bottom">

                <div class="order-details">

                    <div class="order-price">

                        ₹${order.pricing.total}

                    </div>

                    <div class="order-info">

                        <span>

                            ${order.items.length} Items

                        </span>

                        <span>

                            ${formatDeliveryMethod(order.deliveryMethod)}

                        </span>

                        <span>

                            ${formatPaymentMethod(order.paymentMethod)}

                        </span>

                    </div>

                </div>

                <button
                    class="view-details-btn"
                    data-id="${order.orderId}">

                    View Details

                </button>

            </div>

        </article>

        `;

    });

    // ==========================
    // VIEW DETAILS
    // ==========================

    document
        .querySelectorAll(".view-details-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                window.location.href =
                    `../ORDER DETAILS/order-details.html?id=${button.dataset.id}`;

            });

        });

}
// ==========================================================
// RENDER PRODUCT CHIPS
// ==========================================================

function renderItemChips(items) {

    if (!items || items.length === 0) {

        return "";

    }

    let chips = "";

    items
        .slice(0, 2)
        .forEach(item => {

            chips += `

            <span class="item-chip">

                ${item.name} ×${item.quantity}

            </span>

            `;

        });

    if (items.length > 2) {

        chips += `

        <span class="item-chip">

            +${items.length - 2} More

        </span>

        `;

    }

    return chips;

}

// ==========================================================
// FORMAT DATE
// ==========================================================

function formatDate(date) {

    return new Date(date).toLocaleString(

        "en-IN",

        {

            day: "numeric",

            month: "short",

            year: "numeric",

            hour: "numeric",

            minute: "2-digit"

        }

    );

}
function formatOrderStatus(status) {

    switch (status) {

        case "PENDING":
            return "Pending";

        case "PACKING":
            return "Packing";

        case "READY_FOR_PICKUP":
            return "Ready for Pickup";

        case "OUT_FOR_DELIVERY":
            return "Out for Delivery";

        case "DELIVERED":
            return "Delivered";

        case "CANCELLED":
            return "Cancelled";

        default:
            return "Pending";

    }

}

// ==========================================================
// FORMAT DELIVERY METHOD
// ==========================================================

function formatDeliveryMethod(method) {

    return method === "room"

        ? "Room Delivery"

        : "Pickup";

}

// ==========================================================
// FORMAT PAYMENT METHOD
// ==========================================================

function formatPaymentMethod(method) {

    return method === "scan_on_delivery"

        ? "Scan on Delivery"

        : "UPI";

}
// ==========================================================
// STATUS CLASS
// ==========================================================

function getStatusClass(status) {

    switch (status) {

        case "PENDING":
            return "pending";

        case "PACKING":
            return "preparing";

        case "READY_FOR_PICKUP":
        case "OUT_FOR_DELIVERY":
            return "preparing";

        case "DELIVERED":
            return "delivered";

        case "CANCELLED":
            return "cancelled";

        default:
            return "pending";

    }

}