const FREE_DELIVERY_LIMIT = 199;
const DELIVERY_FEE = 10;

function calculateBill(
    subtotal,
    coupon,
    deliveryType = "pickup"
) {

    let discount = 0;

    if (coupon) {

        if (coupon.discountType === "flat") {

            discount = coupon.discountValue;

        }

        else if (coupon.discountType === "percent") {

            discount = Math.floor(
                subtotal * coupon.discountValue / 100
            );

        }

    }

    let delivery = 0;

if (deliveryType === "room") {

    delivery =
        subtotal >= FREE_DELIVERY_LIMIT
            ? 0
            : DELIVERY_FEE;

}

    let total = subtotal - discount + delivery;

    if (total < 0) {
        total = 0;
    }

    return {

        subtotal,

        discount,

        delivery,

        total

    };

}

module.exports = calculateBill;