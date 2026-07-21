const API_BASE = "http://localhost:5001/api";
const token = localStorage.getItem("token");

if (!token) {
  openLoginModal();
  throw "Login required";
}

const orderItemsEl = document.getElementById("orderItems");
const itemCountEl = document.getElementById("itemCount");
const itemTotalEl = document.getElementById("itemTotal");
const deliveryFeeEl = document.getElementById("deliveryFee");
const totalPayableEl = document.getElementById("totalPayable");
const footerTotalEl = document.getElementById("footerTotal");
const freeHintEl = document.getElementById("freeHint");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const changeBtn = document.querySelector(".change-btn");
const addressOverlay = document.getElementById("addressOverlay");
const closeAddressModal = document.getElementById("closeAddressModal");
const defaultAddress = document.getElementById("defaultAddress");
const savedAddresses = document.getElementById("savedAddresses");
const savedHeading = document.getElementById("savedHeading");
const couponInput = document.querySelector(".coupon-input input");
const applyBtn = document.querySelector(".coupon-input button");
const couponList = document.getElementById("couponList");
const couponRow = document.getElementById("couponRow");
const couponDiscountEl = document.getElementById("couponDiscount");
const removeCouponBox = document.getElementById("removeCouponBox");
const removeCouponBtn = document.getElementById("removeCouponBtn");

let selectedCoupon = "";
let selectedAddress = null;
let checkoutItems = [];

const FREE_DELIVERY_LIMIT = 199;
const DELIVERY_FEE = 10;
let cartSubtotal = 0;
let appliedDiscount = 0;
let appliedCoupon = null;
let bill = {};
let deliveryType = "pickup";

const latestOrder = JSON.parse(
  localStorage.getItem(
    "snackment_latest_order"
  )
);
if (
  latestOrder &&
  hasActiveOrder()
) {
  window.location.replace(
    "order-success.html"
  );
}

