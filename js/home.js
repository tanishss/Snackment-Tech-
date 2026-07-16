// DOM ELEMENTS

const activeOrderBar = document.getElementById("active-order-bar");
const activeOrderLabel = document.querySelector(".active-order-label");
const activeOrderTime = document.getElementById("active-order-time");
const activeOrderIcon = document.getElementById("active-order-icon");
const activeOrderStatus = document.getElementById("active-order-status");
const viewOrderBtn = document.getElementById("view-order-btn");
const activeOrderOverlay = document.getElementById("activeOrderOverlay");
const continueBrowsingBtn = document.getElementById("continueBrowsingBtn");
const viewOrderModalBtn = document.getElementById("viewOrderModalBtn");

// EVENTS

viewOrderBtn.addEventListener(
    "click",
    () => {
        window.location.href = "HTML/order-success.html";
    }
);

continueBrowsingBtn.addEventListener(
    "click",
    () => {
        activeOrderOverlay.classList.remove(
            "show"
        );
    }
);

activeOrderOverlay.addEventListener(
    "click",
    (e) => {
        if (
            e.target === activeOrderOverlay
        ) {
            activeOrderOverlay.classList.remove(
                "show"
            );
        }
    }
);

viewOrderModalBtn.addEventListener(
    "click",
    () => {
        window.location.href =
            "HTML/order-success.html";
    }
);

// FUNCTIONS

window.showActiveOrderPopup = function () {
    activeOrderOverlay.classList.add(
        "show"
    );
};

window.updateActiveOrderBar = function (order = OrderStore.get()) {
    if (!order) {
        if (
            !activeOrderBar.classList.contains("active-order-hidden")
        ) {
            activeOrderBar.classList.add(
                "hide"
            );
            setTimeout(() => {
                activeOrderBar.classList.add(
                    "active-order-hidden"
                );
                activeOrderBar.classList.remove(
                    "hide"
                );
            }, 350);
        }
        return;
    }
    activeOrderBar.classList.remove(
        "active-order-hidden"
    );

    activeOrderBar.classList.remove(
        "hide"
    );
    activeOrderBar.classList.remove(
        "show"
    );
    void activeOrderBar.offsetWidth;

    activeOrderBar.classList.add(
        "show"
    );

    const config =
        window.ORDER_STATUS[
        order.orderStatus
        ];

    if (!config) return;

    activeOrderLabel.textContent =
        config.label;

    activeOrderStatus.textContent =
        config.title;

    activeOrderTime.textContent =
        config.subtitle;

    activeOrderIcon.src =
        `Assets/Images/Symbols/${config.icon}`;

    const iconWrapper =
        activeOrderIcon.parentElement;

    iconWrapper.classList.remove(
        "packing",
        "ready",
        "delivery",
        "done"
    );

    void iconWrapper.offsetWidth;

    iconWrapper.classList.add(
        config.animation
    );
}


// INIT

updateActiveOrderBar();
OrderStore.subscribe((order) => {

    updateActiveOrderBar(order);

});