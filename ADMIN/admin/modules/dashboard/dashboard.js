/* =========================================================
   SNACKMENT ADMIN
   DASHBOARD JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeDashboard();
});


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

function initializeDashboard() {
    initializeGreeting();
    initializeOrderBars();
    initializeDashboardActions();
    initializeStatCards();
}


/* =========================================================
   GREETING
========================================================= */

function initializeGreeting() {
    const greetingTitle =
        document.getElementById("dashboard-greeting-title");

    if (!greetingTitle) {
        return;
    }

    const currentHour = new Date().getHours();

    let greeting = "Good Evening";
    let icon = "🌙";

    if (currentHour >= 5 && currentHour < 12) {
        greeting = "Good Morning";
        icon = "☀️";
    } else if (currentHour >= 12 && currentHour < 17) {
        greeting = "Good Afternoon";
        icon = "☀️";
    }

    greetingTitle.innerHTML = `
        ${greeting}
        <span
            class="dashboard-greeting-icon"
            aria-hidden="true"
        >
            ${icon}
        </span>
    `;
}


/* =========================================================
   ORDER BAR CHART
========================================================= */

function initializeOrderBars() {
    const bars =
        document.querySelectorAll(".order-bar-column");

    const tooltip =
        document.getElementById("orders-chart-tooltip");

    if (!bars.length || !tooltip) {
        return;
    }

    bars.forEach((barColumn) => {

        barColumn.addEventListener("mouseenter", () => {

            const time =
                barColumn.dataset.time || "";

            const orders =
                barColumn.dataset.orders || "0";

            const tooltipTime =
                tooltip.querySelector(".tooltip-time");

            const tooltipValue =
                tooltip.querySelector(".tooltip-value");

            if (tooltipTime) {
                tooltipTime.textContent = time;
            }

            if (tooltipValue) {
                tooltipValue.textContent =
                    `${orders} orders`;
            }

            tooltip.setAttribute(
                "aria-hidden",
                "false"
            );

            bars.forEach((item) => {
                item.classList.remove(
                    "order-bar-column--active"
                );
            });

            barColumn.classList.add(
                "order-bar-column--active"
            );
        });


        barColumn.addEventListener("mouseleave", () => {

            tooltip.setAttribute(
                "aria-hidden",
                "true"
            );

            bars.forEach((item) => {
                item.classList.remove(
                    "order-bar-column--active"
                );
            });
        });

    });
}


/* =========================================================
   DASHBOARD ACTION BUTTONS
========================================================= */

function initializeDashboardActions() {

    const viewAllProducts =
        document.getElementById(
            "view-all-products"
        );

    const viewAllOrders =
        document.getElementById(
            "view-all-orders"
        );


    /* -----------------------------------------
       VIEW ALL PRODUCTS
    ----------------------------------------- */

    if (viewAllProducts) {

        viewAllProducts.addEventListener(
            "click",
            () => {

                window.location.href =
                    "../../products/products.html";

            }
        );

    }


    /* -----------------------------------------
       VIEW ALL ORDERS
    ----------------------------------------- */

    if (viewAllOrders) {

        viewAllOrders.addEventListener(
            "click",
            () => {

                window.location.href =
                    "../../orders/orders.html";

            }
        );

    }

}


/* =========================================================
   STAT CARD INTERACTION
========================================================= */

function initializeStatCards() {

    const statCards =
        document.querySelectorAll(".stat-card");

    if (!statCards.length) {
        return;
    }

    statCards.forEach((card) => {

        card.addEventListener(
            "click",
            () => {

                const stat =
                    card.dataset.stat;

                if (!stat) {
                    return;
                }

                handleStatCardClick(stat);

            }
        );

    });

}


/* =========================================================
   STAT CARD ROUTING
========================================================= */

function handleStatCardClick(stat) {

    const routes = {

        "today-orders":
            "../../orders/orders.html",

        "pending-orders":
            "../../orders/orders.html",

        "preparing-orders":
            "../../orders/orders.html",

        "ready-orders":
            "../../orders/orders.html",

        "delivered-orders":
            "../../orders/orders.html",

        "revenue-today":
            "../../analytics/analytics.html",

        "active-customers":
            "../../customers/customers.html",

        "products-in-stock":
            "../../products/products.html"

    };

    const destination =
        routes[stat];

    if (!destination) {
        return;
    }

    window.location.href =
        destination;
}


/* =========================================================
   REVENUE CHART
========================================================= */

function initializeRevenueChart() {

    const revenueChart =
        document.getElementById(
            "revenue-chart"
        );

    if (!revenueChart) {
        return;
    }

    const points =
        revenueChart.querySelectorAll(
            ".revenue-point"
        );

    points.forEach((point) => {

        point.addEventListener(
            "mouseenter",
            () => {

                point.classList.add(
                    "revenue-point--active"
                );

            }
        );

        point.addEventListener(
            "mouseleave",
            () => {

                point.classList.remove(
                    "revenue-point--active"
                );

            }
        );

    });

}


/* =========================================================
   RECENT ORDERS
========================================================= */

function initializeRecentOrders() {

    const rows =
        document.querySelectorAll(
            ".recent-orders-table tbody tr"
        );

    if (!rows.length) {
        return;
    }

    rows.forEach((row) => {

        row.addEventListener(
            "click",
            () => {

                const orderId =
                    row.dataset.orderId;

                if (!orderId) {
                    return;
                }

                console.log(
                    `[Dashboard] Order selected: ${orderId}`
                );

            }
        );

    });

}


/* =========================================================
   TOP PRODUCTS
========================================================= */

function initializeTopProducts() {

    const products =
        document.querySelectorAll(
            ".top-product-item"
        );

    if (!products.length) {
        return;
    }

    products.forEach((product) => {

        product.addEventListener(
            "click",
            () => {

                const productId =
                    product.dataset.product;

                if (!productId) {
                    return;
                }

                console.log(
                    `[Dashboard] Product selected: ${productId}`
                );

            }
        );

    });

}


/* =========================================================
   RUN SECONDARY INITIALIZERS
========================================================= */

initializeRevenueChart();
initializeRecentOrders();
initializeTopProducts();