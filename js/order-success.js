// PART 1
// ==========================================
// DOM ELEMENTS
// ==========================================
const successTitle = document.getElementById("success-title");
const successSubtitle = document.getElementById("success-subtitle");
const orderId = document.getElementById("order-id");
const orderTime = document.getElementById("order-time");
const deliveryTypeText = document.getElementById("delivery-type");
const lastStepTitle = document.getElementById("last-step-title");
const lastStepSubtitle = document.getElementById("last-step-subtitle");
const hostelName = document.getElementById("hostel-name");
const roomNumber = document.getElementById("room-number");
const address = document.getElementById("address");
const arrivalTime = document.getElementById("arrival-time");
const deliveryCardTitle = document.getElementById("delivery-card-title");
const arrivalLabel = document.getElementById("arrival-label");
const summaryItems = document.getElementById("summary-items");
const subtotal = document.getElementById("subtotal");
const deliveryCharge = document.getElementById("delivery-charge");
const grandTotal = document.getElementById("grand-total");
const paymentMethod = document.getElementById("payment-method");
const currentStatusIcon = document.getElementById("current-status-icon");
const currentStatusTitle = document.getElementById("current-status-title");
const currentStatusBadge = document.getElementById("current-status-badge");
const currentStatusMessage = document.getElementById("current-status-message");

let order = OrderStore.get();
// Invalid access

if (!order) {
    window.location.replace("checkout.html");
}

// ==========================================
// INIT
// ==========================================

init();
let previousStatus = order.orderStatus;

OrderStore.subscribe((updatedOrder) => {

    order = updatedOrder;

    if (!order) {
        window.location.replace("../index.html");
        return;
    }

    if (order.orderStatus !== previousStatus) {

        previousStatus = order.orderStatus;

        animateStatusTransition();

        renderOrderTimeline(order.orderStatus);

    }

});
function init() {
    renderHero();
    renderSummary();
    renderDelivery();
    renderTimeline();
}
window.history.pushState(
    null,
    "",
    window.location.href
);

window.addEventListener(
    "popstate",
    () => {

        window.location.replace(
            "../index.html"
        );

    }
);
// ==========================================
// HERO
// ==========================================

function renderHero() {
    orderId.textContent =
        `Order ID: ${order.orderId}`;
    orderTime.textContent =
        formatTime(order.createdAt);
    if (order.deliveryMethod === "pickup") {
        deliveryTypeText.textContent =
            "Self Pickup";
    }
    else {
        deliveryTypeText.textContent =
            "Room Delivery";
    }
}

// ==========================================
// SUMMARY
// ==========================================

function renderSummary() {
    const pricing = order.pricing;
    subtotal.textContent =
        `₹${pricing.subtotal}`;
    deliveryCharge.textContent =
        pricing.deliveryFee === 0
            ? "FREE"
            : `₹${pricing.deliveryFee}`;
    grandTotal.textContent =
        `₹${pricing.total}`;
    paymentMethod.textContent =
        order.paymentMethod === "scan_on_delivery"
            ? "Scan on Delivery"
            : "UPI";
    summaryItems.innerHTML = `
        <div class="summary-row">
            <span>
                Items (${order.items.length})
            </span>
            <strong>
                ₹${pricing.subtotal}
            </strong>
        </div>
    `;
}

// ==========================================
// DELIVERY DETAILS
// ==========================================

function renderDelivery() {

    if (order.deliveryMethod === "pickup") {

        deliveryCardTitle.textContent =
            "Pickup From";

        hostelName.textContent =
            "CSE Boys Hostel, Derabassi";

        roomNumber.textContent =
            "135 (Ground Floor)";

        address.textContent =
            "Room No. 135, CSE Boys Hostel, LM Thapar School of Management, Derabassi";

        arrivalLabel.textContent =
            "Pickup In";

        arrivalTime.textContent =
            "5–7 minutes";

    }

    else {

        deliveryCardTitle.textContent =
            "Delivery Details";

        hostelName.textContent =
            order.address?.hostel || "--";

        roomNumber.textContent =
            order.address?.room || "--";

        address.textContent =
            order.address?.address || "--";

        arrivalLabel.textContent =
            "Expected Arrival";

        arrivalTime.textContent =
            "5–7 minutes";

    }

}

// ==========================================
// STATUS
// ==========================================

function renderTimeline() {
    if (order.deliveryMethod === "pickup") {
        lastStepTitle.textContent =
            "Ready for Pickup";
        lastStepSubtitle.textContent =
            "Pending";
    }
    else {
        lastStepTitle.textContent =
            "Coming to You";
        lastStepSubtitle.textContent =
            "Pending";
    }
}
// ==========================================
// HELPERS
// ==========================================

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ==========================================
// PART 2A
// ANIMATION ENGINE
// ==========================================

// ---------- ELEMENTS ----------

const heroCard = document.getElementById("hero-card");
const timelineLine = document.querySelector(".timeline-line");
const timelineProgress = document.querySelector(".timeline-progress");
const step1 = document.getElementById("step-1");
const step2 = document.getElementById("step-2");
const step3 = document.getElementById("step-3");
const currentStatusCard = document.getElementById("current-status-card");
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// ---------- START ----------

