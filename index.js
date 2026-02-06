require("dotenv").config();

const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const app = express();

/* =======================
   Middlewares
======================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));


/* =======================
   View Engine Setup
======================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


/* =======================
   Email Setup (Nodemailer)
======================= */
const mailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
// verify transporter early and warn if misconfigured
mailTransporter.verify().then(() => {
    console.log('✅ Mail transporter verified');
}).catch(err => {
    console.warn('⚠️ Mail transporter verification failed:', err.message || err);
});

/* =======================
   SMS Setup (Twilio)
======================= */
let smsClient = null;
if (process.env.TWILIO_SID) {
    smsClient = twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_TOKEN
    );
}

/* =======================
   Routes
======================= */
app.get("/", (req, res) => {
    res.render("index", { page: "home" });
});

app.get("/projects", (req, res) => {
    res.render("projects", { page: "projects" });
});

app.get("/education", (req, res) => {
    res.render("education", { page: "education" });
});

app.get("/contact", (req, res) => {
    res.render("contact", { page: "contact", success: false });
});


/* =======================
   Contact Form POST
======================= */
app.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;
    try {
        // 2️⃣ Send Email
        await mailTransporter.sendMail({
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "New Portfolio Message",
            text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `
        });

        // 3️⃣ Send SMS (Optional)
        if (smsClient && process.env.TWILIO_PHONE && process.env.MY_PHONE) {
            await smsClient.messages.create({
                body: `New message from ${name} (${email})`,
                from: process.env.TWILIO_PHONE,
                to: process.env.MY_PHONE
            });
        } else if (smsClient) {
            console.warn('SMS not sent: missing TWILIO_PHONE or MY_PHONE in environment');
        }

        res.render('contact', { success: true });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
});

app.get('/about', (req, res) => {
    res.render('about', { page: 'about' });
});

/* =======================
   Server Start
======================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});