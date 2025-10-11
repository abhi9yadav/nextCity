const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");
const fs = require("fs");
const path = require("path");

module.exports = class Email {
  constructor(user, url, extraData = {}) {
    this.to = user.email;
    this.firstName = user.name ? user.name.split(" ")[0] : "there";
    this.url = url;
    this.from = `${process.env.APP_NAME} <${process.env.EMAIL_FROM}>`;
    this.extraData = extraData;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDPLATEFORM_USER,
          pass: process.env.SENDPLATEFORM_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      // host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
      // port: process.env.MAILTRAP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

  // --- Read HTML template and replace placeholders ---
  getHtml(templateName) {
    const templatePath = path.join(
      __dirname,
      "../views/email",
      `${templateName}.html`
    );
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templatePath}`);
    }

    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace common placeholders
    html = html
      .replace(/{{firstName}}/g, this.firstName)
      .replace(/{{url}}/g, this.url)
      .replace(/{{appName}}/g, process.env.APP_NAME || "NextCity")
      .replace(/{{logoUrl}}/g, this.extraData.logoUrl || "");

    // Replace extraData placeholders
    for (const [key, value] of Object.entries(this.extraData)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, value);
    }

    return html;
  }

  async send(templateName, subject) {
    const html = this.getHtml(templateName);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    // Log mock email in dev mode
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `📧 Mock email to ${this.to} using template: ${templateName} + and mailoptions ${mailOptions}`
      );
    }

    await this.newTransport().sendMail(mailOptions);
  }

  // --- Invitation email based on role ---
  async sendInvitation() {
    const role = (this.extraData.role || "").toLowerCase();
    let templateName, subject;

    switch (role) {
      case "city_admin":
        templateName = "cityAdminInvitation";
        subject = "Invitation as City Admin";
        break;
      case "dept_admin":
        templateName = "deptAdminInvitation";
        subject = "Invitation as Department Admin";
        break;
      case "worker":
        templateName = "workerInvitation";
        subject = "Invitation as Worker";
        break;
      default:
        templateName = "welcome";
        subject = "Welcome to " + process.env.APP_NAME;
    }

    await this.send(templateName, subject);
  }

  // --- Password reset email ---
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Password Reset for " + process.env.APP_NAME
    );
  }

  // --- Generic welcome email for normal citizens ---
  async sendWelcome() {
    await this.send("welcome", "Welcome to " + process.env.APP_NAME);
  }
};