async function loadCheckout() {
  const res = await fetch(`${API_BASE}/cart`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("USER API RESPONSE:", data);

  renderCheckout(data.items || []);

  await loadCoupons();
}
// ================= DELIVERY ADDRESS =================
async function loadDeliveryAddress() {
  try {
    const res = await fetch(`${API_BASE}/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    selectedAddress = {

      hostel: data.hostel,

      room: data.room,

      address: data.address

    };
    console.log("USER DATA:", data); // 🔴 VERY IMPORTANT

    if (!data || !data.hostel || !data.room || !data.address) {
      document.getElementById("addressTitle").innerText =
        "Address not found";
      document.getElementById("addressDesc").innerText =
        "Please complete your profile";
      return;
    }

    // ✅ CORRECT (FLAT DATA)
    document.getElementById("addressTitle").innerText =
      `${data.hostel} - Room ${data.room}`;

    document.getElementById("addressDesc").innerText =
      data.address;

    document.getElementById("modalAddressTitle").innerText =
      `${data.hostel} - Room ${data.room}`;

    document.getElementById("modalAddressDesc").innerText =
      data.address;

  } catch (err) {
    console.error("Address load failed", err);
    document.getElementById("addressTitle").innerText =
      "Error loading address";
    document.getElementById("addressDesc").innerText = "";
  }
}

async function loadSavedAddresses() {

  try {

    const res = await fetch(`${API_BASE}/address`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const addresses = await res.json();

    savedAddresses.innerHTML = "";

    if (addresses.length > 0) {
      savedHeading.style.display = "block";
    } else {
      savedHeading.style.display = "none";
    }

    addresses.forEach(add => {

      const card = document.createElement("div");

      card.className = "address-option";

      card.innerHTML = `

                <div class="address-left">

                    <div class="home-icon">
                        <img src="../Assets/Images/Symbols/home.svg">
                    </div>

                    <div class="address-info">

                        <div class="address-top">
                            <h4>${add.hostel} - Room ${add.room}</h4>
                        </div>

                        <p>${add.address}</p>

                    </div>

                </div>

                <div class="tick" style="visibility:hidden">
                    <img src="../Assets/Images/Symbols/check-mark.svg">
                </div>

            `;

      savedAddresses.appendChild(card);

    });

    attachAddressEvents();

  } catch (err) {

    console.log(err);

  }

}

function calculateBill() {

  const subtotal = cartSubtotal;

  const discount = appliedDiscount;

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

    total,

    freeDelivery: delivery === 0,

    remainingForFreeDelivery:
      Math.max(
        FREE_DELIVERY_LIMIT - subtotal,
        0
      )

  };

}

function renderCheckout(items) {
  checkoutItems = items;
  orderItemsEl.innerHTML = "";

  cartSubtotal = 0;

  items.forEach(item => {
    cartSubtotal += item.price * item.qty;

    orderItemsEl.innerHTML += `

<div class="order-item">

    <div class="order-item-left">

        <img src="${item.image}" alt="${item.name}">

        <div class="order-info">

            <h4>${item.name}</h4>

            <div class="order-meta">

                <span>Qty: ${item.qty}</span>

                <span class="price">₹${item.price}</span>

            </div>

        </div>

    </div>

    <div class="order-price">
        ₹${item.price * item.qty}
    </div>

</div>

`;
  });

  itemCountEl.textContent = `${items.length} items`;
  bill = calculateBill();
  itemTotalEl.textContent = `₹${bill.subtotal}`;

  if (bill.delivery === 0) {

    deliveryFeeEl.innerHTML =
      `<span class="free-delivery">Free</span>`;

  } else {

    deliveryFeeEl.textContent =
      `₹${bill.delivery}`;

  }

  if (bill.discount > 0) {
    couponRow.style.display = "flex";
    couponDiscountEl.textContent = `-₹${bill.discount}`;
    removeCouponBox.style.display = "block";
  }
  else {
    couponRow.style.display = "none";
    removeCouponBox.style.display = "none";
  }
  totalPayableEl.textContent = `₹${bill.total}`;
  footerTotalEl.textContent = bill.total;
  placeOrderBtn.textContent = `Place Order • ₹${bill.total}`;

  if (bill.freeDelivery) {

    freeHintEl.textContent =
      " You're eligible for FREE Delivery";

  }
  else {

    freeHintEl.textContent =
      `Add ₹${bill.remainingForFreeDelivery} more for free delivery`;

  }
  const savings =
    bill.discount +
    (bill.delivery === 0 ? DELIVERY_FEE : 0);

  if (savings > 0) {

    savingText.style.display = "block";

    savingText.textContent =
      `You'll save ₹${savings} on this order! `;

  } else {

    savingText.style.display = "none";

  }
}

document.getElementById("editCartBtn").onclick = () => {
  history.back();
};

document.getElementById("backToCart").onclick = (e) => {
  e.preventDefault();
  history.back();
};


function renderCouponButton(coupon) {

  // Already Applied
  if (appliedCoupon && appliedCoupon.code === coupon.code) {

    return `
            <button class="coupon-applied">
                ✓ Applied
            </button>
        `;

  }

  // Another coupon already applied
  if (appliedCoupon) {

    return `
            <button class="coupon-disabled" disabled>
                Unavailable
            </button>
        `;

  }

  // Eligible
  if (cartSubtotal >= coupon.minOrder) {

    return `
            <button class="coupon-apply">
                Apply
            </button>
        `;

  }

  // Locked
  return `
        <button class="coupon-locked" disabled>
            Add ₹${coupon.minOrder - cartSubtotal} more
        </button>
    `;

}
document.addEventListener("DOMContentLoaded", () => {

  loadDeliveryAddress();
  loadSavedAddresses();
  loadCheckout();
});

placeOrderBtn.onclick = () => {

  const checkoutPayload = {

    deliveryMethod: deliveryType,

    coupon: appliedCoupon
      ? {
        code: appliedCoupon.code,
        discount: bill.discount
      }
      : null,

    address: selectedAddress,

    paymentMethod: "scan_on_delivery"

  };

  localStorage.setItem(
    "snackment_checkout",
    JSON.stringify(checkoutPayload)
  );

  window.location.href = "payment.html";

};

// popup for adress change
changeBtn.addEventListener("click", () => {

  addressOverlay.classList.add("show");

  document.body.style.overflow = "hidden";

  attachAddressEvents();

});

closeAddressModal.addEventListener("click", closeAddress);

addressOverlay.addEventListener("click", (e) => {

  if (e.target === addressOverlay) {

    closeAddress();

  }

});
function closeAddress() {

  addressOverlay.classList.remove("show");

  document.body.style.overflow = "";

}

// ================= ADD ADDRESS VIEW =================

const listView = document.getElementById("addressListView");
const formView = document.getElementById("addAddressView");

const openAddAddress = document.getElementById("openAddAddress");
const cancelAddress = document.getElementById("cancelAddress");
const saveAddress = document.getElementById("saveAddress");

const hostelInput = document.getElementById("hostelInput");
const roomInput = document.getElementById("roomInput");
const addressInput = document.getElementById("addressInput");

const modalHeading = document.querySelector(".modal-title h2");
const modalSubHeading = document.querySelector(".modal-title p");

// ---------------- Open Form ----------------

openAddAddress.addEventListener("click", () => {

  listView.classList.add("hide");
  formView.classList.add("show");

  modalHeading.textContent = "Add New Address";
  modalSubHeading.textContent = "Choose where to deliver";

});

// ---------------- Cancel ----------------

cancelAddress.addEventListener("click", () => {

  formView.classList.remove("show");
  listView.classList.remove("hide");

  modalHeading.textContent = "Select Delivery Address";
  modalSubHeading.textContent = "Choose where to deliver";

});

// ---------------- Save ----------------

saveAddress.addEventListener("click", async () => {

  const hostel = hostelInput.value.trim();
  const room = roomInput.value.trim();
  const address = addressInput.value.trim();

  if (!hostel || !room || !address) {
    alert("Please fill all fields.");
    return;
  }
  await fetch(`${API_BASE}/address`, {

    method: "POST",

    headers: {

      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`

    },

    body: JSON.stringify({

      hostel,
      room,
      address

    })

  });

  await loadSavedAddresses();
  document.getElementById("addressTitle").innerText =
    `${hostel} - Room ${room}`;

  document.getElementById("addressDesc").innerText =
    address;
  // Remove previous selection

  // Clear form

  hostelInput.value = "";
  roomInput.value = "";
  addressInput.value = "";

  // Back

  formView.classList.remove("show");
  listView.classList.remove("hide");

  modalHeading.textContent = "Select Delivery Address";
  modalSubHeading.textContent = "Choose where to deliver";

});

function attachAddressEvents() {

  document.querySelectorAll(
    "#defaultAddress .address-option, #savedAddresses .address-option"
  ).forEach(card => {

    card.onclick = () => {

      // Remove selection from all cards
      document.querySelectorAll(
        "#defaultAddress .address-option, #savedAddresses .address-option"
      ).forEach(c => {

        c.classList.remove("selected");

        const tick = c.querySelector(".tick");

        if (tick) {
          tick.style.visibility = "hidden";
        }

      });

      // Select clicked card
      card.classList.add("selected");

      const selectedTick = card.querySelector(".tick");

      if (selectedTick) {
        selectedTick.style.visibility = "visible";
      }

      // Update checkout card
      const title = card.querySelector("h4").innerText;
      const desc = card.querySelector("p").innerText;

      document.getElementById("addressTitle").innerText = title;
      document.getElementById("addressDesc").innerText = desc;
      const [hostel, room] = title.split(" - Room ");

      selectedAddress = {

        hostel,

        room,

        address: desc

      };

    };

  });

}

applyBtn.addEventListener("click", async () => {

  if (!selectedCoupon) return;

  const res = await fetch(`${API_BASE}/coupon/apply`, {

    method: "POST",

    headers: {

      "Content-Type": "application/json"

    },

    body: JSON.stringify({

      code: selectedCoupon,

      subtotal: cartSubtotal

    })

  });

  const data = await res.json();

  if (!data.success) {

    alert(data.message);

    return;

  }

  appliedDiscount = data.bill.discount;

  appliedCoupon = data.coupon;

  couponInput.value = selectedCoupon;
  applyBtn.disabled = true;


  // 👇 Ye 3 lines yahin hongi
  applyBtn.textContent = "Applied";
  applyBtn.classList.add("enabled");


  await refreshCheckout();

});

async function loadCoupons() {

  try {

    const res = await fetch(`${API_BASE}/coupon`);

    const coupons = await res.json();

    couponList.innerHTML = "";

    coupons.forEach(coupon => {

      couponList.innerHTML += `

<div class="coupon" data-code="${coupon.code}">

    <div>

        <strong>${coupon.code}</strong>

        <p>${coupon.description}</p>

    </div>

    ${renderCouponButton(coupon)}

</div>

`;

    });

    attachCouponEvents();

  }

  catch (err) {

    console.log(err);

  }

}
async function getCartItems() {

  const res = await fetch(`${API_BASE}/cart`, {

    headers: {
      Authorization: `Bearer ${token}`
    }

  });

  const data = await res.json();

  return data.items || [];

}
function attachCouponEvents() {
  if (appliedCoupon) return;
  document.querySelectorAll(".coupon-apply").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const card = btn.closest(".coupon");
      selectedCoupon = card.dataset.code;
      couponInput.value = selectedCoupon;
      // 👇 Ye do lines add karo
      applyBtn.disabled = false;
      applyBtn.classList.add("enabled");
    });
  });
}

removeCouponBtn.addEventListener("click", async () => {
  appliedCoupon = null;
  appliedDiscount = 0;
  selectedCoupon = "";
  couponInput.value = "";
  applyBtn.disabled = true;
  applyBtn.textContent = "Apply";
  applyBtn.classList.remove("enabled");
  applyBtn.style.background = "";
  await refreshCheckout();
});

couponInput.addEventListener("input", () => {

  if (couponInput.value.trim() === "") {

    applyBtn.disabled = true;
    applyBtn.classList.remove("enabled");

  }

});
async function refreshCheckout() {

  const items = await getCartItems();

  renderCheckout(items);

  await loadCoupons();

}

document.querySelectorAll(".delivery-option").forEach(option => {
  option.addEventListener("click", async () => {
    document.querySelectorAll(".delivery-option")
      .forEach(card => card.classList.remove("active"));
    option.classList.add("active");
    deliveryType = option.dataset.delivery;
    await refreshCheckout();
  });
});