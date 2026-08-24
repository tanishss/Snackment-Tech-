// ==========================================================
// DOM ELEMENTS
// ==========================================================

const backBtn = document.querySelector(".back-btn");

const orderIdEl = document.getElementById("orderId");
const orderDateEl = document.getElementById("orderDate");
const orderStatusEl = document.getElementById("orderStatus");

const timelineContainer =
    document.getElementById("timelineContainer");

const itemsContainer =
    document.getElementById("itemsContainer");

const billContainer =
    document.getElementById("billContainer");

const deliveryContainer =
    document.getElementById("deliveryContainer");

const paymentContainer =
    document.getElementById("paymentContainer");

const infoContainer =
    document.getElementById("infoContainer");

// ==========================================================
// CONFIG
// ==========================================================

const API_BASE_URL =
    "https://snackment-backend.onrender.com/api";

const token =
    localStorage.getItem("token");

// ==========================================================
// AUTH CHECK
// ==========================================================

if (!token) {

    window.location.href =
        "../../HTML/index.html";

}

// ==========================================================
// GET ORDER ID
// ==========================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const orderId =
    params.get("id");

// ==========================================================
// BACK
// ==========================================================

backBtn.addEventListener("click", () => {

    window.location.href =
        "../ORDERS/orders.html";

});

// ==========================================================
// INIT
// ==========================================================

init();

async function init() {

    if (!orderId) {

        alert("Invalid order.");

        window.location.href =
            "orders.html";

        return;

    }

    await loadOrder();

}
// ==========================================================
// LOAD ORDER
// ==========================================================

