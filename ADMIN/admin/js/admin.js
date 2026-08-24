/* ==========================================================
   SNACKMENT ADMIN
   Main Controller
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeAdminPanel();
});


/* ==========================================================
   ADMIN INITIALIZATION
========================================================== */

async function initializeAdminPanel() {

    const sidebar =
        document.getElementById("sidebar");

    const topbar =
        document.getElementById("topbar");

    const pageContent =
        document.getElementById("page-content");


    if (!sidebar || !topbar || !pageContent) {

        console.error(
            "[Admin] Required layout containers are missing."
        );

        return;
    }


    /* --------------------------------------------------------
       LOAD SHARED COMPONENTS
    -------------------------------------------------------- */

    await Promise.all([

        loadComponent(
            sidebar,
            "components/sidebar.component"
        ),

        loadComponent(
            topbar,
            "components/topbar.component"
        )

    ]);


    /* --------------------------------------------------------
       INITIALIZE SHARED UI
    -------------------------------------------------------- */

    initializeNavigation();
    initializePageHeading();
    initializeMobileSidebar();
    initializeNotifications();
    initializeSignOut();


    /* --------------------------------------------------------
       LOAD CURRENT MODULE
    -------------------------------------------------------- */

    await loadPage(
        getCurrentPage()
    );
}


/* ==========================================================
   COMPONENT LOADER
========================================================== */

async function loadComponent(container, path) {

    try {

        const response =
            await fetch(
                `${path}?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load component: ${path} (${response.status})`
            );

        }


        const html =
            await response.text();


        container.innerHTML =
            html;


        console.log(
            `[Admin] Loaded: ${path}`,
            `\nLength: ${html.length}`
        );


        return true;

    } catch (error) {

        console.error(
            `[Admin] Component load failed: ${path}`,
            error
        );


        container.innerHTML =
            "";


        return false;
    }
}


/* ==========================================================
   CURRENT PAGE
========================================================== */

function getCurrentPage() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const queryPage =
        params.get("page");


    const validPages = [
        "dashboard",
        "products",
        "orders",
        "customers",
        "coupons",
        "analytics",
        "settings"
    ];


    if (
        queryPage &&
        validPages.includes(queryPage)
    ) {

        return queryPage;
    }


    return "dashboard";
}


/* ==========================================================
   PAGE ROUTES
========================================================== */

const pageRoutes = {

    dashboard:
        "modules/dashboard/dashboard.html",

    products:
        "modules/products/products.html",

    orders:
        "modules/orders/orders.html",

    customers:
        "modules/customers/customers.html",

    coupons:
        "modules/coupons/coupons.html",

    analytics:
        "modules/analytics/analytics.html",

    settings:
        "modules/settings/settings.html"

};


/* ==========================================================
   PAGE ASSETS
========================================================== */

const pageAssets = {

    dashboard: {
        css: "modules/dashboard/dashboard.css",
        js: "modules/dashboard/dashboard.js"
    },

    products: {
        css: "modules/products/products.css",
        js: "modules/products/products.js"
    },

    orders: {
        css: "modules/orders/orders.css",
        js: "modules/orders/orders.js"
    },

    customers: {
        css: "modules/customers/customers.css",
        js: "modules/customers/customers.js"
    },

    coupons: {
        css: "modules/coupons/coupons.css",
        js: "modules/coupons/coupons.js"
    },

    analytics: {
        css: "modules/analytics/analytics.css",
        js: "modules/analytics/analytics.js"
    },

    settings: {
        css: "modules/settings/settings.css",
        js: "modules/settings/settings.js"
    }

};


/* ==========================================================
   LOAD PAGE
========================================================== */

async function loadPage(page) {

    const pageContent =
        document.getElementById(
            "page-content"
        );


    if (!pageContent) {

        console.error(
            "[Admin] #page-content not found."
        );

        return;
    }


    const pagePath =
        pageRoutes[page];


    if (!pagePath) {

        console.error(
            `[Admin] No route found for: ${page}`
        );

        return;
    }


    /* --------------------------------------------------------
       LOADING STATE
    -------------------------------------------------------- */

    pageContent.innerHTML = `
        <div class="page-loading">
            <span class="page-loading-spinner"></span>
        </div>
    `;


    try {

        const response =
            await fetch(
                `${pagePath}?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load page: ${pagePath} (${response.status})`
            );

        }


        const html =
            await response.text();


        pageContent.innerHTML =
            html;


        console.log(
            `[Admin] Loaded page: ${pagePath}`,
            `\nLength: ${html.length}`
        );


        await loadPageAssets(
            page
        );

    } catch (error) {

        console.error(
            `[Admin] Page load failed: ${pagePath}`,
            error
        );


        pageContent.innerHTML = `
            <div class="page-error">
                <h2>Unable to load page</h2>
                <p>
                    Something went wrong while loading
                    this section of the admin panel.
                </p>
            </div>
        `;
    }
}


