const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT || 587),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

module.exports = transporter;


async function sendWelcomeEmail(to, username) {
	const info = await transporter.sendMail({
		from: process.env.MAIL_FROM,
		to,
		subject: "Welcome to Cafeteria 🎉",
		html: `<h2>Welcome, ${username}!</h2><p>Your account created</p>`,
	});

	console.log("Email sent:", info.messageId);
	return info;
}

module.exports = { sendWelcomeEmail };
