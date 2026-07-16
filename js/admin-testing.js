// DOM

const packingBtn = document.getElementById("packing-btn");
const pickupBtn = document.getElementById("pickup-btn");
const deliveryBtn = document.getElementById("delivery-btn");
const deliveredBtn = document.getElementById("delivered-btn");
const rejectBtn = document.getElementById("reject-btn");
const resetBtn = document.getElementById("reset-btn");
const connectBtn = document.getElementById("connect-btn");
const statusDot = document.getElementById("status-dot");
const connectionText = document.getElementById("connection-text");
const backendStatus = document.getElementById("backend-status");

// CONNECT TO ORDER SUCCESS

let orderWindow = null;
function connectOrderPage() {
    if (
        orderWindow &&
        !orderWindow.closed
    ) {
        statusDot.classList.add("connected");
        connectionText.textContent =
            "Connected";
        return orderWindow;
    }
    orderWindow = window.open(
        "order-success.html",
        "SnackmentOrder"
    );
    const timer = setInterval(() => {
        if (
            orderWindow &&
            orderWindow.SnackmentOrder
        ) {
            statusDot.classList.add("connected");
            connectionText.textContent =
                "Connected";
            clearInterval(timer);
        }
    }, 150);
}

// SEND STATUS

function sendStatus(functionName, label) {
    const page = connectOrderPage();
    const timer = setInterval(() => {
        if (
            page &&
            page.SnackmentOrder
        ) {
            page.SnackmentOrder[functionName]();
            backendStatus.textContent =
                label;
            clearInterval(timer);
        }
    }, 150);
}

// BUTTON EVENTS

packingBtn.onclick=()=>{
    sendStatus(
        "orderPacking",
        "PACKING"
    );
};
pickupBtn.onclick=()=>{
    sendStatus(
        "orderReady",
        "READY FOR PICKUP"
    );
};
deliveryBtn.onclick=()=>{
    sendStatus(
        "orderOutForDelivery",
        "OUT FOR DELIVERY"
    );
};
deliveredBtn.onclick=()=>{
    sendStatus(
        "orderDelivered",
        "DELIVERED"
    );
};
rejectBtn.onclick=()=>{
    sendStatus(
        "orderRejected",
        "REJECTED"
    );
};
connectBtn.onclick = () => {
    connectOrderPage();
};

// RESET

resetBtn.onclick = () => {
    const page = connectOrderPage();
    page.location.reload();
};