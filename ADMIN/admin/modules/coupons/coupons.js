/* =========================================================
   SNACKMENT ADMIN — COUPONS MODULE
   coupons.js

   Responsibilities:
   - Coupon page initialization
   - Coupon card management
   - Create Coupon modal
   - Form validation
   - Coupon toggle
   - Usage progress
   - Active coupon count
   - Empty state
   - LocalStorage persistence for testing
   - Dynamic module compatibility
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       MODULE CONSTANTS
    ====================================================== */

    const STORAGE_KEY = "snackment_admin_coupons";


    /*
     * This prevents the module from attaching duplicate
     * listeners when admin.html dynamically loads the page
     * more than once.
     */
    const MODULE_FLAG = "__snackmentCouponsInitialized";


    /* =====================================================
       MODULE STATE
    ====================================================== */

    let coupons = [];

    let isSubmitting = false;

    let previouslyFocusedElement = null;

    /* =====================================================
   API CONFIGURATION
===================================================== */

    const ADMIN_COUPONS_API =
        "http://localhost:5001/api/admin/coupons";


    function getAdminToken() {

        return localStorage.getItem(
            "snackmentAdminToken"
        );

    }


    async function adminCouponRequest(
        url,
        options = {}
    ) {

        const token =
            getAdminToken();


        const response =
            await fetch(
                url,
                {
                    ...options,

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                            : {}),

                        ...(options.headers || {})

                    }

                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            data = null;

        }


        if (!response.ok) {

            throw new Error(
                data?.message ||
                `Request failed (${response.status})`
            );

        }


        return data;

    }
    /* =====================================================
       DOM REFERENCES
    ====================================================== */

    let elements = {};


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    async function initCouponsModule() {

        const page =
            document.getElementById("coupons-page");

        const modal =
            document.getElementById("coupon-modal");


        if (!page && !modal) {

            return false;

        }


        /*
         * Prevent duplicate initialization.
         */

        if (window[MODULE_FLAG]) {

            return true;

        }


        window[MODULE_FLAG] = true;


        /*
         * Cache DOM elements.
         */

        cacheElements();


        /*
         * Attach event listeners.
         */

        bindEvents();


        /*
         * Load REAL coupons from MongoDB.
         */

        const loaded =
            await loadCouponsFromBackend();


        /*
         * If backend failed, do not silently
         * replace the page with fake localStorage data.
         */

        if (!loaded) {

            console.error(
                "[Coupons] Backend coupons could not be loaded."
            );

            coupons = [];

            renderCoupons();

        }


        /*
         * Keep modal closed initially.
         */

        closeModal();


        return true;

    }
    /* =====================================================
       CACHE DOM ELEMENTS
    ====================================================== */

    function cacheElements() {

        elements = {

            /* Page */

            page:
                document.getElementById("coupons-page"),

            countText:
                document.getElementById("coupons-count-text"),

            grid:
                document.getElementById("coupons-grid"),

            emptyState:
                document.getElementById("coupons-empty-state"),


            /* Create buttons */

            openCreateButton:
                document.getElementById("open-create-coupon"),

            emptyCreateButton:
                document.getElementById("empty-create-coupon"),


            /* Modal */

            modal:
                document.getElementById("coupon-modal"),

            modalDialog:
                document.getElementById("coupon-modal-dialog"),

            modalBackdrop:
                document.getElementById("coupon-modal-backdrop"),

            modalTitle:
                document.getElementById("coupon-modal-title"),

            modalSubtitle:
                document.getElementById("coupon-modal-subtitle"),

            closeModalButton:
                document.getElementById("close-coupon-modal"),

            cancelModalButton:
                document.getElementById("cancel-coupon-modal"),


            /* Form */

            form:
                document.getElementById("coupon-form"),

            couponId:
                document.getElementById("coupon-id"),

            couponCode:
                document.getElementById("coupon-code"),

            couponDiscount:
                document.getElementById("coupon-discount"),

            couponMinOrder:
                document.getElementById("coupon-min-order"),

            couponUsageLimit:
                document.getElementById("coupon-usage-limit"),

            couponExpiry:
                document.getElementById("coupon-expiry"),

            couponType:
                document.querySelector(
                    'input[name="couponType"]:checked'
                ),
            couponTypeInputs:
                document.querySelectorAll(
                    'input[name="couponType"]'
                ),
            showOnSite:
                document.getElementById("coupon-show-on-site"),
            /* Errors */

            codeError:
                document.getElementById("coupon-code-error"),

            discountError:
                document.getElementById("coupon-discount-error"),

            minOrderError:
                document.getElementById("coupon-min-order-error"),

            usageLimitError:
                document.getElementById("coupon-usage-limit-error"),

            expiryError:
                document.getElementById("coupon-expiry-error"),

            formError:
                document.getElementById("coupon-form-error"),


            /* Submit */

            submitButton:
                document.getElementById("submit-coupon-form"),

            submitText:
                document.getElementById("coupon-submit-text"),

            submitLoader:
                document.getElementById("coupon-submit-loader")
        };
    }


    /* =====================================================
       READ STATIC COUPONS FROM HTML
    ====================================================== */

    function readCouponsFromHTML() {

        coupons = [];


        if (!elements.grid) {
            return;
        }


        const cards =
            elements.grid.querySelectorAll(".coupon-card");


        cards.forEach((card) => {

            const codeElement =
                card.querySelector(".coupon-code");

            const discountElement =
                card.querySelector(".coupon-discount");

            const detailValues =
                card.querySelectorAll(".coupon-detail-value");

            const usageHeader =
                card.querySelector(".coupon-usage-header");

            const usageValues =
                usageHeader
                    ? usageHeader.querySelectorAll("span")
                    : [];

            const toggle =
                card.querySelector("[data-coupon-toggle]");


            if (!codeElement) {
                return;
            }


            const code =
                codeElement.textContent.trim();


            const discount =
                discountElement
                    ? discountElement.textContent.trim()
                    : "";


            /*
             * HTML structure:
             *
             * detailValues[0] = Min Order
             * detailValues[1] = Expiry
             * detailValues[2] = Used
             * detailValues[3] = Limit
             */

            const minimumOrder =
                detailValues[0]
                    ? parseCurrencyValue(detailValues[0].textContent)
                    : 0;


            const expiry =
                detailValues[1]
                    ? detailValues[1].textContent.trim()
                    : "";


            const used =
                detailValues[2]
                    ? parseNumber(detailValues[2].textContent)
                    : 0;


            const usageLimit =
                detailValues[3]
                    ? parseNumber(detailValues[3].textContent)
                    : 1;


            let usagePercentage = 0;


            if (usageValues[1]) {

                usagePercentage =
                    parseNumber(usageValues[1].textContent);

            } else if (usageLimit > 0) {

                usagePercentage =
                    Math.round((used / usageLimit) * 100);

            }


            /*
             * Determine initial state.
             *
             * Important:
             * We respect the HTML's current data-status
             * rather than automatically marking the old demo
             * dates as expired.
             *
             * This keeps the supplied testing UI intact.
             */

            const status =
                card.dataset.status || "active";


            const isExpired =
                status === "expired" ||
                card.classList.contains("coupon-card-expired");


            const isEnabled =
                toggle
                    ? toggle.checked
                    : status === "active";


            coupons.push({

                id:
                    card.dataset.couponId ||
                    createCouponId(),

                code,

                discount,

                minimumOrder,

                expiry,

                used,

                usageLimit,

                usagePercentage,

                status,

                enabled:
                    isExpired
                        ? false
                        : isEnabled,

                expired:
                    isExpired,

                couponType:
                    "public",

                showOnSite:
                    true

            });

        });
    }

    /* =====================================================
       LOAD COUPONS FROM BACKEND
    ===================================================== */

    async function loadCouponsFromBackend() {

        try {

            const data =
                await adminCouponRequest(
                    ADMIN_COUPONS_API,
                    {
                        method: "GET"
                    }
                );


            if (
                !data ||
                !Array.isArray(data.coupons)
            ) {

                throw new Error(
                    "Invalid coupons response."
                );

            }


            coupons =
                data.coupons.map(
                    normalizeBackendCoupon
                );


            renderCoupons();


            console.log(
                "[Coupons] Loaded from MongoDB:",
                coupons
            );


            return true;

        }

        catch (error) {

            console.error(
                "[Coupons] Failed to load coupons:",
                error
            );


            return false;

        }

    }
    /* =====================================================
       NORMALIZE BACKEND COUPON
    ===================================================== */

    function normalizeBackendCoupon(
        coupon
    ) {

        const used =
            Number(coupon.usedCount) || 0;


        const usageLimit =
            Math.max(
                1,
                Number(coupon.usageLimit) || 1
            );


        const percentage =
            Math.min(
                100,
                Math.round(
                    (used / usageLimit) * 100
                )
            );


        const expired =
            coupon.expiry
                ? new Date(coupon.expiry) < new Date()
                : false;


        let discount = "";


        if (
            coupon.discountType ===
            "percentage"
        ) {

            discount =
                `${formatNumber(coupon.discountValue)}% OFF`;

        } else {

            discount =
                `₹${formatNumber(coupon.discountValue)} OFF`;

        }


        return {

            id:
                coupon._id,

            code:
                coupon.code,

            title:
                coupon.title || coupon.code,

            description:
                coupon.description || "",

            discount,

            minimumOrder:
                Number(coupon.minOrder) || 0,

            expiry:
                coupon.expiry
                    ? new Date(coupon.expiry)
                        .toISOString()
                        .split("T")[0]
                    : "",

            used,

            usageLimit,
            perCustomerLimit:
                Number(coupon.perCustomerLimit) || 1,


            usagePercentage:
                percentage,

            status:
                expired
                    ? "expired"
                    : coupon.isActive
                        ? "active"
                        : "inactive",

            enabled:
                expired
                    ? false
                    : coupon.isActive !== false,

            expired,

            couponType:
                coupon.couponType === "private"
                    ? "private"
                    : "public",

            showOnSite:
                coupon.showOnSite !== false

        };

    }
    /* =====================================================
       RESTORE SAVED COUPONS
    ====================================================== */

    function restoreCoupons() {

        let savedData = null;


        try {

            const raw =
                localStorage.getItem(STORAGE_KEY);


            if (raw) {

                savedData =
                    JSON.parse(raw);

            }

        } catch (error) {

            console.warn(
                "Snackment Coupons: Unable to read localStorage.",
                error
            );

            savedData = null;
        }


        /*
         * If there is no saved data, keep the coupons
         * already present in coupons.html.
         */

        if (!Array.isArray(savedData) || savedData.length === 0) {
            return;
        }


        /*
         * Saved data becomes the current testing state.
         */

        coupons = savedData.map((coupon) => {

            return normalizeCoupon(coupon);

        });
    }


    /* =====================================================
       SAVE COUPONS
    ====================================================== */

    function saveCoupons() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(coupons)
            );

        } catch (error) {

            console.warn(
                "Snackment Coupons: Unable to save to localStorage.",
                error
            );
        }
    }


    /* =====================================================
       NORMALIZE COUPON
    ====================================================== */

    function normalizeCoupon(coupon) {

        const usageLimit =
            Math.max(
                1,
                Number(coupon.usageLimit) || 1
            );


        const used =
            Math.max(
                0,
                Number(coupon.used) || 0
            );


        const calculatedPercentage =
            Math.min(
                100,
                Math.round(
                    (used / usageLimit) * 100
                )
            );


        const expired =
            Boolean(coupon.expired) ||
            coupon.status === "expired";


        return {

            id:
                coupon.id ||
                createCouponId(),

            code:
                String(coupon.code || "").trim(),

            discount:
                String(coupon.discount || "").trim(),

            minimumOrder:
                Math.max(
                    0,
                    Number(coupon.minimumOrder) || 0
                ),

            expiry:
                String(coupon.expiry || "").trim(),

            used,

            usageLimit,

            usagePercentage:
                Number.isFinite(Number(coupon.usagePercentage))
                    ? Math.min(
                        100,
                        Math.max(
                            0,
                            Number(coupon.usagePercentage)
                        )
                    )
                    : calculatedPercentage,

            status:
                expired
                    ? "expired"
                    : (
                        coupon.enabled === false
                            ? "inactive"
                            : "active"
                    ),

            enabled:
                expired
                    ? false
                    : coupon.enabled !== false,

            expired,
            couponType:
                coupon.couponType === "private"
                    ? "private"
                    : "public",

            showOnSite:
                coupon.showOnSite !== false,

        };
    }


    /* =====================================================
       EVENT LISTENERS
    ====================================================== */

    function bindEvents() {

        /*
         * CREATE BUTTON
         */

        if (elements.openCreateButton) {

            elements.openCreateButton.addEventListener(
                "click",
                openCreateModal
            );

        }


        /*
         * EMPTY STATE CREATE BUTTON
         */

        if (elements.emptyCreateButton) {

            elements.emptyCreateButton.addEventListener(
                "click",
                openCreateModal
            );

        }


        /*
         * CLOSE BUTTON
         */

        if (elements.closeModalButton) {

            elements.closeModalButton.addEventListener(
                "click",
                closeModal
            );

        }


        /*
         * CANCEL BUTTON
         */

        if (elements.cancelModalButton) {

            elements.cancelModalButton.addEventListener(
                "click",
                closeModal
            );

        }


        /*
         * BACKDROP
         */

        if (elements.modalBackdrop) {

            elements.modalBackdrop.addEventListener(
                "click",
                closeModal
            );

        }


        /*
         * FORM SUBMISSION
         */

        if (elements.form) {

            elements.form.addEventListener(
                "submit",
                handleFormSubmit
            );

        }


        /*
         * ESCAPE KEY
         */

        document.addEventListener(
            "keydown",
            handleGlobalKeydown
        );
        /* =================================================
   COUPON TYPE — PUBLIC / PRIVATE
================================================= */

        if (elements.couponTypeInputs) {

            elements.couponTypeInputs.forEach((input) => {

                input.addEventListener(
                    "change",
                    handleCouponTypeChange
                );

            });

        }

        /*
         * INPUT VALIDATION CLEANUP
         */

        if (elements.couponCode) {

            elements.couponCode.addEventListener(
                "input",
                () => {

                    clearFieldError(
                        elements.couponCode,
                        elements.codeError
                    );

                    elements.couponCode.value =
                        elements.couponCode.value
                            .toUpperCase()
                            .replace(/\s+/g, "");

                }
            );

        }


        if (elements.couponDiscount) {

            elements.couponDiscount.addEventListener(
                "input",
                () => {

                    clearFieldError(
                        elements.couponDiscount,
                        elements.discountError
                    );

                }
            );

        }


        if (elements.couponMinOrder) {

            elements.couponMinOrder.addEventListener(
                "input",
                () => {

                    clearFieldError(
                        elements.couponMinOrder,
                        elements.minOrderError
                    );

                }
            );

        }


        if (elements.couponUsageLimit) {

            elements.couponUsageLimit.addEventListener(
                "input",
                () => {

                    clearFieldError(
                        elements.couponUsageLimit,
                        elements.usageLimitError
                    );

                }
            );

        }


        if (elements.couponExpiry) {

            elements.couponExpiry.addEventListener(
                "change",
                () => {

                    clearFieldError(
                        elements.couponExpiry,
                        elements.expiryError
                    );

                }
            );

        }
    }


    /* =====================================================
       GLOBAL KEYBOARD EVENTS
    ====================================================== */

    function handleGlobalKeydown(event) {

        if (!elements.modal) {
            return;
        }


        if (
            event.key === "Escape" &&
            !elements.modal.classList.contains("hidden")
        ) {

            event.preventDefault();

            closeModal();

        }
    }
    /* =====================================================
   HANDLE COUPON TYPE CHANGE
===================================================== */

    function handleCouponTypeChange() {

        const selected =
            document.querySelector(
                'input[name="couponType"]:checked'
            );

        const couponType =
            selected
                ? selected.value
                : "public";


        if (!elements.showOnSite) {
            return;
        }


        /*
         * PRIVATE COUPON
         * -----------------------------
         * Private coupons should not be
         * displayed in the site's coupon list.
         */

        if (couponType === "private") {

            elements.showOnSite.checked =
                false;

            elements.showOnSite.disabled =
                true;

            elements.showOnSite.setAttribute(
                "aria-disabled",
                "true"
            );

            return;
        }


        /*
         * PUBLIC COUPON
         * -----------------------------
         * Admin can decide whether the
         * public coupon appears on site.
         */

        elements.showOnSite.disabled =
            false;

        elements.showOnSite.removeAttribute(
            "aria-disabled"
        );

    }
    /* =====================================================
       OPEN CREATE MODAL
    ====================================================== */

    function openCreateModal() {

        if (!elements.modal) {
            return;
        }


        previouslyFocusedElement =
            document.activeElement;


        resetForm();


        /*
         * CREATE mode
         */

        if (elements.modalTitle) {

            elements.modalTitle.textContent =
                "Create Coupon";

        }


        if (elements.modalSubtitle) {

            elements.modalSubtitle.textContent =
                "Create a discount coupon for your customers.";

        }


        if (elements.submitText) {

            elements.submitText.textContent =
                "Create Coupon";

        }


        if (elements.modal) {

            elements.modal.classList.remove("hidden");

            elements.modal.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        /*
         * Prevent background scrolling.
         */

        document.body.classList.add(
            "coupon-modal-open"
        );


        /*
         * Focus the first field after modal is visible.
         */

        window.setTimeout(() => {

            if (elements.couponCode) {

                elements.couponCode.focus();

            }

        }, 50);
    }
    /* =====================================================
   OPEN EDIT MODAL
====================================================== */

    function openEditModal(couponId) {

        const coupon =
            coupons.find(
                item => item.id === couponId
            );


        if (!coupon) {

            console.warn(
                "[Coupons] Coupon not found:",
                couponId
            );

            return;

        }


        previouslyFocusedElement =
            document.activeElement;


        resetForm();


        /*
         * EDIT MODE
         */

        if (elements.modalTitle) {

            elements.modalTitle.textContent =
                "Edit Coupon";

        }


        if (elements.modalSubtitle) {

            elements.modalSubtitle.textContent =
                "Update the details of this coupon.";

        }


        if (elements.submitText) {

            elements.submitText.textContent =
                "Save Changes";

        }


        /*
         * Store MongoDB coupon ID.
         */

        if (elements.couponId) {

            elements.couponId.value =
                coupon.id;

        }


        /*
         * Coupon code
         */

        if (elements.couponCode) {

            elements.couponCode.value =
                coupon.code;

            /*
             * Code should not be changed during edit.
             */

            elements.couponCode.disabled =
                true;

        }


        /*
         * Title
         */

        const titleInput =
            document.getElementById(
                "coupon-title"
            );

        if (titleInput) {

            titleInput.value =
                coupon.title || coupon.code;

        }


        /*
         * Description
         */

        const descriptionInput =
            document.getElementById(
                "coupon-description"
            );

        if (descriptionInput) {

            descriptionInput.value =
                coupon.description || "";

        }


        /*
         * Discount
         */

        if (elements.couponDiscount) {

            if (
                coupon.discount &&
                coupon.discount.includes("%")
            ) {

                const value =
                    parseFloat(
                        coupon.discount
                    );

                elements.couponDiscount.value =
                    Number.isFinite(value)
                        ? value
                        : "";

            } else {

                const value =
                    parseFloat(
                        String(coupon.discount)
                            .replace(/[^\d.]/g, "")
                    );

                elements.couponDiscount.value =
                    Number.isFinite(value)
                        ? value
                        : "";

            }

        }


        /*
         * Discount type
         */

        const discountType =
            coupon.discount &&
                coupon.discount.includes("%")
                ? "percentage"
                : "flat";


        const discountTypeInput =
            document.querySelector(
                `input[name="discountType"][value="${discountType}"]`
            );

        if (discountTypeInput) {

            discountTypeInput.checked =
                true;

        }


        /*
         * Minimum order
         */

        if (elements.couponMinOrder) {

            elements.couponMinOrder.value =
                coupon.minimumOrder || "";

        }


        /*
         * Coupon type
         */

        const couponTypeInput =
            document.querySelector(
                `input[name="couponType"][value="${coupon.couponType || "public"}"]`
            );

        if (couponTypeInput) {

            couponTypeInput.checked =
                true;

        }


        /*
         * Show on site
         */

        if (elements.showOnSite) {

            elements.showOnSite.checked =
                coupon.couponType === "private"
                    ? false
                    : coupon.showOnSite !== false;

        }


        /*
         * Usage limit
         */

        if (elements.couponUsageLimit) {

            elements.couponUsageLimit.value =
                coupon.usageLimit || 1;

        }


        /*
         * Per customer limit
         */

        const perCustomerInput =
            document.getElementById(
                "coupon-per-customer-limit"
            );

        if (perCustomerInput) {

            perCustomerInput.value =
                coupon.perCustomerLimit || 1;

        }


        /*
         * Expiry
         */

        if (elements.couponExpiry) {

            elements.couponExpiry.value =
                coupon.expiry || "";

        }


        /*
         * Apply Public / Private rules.
         */

        handleCouponTypeChange();


        /*
         * Show modal.
         */

        elements.modal.classList.remove(
            "hidden"
        );

        elements.modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "coupon-modal-open"
        );


        /*
         * Focus title.
         */

        window.setTimeout(() => {

            const title =
                document.getElementById(
                    "coupon-title"
                );

            if (title) {

                title.focus();

            }

        }, 50);

    }

    /* =====================================================
       CLOSE MODAL
    ====================================================== */

    function closeModal() {

        if (!elements.modal) {
            return;
        }


        elements.modal.classList.add("hidden");

        elements.modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "coupon-modal-open"
        );


        isSubmitting = false;


        setSubmitLoading(false);


        /*
         * Restore focus where possible.
         */

        if (
            previouslyFocusedElement &&
            typeof previouslyFocusedElement.focus === "function"
        ) {

            try {

                previouslyFocusedElement.focus();

            } catch (error) {

                /* Ignore focus restoration errors. */

            }

        }


        previouslyFocusedElement = null;
    }


    /* =====================================================
       RESET FORM
    ====================================================== */

    function resetForm() {

        if (!elements.form) {
            return;
        }


        elements.form.reset();
        if (elements.couponCode) {

            elements.couponCode.disabled =
                false;

        }

        if (elements.couponId) {

            elements.couponId.value = "";

        }


        clearAllErrors();


        /*
         * Set today's minimum expiry date.
         *
         * The actual user can only choose today or later.
         */

        if (elements.couponExpiry) {

            elements.couponExpiry.min =
                getTodayISODate();

        }
    }


    /* =====================================================
       FORM SUBMISSION
    ====================================================== */

    async function handleFormSubmit(event) {

        event.preventDefault();


        if (isSubmitting) {
            return;
        }


        clearAllErrors();


        const validation =
            validateForm();


        if (!validation.valid) {

            focusFirstError();

            return;
        }


        const formCoupon =
            validation.coupon;


        isSubmitting = true;

        setSubmitLoading(true);


        try {

            const discount =
                parseDiscount(
                    elements.couponDiscount.value.trim()
                );


            /* =================================================
               EDIT MODE
            ================================================== */

            if (
                elements.couponId &&
                elements.couponId.value
            ) {

                const originalCoupon =
                    coupons.find(
                        coupon =>
                            coupon.id ===
                            elements.couponId.value
                    );


                if (!originalCoupon) {

                    throw new Error(
                        "Coupon not found."
                    );

                }


                const titleInput =
                    document.getElementById("coupon-title");

                const descriptionInput =
                    document.getElementById("coupon-description");

                const payload = {

                    title:
                        titleInput
                            ? titleInput.value.trim()
                            : originalCoupon.title || formCoupon.code,

                    description:
                        descriptionInput
                            ? descriptionInput.value.trim()
                            : originalCoupon.description || formCoupon.discount,

                    minOrder:
                        formCoupon.minimumOrder,

                    discountType:
                        discount.type === "fixed"
                            ? "flat"
                            : "percentage",

                    discountValue:
                        discount.value,

                    showOnSite:
                        formCoupon.showOnSite,

                    expiry:
                        formCoupon.expiry || null,

                    usageLimit:
                        formCoupon.usageLimit,

                    perCustomerLimit:
                        Number(
                            document.getElementById(
                                "coupon-per-customer-limit"
                            )?.value
                        ) || originalCoupon.perCustomerLimit || 1

                };


                console.log(
                    "[Coupons] Updating coupon:",
                    originalCoupon.code,
                    payload
                );


                const data =
                    await adminCouponRequest(
                        `${ADMIN_COUPONS_API}/${encodeURIComponent(originalCoupon.code)}`,
                        {
                            method: "PATCH",

                            body:
                                JSON.stringify(payload)
                        }
                    );


                if (
                    !data ||
                    !data.success
                ) {

                    throw new Error(
                        data?.message ||
                        "Coupon update failed."
                    );

                }


                /*
                 * Reload from MongoDB.
                 */

                const loaded =
                    await loadCouponsFromBackend();


                if (!loaded) {

                    throw new Error(
                        "Coupon updated, but coupons could not be reloaded."
                    );

                }


                closeModal();


                showSuccessMessage(
                    "Coupon updated successfully."
                );


                return;

            }


            /* =================================================
               CREATE MODE
            ================================================== */

            const payload = {

                code:
                    formCoupon.code,

                title:
                    formCoupon.code,

                description:
                    formCoupon.discount +
                    (
                        formCoupon.minimumOrder > 0
                            ? ` on orders above ₹${formCoupon.minimumOrder}.`
                            : "."
                    ),

                minOrder:
                    formCoupon.minimumOrder,

                discountType:
                    discount.type === "fixed"
                        ? "flat"
                        : "percentage",

                discountValue:
                    discount.value,

                usageLimit:
                    formCoupon.usageLimit,

                expiry:
                    formCoupon.expiry,

                couponType:
                    formCoupon.couponType,

                showOnSite:
                    formCoupon.showOnSite

            };


            const data =
                await adminCouponRequest(
                    ADMIN_COUPONS_API,
                    {
                        method: "POST",

                        body:
                            JSON.stringify(payload)
                    }
                );


            if (
                !data ||
                !data.success
            ) {

                throw new Error(
                    data?.message ||
                    "Coupon creation failed."
                );

            }


            const loaded =
                await loadCouponsFromBackend();


            if (!loaded) {

                throw new Error(
                    "Coupon created, but coupons could not be reloaded."
                );

            }


            closeModal();


            showSuccessMessage(
                "Coupon created successfully."
            );


        }

        catch (error) {

            console.error(
                "[Coupons] Form submission failed:",
                error
            );


            showGeneralError(
                error.message ||
                "Something went wrong."
            );

        }

        finally {

            isSubmitting = false;

            setSubmitLoading(false);

        }

    }

    /* =====================================================
       FORM VALIDATION
    ====================================================== */

    function validateForm() {

        let valid = true;


        const code =
            elements.couponCode
                ? elements.couponCode.value
                    .trim()
                    .toUpperCase()
                : "";


        const discountRaw =
            elements.couponDiscount
                ? elements.couponDiscount.value.trim()
                : "";


        const minOrderRaw =
            elements.couponMinOrder
                ? elements.couponMinOrder.value.trim()
                : "";


        const usageLimitRaw =
            elements.couponUsageLimit
                ? elements.couponUsageLimit.value.trim()
                : "";


        const expiry =
            elements.couponExpiry
                ? elements.couponExpiry.value
                : "";
        const couponTypeInput =
            document.querySelector(
                'input[name="couponType"]:checked'
            );

        const couponType =
            couponTypeInput
                ? couponTypeInput.value
                : "public";

        const showOnSite =
            elements.showOnSite
                ? elements.showOnSite.checked
                : true;
        /* =================================================
           COUPON CODE
        ================================================== */

        if (!code) {

            showFieldError(
                elements.couponCode,
                elements.codeError,
                "Coupon code is required."
            );

            valid = false;

        } else if (code.length < 3) {

            showFieldError(
                elements.couponCode,
                elements.codeError,
                "Coupon code must contain at least 3 characters."
            );

            valid = false;

        } else if (code.length > 30) {

            showFieldError(
                elements.couponCode,
                elements.codeError,
                "Coupon code cannot exceed 30 characters."
            );

            valid = false;

        } else if (!/^[A-Z0-9_-]+$/.test(code)) {

            showFieldError(
                elements.couponCode,
                elements.codeError,
                "Use only letters, numbers, hyphens or underscores."
            );

            valid = false;

        }


        /* =================================================
           DISCOUNT
        ================================================== */

        const discount =
            parseDiscount(discountRaw);


        if (!discountRaw) {

            showFieldError(
                elements.couponDiscount,
                elements.discountError,
                "Discount value is required."
            );

            valid = false;

        } else if (!discount.valid) {

            showFieldError(
                elements.couponDiscount,
                elements.discountError,
                discount.error
            );

            valid = false;

        }


        /* =================================================
           MINIMUM ORDER
        ================================================== */

        let minimumOrder = 0;


        if (minOrderRaw !== "") {

            minimumOrder =
                Number(minOrderRaw);


            if (
                !Number.isFinite(minimumOrder) ||
                minimumOrder < 0
            ) {

                showFieldError(
                    elements.couponMinOrder,
                    elements.minOrderError,
                    "Minimum order cannot be negative."
                );

                valid = false;

            } else if (!Number.isInteger(minimumOrder)) {

                showFieldError(
                    elements.couponMinOrder,
                    elements.minOrderError,
                    "Enter a valid whole rupee amount."
                );

                valid = false;

            }

        }


        /* =================================================
           USAGE LIMIT
        ================================================== */

        let usageLimit = 0;


        if (!usageLimitRaw) {

            showFieldError(
                elements.couponUsageLimit,
                elements.usageLimitError,
                "Usage limit is required."
            );

            valid = false;

        } else {

            usageLimit =
                Number(usageLimitRaw);


            if (
                !Number.isFinite(usageLimit) ||
                usageLimit < 1
            ) {

                showFieldError(
                    elements.couponUsageLimit,
                    elements.usageLimitError,
                    "Usage limit must be at least 1."
                );

                valid = false;

            } else if (!Number.isInteger(usageLimit)) {

                showFieldError(
                    elements.couponUsageLimit,
                    elements.usageLimitError,
                    "Usage limit must be a whole number."
                );

                valid = false;

            }

        }


        /* =================================================
           EXPIRY
        ================================================== */

        if (!expiry) {

            showFieldError(
                elements.couponExpiry,
                elements.expiryError,
                "Expiry date is required."
            );

            valid = false;

        } else if (expiry < getTodayISODate()) {

            showFieldError(
                elements.couponExpiry,
                elements.expiryError,
                "Expiry date cannot be in the past."
            );

            valid = false;

        }


        /* =================================================
           DUPLICATE CODE
        ================================================== */

        if (code) {

            const editingCouponId =
                elements.couponId
                    ? elements.couponId.value
                    : "";

            const duplicate =
                coupons.some((coupon) => {

                    return (
                        coupon.code.toUpperCase() === code &&
                        coupon.id !== editingCouponId
                    );

                });


            if (duplicate) {

                showFieldError(
                    elements.couponCode,
                    elements.codeError,
                    "This coupon code already exists."
                );

                valid = false;

            }

        }


        if (!valid) {

            return {
                valid: false,
                coupon: null
            };

        }


        /* =================================================
           BUILD NEW COUPON OBJECT
        ================================================== */

        const newCoupon = {

            id: createCouponId(),

            code,

            discount: discount.display,

            minimumOrder,

            expiry,

            used: 0,

            usageLimit,

            usagePercentage: 0,

            status: "active",

            enabled: true,

            expired: false,

            couponType,

            showOnSite

        };

        return {

            valid: true,

            coupon:
                newCoupon

        };
    }


    /* =====================================================
       PARSE DISCOUNT
    ====================================================== */

    function parseDiscount(value) {

        const input =
            String(value || "")
                .trim()
                .replace(/\s+/g, "");


        if (!input) {

            return {

                valid: false,

                error:
                    "Discount value is required.",

                display:
                    ""

            };
        }


        /*
         * Percentage:
         *
         * 10%
         * 15.5%
         */

        if (input.endsWith("%")) {

            const numericPart =
                input.slice(0, -1);


            const percentage =
                Number(numericPart);


            if (
                !Number.isFinite(percentage) ||
                percentage <= 0 ||
                percentage > 100
            ) {

                return {

                    valid: false,

                    error:
                        "Percentage discount must be between 0% and 100%.",

                    display:
                        ""

                };

            }


            return {

                valid: true,

                type:
                    "percentage",

                value:
                    percentage,

                display:
                    `${formatNumber(percentage)}% OFF`

            };
        }


        /*
         * Fixed rupee discount.
         *
         * Accepted:
         *
         * ₹50
         * Rs50
         * Rs.50
         * 50
         */

        const fixedValue =
            input
                .replace(/^₹/, "")
                .replace(/^Rs\.?/i, "");


        const amount =
            Number(fixedValue);


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return {

                valid: false,

                error:
                    "Enter a valid discount such as 10% or ₹50.",

                display:
                    ""

            };

        }


        return {

            valid: true,

            type:
                "fixed",

            value:
                amount,

            display:
                `₹${formatNumber(amount)} OFF`

        };
    }


    /* =====================================================
       RENDER COUPONS
    ====================================================== */

    function renderCoupons() {

        if (!elements.grid) {
            return;
        }


        /*
         * Empty current grid.
         */

        elements.grid.innerHTML = "";


        /*
         * Build every card from current state.
         */

        coupons.forEach((coupon) => {

            const card =
                createCouponCard(coupon);


            elements.grid.appendChild(card);

        });


        /*
         * Update active count.
         */

        updateCount();


        /*
         * Update empty state.
         */

        updateEmptyState();
    }


    /* =====================================================
       CREATE COUPON CARD
    ====================================================== */

    function createCouponCard(coupon) {

        const card =
            document.createElement("article");


        card.className =
            "coupon-card";


        /*
         * Expired visual state.
         */

        if (coupon.expired) {

            card.classList.add(
                "coupon-card-expired"
            );

        }


        card.dataset.couponId =
            coupon.id;


        card.dataset.status =
            getCouponStatus(coupon);


        /* =================================================
           HEADER
        ================================================== */

        const header =
            document.createElement("div");

        header.className =
            "coupon-card-header";


        const codeArea =
            document.createElement("div");

        codeArea.className =
            "coupon-card-code-area";


        /*
         * Code row.
         */

        const codeRow =
            document.createElement("div");

        codeRow.className =
            "coupon-code-row";


        const codeHeading =
            document.createElement("h2");

        codeHeading.className =
            "coupon-code";

        codeHeading.textContent =
            coupon.code;


        codeRow.appendChild(
            codeHeading
        );


        /*
         * Expired badge.
         */

        if (coupon.expired) {

            const expiredBadge =
                document.createElement("span");

            expiredBadge.className =
                "coupon-expired-badge";

            expiredBadge.textContent =
                "EXPIRED";


            codeRow.appendChild(
                expiredBadge
            );

        }


        codeArea.appendChild(
            codeRow
        );


        /* =================================================
           TOGGLE
        ================================================== */

        const toggleLabel =
            document.createElement("label");

        toggleLabel.className =
            "coupon-toggle";

        toggleLabel.setAttribute(
            "aria-label",
            `Toggle ${coupon.code}`
        );


        const toggleInput =
            document.createElement("input");

        toggleInput.type =
            "checkbox";

        toggleInput.className =
            "coupon-toggle-input";

        toggleInput.setAttribute(
            "data-coupon-toggle",
            ""
        );


        toggleInput.checked =
            coupon.enabled &&
            !coupon.expired;


        /*
         * Expired coupons cannot be activated.
         */

        if (coupon.expired) {

            toggleInput.disabled =
                true;

        }


        const toggleTrack =
            document.createElement("span");

        toggleTrack.className =
            "coupon-toggle-track";


        const toggleThumb =
            document.createElement("span");

        toggleThumb.className =
            "coupon-toggle-thumb";


        toggleTrack.appendChild(
            toggleThumb
        );


        toggleLabel.appendChild(
            toggleInput
        );

        toggleLabel.appendChild(
            toggleTrack
        );


        header.appendChild(
            codeArea
        );

        header.appendChild(
            toggleLabel
        );


        card.appendChild(
            header
        );


        /* =================================================
           DISCOUNT
        ================================================== */

        const discount =
            document.createElement("div");

        discount.className =
            "coupon-discount";

        discount.textContent =
            coupon.discount;


        card.appendChild(
            discount
        );


        /* =================================================
           DETAILS
        ================================================== */

        const details =
            document.createElement("div");

        details.className =
            "coupon-details";


        details.appendChild(
            createDetail(
                "Min Order",
                coupon.minimumOrder > 0
                    ? `₹${formatNumber(coupon.minimumOrder)}`
                    : "No min"
            )
        );


        details.appendChild(
            createDetail(
                "Expiry",
                coupon.expiry || "—"
            )
        );


        details.appendChild(
            createDetail(
                "Used",
                formatNumber(coupon.used)
            )
        );


        details.appendChild(
            createDetail(
                "Limit",
                formatNumber(coupon.usageLimit)
            )
        );


        card.appendChild(
            details
        );


        /* =================================================
           USAGE
        ================================================== */

        const usage =
            document.createElement("div");

        usage.className =
            "coupon-usage";


        const usageHeader =
            document.createElement("div");

        usageHeader.className =
            "coupon-usage-header";


        const usageLabel =
            document.createElement("span");

        usageLabel.textContent =
            "Usage";


        const usagePercentage =
            calculateUsagePercentage(coupon);


        const usageValue =
            document.createElement("span");

        usageValue.textContent =
            `${usagePercentage}%`;


        usageHeader.appendChild(
            usageLabel
        );

        usageHeader.appendChild(
            usageValue
        );


        const usageBar =
            document.createElement("div");

        usageBar.className =
            "coupon-usage-bar";


        if (coupon.expired) {

            usageBar.classList.add(
                "coupon-usage-bar-expired"
            );

        }


        const usageProgress =
            document.createElement("span");

        usageProgress.className =
            "coupon-usage-progress";


        usageProgress.style.width =
            `${usagePercentage}%`;


        usageBar.appendChild(
            usageProgress
        );


        usage.appendChild(
            usageHeader
        );

        usage.appendChild(
            usageBar
        );


        card.appendChild(
            usage
        );
        /* =================================================
           EDIT BUTTON
        ================================================== */

        const editButton =
            document.createElement("button");

        editButton.type =
            "button";

        editButton.className =
            "coupon-edit-button";

        editButton.textContent =
            "Edit";

        editButton.setAttribute(
            "aria-label",
            `Edit ${coupon.code}`
        );

        editButton.addEventListener(
            "click",
            () => {

                openEditModal(
                    coupon.id
                );

            }
        );

        card.appendChild(
            editButton
        );

        /* =================================================
           TOGGLE EVENT
        ================================================== */

        toggleInput.addEventListener(
            "change",
            () => {

                handleCouponToggle(
                    coupon.id,
                    toggleInput.checked
                );

            }
        );


        return card;
    }


    /* =====================================================
       CREATE DETAIL
    ====================================================== */

    function createDetail(label, value) {

        const detail =
            document.createElement("div");

        detail.className =
            "coupon-detail";


        const detailLabel =
            document.createElement("span");

        detailLabel.className =
            "coupon-detail-label";

        detailLabel.textContent =
            label;


        const detailValue =
            document.createElement("strong");

        detailValue.className =
            "coupon-detail-value";

        detailValue.textContent =
            value;


        detail.appendChild(
            detailLabel
        );

        detail.appendChild(
            detailValue
        );


        return detail;
    }


    /* =====================================================
       HANDLE COUPON TOGGLE
    ====================================================== */

    async function handleCouponToggle(
        couponId,
        enabled
    ) {

        const coupon =
            coupons.find(
                item => item.id === couponId
            );


        if (!coupon) {

            console.warn(
                "[Coupons] Coupon not found:",
                couponId
            );

            return;

        }


        /*
         * Backend route uses coupon CODE,
         * not MongoDB _id.
         */

        const code =
            coupon.code;


        try {

            const data =
                await adminCouponRequest(
                    `${ADMIN_COUPONS_API}/${encodeURIComponent(code)}/toggle`,
                    {
                        method: "PATCH",

                        body: JSON.stringify({

                            isActive:
                                Boolean(enabled)

                        })

                    }
                );


            if (
                !data ||
                !data.success
            ) {

                throw new Error(
                    data?.message ||
                    "Failed to update coupon status."
                );

            }


            /*
             * Do NOT trust only local state.
             *
             * Reload from MongoDB so the database
             * remains the source of truth.
             */

            const loaded =
                await loadCouponsFromBackend();


            if (!loaded) {

                throw new Error(
                    "Status updated, but coupons could not be reloaded."
                );

            }


            console.log(
                `[Coupons] ${code} is now ${enabled ? "active" : "inactive"
                }`
            );


        }

        catch (error) {

            console.error(
                "[Coupons] Failed to toggle coupon:",
                error
            );


            /*
             * Restore UI from backend state.
             */

            await loadCouponsFromBackend();


            showGeneralError(
                error.message ||
                "Failed to update coupon status."
            );

        }

    }


    /* =====================================================
       UPDATE ACTIVE COUNT
    ====================================================== */

    function updateCount() {

        if (!elements.countText) {
            return;
        }


        const activeCount =
            coupons.filter(
                (coupon) =>
                    coupon.enabled &&
                    !coupon.expired
            ).length;


        elements.countText.textContent =
            `${activeCount} active coupon${activeCount === 1 ? "" : "s"}`;
    }


    /* =====================================================
       UPDATE EMPTY STATE
    ====================================================== */

    function updateEmptyState() {

        if (!elements.emptyState) {
            return;
        }


        const hasCoupons =
            coupons.length > 0;


        if (hasCoupons) {

            elements.emptyState.classList.add(
                "hidden"
            );

            elements.emptyState.setAttribute(
                "aria-hidden",
                "true"
            );

            if (elements.grid) {

                elements.grid.classList.remove(
                    "hidden"
                );

            }

        } else {

            elements.emptyState.classList.remove(
                "hidden"
            );

            elements.emptyState.setAttribute(
                "aria-hidden",
                "false"
            );

            if (elements.grid) {

                elements.grid.classList.add(
                    "hidden"
                );

            }

        }
    }


    /* =====================================================
       GET COUPON STATUS
    ====================================================== */

    function getCouponStatus(coupon) {

        if (coupon.expired) {
            return "expired";
        }


        return coupon.enabled
            ? "active"
            : "inactive";
    }


    /* =====================================================
       CALCULATE USAGE
    ====================================================== */

    function calculateUsagePercentage(coupon) {

        const used =
            Number(coupon.used) || 0;


        const limit =
            Number(coupon.usageLimit) || 0;


        if (limit <= 0) {
            return 0;
        }


        return Math.min(
            100,
            Math.max(
                0,
                Math.round(
                    (used / limit) * 100
                )
            )
        );
    }


    /* =====================================================
       SET SUBMIT LOADING
    ====================================================== */

    function setSubmitLoading(loading) {

        if (
            elements.submitButton
        ) {

            elements.submitButton.disabled =
                loading;

        }


        if (
            elements.submitText
        ) {

            elements.submitText.classList.toggle(
                "hidden",
                loading
            );

        }


        if (
            elements.submitLoader
        ) {

            elements.submitLoader.classList.toggle(
                "hidden",
                !loading
            );

        }
    }


    /* =====================================================
       ERROR HELPERS
    ====================================================== */

    function showFieldError(
        input,
        errorElement,
        message
    ) {

        if (input) {

            input.classList.add(
                "has-error"
            );

            input.setAttribute(
                "aria-invalid",
                "true"
            );

        }


        if (errorElement) {

            errorElement.textContent =
                message;

            errorElement.classList.remove(
                "hidden"
            );

        }
    }


    function clearFieldError(
        input,
        errorElement
    ) {

        if (input) {

            input.classList.remove(
                "has-error"
            );

            input.removeAttribute(
                "aria-invalid"
            );

        }


        if (errorElement) {

            errorElement.textContent =
                "";

            errorElement.classList.add(
                "hidden"
            );

        }
    }


    function clearAllErrors() {

        clearFieldError(
            elements.couponCode,
            elements.codeError
        );


        clearFieldError(
            elements.couponDiscount,
            elements.discountError
        );


        clearFieldError(
            elements.couponMinOrder,
            elements.minOrderError
        );


        clearFieldError(
            elements.couponUsageLimit,
            elements.usageLimitError
        );


        clearFieldError(
            elements.couponExpiry,
            elements.expiryError
        );


        if (elements.formError) {

            elements.formError.textContent =
                "";

            elements.formError.classList.add(
                "hidden"
            );

        }
    }


    function showGeneralError(message) {

        if (!elements.formError) {
            return;
        }


        elements.formError.textContent =
            message;


        elements.formError.classList.remove(
            "hidden"
        );
    }


    /* =====================================================
       FOCUS FIRST ERROR
    ====================================================== */

    function focusFirstError() {

        const fields = [

            elements.couponCode,

            elements.couponDiscount,

            elements.couponMinOrder,

            elements.couponUsageLimit,

            elements.couponExpiry

        ];


        const firstInvalid =
            fields.find(
                (field) =>
                    field &&
                    field.getAttribute("aria-invalid") === "true"
            );


        if (firstInvalid) {

            firstInvalid.focus();

        }
    }


    /* =====================================================
       SUCCESS MESSAGE
    ====================================================== */

    function showSuccessMessage(message) {

        /*
         * Do not depend on a particular toast library.
         *
         * If the admin project already provides a global
         * toast function, use it.
         */

        if (
            typeof window.showToast === "function"
        ) {

            window.showToast(
                message,
                "success"
            );

            return;
        }


        if (
            typeof window.showNotification === "function"
        ) {

            window.showNotification(
                message,
                "success"
            );

            return;
        }


        /*
         * Otherwise, keep this silent.
         *
         * We deliberately do NOT create another random UI
         * component that could conflict with the admin panel.
         */

        console.log(
            `Snackment Coupons: ${message}`
        );
    }


    /* =====================================================
       UTILITY — CREATE ID
    ====================================================== */

    function createCouponId() {

        return (
            "coupon-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );
    }


    /* =====================================================
       UTILITY — NUMBER
    ====================================================== */

    function parseNumber(value) {

        const cleaned =
            String(value || "")
                .replace(/[^\d.-]/g, "");


        const number =
            Number(cleaned);


        return Number.isFinite(number)
            ? number
            : 0;
    }


    /* =====================================================
       UTILITY — CURRENCY
    ====================================================== */

    function parseCurrencyValue(value) {

        return parseNumber(value);
    }


    /* =====================================================
       UTILITY — FORMAT NUMBER
    ====================================================== */

    function formatNumber(value) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {
            return "0";
        }


        /*
         * Avoid unnecessary .00 for normal integer values.
         */

        if (Number.isInteger(number)) {

            return number.toLocaleString("en-IN");

        }


        return number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );
    }


    /* =====================================================
       UTILITY — TODAY ISO DATE
    ====================================================== */

    function getTodayISODate() {

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                now.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;
    }


    /* =====================================================
       PUBLIC API
    ====================================================== */

    /*
     * Expose initialization so the existing admin page
     * loader can explicitly call it after injecting
     * coupons.html.
     */

    window.initCouponsModule =
        initCouponsModule;


    /*
     * Also attempt initialization immediately.
     *
     * This works when coupons.html is already present.
     */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                initCouponsModule();

            },
            {
                once: true
            }
        );

    } else {

        initCouponsModule();

    }


})();