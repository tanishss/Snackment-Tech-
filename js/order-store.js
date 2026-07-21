// ORDER STORE

const OrderStore = (() => {

    const storedOrder = localStorage.getItem(
        "snackment_latest_order"
    );

    let currentOrder = null;

    if (
        storedOrder &&
        storedOrder !== "undefined"
    ) {
        currentOrder = JSON.parse(storedOrder);
    }

    const subscribers = [];

    function notify() {
        subscribers.forEach(callback => {
            try {
                callback(currentOrder);
            } catch (error) {
                console.error(error);
            }
        });
    }

    return {
        get() {
            return currentOrder;
        },

        set(order) {
            currentOrder = order;
            localStorage.setItem(
                "snackment_latest_order",
                JSON.stringify(currentOrder)
            );
            notify();
        },

        updateStatus(status) {

            if (!currentOrder) return;
            const validStatuses = [
                "PACKING",
                "READY_FOR_PICKUP",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED"
            ];
            if (!validStatuses.includes(status)) {
                return;
            }
            if (currentOrder.orderStatus === status) {

                return;

            }
            currentOrder.orderStatus = status;
            const now = new Date().toISOString();
            currentOrder.updatedAt = now;
            if (!currentOrder.statusHistory) {
                currentOrder.statusHistory = [];
            }
            currentOrder.statusHistory.push({
                status,
                time: now
            });
            this.set(currentOrder);
            if (status === "DELIVERED") {

                setTimeout(() => {

                    this.clear();

                }, 5000);

            }
        },

        clear() {
            currentOrder = null;
            localStorage.removeItem(
                "snackment_latest_order"
            );
            notify();
        },

        subscribe(callback) {
            subscribers.push(callback);
        },

        unsubscribe(callback) {

            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        },

    };

})();