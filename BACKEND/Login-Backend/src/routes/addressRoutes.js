const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");

const {
    getAddresses,
    addAddress,
    setDefaultAddress,
    deleteAddress,
    updateAddress
} = require("../controllers/address.controller");

router.get("/", auth, getAddresses);
router.post("/", auth, addAddress);
router.patch("/default/:id", auth, setDefaultAddress);
router.delete("/:id", auth, deleteAddress);
router.patch("/:id", auth, updateAddress);

module.exports = router;