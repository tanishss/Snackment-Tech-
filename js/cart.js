// ================= API CONFIG =================
const API_BASE = "https://snackment-backend.onrender.com/api";

function hasCelebrated() {
    return sessionStorage.getItem("free_delivery_celebrated") === "true";
}

function markCelebrated() {
    sessionStorage.setItem("free_delivery_celebrated", "true");
}

function resetCelebration() {
    sessionStorage.removeItem("free_delivery_celebrated");
}

// ================= AUTH HELPERS =================
function getToken() {
    return localStorage.getItem("token");
}

function isLoggedIn() {
    return !!getToken();
}

// ================= CART STATE =================
let cart = JSON.parse(localStorage.getItem("snackment_cart")) || {
    items: []
};

// ================= ELEMENTS =================
const cartDrawer = document.getElementById("cartDrawer");
const cartBody = document.getElementById("cartBody");
const cartFooter = document.getElementById("cartFooter");
const cartCount = document.querySelector(".cart-count");
const cartSubtotalEl = document.getElementById("cartSubtotal");

const overlay = document.querySelector(".overlay");
const cartBtn = document.querySelector(".cart-btn");
const cartCloseBtn = document.querySelector(".cart-close");
const toast = document.getElementById("toast");


// ================= UTIL FUNCTIONS =================
function saveCart() {
    if (!isLoggedIn()) {
        localStorage.setItem("snackment_cart", JSON.stringify(cart));
    }
}

function getTotalQty() {
    return cart.items.reduce((sum, item) => sum + item.qty, 0);
}

function getSubtotal() {
    return cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

let checkoutBounced = false;

// ================= API CART =================
async function fetchCartFromAPI() {
    try {
        const res = await fetch(`${API_BASE}/cart`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await res.json();
        cart.items = (data.items || []).map(item => ({
            ...item,
            id: item.productId
        }));

    } catch (err) {
        console.error("Failed to fetch cart from backend", err);
    }
}

// ================= CELEBRATION =================
function triggerCelebration() {
    const container = document.getElementById("celebration");
    if (!container) return;

    for (let i = 0; i < 24; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";

        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.background =
            ["#22c55e", "#86efac", "#4ade80"][Math.floor(Math.random() * 3)];
        confetti.style.animationDelay = Math.random() * 0.2 + "s";

        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1300);
    }
}

// ================= TOAST =================

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

// ================= CART UI =================
function updateCartBadge() {
    const qty = getTotalQty();
    if (qty > 0) {
        cartCount.hidden = false;
        cartCount.textContent = qty;
    } else {
        cartCount.hidden = true;
    }
}

function openCart() {
    // agar login modal open hai toh cart mat kholo
    if (document.querySelector(".login-modal.active")) return;

    cartDrawer.classList.add("open");
    overlay.classList.add("active");
    // 🔒 background freeze
    document.body.style.overflow = "hidden";
}

function closeCart() {
    cartDrawer.classList.remove("open");
    overlay.classList.remove("active");
    // 🔓 background unfreeze
    document.body.style.overflow = "";
}

// ================= RENDER CART =================
function renderCart() {
    cartBody.innerHTML = "";

    if (cart.items.length === 0) {
        cartFooter.hidden = true;

        cartBody.innerHTML = `
      <div class="cart-empty">
         <div class="empty-icon-circle">
             <img src="Assets/Images/Symbols/shopping-cart.svg" alt="Empty Cart">
         </div>
         <h4>Your cart is empty</h4>
         <p class="add-some-snacks">Add some snacks to get started 😋</p>
         <button class="start-shopping-btn">Start Shopping</button>
      </div>
    `;
        /* START SHOPPING → CLOSE CART */
        cartBody.querySelector(".start-shopping-btn")
            .addEventListener("click", closeCart);
        return;
    }

    cart.items.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item-card";

        div.innerHTML = `
    <img class="cart-item-img" src="${item.image}" alt="${item.name}">

    <div class="cart-item-info">
      <h5 class="cart-item-name">${item.name}</h5>
      <div class="cart-item-meta">
        <span class="cart-item-price">₹${item.price}</span>
        <span class="cart-item-category">${item.category || "Snacks"}</span>
      </div>
    </div>

    <div class="cart-item-qty">
      <button class="qty-minus">−</button>
      <span>${item.qty}</span>
      <button class="qty-plus">+</button>
    </div>
  `;


        div.querySelector(".qty-plus").onclick = async () => {
            if (isLoggedIn()) {
                await fetch(`${API_BASE}/cart/add`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({
                        productId: item.id,
                        qty: 1
                    })
                });
                await fetchCartFromAPI();
            } else {
                item.qty++;
            }
            updateCart();
        };


        div.querySelector(".qty-minus").onclick = async () => {
            if (isLoggedIn()) {
                await fetch(`${API_BASE}/cart/remove`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({
                        productId: item.id
                    })
                });
                await fetchCartFromAPI();
            } else {
                item.qty--;
                if (item.qty <= 0) {
                    cart.items = cart.items.filter(i => i.id !== item.id);
                }
            }
            updateCart();
        };


        cartBody.appendChild(div);
    });

    cartFooter.hidden = false;
    cartSubtotalEl.textContent = `₹${getSubtotal()}`;

    // items count
    document.getElementById("cartItemsCount").textContent =
        `${getTotalQty()} items`;


    // ===== FREE DELIVERY SMART LOGIC =====
    const FREE_DELIVERY_LIMIT = 199;

    const freeDeliveryText = document.getElementById("freeDeliveryText");
    const progressFill = document.getElementById("freeDeliveryProgress");
    const subtotal = getSubtotal();

    if (freeDeliveryText && progressFill) {
        if (subtotal >= FREE_DELIVERY_LIMIT) {
            freeDeliveryText.textContent = "You are eligible for free delivery 🎉";
            freeDeliveryText.style.color = "#16a34a";
            progressFill.style.width = "100%";

            // 🎉 celebrate ONLY once per threshold-cross
            if (!hasCelebrated()) {
                triggerCelebration();
                markCelebrated();
            }

            // bounce checkout only once
            const checkoutBtn = document.querySelector(".checkout-btn");
            if (checkoutBtn && !checkoutBounced) {
                checkoutBtn.classList.add("bounce");
                checkoutBounced = true;

                setTimeout(() => {
                    checkoutBtn.classList.remove("bounce");
                }, 500);
            }

        } else {
            // reset when user goes below threshold
            resetCelebration();
            checkoutBounced = false;

            const remaining = FREE_DELIVERY_LIMIT - subtotal;
            const percent = Math.min(
                (subtotal / FREE_DELIVERY_LIMIT) * 100,
                100
            );

            freeDeliveryText.textContent =
                `₹${remaining} more to get free delivery`;
            freeDeliveryText.style.color = "#6b7280";
            progressFill.style.width = `${percent}%`;
        }
    }

}

