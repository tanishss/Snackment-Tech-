exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.getOTPExpiry = () => {
  const expiry = new Date();
  expiry.setMinutes(
    expiry.getMinutes() + Number(process.env.OTP_EXPIRY || 5)
  );
  return expiry;
};
