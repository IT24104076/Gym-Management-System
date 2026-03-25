const sendEmail = async (to, subject, text) => {
  console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL] Body: ${text}`);
};

module.exports = { sendEmail };
