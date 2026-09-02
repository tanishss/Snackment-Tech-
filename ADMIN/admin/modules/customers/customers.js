/* =========================================================
   SNACKMENT ADMIN
   CUSTOMERS MODULE
   ---------------------------------------------------------
   File:
   ADMIN/admin/modules/customers/customers.js

   PURPOSE:
   - Initialize Customers module
   - Maintain customer data
   - Render customer table
   - Update statistics
   - Update registered-customer count
   - Handle empty state
   - Search-ready
   - Status-filter-ready
   - Customer pagination
   - Keep DOM selectors aligned with customers.html

   IMPORTANT:
   - No dependency on Products JS
   - No dependency on Orders JS
   - No inline HTML page replacement
   - No SVG injection
   - No backend endpoint assumed yet
========================================================= */


/* =========================================================
   1. CUSTOMERS MODULE
========================================================= */

const CustomersModule = (() => {

    "use strict";


    /* =====================================================
       1.1 CUSTOMER DATA
       -----------------------------------------------------
       Temporary frontend testing data.

       Later this exact structure can be populated from
       backend / MongoDB API.
    ====================================================== */

    let customers = [];


    /* =====================================================
       1.2 PAGINATION STATE
    ====================================================== */

    const pagination = {

        currentPage: 1,

        pageSize: 8

    };


    /* =====================================================
       1.3 CURRENT DISPLAYED DATA
       -----------------------------------------------------
       This is extremely important.

       `customers`
           = complete customer dataset

       `displayedCustomers`
           = currently filtered/search result

       Pagination must work on displayedCustomers,
       otherwise searching/filtering would break pagination.
    ====================================================== */

    let displayedCustomers = [...customers];


    /* =====================================================
       2. DOM REFERENCES
       -----------------------------------------------------
       Everything here directly matches customers.html.
    ====================================================== */

    const elements = {

        page:
            document.getElementById("customers-page"),


        countText:
            document.getElementById("customers-count-text"),


        stats:
            document.getElementById("customers-stats"),


        totalCustomers:
            document.getElementById("stat-total-customers"),


        activeToday:
            document.getElementById("stat-active-today"),


        newThisWeek:
            document.getElementById("stat-new-this-week"),


        averageOrderValue:
            document.getElementById("stat-average-order-value"),


        table:
            document.getElementById("customers-table"),


        tableBody:
            document.getElementById("customers-table-body"),


        emptyState:
            document.getElementById("customers-empty-state"),


        /* =================================================
           PAGINATION ELEMENTS
        ================================================== */

        paginationContainer:
            document.getElementById("customers-pagination"),


        paginationStart:
            document.getElementById("customers-pagination-start"),


        paginationEnd:
            document.getElementById("customers-pagination-end"),


        paginationTotal:
            document.getElementById("customers-pagination-total"),


        paginationPrevious:
            document.getElementById("customers-pagination-prev"),


        paginationNext:
            document.getElementById("customers-pagination-next")

    };


    /* =====================================================
       3. VALIDATION OF REQUIRED DOM
    ====================================================== */

    function validateDOM() {

        const requiredElements = [

            ["customers-page", elements.page],

            ["customers-count-text", elements.countText],

            ["stat-total-customers", elements.totalCustomers],

            ["stat-active-today", elements.activeToday],

            ["stat-new-this-week", elements.newThisWeek],

            ["stat-average-order-value", elements.averageOrderValue],

            ["customers-table", elements.table],

            ["customers-table-body", elements.tableBody],

            ["customers-empty-state", elements.emptyState]

        ];


        const missing = requiredElements
            .filter(([, element]) => !element)
            .map(([id]) => `#${id}`);


        if (missing.length > 0) {

            console.error(
                "[Customers] Missing required DOM elements:",
                missing
            );

            return false;
        }


        /*
         * Pagination is intentionally not included in the
         * REQUIRED list.

         * This means the Customers page will still work if
         * pagination HTML has not been inserted yet.

         * We simply warn about missing pagination elements.
         */

        const paginationElements = [

            ["customers-pagination", elements.paginationContainer],

            ["customers-pagination-start", elements.paginationStart],

            ["customers-pagination-end", elements.paginationEnd],

            ["customers-pagination-total", elements.paginationTotal],

            ["customers-pagination-prev", elements.paginationPrevious],

            ["customers-pagination-next", elements.paginationNext]

        ];


        const missingPagination =
            paginationElements
                .filter(([, element]) => !element)
                .map(([id]) => `#${id}`);


        if (missingPagination.length > 0) {

            console.warn(
                "[Customers] Pagination elements missing:",
                missingPagination
            );

        }


        return true;
    }


    /* =====================================================
       4. FORMAT CURRENCY
    ====================================================== */

    function formatCurrency(value) {

        const numericValue =
            Number(value);


        if (!Number.isFinite(numericValue)) {

            return "₹0";

        }


        return `₹${numericValue.toLocaleString("en-IN")}`;
    }
    /* =====================================================
   LOAD CUSTOMERS FROM BACKEND
===================================================== */

    async function loadCustomers() {

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
                    "http://localhost:5001/api/admin/customers",
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
                    "Failed to load customers."
                );

            }


            customers =
                (data.customers || [])
                    .map(customer => {

                        const name =
                            customer.name ||
                            "Unknown Customer";


                        const initials =
                            name
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map(
                                    word =>
                                        word.charAt(0)
                                )
                                .join("")
                                .toUpperCase();


                        return {

                            id:
                                customer._id,

                            name,

                            initials,

                            room:
                                customer.room ||
                                "—",

                            phone:
                                customer.phone ||
                                "—",

                            totalOrders:
                                Number(
                                    customer.totalOrders
                                ) || 0,

                            totalSpent:
                                Number(
                                    customer.totalSpent
                                ) || 0,

                            createdAt:
                                customer.createdAt,

                            lastOrderDate:
                                customer.lastOrderDate,
                                
                            lastOrder:
                                customer.lastOrderDate
                                    ? formatLastOrder(
                                        customer.lastOrderDate
                                    )
                                    : "Never",

                            status:
                                "active",

                            avatarClass:
                                getAvatarClass(
                                    customer._id
                                )

                        };

                    });


            displayedCustomers =
                [...customers];


            pagination.currentPage =
                1;


            renderCustomers(
                displayedCustomers
            );


            updateStatistics();


            console.log(
                `[Customers] Loaded ${customers.length} customers from backend.`
            );


        } catch (error) {

            console.error(
                "[Customers] Failed to load customers:",
                error
            );


            customers = [];

            displayedCustomers = [];


            pagination.currentPage =
                1;


            renderCustomers(
                displayedCustomers
            );

        }

    }
    /* =====================================================
       FORMAT LAST ORDER
    ===================================================== */

    function formatLastOrder(date) {

        const timestamp =
            new Date(date).getTime();

        if (
            !Number.isFinite(timestamp)
        ) {

            return "Never";

        }


        const difference =
            Date.now() -
            timestamp;


        const minutes =
            Math.floor(
                difference /
                (1000 * 60)
            );


        if (minutes < 1) {

            return "Just now";

        }


        if (minutes < 60) {

            return `${minutes}m ago`;

        }


        const hours =
            Math.floor(
                minutes / 60
            );


        if (hours < 24) {

            return `${hours}h ago`;

        }


        const days =
            Math.floor(
                hours / 24
            );


        if (days < 7) {

            return `${days}d ago`;

        }


        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "short"
                }
            );

    }


    /* =====================================================
       AVATAR CLASS
    ===================================================== */

    function getAvatarClass(id) {

        const classes = [

            "customers-avatar-green",

            "customers-avatar-blue",

            "customers-avatar-orange",

            "customers-avatar-red",

            "customers-avatar-purple",

            "customers-avatar-pink",

            "customers-avatar-teal",

            "customers-avatar-orange-alt"

        ];


        let hash = 0;


        String(id || "")
            .split("")
            .forEach(char => {

                hash =
                    char.charCodeAt(0) +
                    ((hash << 5) - hash);

            });


        return classes[
            Math.abs(hash) %
            classes.length
        ];

    }
    /* =====================================================
       5. ESCAPE HTML
       -----------------------------------------------------
       Important for backend data later.
    ====================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

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
       6. NORMALIZE STATUS
    ====================================================== */

    function normalizeStatus(status) {

        if (!status) {

            return "inactive";

        }


        const normalized =
            String(status)
                .trim()
                .toLowerCase();


        return normalized === "active"
            ? "active"
            : "inactive";
    }


    /* =====================================================
       7. STATUS LABEL
    ====================================================== */

    function getStatusLabel(status) {

        return normalizeStatus(status) === "active"
            ? "Active"
            : "Inactive";
    }


    /* =====================================================
       8. STATUS CLASS
    ====================================================== */

    function getStatusClass(status) {

        return normalizeStatus(status) === "active"
            ? "customers-status-active"
            : "customers-status-inactive";
    }


    /* =====================================================
       9. CUSTOMER ROW GENERATOR
    ====================================================== */

    function createCustomerRow(customer) {

        const safeId =
            escapeHTML(customer.id);


        const safeName =
            escapeHTML(customer.name);


        const safeInitials =
            escapeHTML(customer.initials);


        const safeRoom =
            escapeHTML(customer.room);


        const safePhone =
            escapeHTML(customer.phone);


        const safeLastOrder =
            escapeHTML(customer.lastOrder);


        const avatarClass =
            customer.avatarClass ||
            "customers-avatar-green";


        const status =
            normalizeStatus(
                customer.status
            );


        const statusClass =
            getStatusClass(status);


        const statusLabel =
            getStatusLabel(status);


        const totalOrders =
            Number.isFinite(
                Number(customer.totalOrders)
            )
                ? Number(customer.totalOrders)
                : 0;


        const totalSpent =
            Number.isFinite(
                Number(customer.totalSpent)
            )
                ? Number(customer.totalSpent)
                : 0;


        return `

            <tr
                class="customers-table-row"
                data-customer-id="${safeId}"
            >

                <td class="customers-cell customers-cell-customer">

                    <div class="customers-customer-info">

                        <div
                            class="customers-avatar ${avatarClass}"
                            aria-hidden="true"
                        >
                            ${safeInitials}
                        </div>


                        <div class="customers-customer-details">

                            <p class="customers-customer-name">
                                ${safeName}
                            </p>

                        </div>

                    </div>

                </td>


                <td class="customers-cell customers-cell-room">

                    <span class="customers-room">
                        ${safeRoom}
                    </span>

                </td>


                <td class="customers-cell customers-cell-phone">

                    <span class="customers-phone">
                        ${safePhone}
                    </span>

                </td>


                <td class="customers-cell customers-cell-orders">

                    <span class="customers-orders-count">
                        ${totalOrders}
                    </span>

                </td>


                <td class="customers-cell customers-cell-spent">

                    <span class="customers-spent">
                        ${formatCurrency(totalSpent)}
                    </span>

                </td>


                <td class="customers-cell customers-cell-last-order">

                    <span class="customers-last-order">
                        ${safeLastOrder}
                    </span>

                </td>


                <td class="customers-cell customers-cell-status">

                    <span
                        class="customers-status ${statusClass}"
                        data-status="${status}"
                    >
                        ${statusLabel}
                    </span>

                </td>

            </tr>

        `;
    }


    /* =====================================================
       10. UPDATE PAGINATION
    ====================================================== */

    function updatePagination(
        totalItems,
        startIndex = 0,
        endIndex = 0
    ) {

        /*
         * If pagination HTML doesn't exist yet,
         * simply do nothing.
         */

        if (
            !elements.paginationContainer ||
            !elements.paginationStart ||
            !elements.paginationEnd ||
            !elements.paginationTotal ||
            !elements.paginationPrevious ||
            !elements.paginationNext
        ) {

            return;
        }


        /* =================================================
           NO RESULTS
        ================================================= */

        if (totalItems <= 0) {

            elements.paginationStart.textContent =
                "0";


            elements.paginationEnd.textContent =
                "0";


            elements.paginationTotal.textContent =
                "0";


            elements.paginationPrevious.disabled =
                true;


            elements.paginationNext.disabled =
                true;


            return;
        }


        /* =================================================
           DISPLAY RANGE
        ================================================= */

        const displayStart =
            startIndex + 1;


        const displayEnd =
            endIndex;


        const totalPages =
            Math.ceil(
                totalItems /
                pagination.pageSize
            );


        /* =================================================
           UPDATE TEXT
        ================================================= */

        elements.paginationStart.textContent =
            displayStart.toLocaleString(
                "en-IN"
            );


        elements.paginationEnd.textContent =
            displayEnd.toLocaleString(
                "en-IN"
            );


        elements.paginationTotal.textContent =
            totalItems.toLocaleString(
                "en-IN"
            );


        /* =================================================
           PREVIOUS BUTTON
        ================================================= */

        elements.paginationPrevious.disabled =
            pagination.currentPage <= 1;


        /* =================================================
           NEXT BUTTON
        ================================================= */

        elements.paginationNext.disabled =
            pagination.currentPage >= totalPages;

    }


    /* =====================================================
       11. RENDER CUSTOMER TABLE
       ===================================================== */

    function renderCustomers(
        list = displayedCustomers
    ) {

        if (!elements.tableBody) {

            return;

        }


        /* =================================================
           SAFETY
        ================================================= */

        if (!Array.isArray(list)) {

            list = [];

        }


        /*
         * Keep the currently displayed dataset synchronized.
         */

        displayedCustomers =
            [...list];


        /* =================================================
           TOTAL PAGES
        ================================================= */

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    displayedCustomers.length /
                    pagination.pageSize
                )
            );


        /*
         * If a filter/search causes the current page
         * to become invalid, move back to the last page.
         */

        if (
            pagination.currentPage >
            totalPages
        ) {

            pagination.currentPage =
                totalPages;

        }


        /* =================================================
           CLEAR ONLY TABLE BODY
        ================================================= */

        elements.tableBody.innerHTML = "";


        /* =================================================
           EMPTY STATE
        ================================================= */

        if (
            displayedCustomers.length === 0
        ) {

            showEmptyState();

            updatePagination(0);

            return;

        }


        hideEmptyState();


        /* =================================================
           CURRENT PAGE RANGE
        ================================================= */

        const startIndex =
            (
                pagination.currentPage - 1
            ) *
            pagination.pageSize;


        const endIndex =
            Math.min(
                startIndex +
                pagination.pageSize,
                displayedCustomers.length
            );


        /* =================================================
           CURRENT PAGE CUSTOMERS
        ================================================= */

        const visibleCustomers =
            displayedCustomers.slice(
                startIndex,
                endIndex
            );


        /* =================================================
           CREATE ROWS
        ================================================= */

        const fragment =
            document.createDocumentFragment();


        visibleCustomers.forEach(
            customer => {

                const template =
                    document.createElement(
                        "template"
                    );


                template.innerHTML =
                    createCustomerRow(
                        customer
                    ).trim();


                const row =
                    template
                        .content
                        .firstElementChild;


                if (row) {

                    fragment.appendChild(
                        row
                    );

                }

            }
        );


        elements.tableBody.appendChild(
            fragment
        );


        /* =================================================
           UPDATE PAGINATION
        ================================================= */

        updatePagination(
            displayedCustomers.length,
            startIndex,
            endIndex
        );

    }


    /* =====================================================
       12. GO TO PAGE
    ===================================================== */

    function goToPage(page) {

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    displayedCustomers.length /
                    pagination.pageSize
                )
            );


        let requestedPage =
            Number(page);


        if (
            !Number.isFinite(
                requestedPage
            )
        ) {

            requestedPage = 1;

        }


        requestedPage =
            Math.floor(
                requestedPage
            );


        /*
         * Clamp page between first and last page.
         */

        requestedPage =
            Math.max(
                1,
                Math.min(
                    requestedPage,
                    totalPages
                )
            );


        /*
         * Nothing to change.
         */

        if (
            requestedPage ===
            pagination.currentPage
        ) {

            renderCustomers(
                displayedCustomers
            );

            return;

        }


        pagination.currentPage =
            requestedPage;


        renderCustomers(
            displayedCustomers
        );

    }


    /* =====================================================
       13. NEXT PAGE
    ===================================================== */

    function nextPage() {

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    displayedCustomers.length /
                    pagination.pageSize
                )
            );


        if (
            pagination.currentPage >=
            totalPages
        ) {

            return;

        }


        pagination.currentPage++;


        renderCustomers(
            displayedCustomers
        );

    }


    /* =====================================================
       14. PREVIOUS PAGE
    ===================================================== */

    function previousPage() {

        if (
            pagination.currentPage <= 1
        ) {

            return;

        }


        pagination.currentPage--;


        renderCustomers(
            displayedCustomers
        );

    }


    /* =====================================================
       15. SHOW EMPTY STATE
    ===================================================== */

    function showEmptyState() {

        if (!elements.emptyState) {

            return;

        }


        elements.emptyState.classList.remove(
            "hidden"
        );

    }


    /* =====================================================
       16. HIDE EMPTY STATE
    ===================================================== */

    function hideEmptyState() {

        if (!elements.emptyState) {

            return;

        }


        elements.emptyState.classList.add(
            "hidden"
        );

    }


    /* =====================================================
       17. CALCULATE AVERAGE ORDER VALUE
       -----------------------------------------------------
       Average Order Value =
       Total Customer Spend / Total Orders
    ====================================================== */

    function calculateAverageOrderValue(
        list
    ) {

        if (
            !Array.isArray(list) ||
            list.length === 0
        ) {

            return 0;

        }


        let totalSpent = 0;

        let totalOrders = 0;


        list.forEach(
            customer => {

                const spent =
                    Number(
                        customer.totalSpent
                    );


                const orders =
                    Number(
                        customer.totalOrders
                    );


                if (
                    Number.isFinite(
                        spent
                    )
                ) {

                    totalSpent +=
                        spent;

                }


                if (
                    Number.isFinite(
                        orders
                    ) &&
                    orders > 0
                ) {

                    totalOrders +=
                        orders;

                }

            }
        );


        if (
            totalOrders <= 0
        ) {

            return 0;

        }


        return Math.round(
            totalSpent /
            totalOrders
        );

    }


    /* =====================================================
       18. UPDATE STATISTICS
    ====================================================== */
    function updateStatistics() {

        const totalCustomers =
            customers.length;


        /* =================================================
           ACTIVE TODAY
           -------------------------------------------------
           Customer is active today if their latest order
           was placed today.
        ================================================== */

        const now =
            new Date();


        const startOfToday =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );


        const startOfTomorrow =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1
            );


        const activeToday =
            customers.filter(
                customer => {

                    if (
                        !customer.lastOrderDate
                    ) {

                        return false;

                    }


                    const lastOrder =
                        new Date(
                            customer.lastOrderDate
                        );


                    return (
                        lastOrder >= startOfToday &&
                        lastOrder < startOfTomorrow
                    );

                }
            ).length;


        /* =================================================
           NEW THIS WEEK
           -------------------------------------------------
           Monday → Sunday
        ================================================== */

        const startOfWeek =
            new Date(now);


        const day =
            startOfWeek.getDay();


        const daysFromMonday =
            day === 0
                ? 6
                : day - 1;


        startOfWeek.setDate(
            startOfWeek.getDate() -
            daysFromMonday
        );


        startOfWeek.setHours(
            0,
            0,
            0,
            0
        );


        const newThisWeek =
            customers.filter(
                customer => {

                    if (
                        !customer.createdAt
                    ) {

                        return false;

                    }


                    const createdAt =
                        new Date(
                            customer.createdAt
                        );


                    return (
                        createdAt >= startOfWeek
                    );

                }
            ).length;


        /* =================================================
           AVERAGE ORDER VALUE
        ================================================== */

        const averageOrderValue =
            calculateAverageOrderValue(
                customers
            );


        /* =================================================
           UPDATE TOTAL CUSTOMERS
        ================================================== */

        if (
            elements.totalCustomers
        ) {

            elements.totalCustomers.textContent =
                totalCustomers.toLocaleString(
                    "en-IN"
                );

        }


        /* =================================================
           UPDATE ACTIVE TODAY
        ================================================== */

        if (
            elements.activeToday
        ) {

            elements.activeToday.textContent =
                activeToday.toLocaleString(
                    "en-IN"
                );

        }


        /* =================================================
           UPDATE NEW THIS WEEK
        ================================================== */

        if (
            elements.newThisWeek
        ) {

            elements.newThisWeek.textContent =
                newThisWeek.toLocaleString(
                    "en-IN"
                );

        }


        /* =================================================
           UPDATE AVERAGE ORDER VALUE
        ================================================== */

        if (
            elements.averageOrderValue
        ) {

            elements.averageOrderValue.textContent =
                formatCurrency(
                    averageOrderValue
                );

        }


        /* =================================================
           REGISTERED CUSTOMER TEXT
        ================================================== */

        if (
            elements.countText
        ) {

            elements.countText.textContent =
                `${totalCustomers} registered customer${totalCustomers === 1 ? "" : "s"}`;

        }

    }
    /* =====================================================
       19. SEARCH CUSTOMERS
       -----------------------------------------------------
       Search is performed against complete customer data.

       Result is stored in displayedCustomers so pagination
       continues to work correctly after searching.
    ====================================================== */

    function search(query) {

        const normalizedQuery =
            String(query || "")
                .trim()
                .toLowerCase();


        /* =================================================
           CLEAR SEARCH
        ================================================= */

        if (
            !normalizedQuery
        ) {

            pagination.currentPage =
                1;


            displayedCustomers =
                [...customers];


            renderCustomers(
                displayedCustomers
            );


            return [
                ...displayedCustomers
            ];

        }


        /* =================================================
           FILTER
        ================================================= */

        const filtered =
            customers.filter(
                customer => {

                    const searchableText = [

                        customer.name,

                        customer.initials,

                        customer.room,

                        customer.phone,

                        customer.id,

                        customer.status

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchableText.includes(
                        normalizedQuery
                    );

                }
            );


        /* =================================================
           RESET PAGE
           ------------------------------------------------
           Every new search starts from page 1.
        ================================================= */

        pagination.currentPage =
            1;


        displayedCustomers =
            filtered;


        renderCustomers(
            displayedCustomers
        );


        return [
            ...filtered
        ];

    }


    /* =====================================================
       20. FILTER BY STATUS
    ===================================================== */

    function filterByStatus(status) {

        const normalizedStatus =
            String(status || "")
                .trim()
                .toLowerCase();


        /* =================================================
           ALL
        ================================================= */

        if (
            !normalizedStatus ||
            normalizedStatus === "all"
        ) {

            pagination.currentPage =
                1;


            displayedCustomers =
                [...customers];


            renderCustomers(
                displayedCustomers
            );


            return [
                ...displayedCustomers
            ];

        }


        /* =================================================
           FILTER
        ================================================= */

        const filtered =
            customers.filter(
                customer =>
                    normalizeStatus(
                        customer.status
                    ) === normalizedStatus
            );


        pagination.currentPage =
            1;


        displayedCustomers =
            filtered;


        renderCustomers(
            displayedCustomers
        );


        return [
            ...filtered
        ];

    }


    /* =====================================================
       21. GET CUSTOMER BY ID
    ====================================================== */

    function getCustomerById(id) {

        if (!id) {

            return null;

        }


        return customers.find(
            customer =>
                customer.id === id
        ) || null;

    }


    /* =====================================================
       22. UPDATE CUSTOMER
    ====================================================== */

    function updateCustomer(
        id,
        updates = {}
    ) {

        const index =
            customers.findIndex(
                customer =>
                    customer.id === id
            );


        if (
            index === -1
        ) {

            console.warn(
                "[Customers] Customer not found:",
                id
            );


            return false;

        }


        customers[index] = {

            ...customers[index],

            ...updates

        };


        /*
         * Rebuild displayed dataset.

         * This keeps current search/filter state
         * synchronized as much as possible.
         */

        displayedCustomers =
            displayedCustomers.map(
                customer =>
                    customer.id === id
                        ? customers[index]
                        : customer
            );


        /*
         * If the customer wasn't currently displayed,
         * simply keep displayedCustomers unchanged.
         */

        renderCustomers(
            displayedCustomers
        );


        updateStatistics();


        return true;

    }


    /* =====================================================
       23. ADD CUSTOMER
    ====================================================== */

    function addCustomer(
        customer
    ) {

        if (
            !customer ||
            typeof customer !== "object"
        ) {

            console.warn(
                "[Customers] Invalid customer data."
            );


            return false;

        }


        if (!customer.id) {

            console.warn(
                "[Customers] Customer ID is required."
            );


            return false;

        }


        const alreadyExists =
            customers.some(
                existing =>
                    existing.id ===
                    customer.id
            );


        if (
            alreadyExists
        ) {

            console.warn(
                "[Customers] Customer already exists:",
                customer.id
            );


            return false;

        }


        customers.push(
            customer
        );


        /*
         * New customer becomes part of
         * the current displayed dataset.
         */

        displayedCustomers.push(
            customer
        );


        /*
         * Re-render from first page.

         * This is predictable for an admin UI.
         */

        pagination.currentPage =
            1;


        renderCustomers(
            displayedCustomers
        );


        updateStatistics();


        return true;

    }


    /* =====================================================
       24. REMOVE CUSTOMER
    ====================================================== */

    function removeCustomer(
        id
    ) {

        const previousLength =
            customers.length;


        customers =
            customers.filter(
                customer =>
                    customer.id !== id
            );


        if (
            customers.length ===
            previousLength
        ) {

            console.warn(
                "[Customers] Customer not found:",
                id
            );


            return false;

        }


        displayedCustomers =
            displayedCustomers.filter(
                customer =>
                    customer.id !== id
            );


        /*
         * Make sure current page still exists.
         */

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    displayedCustomers.length /
                    pagination.pageSize
                )
            );


        if (
            pagination.currentPage >
            totalPages
        ) {

            pagination.currentPage =
                totalPages;

        }


        renderCustomers(
            displayedCustomers
        );


        updateStatistics();


        return true;

    }


    /* =====================================================
       25. ROW CLICK HANDLER
       -----------------------------------------------------
       View functionality isn't implemented yet.

       This only detects selected customer.
    ====================================================== */

    function handleTableClick(
        event
    ) {

        const row =
            event.target.closest(
                ".customers-table-row"
            );


        if (!row) {

            return;

        }


        const customerId =
            row.dataset.customerId;


        if (!customerId) {

            return;

        }


        const customer =
            getCustomerById(
                customerId
            );


        if (!customer) {

            return;

        }


        /*
         * Future flow:
         *
         * Customer Row
         *       ↓
         * View Customer
         *       ↓
         * Customer Details
         *       ↓
         * Orders
         *       ↓
         * Edit / Status / etc.
         */

        console.log(
            "[Customers] Customer selected:",
            customer
        );

    }


    /* =====================================================
       26. PAGINATION EVENT HANDLERS
    ====================================================== */

    function bindPaginationEvents() {

        /* =================================================
           PREVIOUS
        ================================================= */

        if (
            elements.paginationPrevious
        ) {

            elements.paginationPrevious.addEventListener(
                "click",
                previousPage
            );

        }


        /* =================================================
           NEXT
        ================================================= */

        if (
            elements.paginationNext
        ) {

            elements.paginationNext.addEventListener(
                "click",
                nextPage
            );

        }

    }


    /* =====================================================
       27. EVENT LISTENERS
    ====================================================== */

    function bindEvents() {

        /* =================================================
           TABLE
        ================================================= */

        if (
            elements.tableBody
        ) {

            elements.tableBody.addEventListener(
                "click",
                handleTableClick
            );

        }


        /* =================================================
           PAGINATION
        ================================================= */

        bindPaginationEvents();

    }


    /* =====================================================
       28. INITIALIZE MODULE
    ====================================================== */

    function init() {

        console.log(
            "[Customers] Initializing Customers module..."
        );


        /* =================================================
           VALIDATE DOM
        ================================================= */

        if (
            !validateDOM()
        ) {

            console.error(
                "[Customers] Initialization stopped because required DOM elements are missing."
            );


            return false;

        }


        /* =================================================
           RESET DATA VIEW
        ================================================= */
        pagination.currentPage =
            1;

        bindEvents();

        loadCustomers();


        console.log(
            "[Customers] Customers module initialized successfully."
        );


        return true;

    }


    /* =====================================================
       29. PUBLIC API
    ====================================================== */

    return {

        init,

        getCustomers: () =>
            [...customers],


        getDisplayedCustomers: () =>
            [...displayedCustomers],


        getCustomerById,


        search,

        filterByStatus,


        addCustomer,


        updateCustomer,


        removeCustomer,


        renderCustomers,


        updateStatistics,


        /* =================================================
           PAGINATION PUBLIC METHODS
        ================================================== */

        goToPage,

        nextPage,

        previousPage,


        getCurrentPage: () =>
            pagination.currentPage,


        getTotalPages: () =>
            Math.max(
                1,
                Math.ceil(
                    displayedCustomers.length /
                    pagination.pageSize
                )
            )

    };

})();


/* =========================================================
   30. SAFE INITIALIZATION
   ---------------------------------------------------------
   Handles both:

   - JS loaded before DOM
   - JS loaded after DOM
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            CustomersModule.init();

        },
        {
            once: true
        }
    );

} else {

    CustomersModule.init();

}


/* =========================================================
   31. GLOBAL DEBUG ACCESS
   ---------------------------------------------------------
   Browser console examples:

   CustomersModule.getCustomers()

   CustomersModule.getDisplayedCustomers()

   CustomersModule.search("arjun")

   CustomersModule.filterByStatus("active")

   CustomersModule.getCustomerById("customer-001")

   CustomersModule.nextPage()

   CustomersModule.previousPage()

   CustomersModule.goToPage(2)

   CustomersModule.getCurrentPage()

   CustomersModule.getTotalPages()
========================================================= */

window.CustomersModule =
    CustomersModule;


/* =========================================================
   END CUSTOMERS JS
========================================================= */