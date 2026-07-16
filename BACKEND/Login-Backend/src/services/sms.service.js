const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendOTP = async (phone, otp) => {
  return client.messages.create({
    body: `Your Snackment login OTP is ${otp}. Valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE,
    to: `+91${phone}`
  });
};