/* ==========================================================
   LOAD PAGE ASSETS
========================================================== */

async function loadPageAssets(page) {

    const assets =
        pageAssets[page];


    if (!assets) {
        return;
    }


    if (assets.css) {

        await loadPageStylesheet(
            assets.css
        );
    }


    if (assets.js) {

        await loadPageScript(
            assets.js
        );
    }
}


/* ==========================================================
   LOAD PAGE CSS
========================================================== */

function loadPageStylesheet(path) {

    return new Promise((resolve) => {

        const existing =
            document.querySelector(
                `link[data-page-css="${path}"]`
            );


        if (existing) {

            resolve();

            return;
        }


        const stylesheet =
            document.createElement(
                "link"
            );


        stylesheet.rel =
            "stylesheet";


        stylesheet.href =
            `${path}?v=${Date.now()}`;


        stylesheet.dataset.pageCss =
            path;


        stylesheet.onload =
            () => {

                console.log(
                    `[Admin] Loaded CSS: ${path}`
                );

                resolve();
            };


        stylesheet.onerror =
            () => {

                console.error(
                    `[Admin] Failed to load CSS: ${path}`
                );

                resolve();
            };


        document.head.appendChild(
            stylesheet
        );

    });
}


/* ==========================================================
   LOAD PAGE JS
========================================================== */

function loadPageScript(path) {

    return new Promise((resolve) => {

        const existing =
            document.querySelector(
                `script[data-page-js="${path}"]`
            );


        if (existing) {

            resolve();

            return;
        }


        const script =
            document.createElement(
                "script"
            );


        script.src =
            `${path}?v=${Date.now()}`;


        script.dataset.pageJs =
            path;


        script.onload =
            () => {

                console.log(
                    `[Admin] Loaded JS: ${path}`
                );

                resolve();
            };


        script.onerror =
            () => {

                console.error(
                    `[Admin] Failed to load JS: ${path}`
                );

                resolve();
            };


        document.body.appendChild(
            script
        );

    });
}


/* ==========================================================
   NAVIGATION
========================================================== */

function initializeNavigation() {

    const navigationItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navigationItems.forEach(
        (item) => {

            const page =
                item.dataset.page;


            item.classList.toggle(
                "active",
                page === getCurrentPage()
            );


            item.addEventListener(
                "click",
                () => {

                    navigateToPage(
                        page
                    );

                }
            );

        }
    );
}


/* ==========================================================
   NAVIGATE TO PAGE
========================================================== */

async function navigateToPage(page) {

    if (!pageRoutes[page]) {

        console.error(
            `[Admin] No route found for: ${page}`
        );

        return;
    }


    /* --------------------------------------------------------
       UPDATE ACTIVE NAVIGATION
    -------------------------------------------------------- */

    document
        .querySelectorAll(".nav-item")
        .forEach(
            (item) => {

                item.classList.toggle(
                    "active",
                    item.dataset.page === page
                );

            }
        );


    /* --------------------------------------------------------
       UPDATE URL
    -------------------------------------------------------- */

    const url =
        `admin.html?page=${page}`;


    window.history.pushState(
        {
            page: page
        },
        "",
        url
    );


    /* --------------------------------------------------------
       UPDATE HEADING
    -------------------------------------------------------- */

    updatePageHeading(
        page
    );


    /* --------------------------------------------------------
       CLOSE MOBILE SIDEBAR
    -------------------------------------------------------- */

    closeMobileSidebar();


    /* --------------------------------------------------------
       LOAD MODULE
    -------------------------------------------------------- */

    await loadPage(
        page
    );
}


/* ==========================================================
   PAGE HEADING
========================================================== */

function initializePageHeading() {

    updatePageHeading(
        getCurrentPage()
    );
}


/* ==========================================================
   UPDATE PAGE HEADING
========================================================== */

function updatePageHeading(page) {

    const pageNames = {

        dashboard: "Dashboard",
        products: "Products",
        orders: "Orders",
        customers: "Customers",
        coupons: "Coupons",
        analytics: "Analytics",
        settings: "Settings"

    };


    const pageName =
        pageNames[page]
        || "Dashboard";


    const pageTitle =
        document.getElementById(
            "page-title"
        );


    const breadcrumbPage =
        document.getElementById(
            "breadcrumb-page"
        );


    if (pageTitle) {

        pageTitle.textContent =
            pageName;
    }


    if (breadcrumbPage) {

        breadcrumbPage.textContent =
            pageName;
    }


    document.title =
        `Snackment Admin — ${pageName}`;
}


