// ==========================================
// ACTIVE ORDER HELPERS
// ==========================================

window.getActiveOrder = function () {

    const order = OrderStore.get();

    if (!order) return null;

    const inactiveStatuses = [
        "DELIVERED",
        "CANCELLED"
    ];

    if (
        inactiveStatuses.includes(
            order.orderStatus
        )
    ) {
        return null;
    }

    return order;

};

window.hasActiveOrder = function () {

    return (
        window.getActiveOrder() !== null
    );

};

window.clearActiveOrder = function () {
    OrderStore.clear();
};
