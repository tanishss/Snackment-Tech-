const User = require("../models/User");

exports.getAddresses = async (req, res) => {

    try {

        const user = await User.findById(req.userId).select("addresses");

        res.json(user.addresses);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to fetch addresses."
        });

    }

};

exports.addAddress = async (req, res) => {

    try {

        const {
            hostel,
            room,
            address,
            isDefault
        } = req.body;

        if (!hostel || !room || !address) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const user = await User.findById(req.userId);

        if (user.addresses.length >= 5) {
            return res.status(400).json({
                message: "Maximum 5 addresses allowed."
            });
        }

        const alreadyExists = user.addresses.some(existing =>

            existing.hostel === hostel &&
            existing.room === room &&
            existing.address === address

        );

        if (alreadyExists) {
            return res.status(400).json({
                message: "This address already exists."
            });
        }
        if (isDefault === true) {

            user.addresses.forEach(addr => {

                addr.isDefault = false;

            });

            user.hostel = hostel;
            user.room = room;
            user.address = address;

        }
        user.addresses.push({

            hostel,

            room,

            address,

            isDefault: !!isDefault

        });
        const newAddress =
            user.addresses[user.addresses.length - 1];

        if (newAddress.isDefault) {

            user.hostel = newAddress.hostel;
            user.room = newAddress.room;
            user.address = newAddress.address;

        }

        await user.save();
        const updatedUser = await User.findById(req.userId);

        console.log(
            updatedUser.hostel,
            updatedUser.room,
            updatedUser.address
        );

        res.status(201).json({
            message: "Address added successfully.",
            addresses: user.addresses
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to add address."
        });

    }

};
exports.setDefaultAddress = async (req, res) => {

    try {

        const { id } = req.params;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        user.addresses.forEach(address => {

            address.isDefault =
                address._id.toString() === id;

        });

        await user.save();

        // 🔥 Update old fields for compatibility
        const defaultAddress = user.addresses.find(address => address.isDefault);
        if (!defaultAddress) {
            return res.status(404).json({
                message: "Default address not found."
            });
        }

        user.hostel = defaultAddress.hostel;
        user.room = defaultAddress.room;
        user.address = defaultAddress.address;

        await user.save();

        res.json({
            message: "Default address updated.",
            addresses: user.addresses
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to update default address."
        });

    }

};

exports.deleteAddress = async (req, res) => {

    try {

        const { id } = req.params;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const address = user.addresses.id(id);

        if (!address) {
            return res.status(404).json({
                message: "Address not found."
            });
        }

        if (address.isDefault) {
            return res.status(400).json({
                message: "Default address cannot be deleted."
            });
        }

        address.deleteOne();

        await user.save();

        res.json({
            message: "Address deleted successfully.",
            addresses: user.addresses
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to delete address."
        });

    }

};

exports.updateAddress = async (req, res) => {

    try {

        const { id } = req.params;
        const {
            hostel,
            room,
            address,
            isDefault
        } = req.body;

        if (!hostel || !room || !address) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const selectedAddress = user.addresses.id(id);

        if (!selectedAddress) {
            return res.status(404).json({
                message: "Address not found."
            });
        }

        selectedAddress.hostel = hostel;
        selectedAddress.room = room;
        selectedAddress.address = address;
        // Update default status

        user.addresses.forEach(addr => {

            addr.isDefault = false;

        });

        if (isDefault) {

            selectedAddress.isDefault = true;

            user.hostel = hostel;
            user.room = room;
            user.address = address;

        }
        await user.save();
        const updatedUser = await User.findById(req.userId);

        console.log(
            updatedUser.hostel,
            updatedUser.room,
            updatedUser.address
        );

        // 🔥 Compatibility
        // Agar default address edit hui hai,
        // to old hostel/room/address fields bhi update karo.


        res.json({
            message: "Address updated successfully.",
            addresses: user.addresses
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to update address."
        });

    }

};