/* ==========================================================
   MOBILE SIDEBAR
========================================================== */

function initializeMobileSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const menuButton =
        document.getElementById(
            "mobile-menu-button"
        );


    if (!sidebar || !menuButton) {
        return;
    }


    let overlay =
        document.getElementById(
            "sidebar-overlay"
        );


    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            "sidebar-overlay";


        overlay.className =
            "sidebar-overlay";


        document.body.appendChild(
            overlay
        );
    }


    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.add(
                "open"
            );

            overlay.classList.add(
                "active"
            );

        }
    );


    overlay.addEventListener(
        "click",
        () => {

            closeMobileSidebar();

        }
    );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            (item) => {

                item.addEventListener(
                    "click",
                    () => {

                        closeMobileSidebar();

                    }
                );

            }
        );
}


/* ==========================================================
   CLOSE MOBILE SIDEBAR
========================================================== */

function closeMobileSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebar-overlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );
    }


    if (overlay) {

        overlay.classList.remove(
            "active"
        );
    }
}


/* ==========================================================
   NOTIFICATIONS
========================================================== */

function initializeNotifications() {

    const notificationButton =
        document.getElementById(
            "notification-button"
        );


    const notificationPopup =
        document.getElementById(
            "notification-popup"
        );


    if (
        !notificationButton ||
        !notificationPopup
    ) {

        console.error(
            "[Admin] Notification elements are missing."
        );

        return;
    }


    notificationButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();


            const isOpen =
                notificationPopup.classList.toggle(
                    "open"
                );


            notificationButton.classList.toggle(
                "active",
                isOpen
            );


            notificationButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );


            notificationPopup.setAttribute(
                "aria-hidden",
                String(!isOpen)
            );

        }
    );


    notificationPopup.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

        }
    );


    document.addEventListener(
        "click",
        () => {

            closeNotifications();

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                closeNotifications();

            }

        }
    );


    function closeNotifications() {

        notificationPopup.classList.remove(
            "open"
        );


        notificationButton.classList.remove(
            "active"
        );


        notificationButton.setAttribute(
            "aria-expanded",
            "false"
        );


        notificationPopup.setAttribute(
            "aria-hidden",
            "true"
        );
    }
}


/* ==========================================================
   SIGN OUT
========================================================== */

function initializeSignOut() {

    document.addEventListener(
        "click",
        (event) => {

            const signOutButton =
                event.target.closest(
                    ".sign-out-button"
                );


            const cancelButton =
                event.target.closest(
                    "#logout-cancel-button"
                );


            const confirmButton =
                event.target.closest(
                    "#logout-confirm-button"
                );


            const logoutModal =
                document.getElementById(
                    "logout-modal"
                );


            if (signOutButton) {

                event.preventDefault();

                openLogoutModal();

                return;
            }


            if (cancelButton) {

                closeLogoutModal();

                return;
            }


            if (confirmButton) {

                confirmSignOut();

                return;
            }


            if (
                logoutModal &&
                event.target === logoutModal
            ) {

                closeLogoutModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            const logoutModal =
                document.getElementById(
                    "logout-modal"
                );


            if (
                event.key === "Escape" &&
                logoutModal &&
                logoutModal.classList.contains(
                    "open"
                )
            ) {

                closeLogoutModal();

            }

        }
    );
}


/* ==========================================================
   OPEN LOGOUT MODAL
========================================================== */

function openLogoutModal() {

    const logoutModal =
        document.getElementById(
            "logout-modal"
        );


    if (!logoutModal) {

        console.error(
            "[Admin] Logout modal not found."
        );

        return;
    }


    logoutModal.classList.add(
        "open"
    );


    logoutModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );
}


/* ==========================================================
   CLOSE LOGOUT MODAL
========================================================== */

function closeLogoutModal() {

    const logoutModal =
        document.getElementById(
            "logout-modal"
        );


    if (!logoutModal) {
        return;
    }


    logoutModal.classList.remove(
        "open"
    );


    logoutModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );
}


/* ==========================================================
   CONFIRM SIGN OUT
========================================================== */

function confirmSignOut() {

    window.location.href =
        "../../login.html";
}


/* ==========================================================
   BROWSER BACK / FORWARD
========================================================== */

window.addEventListener(
    "popstate",
    async () => {

        const page =
            getCurrentPage();


        document
            .querySelectorAll(".nav-item")
            .forEach(
                (item) => {

                    item.classList.toggle(
                        "active",
                        item.dataset.page === page
                    );

                }
            );


        updatePageHeading(
            page
        );


        await loadPage(
            page
        );

    }
);