// ================= UPDATE CART =================
function updateCart() {
    saveCart();
    updateCartBadge();
    renderCart();
}

// ================= ADD TO CART =================

async function addToCart(product) {
    // ==========================================
// ACTIVE ORDER CHECK
// ==========================================

if (hasActiveOrder()) {

    showActiveOrderPopup();

    return;

}
    if (!isLoggedIn()) {
        // GUEST → localStorage
        const existing = cart.items.find(i => i.id === product.id);
        if (existing) {
            existing.qty++;
        } else {
            cart.items.push({ ...product, qty: 1 });
        }
        updateCart();
        showToast("Item added to cart");
        return;
    }

    // LOGGED IN → API
    try {
        await fetch(`${API_BASE}/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                qty: 1
            })
        });

        await fetchCartFromAPI();
        updateCart();
        showToast("Item added to cart");
    } catch (err) {
        console.error("Add to cart failed", err);
    }
}

// ================= EVENT LISTENERS =================

// Open cart
cartBtn.addEventListener("click", openCart);

// Close cart
cartCloseBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

// Add buttons (featured + hero cards)
document.querySelectorAll(".featured-add-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        const card = e.target.closest(".floating-card, .featured-card");
        if (!card) return;

        const name = card.querySelector("h4")?.innerText;
        const priceText = card.querySelector(".price, .featured-price")?.innerText;
        const image = card.querySelector("img")?.src;

        const price = parseInt(priceText.replace("₹", ""));

        const product = {
            id: name,
            name,
            price,
            image
        };

        addToCart(product);
    });
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeCart();
    }
});
// ================= CHECKOUT REDIRECT =================
const checkoutBtn = document.querySelector(".checkout-btn");

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {

        // 🔐 login required
        if (!isLoggedIn()) {
            if (typeof openLoginModal === "function") {
                openLoginModal();
            }
            return;
        }

        // 🛒 empty cart guard
        if (!cart.items || cart.items.length === 0) {
            showToast("Your cart is empty");
            return;
        }

        // ✅ go to checkout page
        window.location.href = "HTML/checkout.html";
    });
}


// ================= INIT =================
(async function initCart() {
    if (isLoggedIn()) {
        await fetchCartFromAPI();
    } else {
        cart = JSON.parse(localStorage.getItem("snackment_cart")) || { items: [] };
    }
    updateCart();
})();

