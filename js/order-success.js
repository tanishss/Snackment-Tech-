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
OrderStore.subscribe((updatedOrder) => {

    order = updatedOrder;

    if (!order) {

        window.location.replace("../index.html");

        return;

    }

    renderOrderTimeline(order.orderStatus);

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
    if (order.deliveryType === "pickup") {
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
    const bill = order.bill;
    subtotal.textContent =
        `₹${bill.subtotal}`;
    deliveryCharge.textContent =
        bill.delivery === 0
            ? "FREE"
            : `₹${bill.delivery}`;
    grandTotal.textContent =
        `₹${bill.total}`;
    paymentMethod.textContent =
        order.paymentMethod;
    summaryItems.innerHTML = `
        <div class="summary-row">
            <span>
                Items (${order.itemCount})
            </span>
            <strong>
                ₹${bill.subtotal}
            </strong>
        </div>
    `;
}

// ==========================================
// DELIVERY DETAILS
// ==========================================

function renderDelivery() {

    if (order.deliveryType === "pickup") {

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
            order.deliveryAddress?.hostel || "--";

        roomNumber.textContent =
            order.deliveryAddress?.room || "--";

        address.textContent =
            order.deliveryAddress?.address || "--";

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
    if (order.deliveryType === "pickup") {
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

// ---------- START ----------

window.addEventListener("load", () => {

    setTimeout(() => {

        if (order.orderStatus === "PACKING") {

            startHeroAnimation();

        } else {

            heroCard.classList.add("show");

            timelineLine.classList.add("show");

            revealStep(step1);
            revealStep(step2);
            revealStep(step3);

            revealCurrentStatus();

            renderOrderTimeline(
                order.orderStatus
            );

        }

    }, 250);

});

// ==========================================
// HERO
// ==========================================

function startHeroAnimation() {
    heroCard.classList.add("show");
    // Hero animation finishes
    // then wait a little before timeline
    setTimeout(() => {
        startTimeline();
    }, 1800);
}

// ==========================================
// TIMELINE SEQUENCE
// ==========================================
function startTimeline() {
    // Draw Grey Line
    timelineLine.classList.add("show");
    // Step 1
    setTimeout(() => {
        revealStep(step1);
        step1.classList.add("completed");
    }, 550);
    // Step 2
    setTimeout(() => {
        revealStep(step2);
    }, 950);
    // Step 3
    setTimeout(() => {
        revealStep(step3);
    }, 1350);
    // Fill Green Line till Packing
    setTimeout(() => {
        timelineProgress.classList.add("fill");
    }, 1800);
    // Packing becomes active
    setTimeout(() => {

        activatePacking();

        renderOrderTimeline(
            order.orderStatus
        );

    }, 2500);
}

// ==========================================
// REVEAL STEP
// ==========================================

function revealStep(step) {
    step.classList.add("show");
}

// ==========================================
// PACKING
// ==========================================

function activatePacking() {
    step2.classList.add("active");
    revealCurrentStatus();
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

function resetTimeline() {
    timelineLine.classList.remove("show");
    timelineProgress.classList.remove("fill");
    step1.className = "timeline-step";
    step2.className = "timeline-step";
    step3.className = "timeline-step";
}



// ==========================================
// CURRENT STATUS RENDERER
// ==========================================

function setCurrentStatus(status) {
    const config = window.ORDER_STATUS[status];
    if (!config) return;
    animateCurrentStatus();
    currentStatusIcon.style.transform = "scale(.75)";
    currentStatusIcon.style.opacity = ".3";

    setTimeout(() => {

        currentStatusIcon.src = `../Assets/Images/Symbols/${config.icon}`;
        currentStatusTitle.textContent =
            config.title;

        currentStatusBadge.className =
            "active-badge " + config.badgeClass;

        currentStatusMessage.textContent =
            config.subtitle;

        currentStatusIcon.style.transform = "scale(1)";
        currentStatusIcon.style.opacity = "1";

    }, 180);
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
    setCurrentStatus(status);

    switch (status) {

        // PACKING

        case "PACKING":
            step1.classList.add("completed");
            step2.classList.add("active");
            timelineProgress.classList.add("fill");
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

            popStep(step3);

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

            popStep(step3);

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

// ==========================================
// POP ANIMATION
// ==========================================

function popStep(step) {
    step.classList.remove("show");
    void step.offsetWidth;
    step.classList.add("show");
}

// ==========================================
// STOP PACKING
// ==========================================

function stopPackingAnimation() {
    step2.classList.remove("active");
    step2.classList.add("completed");
}

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