window.addEventListener("load", () => {

    setTimeout(() => {

        if (order.orderStatus === "PACKING") {

            playInitialAnimation();

        } else {

            heroCard.classList.add("show");
            renderOrderTimeline(order.orderStatus);

        }

    }, 250);

});

// ==========================================
// HERO
// ==========================================



// ==========================================
// TIMELINE SEQUENCE
// ==========================================
async function playInitialAnimation() {
    setCurrentStatus("PACKING");
    heroCard.classList.add("show");

    await wait(1800);

    timelineLine.classList.add("show");

    await wait(550);

    revealStep(step1);
    step1.classList.add("completed");

    await wait(400);

    revealStep(step2);

    await wait(400);

    revealStep(step3);

    await wait(450);

    timelineProgress.classList.add("fill");

    await wait(700);

    step2.classList.add("active");

    revealCurrentStatus();

}

// ==========================================
// REVEAL STEP
// ==========================================

function revealStep(step) {
    step.classList.add("show");
}


// ==========================================
// CURRENT STATUS CARD
// ==========================================

function revealCurrentStatus() {
    currentStatusCard.classList.remove("hidden");
    currentStatusCard.classList.remove("fade-in");
    void currentStatusCard.offsetWidth;
    currentStatusCard.classList.add("fade-in");
}

// ==========================================
// RESET
// (Future use)
// ==========================================



// ==========================================
// CURRENT STATUS RENDERER
// ==========================================

function setCurrentStatus(status) {
    const config = window.ORDER_STATUS[status];
    if (!config) return;

    currentStatusIcon.src = `../Assets/Images/Symbols/${config.icon}`;
    currentStatusTitle.textContent = config.title;
    currentStatusBadge.className = "active-badge " + config.badgeClass;
    currentStatusMessage.textContent = config.subtitle;
}

// ==========================================
// STEP HELPERS
// ==========================================

function completeStep(step) {
    step.classList.remove("active");
    step.classList.remove("pending");
    step.classList.add("completed");
}

function activateStep(step) {
    step.classList.remove("pending");
    step.classList.remove("completed");
    step.classList.add("active");
}

function setStepSubtitle(step, text) {
    const subtitle = step.querySelector(".step-label span");
    if (subtitle) { subtitle.textContent = text; }
}

function fillTimelineComplete() {
    timelineProgress.classList.remove("fill");
    timelineProgress.classList.remove("complete");
    void timelineProgress.offsetWidth;
    timelineProgress.classList.add("complete");
}
// ==========================================
// PART 2B
// STATUS ENGINE
// ==========================================

function renderOrderTimeline(status) {
    
    // Reset Timeline

    [step1, step2, step3].forEach(step => {
        step.className = "timeline-step show";
    });

    timelineProgress.classList.remove("fill");
    timelineProgress.classList.remove("complete");
    timelineProgress.style.width = "";
    setStepSubtitle(step2, "In Progress");
setStepSubtitle(step3, "Pending");
    setCurrentStatus(status);
    switch (status) {

        // PACKING

        case "PACKING":

            step1.classList.add("completed");

            step2.classList.add("active");

            step3.classList.add("pending");
            // Page refresh ke liye
            timelineProgress.style.width = "calc(50% - 90px)";


            //timelineProgress.classList.add("fill");

            break;

        // ======================================
        // READY FOR PICKUP
        // ======================================

        case "READY_FOR_PICKUP":

            fillTimelineComplete();

            completeStep(step2);

            activateStep(step3);

            setStepSubtitle(step2, "Packed");

            setStepSubtitle(step3, "In Progress");


            break;

        // ======================================
        // ROOM DELIVERY
        // ======================================

        case "OUT_FOR_DELIVERY":

            fillTimelineComplete();

            completeStep(step2);

            activateStep(step3);

            setStepSubtitle(step2, "Packed");

            setStepSubtitle(step3, "In Progress");

            break;
        // ======================================
        // DELIVERED
        // ======================================
        case "DELIVERED":
            step2.classList.remove("active");
            break;

        // ======================================
        // REJECTED
        // ======================================
    }
}

// ==========================================
// PART 2C
// HELPERS
// ==========================================

// Current Status Smooth Animation

function animateCurrentStatus() {
    currentStatusCard.classList.remove("status-changing");
    void currentStatusCard.offsetWidth;
    currentStatusCard.classList.add("status-changing");
}
function animateStatusTransition() {
    animateCurrentStatus();
}
// ==========================================
// POP ANIMATION
// ==========================================

// ==========================================
// STOP PACKING
// ==========================================

// ==========================================
// BACKEND READY FUNCTIONS
// ==========================================

function orderPacking() {
    OrderStore.updateStatus("PACKING");
}

function orderReady() {
    OrderStore.updateStatus("READY_FOR_PICKUP");
}

function orderOutForDelivery() {
    OrderStore.updateStatus("OUT_FOR_DELIVERY");
}

function orderDelivered() {
    OrderStore.updateStatus("DELIVERED");
}

// ==========================================
// DEBUG
// ==========================================

window.SnackmentOrder = {
    orderPacking,
    orderReady,
    orderOutForDelivery,
    orderDelivered,
};
