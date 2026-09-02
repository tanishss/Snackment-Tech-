/* =========================================================
   SNACKMENT ADMIN — ORDERS
   ---------------------------------------------------------
   Responsibilities:

   1. Render orders
   2. Status filtering
   3. Search
   4. Pagination
   5. Loading state
   6. Empty state
   7. Order details modal shell
   8. Toast system
   9. Keyboard / accessibility handling
   10. Clean separation for future API integration

   NOTE:
   This version uses local dummy data for UI testing.
   The data-loading layer is intentionally isolated so the
   backend can be connected later without rebuilding the UI.
   ========================================================= */


/* =========================================================
   01. MODULE STATE
   ========================================================= */

const OrdersModule = (() => {

    "use strict";


    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const CONFIG = {

        itemsPerPage: 8,

        searchDelay: 180,

        toastDuration: 3200

    };


    /* =====================================================
       DUMMY ORDERS
       
       These are temporary UI-testing records.
       Backend integration will replace this source later.
    ====================================================== */

    const orders = [

        {
            id: "#1042",
            customer: {
                name: "Arjun Mehta",
                phone: "9876543210"
            },
            items: 2,
            total: 186,
            payment: "UPI",
            status: "delivered",
            time: "2m ago",
            createdAt: Date.now() - (2 * 60 * 1000),

            products: [
                {
                    name: "Lays Classic Salted",
                    quantity: 1,
                    price: 20
                },
                {
                    name: "Dairy Milk Silk",
                    quantity: 1,
                    price: 166
                }
            ]
        },


        {
            id: "#1041",
            customer: {
                name: "Riya Sharma",
                phone: "9812345678"
            },
            items: 3,
            total: 312,
            payment: "UPI",
            status: "preparing",
            time: "8m ago",
            createdAt: Date.now() - (8 * 60 * 1000),

            products: [
                {
                    name: "Maggi 2-Minute Noodles",
                    quantity: 2,
                    price: 28
                },
                {
                    name: "KitKat",
                    quantity: 1,
                    price: 256
                }
            ]
        },


        {
            id: "#1040",
            customer: {
                name: "Karan Singh",
                phone: "9765432109"
            },
            items: 2,
            total: 94,
            payment: "Cash",
            status: "ready",
            time: "15m ago",
            createdAt: Date.now() - (15 * 60 * 1000),

            products: [
                {
                    name: "Lays Classic Salted",
                    quantity: 2,
                    price: 47
                }
            ]
        },


        {
            id: "#1039",
            customer: {
                name: "Priya Nair",
                phone: "9654321098"
            },
            items: 4,
            total: 228,
            payment: "UPI",
            status: "pending",
            time: "22m ago",
            createdAt: Date.now() - (22 * 60 * 1000),

            products: [
                {
                    name: "Britannia Marie",
                    quantity: 2,
                    price: 40
                },
                {
                    name: "Thums Up",
                    quantity: 2,
                    price: 148
                }
            ]
        },


        {
            id: "#1038",
            customer: {
                name: "Dev Patel",
                phone: "9543210987"
            },
            items: 1,
            total: 45,
            payment: "UPI",
            status: "cancelled",
            time: "38m ago",
            createdAt: Date.now() - (38 * 60 * 1000),

            products: [
                {
                    name: "Maggi 2-Minute Noodles",
                    quantity: 1,
                    price: 45
                }
            ]
        },


        {
            id: "#1037",
            customer: {
                name: "Ananya Bose",
                phone: "9432109876"
            },
            items: 6,
            total: 407,
            payment: "UPI",
            status: "delivered",
            time: "1h ago",
            createdAt: Date.now() - (60 * 60 * 1000),

            products: [
                {
                    name: "Lays Classic Salted",
                    quantity: 2,
                    price: 40
                },
                {
                    name: "KitKat",
                    quantity: 2,
                    price: 167
                },
                {
                    name: "Thums Up",
                    quantity: 2,
                    price: 100
                }
            ]
        },


        {
            id: "#1036",
            customer: {
                name: "Vikram Reddy",
                phone: "9321098765"
            },
            items: 2,
            total: 138,
            payment: "Cash",
            status: "delivered",
            time: "1.5h ago",
            createdAt: Date.now() - (90 * 60 * 1000),

            products: [
                {
                    name: "Aloo Bhujia",
                    quantity: 1,
                    price: 68
                },
                {
                    name: "Britannia Marie",
                    quantity: 1,
                    price: 70
                }
            ]
        },


        {
            id: "#1035",
            customer: {
                name: "Sneha Kapoor",
                phone: "9210987654"
            },
            items: 2,
            total: 92,
            payment: "UPI",
            status: "delivered",
            time: "2h ago",
            createdAt: Date.now() - (2 * 60 * 60 * 1000),

            products: [
                {
                    name: "Lays Classic Salted",
                    quantity: 1,
                    price: 20
                },
                {
                    name: "Thums Up",
                    quantity: 1,
                    price: 72
                }
            ]
        },


        {
            id: "#1034",
            customer: {
                name: "Rahul Verma",
                phone: "9123456780"
            },
            items: 3,
            total: 215,
            payment: "UPI",
            status: "pending",
            time: "2.5h ago",
            createdAt: Date.now() - (150 * 60 * 1000),

            products: [
                {
                    name: "KitKat",
                    quantity: 1,
                    price: 80
                },
                {
                    name: "Lays Classic Salted",
                    quantity: 2,
                    price: 135
                }
            ]
        },


        {
            id: "#1033",
            customer: {
                name: "Meera Iyer",
                phone: "9012345678"
            },
            items: 2,
            total: 150,
            payment: "Cash",
            status: "preparing",
            time: "3h ago",
            createdAt: Date.now() - (180 * 60 * 1000),

            products: [
                {
                    name: "Maggi 2-Minute Noodles",
                    quantity: 2,
                    price: 150
                }
            ]
        },


        {
            id: "#1032",
            customer: {
                name: "Aditya Malhotra",
                phone: "9988776655"
            },
            items: 4,
            total: 284,
            payment: "UPI",
            status: "ready",
            time: "3.5h ago",
            createdAt: Date.now() - (210 * 60 * 1000),

            products: [
                {
                    name: "Britannia Marie",
                    quantity: 2,
                    price: 80
                },
                {
                    name: "Thums Up",
                    quantity: 2,
                    price: 204
                }
            ]
        },


        {
            id: "#1031",
            customer: {
                name: "Neha Gupta",
                phone: "9876501234"
            },
            items: 1,
            total: 20,
            payment: "UPI",
            status: "cancelled",
            time: "4h ago",
            createdAt: Date.now() - (240 * 60 * 1000),

            products: [
                {
                    name: "Lays Classic Salted",
                    quantity: 1,
                    price: 20
                }
            ]
        }

    ];


    /* =====================================================
       MODULE STATE
    ====================================================== */

    const state = {

        allOrders: [...orders],

        filteredOrders: [...orders],

        currentPage: 1,

        activeStatus: "all",

        searchTerm: "",

        isLoading: false,

        selectedOrder: null,

        toastTimer: null,

        searchTimer: null

    };


    /* =====================================================
       DOM REFERENCES
    ====================================================== */

    const elements = {};


    /* =====================================================
       INITIALIZE DOM REFERENCES
    ====================================================== */

    function cacheElements() {

        elements.page = document.getElementById("orders-page");

        if (!elements.page) {
            return false;
        }


        elements.todaySummary =
            document.getElementById("orders-today-summary");


        elements.statusTabs =
            document.getElementById("orders-status-tabs");


        elements.search =
            document.getElementById("orders-search");


        elements.clearSearch =
            document.getElementById("clear-orders-search");


        elements.filterSummary =
            document.getElementById("orders-filter-summary");


        elements.filterResultCount =
            document.getElementById("orders-filter-result-count");


        elements.table =
            document.getElementById("orders-table");


        elements.tableWrapper =
            document.getElementById("orders-table-wrapper");


        elements.tableBody =
            document.getElementById("orders-table-body");


        elements.loadingState =
            document.getElementById("orders-loading-state");


        elements.emptyState =
            document.getElementById("orders-empty-state");


        elements.emptyTitle =
            document.getElementById("orders-empty-title");


        elements.emptyDescription =
            document.getElementById("orders-empty-description");


        elements.clearFilters =
            document.getElementById("clear-orders-filters");


        elements.showingStart =
            document.getElementById("orders-showing-start");


        elements.showingEnd =
            document.getElementById("orders-showing-end");


        elements.totalCount =
            document.getElementById("orders-total-count");


        elements.paginationControls =
            document.getElementById("orders-pagination-controls");


        elements.pageNumberList =
            document.getElementById("orders-page-number-list");


        elements.prevPage =
            document.getElementById("orders-prev-page");


        elements.nextPage =
            document.getElementById("orders-next-page");


        elements.detailsModal =
            document.getElementById("order-details-modal");


        elements.detailsOverlay =
            document.getElementById("order-details-overlay");


        elements.detailsTitle =
            document.getElementById("order-details-title");


        elements.detailsSubtitle =
            document.getElementById("order-details-subtitle");


        elements.detailsContent =
            document.getElementById("order-details-content");


        elements.closeDetails =
            document.getElementById("close-order-details");


        elements.closeDetailsFooter =
            document.getElementById("close-order-details-footer");


        elements.toast =
            document.getElementById("orders-toast");


        elements.toastIcon =
            document.getElementById("orders-toast-icon");


        elements.toastTitle =
            document.getElementById("orders-toast-title");


        elements.toastMessage =
            document.getElementById("orders-toast-message");


        elements.toastClose =
            document.getElementById("orders-toast-close");


        return true;
    }


    /* =====================================================
       DOM VALIDATION
       
       This is intentionally strict enough to catch a broken
       HTML/JS connection early.
    ====================================================== */

    function validateElements() {

        const required = [

            ["orders-page", elements.page],

            ["orders-status-tabs", elements.statusTabs],

            ["orders-search", elements.search],

            ["orders-table-body", elements.tableBody],

            ["orders-loading-state", elements.loadingState],

            ["orders-empty-state", elements.emptyState],

            ["orders-prev-page", elements.prevPage],

            ["orders-next-page", elements.nextPage],

            ["orders-page-number-list", elements.pageNumberList]

        ];


        let valid = true;


        required.forEach(([id, element]) => {

            if (!element) {

                console.error(
                    `[Orders] Missing required element: #${id}`
                );

                valid = false;
            }

        });


        return valid;
    }


    /* =====================================================
       ESCAPE HTML
       
       Any future backend string should pass through this
       before being inserted using innerHTML.
    ====================================================== */

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       FORMAT CURRENCY
    ====================================================== */

    function formatCurrency(amount) {

        const number = Number(amount);

        if (!Number.isFinite(number)) {
            return "₹0";
        }


        return `₹${number.toLocaleString("en-IN")}`;
    }


    /* =====================================================
       FORMAT STATUS
    ====================================================== */
    function normalizeOrderStatus(status) {

        const map = {

            PENDING: "pending",

            PACKING: "preparing",

            READY_FOR_PICKUP: "ready",

            OUT_FOR_DELIVERY: "preparing",

            DELIVERED: "delivered",

            CANCELLED: "cancelled"

        };

        return (
            map[
            String(status || "")
                .toUpperCase()
            ] || "pending"
        );
    }
    function formatStatus(status) {

        const map = {

            pending: "Pending",

            packing: "Preparing",

            preparing: "Preparing",

            ready_for_pickup: "Ready",

            ready: "Ready",

            out_for_delivery: "Out for delivery",

            delivered: "Delivered",

            cancelled: "Cancelled"

        };

        return map[
            String(status || "").toLowerCase()
        ] || "Unknown";
    }


    /* =====================================================
       STATUS CLASS
    ====================================================== */

    function getStatusClass(status) {

        const normalized =
            String(status || "").toLowerCase();

        const map = {

            pending: "pending",

            packing: "preparing",

            preparing: "preparing",

            ready_for_pickup: "ready",

            ready: "ready",

            out_for_delivery: "ready",

            delivered: "delivered",

            cancelled: "cancelled"

        };

        const className =
            map[normalized];

        return className
            ? `status-${className}`
            : "status-default";
    }

    function getNextStatus(status) {

        const nextStatus = {

            pending: {
                value: "PACKING",
                label: "Mark Preparing"
            },

            preparing: {
                value: "READY_FOR_PICKUP",
                label: "Mark Ready"
            },

            ready: {
                value: "OUT_FOR_DELIVERY",
                label: "Out for Delivery"
            }

        };

        return nextStatus[
            String(status || "").toLowerCase()
        ] || null;
    }


    async function updateOrderStatus(orderId, newStatus) {

        try {

            const token =
                localStorage.getItem(
                    "snackmentAdminToken"
                );

            if (!token) {
                throw new Error(
                    "Admin authentication required."
                );
            }

            const response =
                await fetch(
                    `http://localhost:5001/api/admin/orders/${encodeURIComponent(orderId)}/status`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Failed to update order status."
                );
            }

            /* Update local order immediately */

            const order =
                state.allOrders.find(
                    item =>
                        String(item.id) ===
                        String(orderId)
                );

            if (order) {

                order.status =
                    normalizeOrderStatus(
                        data.order.orderStatus
                    );

            }

            /* Re-apply filters/counts */

            updateStatusCounts();

            updateTodaySummary();

            filterOrders();

            showToast(
                "Order Updated",
                `Order ${orderId} status updated successfully.`,
                "success"
            );

            console.log(
                `[Orders] ${orderId} → ${data.order.orderStatus}`
            );

        } catch (error) {

            console.error(
                "[Orders] Status update failed:",
                error
            );

            showToast(
                "Update Failed",
                error.message ||
                "Unable to update order status.",
                "error"
            );

        }
    }
    /* =====================================================
       TODAY ORDER COUNT
    ====================================================== */

    function updateTodaySummary() {

        if (!elements.todaySummary) {
            return;
        }


        const now = new Date();


        const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        ).getTime();


        const todayEnd = todayStart + (24 * 60 * 60 * 1000);


        const todayOrders = state.allOrders.filter(order => {

            const timestamp = Number(order.createdAt);

            return (
                timestamp >= todayStart &&
                timestamp < todayEnd
            );

        });


        const count = todayOrders.length;


        elements.todaySummary.textContent =
            `${count} total order${count === 1 ? "" : "s"} today`;
    }


    /* =====================================================
       STATUS COUNTS
    ====================================================== */

    function updateStatusCounts() {

        const counts = {

            all: state.allOrders.length,

            pending: 0,

            preparing: 0,

            ready: 0,

            delivered: 0,

            cancelled: 0

        };


        state.allOrders.forEach(order => {

            if (counts[order.status] !== undefined) {
                counts[order.status]++;
            }

        });


        Object.keys(counts).forEach(status => {

            const element =
                document.getElementById(
                    `orders-count-${status}`
                );


            if (element) {
                element.textContent = counts[status];
            }

        });
    }


    /* =====================================================
       FILTER ORDERS
    ====================================================== */

    function filterOrders() {

        const searchTerm =
            state.searchTerm.trim().toLowerCase();


        state.filteredOrders =
            state.allOrders.filter(order => {

                const matchesStatus =
                    state.activeStatus === "all" ||
                    order.status === state.activeStatus;


                if (!matchesStatus) {
                    return false;
                }


                if (!searchTerm) {
                    return true;
                }


                const orderId =
                    String(order.id).toLowerCase();


                const customerName =
                    String(
                        order.customer?.name || ""
                    ).toLowerCase();


                const customerPhone =
                    String(
                        order.customer?.phone || ""
                    ).toLowerCase();


                return (
                    orderId.includes(searchTerm) ||
                    customerName.includes(searchTerm) ||
                    customerPhone.includes(searchTerm)
                );

            });


        state.currentPage = 1;


        updateFilterSummary();

        render();
    }


    /* =====================================================
       FILTER SUMMARY
    ====================================================== */

    function updateFilterSummary() {

        if (!elements.filterSummary) {
            return;
        }


        const hasFilter =
            state.activeStatus !== "all" ||
            state.searchTerm.trim() !== "";


        if (!hasFilter) {

            elements.filterSummary.classList.add("hidden");

            return;
        }


        elements.filterSummary.classList.remove("hidden");


        const count =
            state.filteredOrders.length;


        elements.filterResultCount.textContent =
            `${count} order${count === 1 ? "" : "s"} found`;
    }


    /* =====================================================
       RENDER
    ====================================================== */

    function render() {

        if (state.isLoading) {
            return;
        }


        const total =
            state.filteredOrders.length;


        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    total / CONFIG.itemsPerPage
                )
            );


        if (state.currentPage > totalPages) {
            state.currentPage = totalPages;
        }


        if (total === 0) {

            showEmptyState();

            updatePagination();

            return;
        }


        hideEmptyState();


        const startIndex =
            (state.currentPage - 1) *
            CONFIG.itemsPerPage;


        const endIndex =
            Math.min(
                startIndex + CONFIG.itemsPerPage,
                total
            );


        const pageOrders =
            state.filteredOrders.slice(
                startIndex,
                endIndex
            );


        renderRows(pageOrders);


        updatePagination(
            startIndex + 1,
            endIndex,
            total
        );
    }


    /* =====================================================
       RENDER TABLE ROWS
    ====================================================== */

    function renderRows(pageOrders) {

        if (!elements.tableBody) {
            return;
        }


        elements.tableBody.innerHTML = "";


        const fragment =
            document.createDocumentFragment();


        pageOrders.forEach(order => {

            const row =
                document.createElement("tr");


            row.dataset.orderId =
                String(order.id);


            row.innerHTML = `

                <td>
                    <span class="orders-order-id">
                        ${escapeHTML(order.id)}
                    </span>
                </td>


                <td class="orders-customer-cell">

                    <span class="orders-customer-name">
                        ${escapeHTML(
                order.customer?.name || "Unknown Customer"
            )}
                    </span>

                    <span class="orders-customer-phone">
                        ${escapeHTML(
                order.customer?.phone || "—"
            )}
                    </span>

                </td>


                <td>

                    <span class="orders-items-count">
                        ${Number(order.items) || 0}
                    </span>

                </td>


                <td>

                    <span class="orders-total">
                        ${formatCurrency(order.total)}
                    </span>

                </td>


                <td>

                    <span class="orders-payment">
                        ${escapeHTML(order.payment || "—")}
                    </span>

                </td>


                <td>

                    <span
                        class="orders-status-badge ${getStatusClass(order.status)}"
                    >
                        ${escapeHTML(
                formatStatus(order.status)
            )}
                    </span>

                </td>


                <td>

                    <span class="orders-time">
                        ${escapeHTML(order.time || "—")}
                    </span>

                </td>


                <td class="orders-action-cell">

    <button
        type="button"
        class="orders-view-button"
        data-action="view-order"
        data-order-id="${escapeHTML(order.id)}"
    >
        View
    </button>

    ${(() => {

                    const next =
                        getNextStatus(order.status);

                    if (!next) {
                        return "";
                    }

                    return `
            <button
                type="button"
                class="orders-status-action-button"
                data-action="update-status"
                data-order-id="${escapeHTML(order.id)}"
                data-new-status="${escapeHTML(next.value)}"
            >
                ${escapeHTML(next.label)}
            </button>
        `;

                })()}

</td>

            `;


            fragment.appendChild(row);

        });


        elements.tableBody.appendChild(fragment);
    }


    /* =====================================================
       EMPTY STATE
    ====================================================== */

    function showEmptyState() {

        if (elements.tableWrapper) {
            elements.tableWrapper.classList.add("hidden");
        }


        if (elements.emptyState) {
            elements.emptyState.classList.remove("hidden");
        }


        if (
            elements.emptyTitle &&
            elements.emptyDescription
        ) {

            if (
                state.searchTerm.trim() ||
                state.activeStatus !== "all"
            ) {

                elements.emptyTitle.textContent =
                    "No orders found";

                elements.emptyDescription.textContent =
                    "Try changing your search or selected status.";

            } else {

                elements.emptyTitle.textContent =
                    "No orders yet";

                elements.emptyDescription.textContent =
                    "New customer orders will appear here.";

            }

        }
    }


    /* =====================================================
       HIDE EMPTY STATE
    ====================================================== */

    function hideEmptyState() {

        if (elements.emptyState) {
            elements.emptyState.classList.add("hidden");
        }


        if (elements.tableWrapper) {
            elements.tableWrapper.classList.remove("hidden");
        }
    }


    /* =====================================================
       PAGINATION
    ====================================================== */

    function updatePagination(
        start = 0,
        end = 0,
        total = 0
    ) {

        if (elements.showingStart) {
            elements.showingStart.textContent = start;
        }


        if (elements.showingEnd) {
            elements.showingEnd.textContent = end;
        }


        if (elements.totalCount) {
            elements.totalCount.textContent = total;
        }


        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    total / CONFIG.itemsPerPage
                )
            );


        if (elements.prevPage) {

            elements.prevPage.disabled =
                total === 0 ||
                state.currentPage <= 1;

        }


        if (elements.nextPage) {

            elements.nextPage.disabled =
                total === 0 ||
                state.currentPage >= totalPages;

        }


        renderPageNumbers(totalPages);
    }


    /* =====================================================
       PAGE NUMBERS
    ====================================================== */

    function renderPageNumbers(totalPages) {

        if (!elements.pageNumberList) {
            return;
        }


        elements.pageNumberList.innerHTML = "";


        if (
            state.filteredOrders.length === 0 ||
            totalPages <= 1
        ) {
            return;
        }


        const pages = buildPageList(
            totalPages,
            state.currentPage
        );


        const fragment =
            document.createDocumentFragment();


        pages.forEach(page => {

            if (page === "...") {

                const ellipsis =
                    document.createElement("span");


                ellipsis.className =
                    "orders-page-ellipsis";


                ellipsis.textContent =
                    "…";


                fragment.appendChild(ellipsis);

                return;
            }


            const button =
                document.createElement("button");


            button.type = "button";

            button.className =
                "orders-page-number";


            if (page === state.currentPage) {
                button.classList.add("active");
            }


            button.textContent = page;


            button.dataset.page = page;


            button.setAttribute(
                "aria-label",
                `Go to page ${page}`
            );


            button.setAttribute(
                "aria-current",
                page === state.currentPage
                    ? "page"
                    : "false"
            );


            fragment.appendChild(button);

        });


        elements.pageNumberList.appendChild(fragment);
    }


    /* =====================================================
       BUILD PAGE LIST
    ====================================================== */

    function buildPageList(totalPages, currentPage) {

        if (totalPages <= 5) {

            return Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );

        }


        const pages = [];


        pages.push(1);


        if (currentPage > 3) {
            pages.push("...");
        }


        const start =
            Math.max(2, currentPage - 1);


        const end =
            Math.min(
                totalPages - 1,
                currentPage + 1
            );


        for (let page = start; page <= end; page++) {

            if (!pages.includes(page)) {
                pages.push(page);
            }

        }


        if (currentPage < totalPages - 2) {
            pages.push("...");
        }


        if (!pages.includes(totalPages)) {
            pages.push(totalPages);
        }


        return pages;
    }


    /* =====================================================
       CHANGE PAGE
    ====================================================== */

    function goToPage(page) {

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    state.filteredOrders.length /
                    CONFIG.itemsPerPage
                )
            );


        const requestedPage =
            Number(page);


        if (
            !Number.isInteger(requestedPage) ||
            requestedPage < 1 ||
            requestedPage > totalPages
        ) {
            return;
        }


        state.currentPage =
            requestedPage;


        render();
    }


    /* =====================================================
       SET STATUS
    ====================================================== */

    function setStatus(status) {

        const allowedStatuses = [

            "all",

            "pending",

            "preparing",

            "ready",

            "delivered",

            "cancelled"

        ];


        if (!allowedStatuses.includes(status)) {
            return;
        }


        state.activeStatus =
            status;


        state.currentPage =
            1;


        updateActiveStatusTab();

        filterOrders();
    }


    /* =====================================================
       ACTIVE STATUS TAB
    ====================================================== */

    function updateActiveStatusTab() {

        if (!elements.statusTabs) {
            return;
        }


        const tabs =
            elements.statusTabs.querySelectorAll(
                ".orders-status-tab"
            );


        tabs.forEach(tab => {

            const active =
                tab.dataset.status ===
                state.activeStatus;


            tab.classList.toggle(
                "active",
                active
            );


            tab.setAttribute(
                "aria-selected",
                active ? "true" : "false"
            );

        });
    }


    /* =====================================================
       SEARCH
    ====================================================== */

    function handleSearch(value) {

        state.searchTerm =
            String(value || "");


        if (elements.clearSearch) {

            elements.clearSearch.classList.toggle(
                "hidden",
                state.searchTerm.trim() === ""
            );

        }


        clearTimeout(state.searchTimer);


        state.searchTimer =
            setTimeout(() => {

                filterOrders();

            }, CONFIG.searchDelay);
    }


    /* =====================================================
       CLEAR SEARCH
    ====================================================== */

    function clearSearch() {

        if (elements.search) {
            elements.search.value = "";
        }


        state.searchTerm = "";


        if (elements.clearSearch) {
            elements.clearSearch.classList.add("hidden");
        }


        filterOrders();
    }


    /* =====================================================
       CLEAR ALL FILTERS
    ====================================================== */

    function clearFilters() {

        state.activeStatus = "all";

        state.searchTerm = "";

        state.currentPage = 1;


        if (elements.search) {
            elements.search.value = "";
        }


        if (elements.clearSearch) {
            elements.clearSearch.classList.add("hidden");
        }


        updateActiveStatusTab();

        filterOrders();
    }


    /* =====================================================
       OPEN ORDER DETAILS
       
       Currently a shell only.
       No order-detail business logic is added yet.
    ====================================================== */

    function openOrderDetails(orderId) {

        const order =
            state.allOrders.find(
                item =>
                    String(item.id) ===
                    String(orderId)
            );


        if (!order) {

            showToast(
                "Error",
                "Order could not be found.",
                "error"
            );

            return;
        }


        state.selectedOrder =
            order;


        if (elements.detailsTitle) {

            elements.detailsTitle.textContent =
                `Order ${order.id}`;

        }


        if (elements.detailsSubtitle) {

            elements.detailsSubtitle.textContent =
                `${order.customer?.name || "Customer"} · ${formatStatus(order.status)}`;

        }


        if (elements.detailsContent) {

            elements.detailsContent.innerHTML = `

                <div
                    style="
                        padding: 30px 0;
                        text-align: center;
                        color: var(--orders-text-muted);
                    "
                >
                    Order details UI will be added here.
                </div>

            `;

        }


        if (elements.detailsModal) {

            elements.detailsModal.classList.remove(
                "hidden"
            );


            elements.detailsModal.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        document.body.classList.add(
            "orders-modal-open"
        );


        if (elements.closeDetails) {

            elements.closeDetails.focus();

        }
    }


    /* =====================================================
       CLOSE ORDER DETAILS
    ====================================================== */

    function closeOrderDetails() {

        if (!elements.detailsModal) {
            return;
        }


        elements.detailsModal.classList.add(
            "hidden"
        );


        elements.detailsModal.setAttribute(
            "aria-hidden",
            "true"
        );


        state.selectedOrder =
            null;


        document.body.classList.remove(
            "orders-modal-open"
        );
    }


    /* =====================================================
       TOAST
    ====================================================== */

    function showToast(
        title,
        message,
        type = "success"
    ) {

        if (!elements.toast) {
            return;
        }


        clearTimeout(state.toastTimer);


        if (elements.toastTitle) {
            elements.toastTitle.textContent =
                title;
        }


        if (elements.toastMessage) {
            elements.toastMessage.textContent =
                message;
        }


        if (elements.toastIcon) {

            elements.toastIcon.textContent =
                type === "error"
                    ? "!"
                    : "✓";

        }


        elements.toast.classList.remove(
            "hidden"
        );


        state.toastTimer =
            setTimeout(() => {

                hideToast();

            }, CONFIG.toastDuration);
    }


    /* =====================================================
       HIDE TOAST
    ====================================================== */

    function hideToast() {

        if (!elements.toast) {
            return;
        }


        elements.toast.classList.add(
            "hidden"
        );
    }


    /* =====================================================
       LOADING STATE
    ====================================================== */

    function setLoading(isLoading) {

        state.isLoading =
            Boolean(isLoading);


        if (elements.loadingState) {

            elements.loadingState.classList.toggle(
                "hidden",
                !state.isLoading
            );

        }


        if (state.isLoading) {

            if (elements.tableWrapper) {
                elements.tableWrapper.classList.add(
                    "hidden"
                );
            }


            if (elements.emptyState) {
                elements.emptyState.classList.add(
                    "hidden"
                );
            }

        }
    }


    /* =====================================================
       LOAD ORDERS
       
       TEMPORARY LOCAL SOURCE.

       Future API connection should happen HERE.

       Example future structure:

       const response = await fetch("/api/orders");
       const data = await response.json();

       state.allOrders = data.orders;
       state.filteredOrders = [...state.allOrders];

       ===================================================== */
    async function loadOrders() {

        setLoading(true);

        try {

            const token =
                localStorage.getItem(
                    "snackmentAdminToken"
                );

            if (!token) {
                throw new Error(
                    "Admin authentication required."
                );
            }

            const response =
                await fetch(
                    "http://localhost:5001/api/admin/orders",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Failed to load orders."
                );
            }

            /* ------------------------------------------
               REAL BACKEND ORDERS
            ------------------------------------------ */

            state.allOrders =
                data.orders.map(order => ({

                    id:
                        order.orderId,

                    customer: {
                        name:
                            order.user?.name ||
                            "Customer",

                        phone:
                            order.user?.phone ||
                            "—"
                    },

                    items:
                        order.items?.reduce(
                            (sum, item) =>
                                sum +
                                Number(item.quantity || 0),
                            0
                        ) || 0,

                    total:
                        Number(
                            order.pricing?.total || 0
                        ),

                    payment:
                        order.paymentMethod ||
                        "—",

                    status:
                        normalizeOrderStatus(
                            order.orderStatus
                        ),

                    time:
                        order.createdAt
                            ? new Date(
                                order.createdAt
                            ).toLocaleString(
                                "en-IN"
                            )
                            : "—",

                    createdAt:
                        new Date(
                            order.createdAt
                        ).getTime(),

                    products:
                        order.items || []

                }));


            state.filteredOrders =
                [...state.allOrders];

            state.currentPage = 1;


            updateTodaySummary();

            updateStatusCounts();

            updateActiveStatusTab();

            updateFilterSummary();

            render();


            console.log(
                `[Orders] Loaded ${state.allOrders.length} real orders from backend.`
            );


        } catch (error) {

            console.error(
                "[Orders] Failed to load orders:",
                error
            );

            state.allOrders = [];

            state.filteredOrders = [];

            showEmptyState();

            showToast(
                "Error",
                error.message ||
                "Unable to load orders.",
                "error"
            );


        } finally {

            setLoading(false);

            render();

        }
    }



    /* =====================================================
       EVENT HANDLERS
    ====================================================== */

    function handleStatusTabClick(event) {

        const tab =
            event.target.closest(
                ".orders-status-tab"
            );


        if (!tab) {
            return;
        }


        const status =
            tab.dataset.status;


        setStatus(status);
    }


    function handleTableClick(event) {

        const statusButton =
            event.target.closest(
                '[data-action="update-status"]'
            );

        if (statusButton) {

            const orderId =
                statusButton.dataset.orderId;

            const newStatus =
                statusButton.dataset.newStatus;

            updateOrderStatus(
                orderId,
                newStatus
            );

            return;
        }


        const viewButton =
            event.target.closest(
                '[data-action="view-order"]'
            );

        if (!viewButton) {
            return;
        }


        const orderId =
            viewButton.dataset.orderId;


        openOrderDetails(orderId);
    }


    function handlePaginationClick(event) {

        const pageButton =
            event.target.closest(
                ".orders-page-number"
            );


        if (pageButton) {

            goToPage(
                pageButton.dataset.page
            );

            return;
        }

    }


    function bindEvents() {

        /* -----------------------------------------------
           STATUS TABS
        ------------------------------------------------ */

        if (elements.statusTabs) {

            elements.statusTabs.addEventListener(
                "click",
                handleStatusTabClick
            );

        }


        /* -----------------------------------------------
           SEARCH
        ------------------------------------------------ */

        if (elements.search) {

            elements.search.addEventListener(
                "input",
                event => {

                    handleSearch(
                        event.target.value
                    );

                }
            );

        }


        /* -----------------------------------------------
           CLEAR SEARCH
        ------------------------------------------------ */

        if (elements.clearSearch) {

            elements.clearSearch.addEventListener(
                "click",
                clearSearch
            );

        }


        /* -----------------------------------------------
           CLEAR FILTERS
        ------------------------------------------------ */

        if (elements.clearFilters) {

            elements.clearFilters.addEventListener(
                "click",
                clearFilters
            );

        }


        /* -----------------------------------------------
           TABLE / VIEW BUTTON
        ------------------------------------------------ */

        if (elements.tableBody) {

            elements.tableBody.addEventListener(
                "click",
                handleTableClick
            );

        }


        /* -----------------------------------------------
           PREVIOUS PAGE
        ------------------------------------------------ */

        if (elements.prevPage) {

            elements.prevPage.addEventListener(
                "click",
                () => {

                    goToPage(
                        state.currentPage - 1
                    );

                }
            );

        }


        /* -----------------------------------------------
           NEXT PAGE
        ------------------------------------------------ */

        if (elements.nextPage) {

            elements.nextPage.addEventListener(
                "click",
                () => {

                    goToPage(
                        state.currentPage + 1
                    );

                }
            );

        }


        /* -----------------------------------------------
           PAGE NUMBERS
        ------------------------------------------------ */

        if (elements.pageNumberList) {

            elements.pageNumberList.addEventListener(
                "click",
                handlePaginationClick
            );

        }


        /* -----------------------------------------------
           DETAILS MODAL — CLOSE BUTTON
        ------------------------------------------------ */

        if (elements.closeDetails) {

            elements.closeDetails.addEventListener(
                "click",
                closeOrderDetails
            );

        }


        /* -----------------------------------------------
           DETAILS MODAL — FOOTER CLOSE
        ------------------------------------------------ */

        if (elements.closeDetailsFooter) {

            elements.closeDetailsFooter.addEventListener(
                "click",
                closeOrderDetails
            );

        }


        /* -----------------------------------------------
           DETAILS MODAL — OVERLAY
        ------------------------------------------------ */

        if (elements.detailsOverlay) {

            elements.detailsOverlay.addEventListener(
                "click",
                closeOrderDetails
            );

        }


        /* -----------------------------------------------
           TOAST CLOSE
        ------------------------------------------------ */

        if (elements.toastClose) {

            elements.toastClose.addEventListener(
                "click",
                hideToast
            );

        }


        /* -----------------------------------------------
           KEYBOARD
        ------------------------------------------------ */

        document.addEventListener(
            "keydown",
            handleKeyboard
        );

    }


    /* =====================================================
       KEYBOARD HANDLER
    ====================================================== */

    function handleKeyboard(event) {

        /* Escape closes details modal */

        if (
            event.key === "Escape" &&
            state.selectedOrder
        ) {

            closeOrderDetails();

        }

    }


    /* =====================================================
       DEBUG
       
       Useful while integrating this module.
    ====================================================== */

    function debug() {

        console.group(
            "SNACKMENT ORDERS DEBUG"
        );


        console.log(
            "All orders:",
            state.allOrders
        );


        console.log(
            "Filtered orders:",
            state.filteredOrders
        );


        console.log(
            "Active status:",
            state.activeStatus
        );


        console.log(
            "Search:",
            state.searchTerm
        );


        console.log(
            "Current page:",
            state.currentPage
        );


        console.log(
            "Items per page:",
            CONFIG.itemsPerPage
        );


        console.log(
            "Selected order:",
            state.selectedOrder
        );


        console.groupEnd();
    }


    /* =====================================================
       INITIALIZE
    ====================================================== */

    function init() {

        console.log(
            "[Orders] Initializing Orders module..."
        );


        if (!cacheElements()) {

            console.warn(
                "[Orders] #orders-page not found. Module not initialized."
            );

            return;

        }


        if (!validateElements()) {

            console.error(
                "[Orders] Required DOM elements are missing. Initialization stopped."
            );

            return;

        }


        bindEvents();


        loadOrders();


        window.OrdersModule =
            OrdersModule;


        console.log(
            "[Orders] Orders module initialized successfully."
        );

    }


    /* =====================================================
       PUBLIC API
    ====================================================== */

    return {

        init,

        loadOrders,

        render,

        setStatus,

        clearFilters,

        clearSearch,

        openOrderDetails,

        closeOrderDetails,

        showToast,

        debug,

        getState: () => ({
            ...state,
            allOrders: [...state.allOrders],
            filteredOrders: [...state.filteredOrders]
        })

    };

})();


/* =========================================================
   02. MODULE START
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => OrdersModule.init(),
        { once: true }
    );

} else {

    OrdersModule.init();

}