async function loadOrder() {

    try {

        const response = await fetch(

            `${API_BASE_URL}/orders/${orderId}`,

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`

                }

            }

        );

        const order =
            await response.json();

        if (!response.ok) {

            throw new Error(

                order.message ||
                "Failed to load order."

            );

        }

        renderOrder(order);

    }

    catch (err) {

        console.error(err);

        alert(

            err.message ||
            "Unable to load order."

        );

    }

}
// ==========================================================
// RENDER ORDER
// ==========================================================

function renderOrder(order) {

    orderIdEl.textContent =
        `#${order.orderId}`;

    orderDateEl.textContent =
        formatDate(order.createdAt);

    orderStatusEl.textContent =
        formatStatus(
            order.orderStatus
        );

    orderStatusEl.className =
        `status-badge ${getStatusClass(
            order.orderStatus
        )}`;

    renderTimeline(order);

    renderItems(order.items);

    renderBill(order);

    renderDelivery(order);

    renderPayment(order);

    renderInfo(order);

}
// ==========================================================
// TIMELINE
// ==========================================================

function renderTimeline(order) {

    const steps = [

        "PACKING",

        "READY_FOR_PICKUP",

        "OUT_FOR_DELIVERY",

        "DELIVERED"

    ];

    timelineContainer.innerHTML = "";

    const currentIndex =
        steps.indexOf(order.orderStatus);

    steps.forEach((step, index) => {

        let state = "pending";

        let icon = "○";

        if (index < currentIndex) {

            state = "completed";

            icon = "✓";

        }

        else if (index === currentIndex) {

            state = "current";

            icon = "•";

        }

        timelineContainer.innerHTML += `

        <div class="timeline-step">

            <div class="timeline-icon ${state}">

                ${icon}

            </div>

            <div class="timeline-content">

                <h4>

                    ${formatStatus(step)}

                </h4>

            </div>

        </div>

        `;

    });

}
// ==========================================================
// ITEMS
// ==========================================================

function renderItems(items) {

    itemsContainer.innerHTML = "";

    items.forEach(item => {

        itemsContainer.innerHTML += `

        <div class="item-card">

            <img
                class="item-image"
                src="${item.image}"
                alt="${item.name}">

            <div class="item-info">

                <h4>

                    ${item.name}

                </h4>

                <div class="item-price">

                    ₹${item.price}

                    ×

                    ${item.quantity}

                </div>

            </div>

            <div class="item-total">

                ₹${item.price * item.quantity}

            </div>

        </div>

        `;

    });

}
// ==========================================================
// BILL
// ==========================================================

function renderBill(order) {

    billContainer.innerHTML = `

    <div class="bill-row">

        <span>

            Subtotal

        </span>

        <span>

            ₹${order.pricing.subtotal}

        </span>

    </div>

    <div class="bill-row">

        <span>

            Discount

        </span>

        <span>

            -₹${order.pricing.discount}

        </span>

    </div>

    <div class="bill-row">

        <span>

            Delivery

        </span>

        <span>

            ₹${order.pricing.deliveryFee}

        </span>

    </div>

    <div class="bill-total">

        <span>

            Total

        </span>

        <span>

            ₹${order.pricing.total}

        </span>

    </div>

    `;

}
// ==========================================================
// DELIVERY
// ==========================================================

function renderDelivery(order) {

    deliveryContainer.innerHTML = `

    <div class="info-row">

        <span class="info-label">

            Delivery Method

        </span>

        <span class="info-value">

            ${formatDeliveryMethod(order.deliveryMethod)}

        </span>

    </div>

    <div class="info-row">

        <span class="info-label">

            Hostel

        </span>

        <span class="info-value">

            ${order.address.hostel}

        </span>

    </div>

    <div class="info-row">

        <span class="info-label">

            Room

        </span>

        <span class="info-value">

            ${order.address.room}

        </span>

    </div>

    <div class="info-row">

        <span class="info-label">

            Address

        </span>

        <span class="info-value">

            ${order.address.address}

        </span>

    </div>

    `;

}
// ==========================================================
// PAYMENT
// ==========================================================

function renderPayment(order) {

    paymentContainer.innerHTML = `

    <div class="info-row">

        <span class="info-label">

            Method

        </span>

        <span class="info-value">

            ${formatPaymentMethod(order.paymentMethod)}

        </span>

    </div>

    <div class="info-row">

        <span class="info-label">

            Status

        </span>

        <span class="info-value">

            ${capitalize(order.paymentStatus)}

        </span>

    </div>

    `;

}
// ==========================================================
// ORDER INFO
// ==========================================================

function renderInfo(order) {

    infoContainer.innerHTML = `

    <div class="info-row">

        <span class="info-label">

            Order ID

        </span>

        <span class="info-value">

            ${order.orderId}

        </span>

    </div>

    <div class="info-row">

        <span class="info-label">

            Created

        </span>

        <span class="info-value">

            ${formatDate(order.createdAt)}

        </span>

    </div>

    <div class="info-row">

        <span class="info-label">

            Updated

        </span>

        <span class="info-value">

            ${formatDate(order.updatedAt)}

        </span>

    </div>

    `;

}
// ==========================================================
// FORMAT STATUS
// ==========================================================

function formatStatus(status) {

    switch (status) {

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
// STATUS CLASS
// ==========================================================

function getStatusClass(status) {

    switch (status) {

        case "PACKING":
            return "preparing";

        case "READY_FOR_PICKUP":
        case "OUT_FOR_DELIVERY":
            return "transit";

        case "DELIVERED":
            return "delivered";

        case "CANCELLED":
            return "cancelled";

        default:
            return "pending";

    }

}

// ==========================================================
// DELIVERY METHOD
// ==========================================================

function formatDeliveryMethod(method) {

    return method === "room"

        ? "Room Delivery"

        : "Pickup";

}

// ==========================================================
// PAYMENT METHOD
// ==========================================================

function formatPaymentMethod(method) {

    return method === "scan_on_delivery"

        ? "Scan on Delivery"

        : "UPI";

}

// ==========================================================
// CAPITALIZE
// ==========================================================

function capitalize(text) {

    if (!text) {

        return "";

    }

    return text.charAt(0).toUpperCase()

        + text.slice(1);

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
// ==========================================================
// CONTACT SUPPORT
// ==========================================================

const supportBtn = document.querySelector(".support-btn");

supportBtn.addEventListener("click", () => {

    window.open(

        "https://instagram.com/snackment",

        "_blank"

    );

});