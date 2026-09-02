/* =========================================================
   SNACKMENT ADMIN — PRODUCTS MODULE
   Frontend-only product management
========================================================= */

(() => {
    "use strict";

    /* =========================================================
       1. PRODUCT DATA
    ========================================================= */

    let products = [
        {
            id: "product-001",
            name: "Lays Classic Salted",
            category: "snacks",
            mrp: 20,
            price: 20,
            stock: 42,
            featured: true,
            image: "../../../../Assets/Images/Products/lays.jpg"
        },
        {
            id: "product-002",
            name: "Maggi 2-Minute Noodles",
            category: "instant-food",
            mrp: 15,
            price: 14,
            stock: 75,
            featured: true,
            image: "../../../../Assets/Images/Products/maggi.jpg"
        },
        {
            id: "product-003",
            name: "Dairy Milk Silk",
            category: "chocolate",
            mrp: 80,
            price: 75,
            stock: 25,
            featured: false,
            image: "../../../../Assets/Images/Products/dairy-milk.jpg"
        },
        {
            id: "product-004",
            name: "Oreo Original",
            category: "biscuits",
            mrp: 40,
            price: 38,
            stock: 0,
            featured: false,
            image: "../../../../Assets/Images/Products/oreo.jpg"
        },
        {
            id: "product-005",
            name: "Red Bull Energy Drink",
            category: "beverages",
            mrp: 130,
            price: 120,
            stock: 14,
            featured: true,
            image: "../../../../Assets/Images/Products/red-bull.jpg"
        },
        {
            id: "product-006",
            name: "Tropicana Orange 200ml",
            category: "beverages",
            mrp: 30,
            price: 28,
            stock: 60,
            featured: false,
            image: "../../../../Assets/Images/Products/tropicana.jpg"
        },
        {
            id: "product-007",
            name: "Haldiram's Aloo Bhujia",
            category: "snacks",
            mrp: 30,
            price: 28,
            stock: 3,
            featured: false,
            image: "../../../../Assets/Images/Products/aloo-bhujia.jpg"
        },
        {
            id: "product-008",
            name: "Britannia Marie Gold",
            category: "biscuits",
            mrp: 25,
            price: 22,
            stock: 41,
            featured: false,
            image: "../../../../Assets/Images/Products/britannia-marie.jpg"
        },
        {
            id: "product-009",
            name: "Thums Up 600ml",
            category: "beverages",
            mrp: 40,
            price: 38,
            stock: 28,
            featured: false,
            image: "../../../../Assets/Images/Products/thums-up.jpg"
        },
        {
            id: "product-010",
            name: "Kit Kat 4-Finger",
            category: "chocolate",
            mrp: 50,
            price: 45,
            stock: 19,
            featured: false,
            image: "../../../../Assets/Images/Products/kitkat.jpg"
        }
    ];

    /* =========================================================
   1A. BACKEND API
========================================================= */

    const API_BASE_URL = "http://localhost:5001/api/admin/products";


    async function loadProductsFromBackend() {

        const token =
            localStorage.getItem("snackmentAdminToken");

        if (!token) {

            console.error(
                "[Products] Admin token not found."
            );

            return false;
        }


        try {

            const response =
                await fetch(
                    API_BASE_URL,
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


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Failed to load products."
                );

            }


            products =
                Array.isArray(data.products)
                    ? data.products.map(product => ({
                        id: product.productId,
                        name: product.name,
                        category: product.category,
                        mrp: product.mrp,
                        price: product.price,
                        stock: product.stock,
                        featured: product.featured,
                        image: product.image || ""
                    }))
                    : [];


            console.log(
                `[Products] Loaded ${products.length} products from backend.`
            );


            return true;

        } catch (error) {

            console.error(
                "[Products] Backend load failed:",
                error
            );

            return false;
        }
    }
    /* =========================================================
       2. STATE
    ========================================================= */

    let searchQuery = "";
    let selectedCategory = "all";
    let selectedStockFilter = "all";

    let currentPage = 1;
    const productsPerPage = 10;

    let editingProductId = null;
    let deletingProductId = null;

    let selectedImageData = "";


    /* =========================================================
       3. DOM REFERENCES
    ========================================================= */

    const elements = {};


    /* =========================================================
       4. CACHE DOM
    ========================================================= */

    function cacheElements() {

        elements.page =
            document.getElementById("products-page");

        elements.table =
            document.getElementById("products-table");

        elements.tableBody =
            document.getElementById("products-table-body");

        elements.searchInput =
            document.getElementById("product-search");

        elements.searchClear =
            document.getElementById("clear-product-search");

        elements.categoryFilter =
            document.getElementById("category-filter");

        elements.stockFilter =
            document.getElementById("stock-filter");

        elements.filterSummary =
            document.getElementById("products-filter-summary");

        elements.filterResultCount =
            document.getElementById("products-filter-result-count");

        elements.clearFilters =
            document.getElementById("clear-product-filters");

        elements.emptyState =
            document.getElementById("products-empty-state");

        elements.emptyStateClear =
            document.getElementById("empty-state-clear");

        elements.productsCount =
            document.getElementById("products-count");

        elements.showingStart =
            document.getElementById("products-showing-start");

        elements.showingEnd =
            document.getElementById("products-showing-end");

        elements.totalCount =
            document.getElementById("products-total-count");

        elements.previousPage =
            document.getElementById("products-prev-page");

        elements.nextPage =
            document.getElementById("products-next-page");

        elements.pageNumberList =
            document.getElementById("products-page-number-list");

        elements.addProductButton =
            document.getElementById("open-add-product");

        elements.modal =
            document.getElementById("product-modal");

        elements.modalOverlay =
            document.getElementById("product-modal-overlay");

        elements.modalTitle =
            document.getElementById("product-modal-title");

        elements.modalDescription =
            document.getElementById("product-modal-description");

        elements.closeModal =
            document.getElementById("close-product-modal");

        elements.cancelModal =
            document.getElementById("cancel-product-modal");

        elements.form =
            document.getElementById("product-form");

        elements.productId =
            document.getElementById("product-id");

        elements.productName =
            document.getElementById("product-name");

        elements.productCategory =
            document.getElementById("product-category");

        elements.productMrp =
            document.getElementById("product-mrp");

        elements.productPrice =
            document.getElementById("product-price");

        elements.productStock =
            document.getElementById("product-stock");

        elements.productFeatured =
            document.getElementById("product-featured");

        elements.productImage =
            document.getElementById("product-image");

        elements.imageUpload =
            document.getElementById("product-image-upload");

        elements.imageUploadEmpty =
            document.getElementById("product-upload-empty");

        elements.imageUploadPreview =
            document.getElementById("product-upload-preview");

        elements.imagePreview =
            document.getElementById("product-image-preview");

        elements.changeImage =
            document.getElementById("change-product-image");

        elements.removeImage =
            document.getElementById("remove-product-image");

        elements.imageError =
            document.getElementById("product-image-error");

        elements.nameError =
            document.getElementById("product-name-error");

        elements.categoryError =
            document.getElementById("product-category-error");

        elements.mrpError =
            document.getElementById("product-mrp-error");

        elements.priceError =
            document.getElementById("product-price-error");

        elements.stockError =
            document.getElementById("product-stock-error");

        elements.formError =
            document.getElementById("product-form-error");

        elements.submitButton =
            document.getElementById("submit-product-form");

        elements.submitText =
            document.getElementById("product-submit-text");

        elements.submitLoader =
            document.getElementById("product-submit-loader");

        elements.deleteModal =
            document.getElementById("product-delete-modal");

        elements.deleteOverlay =
            document.getElementById("product-delete-overlay");

        elements.deleteName =
            document.getElementById("delete-product-name");

        elements.cancelDelete =
            document.getElementById("cancel-product-delete");

        elements.confirmDelete =
            document.getElementById("confirm-product-delete");

        elements.toast =
            document.getElementById("products-toast");

        elements.toastIcon =
            document.getElementById("products-toast-icon");

        elements.toastTitle =
            document.getElementById("products-toast-title");

        elements.toastMessage =
            document.getElementById("products-toast-message");

        elements.closeToast =
            document.getElementById("products-toast-close");
    }


    /* =========================================================
       5. REQUIRED DOM CHECK
    ========================================================= */

    function hasRequiredDOM() {

        return Boolean(
            elements.page &&
            elements.tableBody &&
            elements.addProductButton &&
            elements.modal &&
            elements.form
        );
    }


    /* =========================================================
       6. CATEGORY HELPERS
    ========================================================= */

    function normalizeCategory(category) {

        return String(category || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }


    function formatCategory(category) {

        const categories = {
            snacks: "Snacks",
            "instant-food": "Instant Food",
            chocolate: "Chocolate",
            beverages: "Beverages",
            biscuits: "Biscuits"
        };

        return categories[
            normalizeCategory(category)
        ] || String(category || "Other");
    }


    /* =========================================================
       7. SEARCH
    ========================================================= */

    function bindSearchEvents() {

        elements.searchInput?.addEventListener(
            "input",
            () => {

                searchQuery =
                    elements.searchInput.value
                        .trim()
                        .toLowerCase();

                currentPage = 1;

                updateSearchClearButton();
                renderProducts();
                updateFilterSummary();
            }
        );

        elements.searchClear?.addEventListener(
            "click",
            () => {

                elements.searchInput.value = "";
                searchQuery = "";
                currentPage = 1;

                updateSearchClearButton();
                renderProducts();
                updateFilterSummary();

                elements.searchInput.focus();
            }
        );
    }


    function updateSearchClearButton() {

        if (!elements.searchClear) {
            return;
        }

        elements.searchClear.classList.toggle(
            "hidden",
            !searchQuery
        );
    }


    /* =========================================================
       8. FILTERS
    ========================================================= */

    function bindFilterEvents() {

        elements.categoryFilter?.addEventListener(
            "change",
            () => {

                selectedCategory =
                    elements.categoryFilter.value || "all";

                currentPage = 1;

                renderProducts();
                updateFilterSummary();
            }
        );

        elements.stockFilter?.addEventListener(
            "change",
            () => {

                selectedStockFilter =
                    elements.stockFilter.value || "all";

                currentPage = 1;

                renderProducts();
                updateFilterSummary();
            }
        );

        elements.clearFilters?.addEventListener(
            "click",
            clearFilters
        );

        elements.emptyStateClear?.addEventListener(
            "click",
            clearFilters
        );
    }


    function clearFilters() {

        searchQuery = "";
        selectedCategory = "all";
        selectedStockFilter = "all";
        currentPage = 1;

        if (elements.searchInput) {
            elements.searchInput.value = "";
        }

        if (elements.categoryFilter) {
            elements.categoryFilter.value = "all";
        }

        if (elements.stockFilter) {
            elements.stockFilter.value = "all";
        }

        updateSearchClearButton();
        renderProducts();
        updateFilterSummary();
    }


    /* =========================================================
       9. FILTER PRODUCTS
    ========================================================= */

    function getFilteredProducts() {

        return products.filter(product => {

            const name =
                String(product.name || "")
                    .toLowerCase();

            const category =
                normalizeCategory(product.category);

            const id =
                String(product.id || "")
                    .toLowerCase();

            const matchesSearch =
                !searchQuery ||
                name.includes(searchQuery) ||
                category.includes(searchQuery) ||
                id.includes(searchQuery);

            const matchesCategory =
                selectedCategory === "all" ||
                category ===
                normalizeCategory(selectedCategory);

            let matchesStock = true;

            if (selectedStockFilter === "in-stock") {
                matchesStock =
                    Number(product.stock) > 0;
            }

            if (selectedStockFilter === "out-of-stock") {
                matchesStock =
                    Number(product.stock) <= 0;
            }

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStock
            );
        });
    }


    /* =========================================================
       10. RENDER PRODUCTS
    ========================================================= */

    function renderProducts() {

        if (!elements.tableBody) {
            return;
        }

        const filtered =
            getFilteredProducts();

        const total =
            filtered.length;

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    total / productsPerPage
                )
            );

        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const start =
            (currentPage - 1) *
            productsPerPage;

        const end =
            Math.min(
                start + productsPerPage,
                total
            );

        const pageProducts =
            filtered.slice(start, end);

        elements.tableBody.innerHTML = "";

        if (!pageProducts.length) {

            elements.table?.classList.add(
                "hidden"
            );

            elements.emptyState?.classList.remove(
                "hidden"
            );

            updatePagination(
                total,
                0,
                0,
                totalPages
            );

            return;
        }

        elements.table?.classList.remove(
            "hidden"
        );

        elements.emptyState?.classList.add(
            "hidden"
        );

        pageProducts.forEach(product => {

            elements.tableBody.appendChild(
                createProductRow(product)
            );
        });

        updatePagination(
            total,
            start + 1,
            end,
            totalPages
        );
    }


    /* =========================================================
       11. PRODUCT ROW
    ========================================================= */

    function createProductRow(product) {

        const row =
            document.createElement("tr");

        const stock =
            Number(product.stock) || 0;

        const stockClass =
            stock > 0
                ? "in-stock"
                : "out-of-stock";

        const stockLabel =
            stock > 0
                ? `${stock} in stock`
                : "Out of stock";

        const image =
            product.image ||
            "../../../../Assets/Images/Products/placeholder.png";

        row.innerHTML = `
            <td>
                <div class="product-table-product">
                    <div class="product-table-image">
                        <img
                            src="${escapeAttribute(image)}"
                            alt="${escapeAttribute(product.name)}"
                        >
                    </div>

                    <div class="product-table-product-info">
                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        <span>
                            ${escapeHTML(product.id)}
                        </span>
                    </div>
                </div>
            </td>

            <td>
                <span class="product-category-badge">
                    ${escapeHTML(formatCategory(product.category))}
                </span>
            </td>

            <td>
                ₹${formatMoney(product.mrp)}
            </td>

            <td>
                <strong>
                    ₹${formatMoney(product.price)}
                </strong>
            </td>

            <td>
                <span class="product-stock-badge ${stockClass}">
                    ${escapeHTML(stockLabel)}
                </span>
            </td>

            <td>
                <span class="product-status-badge ${stockClass}">
                    ${stock > 0 ? "Available" : "Unavailable"}
                </span>
            </td>

            <td>
                ${product.featured
                ? `<span class="product-featured-badge">Featured</span>`
                : `<span class="product-not-featured">—</span>`
            }
            </td>

            <td class="products-actions-column">
                <div class="product-row-actions">
                    <button
                        type="button"
                        class="product-action-button"
                        data-action="edit"
                        data-product-id="${escapeAttribute(product.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="product-action-button danger"
                        data-action="delete"
                        data-product-id="${escapeAttribute(product.id)}"
                    >
                        Delete
                    </button>
                </div>
            </td>
        `;

        return row;
    }


    /* =========================================================
       12. TABLE EVENTS
    ========================================================= */

    function bindTableEvents() {

        elements.tableBody?.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );

                if (!button) {
                    return;
                }

                const action =
                    button.dataset.action;

                const productId =
                    button.dataset.productId;

                if (action === "edit") {
                    openEditProduct(productId);
                }

                if (action === "delete") {
                    openDeleteModal(productId);
                }
            }
        );
    }


    /* =========================================================
       13. MODAL EVENTS
    ========================================================= */

    function bindModalEvents() {

        elements.addProductButton?.addEventListener(
            "click",
            event => {

                event.preventDefault();
                openAddProduct();
            }
        );

        elements.closeModal?.addEventListener(
            "click",
            closeProductModal
        );

        elements.cancelModal?.addEventListener(
            "click",
            closeProductModal
        );

        elements.modalOverlay?.addEventListener(
            "click",
            closeProductModal
        );
    }


    /* =========================================================
       14. ADD PRODUCT
    ========================================================= */

    function openAddProduct() {

        editingProductId = null;

        resetProductForm();

        if (elements.modalTitle) {
            elements.modalTitle.textContent =
                "Add New Product";
        }

        if (elements.modalDescription) {
            elements.modalDescription.textContent =
                "Add a new product to your inventory.";
        }

        if (elements.submitText) {
            elements.submitText.textContent =
                "Add Product";
        }

        showProductModal();
    }


    /* =========================================================
       15. EDIT PRODUCT
    ========================================================= */

    function openEditProduct(productId) {

        const product =
            products.find(
                item => item.id === productId
            );

        if (!product) {
            showToast(
                "Error",
                "Product could not be found.",
                "error"
            );

            return;
        }

        editingProductId =
            product.id;

        resetProductForm();

        if (elements.productId) {
            elements.productId.value =
                product.id;
        }

        if (elements.productName) {
            elements.productName.value =
                product.name || "";
        }

        if (elements.productCategory) {
            elements.productCategory.value =
                normalizeCategory(product.category);
        }

        if (elements.productMrp) {
            elements.productMrp.value =
                product.mrp ?? "";
        }

        if (elements.productPrice) {
            elements.productPrice.value =
                product.price ?? "";
        }

        if (elements.productStock) {
            elements.productStock.value =
                product.stock ?? "";
        }

        if (elements.productFeatured) {
            elements.productFeatured.checked =
                Boolean(product.featured);
        }

        if (product.image) {
            selectedImageData =
                product.image;

            showImagePreview(
                product.image
            );
        }

        if (elements.modalTitle) {
            elements.modalTitle.textContent =
                "Edit Product";
        }

        if (elements.modalDescription) {
            elements.modalDescription.textContent =
                "Update the product information below.";
        }

        if (elements.submitText) {
            elements.submitText.textContent =
                "Save Changes";
        }

        showProductModal();
    }


    /* =========================================================
       16. SHOW / CLOSE MODAL
    ========================================================= */

    function showProductModal() {

        if (!elements.modal) {
            return;
        }

        elements.modal.classList.remove(
            "hidden"
        );

        elements.modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "product-modal-open"
        );

        setTimeout(() => {

            elements.productName?.focus();

        }, 50);
    }


    function closeProductModal() {

        if (!elements.modal) {
            return;
        }

        // Agar close button (ya modal ke andar koi aur element)
        // abhi focused hai, pehle usse blur karo aur focus
        // wapas "Add Product" button par bhej do — warna
        // Chrome aria-hidden ko block kar deta hai.
        if (elements.modal.contains(document.activeElement)) {
            document.activeElement?.blur();
            elements.addProductButton?.focus();
        }

        elements.modal.classList.add("hidden");
        elements.modal.setAttribute("aria-hidden", "true");

        document.body.classList.remove("product-modal-open");

        editingProductId = null;

        resetProductForm();
    }


    /* =========================================================
       17. RESET FORM
    ========================================================= */

    function resetProductForm() {

        elements.form?.reset();

        if (elements.productId) {
            elements.productId.value = "";
        }

        if (elements.productMrp) {
            elements.productMrp.value = "";
        }

        if (elements.productPrice) {
            elements.productPrice.value = "";
        }

        if (elements.productStock) {
            elements.productStock.value = "";
        }

        if (elements.productFeatured) {
            elements.productFeatured.checked = false;
        }

        selectedImageData = "";

        clearImagePreview();
        clearFormErrors();

        if (elements.submitButton) {
            elements.submitButton.disabled = false;
        }

        if (elements.submitText) {
            elements.submitText.textContent =
                editingProductId
                    ? "Save Changes"
                    : "Add Product";
        }

        elements.submitLoader?.classList.add(
            "hidden"
        );
    }


    /* =========================================================
       18. IMAGE EVENTS
    ========================================================= */

    function bindImageEvents() {

        if (!elements.imageUpload) {
            return;
        }

        elements.imageUpload.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        "#change-product-image"
                    ) ||
                    event.target.closest(
                        "#remove-product-image"
                    )
                ) {
                    return;
                }

                elements.productImage?.click();
            }
        );

        elements.imageUpload.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    elements.productImage?.click();
                }
            }
        );

        elements.imageUpload.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                elements.imageUpload.classList.add(
                    "drag-over"
                );
            }
        );

        elements.imageUpload.addEventListener(
            "dragleave",
            event => {

                if (
                    event.target ===
                    elements.imageUpload
                ) {

                    elements.imageUpload.classList.remove(
                        "drag-over"
                    );
                }
            }
        );

        elements.imageUpload.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                elements.imageUpload.classList.remove(
                    "drag-over"
                );

                const file =
                    event.dataTransfer.files?.[0];

                if (file) {
                    handleImageFile(file);
                }
            }
        );

        elements.productImage?.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files?.[0];

                if (file) {
                    handleImageFile(file);
                }
            }
        );

        elements.changeImage?.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                elements.productImage?.click();
            }
        );

        elements.removeImage?.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                selectedImageData = "";

                if (elements.productImage) {
                    elements.productImage.value = "";
                }

                clearImagePreview();
            }
        );
    }


    /* =========================================================
       19. IMAGE PROCESSING
    ========================================================= */

    function handleImageFile(file) {

        clearImageError();

        const validTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!validTypes.includes(file.type)) {

            showImageError(
                "Please upload a JPG, PNG or WebP image."
            );

            return;
        }

        if (file.size > 5 * 1024 * 1024) {

            showImageError(
                "Image size must be 5 MB or smaller."
            );

            return;
        }

        const reader =
            new FileReader();

        reader.onload = event => {

            selectedImageData =
                event.target.result;

            showImagePreview(
                selectedImageData
            );
        };

        reader.onerror = () => {

            showImageError(
                "Unable to read the selected image."
            );
        };

        reader.readAsDataURL(file);
    }


    function showImagePreview(imageData) {

        if (
            !elements.imageUploadPreview ||
            !elements.imageUploadEmpty ||
            !elements.imagePreview
        ) {
            return;
        }

        elements.imagePreview.src =
            imageData;

        elements.imageUploadEmpty.classList.add(
            "hidden"
        );

        elements.imageUploadPreview.classList.remove(
            "hidden"
        );
    }


    function clearImagePreview() {

        if (elements.imageUploadEmpty) {
            elements.imageUploadEmpty.classList.remove(
                "hidden"
            );
        }

        if (elements.imageUploadPreview) {
            elements.imageUploadPreview.classList.add(
                "hidden"
            );
        }

        if (elements.imagePreview) {
            elements.imagePreview.src = "";
        }

        clearImageError();
    }


    function showImageError(message) {

        if (!elements.imageError) {
            return;
        }

        elements.imageError.textContent =
            message;

        elements.imageError.classList.remove(
            "hidden"
        );
    }


    function clearImageError() {

        if (!elements.imageError) {
            return;
        }

        elements.imageError.textContent = "";

        elements.imageError.classList.add(
            "hidden"
        );
    }


    /* =========================================================
       20. FORM EVENTS
    ========================================================= */

    function bindFormEvents() {

        elements.form?.addEventListener(
            "submit",
            handleProductSubmit
        );
    }


    /* =========================================================
       21. FORM SUBMIT
    ========================================================= */

    async function handleProductSubmit(event) {

        event.preventDefault();

        clearFormErrors();

        const data =
            getFormData();

        const validation =
            validateProduct(data);

        if (!validation.valid) {

            displayFormErrors(
                validation.errors
            );

            return;
        }

        setSubmitLoading(true);

        try {

            if (editingProductId) {

                await updateExistingProduct(
                    editingProductId,
                    data
                );

                showToast(
                    "Product Updated",
                    `${data.name} has been updated successfully.`,
                    "success"
                );

            } else {

                await createNewProduct(data);

                showToast(
                    "Product Added",
                    `${data.name} has been added to inventory.`,
                    "success"
                );
            }

            currentPage = 1;

            renderProducts();
            updateProductCount();

            closeProductModal();

        } catch (error) {

            console.error(
                "[Products] Save product failed:",
                error
            );

            if (elements.formError) {

                elements.formError.textContent =
                    error.message ||
                    "Failed to save product.";

                elements.formError.classList.remove(
                    "hidden"
                );
            }

            showToast(
                "Error",
                error.message ||
                "Failed to save product.",
                "error"
            );

        } finally {

            setSubmitLoading(false);
        }
    }

    /* =========================================================
       22. FORM DATA
    ========================================================= */

    function getFormData() {

        return {
            name:
                elements.productName?.value
                    .trim() || "",

            category:
                elements.productCategory?.value
                    .trim() || "",

            mrp:
                Number(
                    elements.productMrp?.value
                ),

            price:
                Number(
                    elements.productPrice?.value
                ),

            stock:
                Number(
                    elements.productStock?.value
                ),

            featured:
                Boolean(
                    elements.productFeatured?.checked
                ),

            image:
                selectedImageData || ""
        };
    }


    /* =========================================================
       23. VALIDATION
    ========================================================= */

    function validateProduct(data) {

        const errors = {};

        if (!data.name) {

            errors.name =
                "Product name is required.";

        }

        if (!data.category) {

            errors.category =
                "Please select a category.";

        }

        if (
            !Number.isFinite(data.mrp) ||
            data.mrp <= 0
        ) {

            errors.mrp =
                "Enter a valid MRP.";

        }

        if (
            !Number.isFinite(data.price) ||
            data.price <= 0
        ) {

            errors.price =
                "Enter a valid selling price.";

        }

        if (
            Number.isFinite(data.mrp) &&
            Number.isFinite(data.price) &&
            data.price > data.mrp
        ) {

            errors.price =
                "Selling price cannot be greater than MRP.";

        }

        if (
            !Number.isFinite(data.stock) ||
            data.stock < 0 ||
            !Number.isInteger(data.stock)
        ) {

            errors.stock =
                "Enter a valid whole-number stock quantity.";

        }

        return {
            valid:
                Object.keys(errors).length === 0,

            errors
        };
    }


    /* =========================================================
       24. DISPLAY ERRORS
    ========================================================= */

    function displayFormErrors(errors) {

        const map = {
            name: elements.nameError,
            category: elements.categoryError,
            mrp: elements.mrpError,
            price: elements.priceError,
            stock: elements.stockError
        };

        Object.entries(errors).forEach(
            ([field, message]) => {

                const errorElement =
                    map[field];

                if (!errorElement) {
                    return;
                }

                errorElement.textContent =
                    message;

                errorElement.classList.remove(
                    "hidden"
                );

                const input =
                    getFieldElement(field);

                input?.classList.add(
                    "field-error"
                );
            }
        );
    }


    function getFieldElement(field) {

        const map = {
            name: elements.productName,
            category: elements.productCategory,
            mrp: elements.productMrp,
            price: elements.productPrice,
            stock: elements.productStock
        };

        return map[field] || null;
    }


    function clearFormErrors() {

        const errorElements = [
            elements.nameError,
            elements.categoryError,
            elements.mrpError,
            elements.priceError,
            elements.stockError,
            elements.formError
        ];

        errorElements.forEach(
            element => {

                if (!element) {
                    return;
                }

                element.textContent = "";

                element.classList.add(
                    "hidden"
                );
            }
        );

        document
            .querySelectorAll(
                "#product-form .field-error"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "field-error"
                    );
                }
            );
    }


    /* =========================================================
       25. CREATE / UPDATE
    ========================================================= */

    async function createNewProduct(data) {

        const token =
            localStorage.getItem("snackmentAdminToken");

        if (!token) {
            throw new Error("Admin authentication required.");
        }

        const response =
            await fetch(
                API_BASE_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name: data.name,
                        category: data.category,
                        mrp: data.mrp,
                        price: data.price,
                        stock: data.stock,
                        featured: data.featured,
                        image: data.image
                    })
                }
            );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Failed to create product."
            );
        }

        const product =
            result.product;

        products.unshift({
            id: product.productId,
            name: product.name,
            category: product.category,
            mrp: product.mrp,
            price: product.price,
            stock: product.stock,
            featured: product.featured,
            image: product.image || ""
        });

        return product;
    }

    async function updateExistingProduct(productId, data) {

        const token =
            localStorage.getItem("snackmentAdminToken");

        if (!token) {
            throw new Error("Admin authentication required.");
        }

        const response =
            await fetch(
                `${API_BASE_URL}/${encodeURIComponent(productId)}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name: data.name,
                        category: data.category,
                        mrp: data.mrp,
                        price: data.price,
                        stock: data.stock,
                        featured: data.featured,
                        image: data.image
                    })
                }
            );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Failed to update product."
            );
        }

        const updated =
            result.product;

        const index =
            products.findIndex(
                product =>
                    product.id === productId
            );

        if (index !== -1) {

            products[index] = {
                id: updated.productId,
                name: updated.name,
                category: updated.category,
                mrp: updated.mrp,
                price: updated.price,
                stock: updated.stock,
                featured: updated.featured,
                image: updated.image || ""
            };

        }

        return updated;
    }


    function generateProductId() {

        let number =
            products.length + 1;

        let id =
            `product-${String(number).padStart(3, "0")}`;

        while (
            products.some(
                product =>
                    product.id === id
            )
        ) {

            number++;

            id =
                `product-${String(number).padStart(3, "0")}`;
        }

        return id;
    }


    /* =========================================================
       26. DELETE
    ========================================================= */

    function bindDeleteEvents() {

        elements.cancelDelete?.addEventListener(
            "click",
            closeDeleteModal
        );

        elements.deleteOverlay?.addEventListener(
            "click",
            closeDeleteModal
        );

        elements.confirmDelete?.addEventListener(
            "click",
            confirmDelete
        );
    }


    function openDeleteModal(productId) {

        const product =
            products.find(
                item =>
                    item.id === productId
            );

        if (!product) {
            return;
        }

        deletingProductId =
            productId;

        if (elements.deleteName) {
            elements.deleteName.textContent =
                product.name;
        }

        elements.deleteModal?.classList.remove(
            "hidden"
        );

        elements.deleteModal?.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    function closeDeleteModal() {

        elements.deleteModal?.classList.add(
            "hidden"
        );

        elements.deleteModal?.setAttribute(
            "aria-hidden",
            "true"
        );

        deletingProductId = null;
    }


    async function confirmDelete() {

        if (!deletingProductId) {
            return;
        }

        const product =
            products.find(
                item =>
                    item.id === deletingProductId
            );

        if (!product) {
            closeDeleteModal();
            return;
        }

        const productId =
            deletingProductId;

        const token =
            localStorage.getItem("snackmentAdminToken");

        if (!token) {

            showToast(
                "Error",
                "Admin authentication required.",
                "error"
            );

            return;
        }

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/${encodeURIComponent(productId)}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );

            const result =
                await response.json();

            if (!response.ok || !result.success) {

                throw new Error(
                    result.message ||
                    "Failed to delete product."
                );
            }

            products =
                products.filter(
                    item =>
                        item.id !== productId
                );

            currentPage = 1;

            renderProducts();
            updateProductCount();

            showToast(
                "Product Deleted",
                `${product.name} has been removed from inventory.`,
                "success"
            );

            closeDeleteModal();

        } catch (error) {

            console.error(
                "[Products] Delete failed:",
                error
            );

            showToast(
                "Error",
                error.message ||
                "Failed to delete product.",
                "error"
            );
        }
    }

    /* =========================================================
       27. PAGINATION
    ========================================================= */

    function bindPaginationEvents() {

        elements.previousPage?.addEventListener(
            "click",
            () => {

                if (currentPage > 1) {

                    currentPage--;

                    renderProducts();
                }
            }
        );

        elements.nextPage?.addEventListener(
            "click",
            () => {

                const totalPages =
                    Math.max(
                        1,
                        Math.ceil(
                            getFilteredProducts().length /
                            productsPerPage
                        )
                    );

                if (currentPage < totalPages) {

                    currentPage++;

                    renderProducts();
                }
            }
        );
    }


    function updatePagination(
        total,
        start,
        end,
        totalPages
    ) {

        if (elements.showingStart) {
            elements.showingStart.textContent =
                start;
        }

        if (elements.showingEnd) {
            elements.showingEnd.textContent =
                end;
        }

        if (elements.totalCount) {
            elements.totalCount.textContent =
                total;
        }

        if (elements.previousPage) {

            elements.previousPage.disabled =
                currentPage <= 1;
        }

        if (elements.nextPage) {

            elements.nextPage.disabled =
                currentPage >= totalPages;
        }

        if (!elements.pageNumberList) {
            return;
        }

        elements.pageNumberList.innerHTML = "";

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            const button =
                document.createElement("button");

            button.type =
                "button";

            button.className =
                "products-pagination-number";

            if (page === currentPage) {
                button.classList.add("active");
            }

            button.textContent =
                page;

            button.addEventListener(
                "click",
                () => {

                    currentPage =
                        page;

                    renderProducts();
                }
            );

            elements.pageNumberList.appendChild(
                button
            );
        }
    }


    /* =========================================================
       28. PRODUCT COUNT
    ========================================================= */

    function updateProductCount() {

        if (elements.productsCount) {

            elements.productsCount.textContent =
                products.length;
        }
    }


    /* =========================================================
       29. FILTER SUMMARY
    ========================================================= */

    function updateFilterSummary() {

        const filtering =
            Boolean(
                searchQuery ||
                selectedCategory !== "all" ||
                selectedStockFilter !== "all"
            );

        if (!elements.filterSummary) {
            return;
        }

        elements.filterSummary.classList.toggle(
            "hidden",
            !filtering
        );

        if (filtering) {

            const count =
                getFilteredProducts().length;

            if (elements.filterResultCount) {

                elements.filterResultCount.textContent =
                    `${count} product${count === 1 ? "" : "s"} found`;
            }
        }
    }


    /* =========================================================
       30. SUBMIT LOADING
    ========================================================= */

    function setSubmitLoading(loading) {

        if (elements.submitButton) {

            elements.submitButton.disabled =
                loading;
        }

        elements.submitLoader?.classList.toggle(
            "hidden",
            !loading
        );

        if (elements.submitText) {

            if (loading) {

                elements.submitText.textContent =
                    editingProductId
                        ? "Saving..."
                        : "Adding...";

            } else {

                elements.submitText.textContent =
                    editingProductId
                        ? "Save Changes"
                        : "Add Product";
            }
        }
    }


    /* =========================================================
       31. TOAST
    ========================================================= */

    function bindToastEvents() {

        elements.closeToast?.addEventListener(
            "click",
            hideToast
        );
    }


    function showToast(
        title,
        message,
        type = "success"
    ) {

        if (!elements.toast) {
            return;
        }

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

        window.clearTimeout(
            showToast.timeout
        );

        showToast.timeout =
            window.setTimeout(
                hideToast,
                3500
            );
    }


    function hideToast() {

        elements.toast?.classList.add(
            "hidden"
        );
    }


    /* =========================================================
       32. KEYBOARD EVENTS
    ========================================================= */

    function bindKeyboardEvents() {

        document.addEventListener(
            "keydown",
            event => {

                if (event.key !== "Escape") {
                    return;
                }

                if (
                    elements.modal &&
                    !elements.modal.classList.contains(
                        "hidden"
                    )
                ) {

                    closeProductModal();

                    return;
                }

                if (
                    elements.deleteModal &&
                    !elements.deleteModal.classList.contains(
                        "hidden"
                    )
                ) {

                    closeDeleteModal();
                }
            }
        );
    }


    /* =========================================================
       33. ESCAPE HTML
    ========================================================= */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function escapeAttribute(value) {

        return escapeHTML(value);
    }


    /* =========================================================
       34. MONEY
    ========================================================= */

    function formatMoney(value) {

        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return "0";
        }

        return Number.isInteger(number)
            ? String(number)
            : number.toFixed(2);
    }


    /* =========================================================
       35. INITIALIZE
    ========================================================= */

    function initializeProducts() {

        cacheElements();

        if (!hasRequiredDOM()) {

            console.error(
                "[Products] Required Products DOM is missing."
            );

            return false;
        }

        if (
            elements.page.dataset.productsInitialized ===
            "true"
        ) {

            return true;
        }

        elements.page.dataset.productsInitialized =
            "true";

        bindSearchEvents();
        bindFilterEvents();
        bindModalEvents();
        bindImageEvents();
        bindFormEvents();
        bindTableEvents();
        bindPaginationEvents();
        bindDeleteEvents();
        bindToastEvents();
        bindKeyboardEvents();

        loadProductsFromBackend()
            .then(success => {

                if (success) {

                    renderProducts();
                    updateProductCount();
                    updateSearchClearButton();
                    updateFilterSummary();

                    return;
                }

                // Backend unavailable:
                // existing local products remain as fallback.

                renderProducts();
                updateProductCount();
                updateSearchClearButton();
                updateFilterSummary();

            });

        return true;
    }


    /* =========================================================
       36. DYNAMIC ADMIN PAGE SUPPORT
    ========================================================= */

    function tryInitializeProducts() {

        const page =
            document.getElementById(
                "products-page"
            );

        if (!page) {
            return false;
        }

        return initializeProducts();
    }


    window.initializeProducts =
        tryInitializeProducts;


    /* =========================================================
       37. INITIAL EXECUTION
    ========================================================= */

    tryInitializeProducts();


    /* =========================================================
       38. MUTATION OBSERVER
    ========================================================= */

    const observer =
        new MutationObserver(
            () => {

                const page =
                    document.getElementById(
                        "products-page"
                    );

                if (!page) {
                    return;
                }

                if (
                    page.dataset.productsInitialized !==
                    "true"
                ) {

                    tryInitializeProducts();
                }
            }
        );

    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );

})();