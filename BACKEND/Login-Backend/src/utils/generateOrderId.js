const Counter = require("../models/Counter");

const generateOrderId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "order" },
        { $inc: { sequence: 1 } },
        {
            new: true,
            upsert: true,
        }
    );

    const sequence = counter.sequence.toString().padStart(4, "0");

    return `SNK${sequence}`;
};

module.exports = generateOrderId;