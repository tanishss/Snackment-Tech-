// ==========================================
// ORDER STATUS CONFIGURATION
// Single Source of Truth
// ==========================================

window.ORDER_STATUS = {

    PACKING: {

        label: "ORDER IN PROGRESS",

        title: "Packing your order...",

        subtitle: " • 5–7 min",

        badge: "ACTIVE",

        badgeClass: "active",

        icon: "packing.svg",

        animation: "packing"

    },

    READY_FOR_PICKUP: {

        label: "READY FOR PICKUP",

        title: "Ready for Pickup!",

        subtitle: "Collect your order now",

        badge: "READY",

        badgeClass: "ready",

        icon: "person-carry-box.svg",

        animation: "ready"

    },

    OUT_FOR_DELIVERY: {

        label: "OUT FOR DELIVERY",

        title: "Coming to your room",

        subtitle: "ETA • 1–2 min",

        badge: "LIVE",

        badgeClass: "live",

        icon: "truck-side.svg",

        animation: "delivery"

    },

    DELIVERED: {

        label: "ORDER DELIVERED",

        title: "Order Delivered",

        subtitle: "Enjoy your snacks!",

        badge: "DONE",

        badgeClass: "done",

        icon: "check-mark.svg",

        animation: "done"

    }

};
window.addEventListener(

    "storage",

    (event) => {

        if (

            event.key !== "snackment_latest_order"

        ) return;

        const updatedOrder = JSON.parse(

            event.newValue

        );

        if (!updatedOrder) return;

        renderOrderTimeline(

            updatedOrder.orderStatus

        );

    }

);