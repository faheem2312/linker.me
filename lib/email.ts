import { promises as fs } from "fs";
import { join } from "path";

const dataDir = join(process.cwd(), "data");
const logPath = join(dataDir, "emails.log");

export async function sendWelcomeEmail(to: string, handle: string) {
  const body = [
    `To: ${to}`,
    "Subject: Welcome to Linker.me!",
    "",
    `Welcome to your personal bookmarks profile, @${handle}!`,
    "You can keep bookmarks private or share the ones you want with your public profile.",
    "",
    "Thank you for signing up.",
    "- Linker.me",
  ].join("\n");

  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.appendFile(logPath, `${new Date().toISOString()}\n${body}\n---\n`, "utf8");
    console.info(`Welcome email written to ${logPath} for ${to}`);
  } catch (error) {
    console.error("Failed to log welcome email to file:", error);
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const senderEmail = process.env.BREVO_SENDER_EMAIL || "onboarding@resend.dev";
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "api-key": brevoApiKey,
        },
        body: JSON.stringify({
          sender: {
            name: "Linker.me",
            email: senderEmail,
          },
          to: [
            {
              email: to,
            },
          ],
          subject: "Welcome to Linker.me!",
          textContent: [
            `Welcome to your personal bookmarks profile, @${handle}!`,
            "You can keep bookmarks private or share the ones you want with your public profile.",
            "",
            "Thank you for signing up.",
            "- Linker.me",
          ].join("\n"),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Brevo API error (status ${response.status}): ${errorText}`);
      } else {
        const result = await response.json();
        console.info(`Welcome email successfully sent via Brevo API to ${to}:`, result);
      }
    } catch (error) {
      console.error("Error sending welcome email via Brevo API:", error);
    }
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "Linker.me <onboarding@resend.dev>",
          to,
          subject: "Welcome to Linker.me!",
          text: [
            `Welcome to your personal bookmarks profile, @${handle}!`,
            "You can keep bookmarks private or share the ones you want with your public profile.",
            "",
            "Thank you for signing up.",
            "- Linker.me",
          ].join("\n"),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = `Resend API error (status ${response.status}): ${errorText}`;
        if (response.status === 403) {
          errorMsg += "\n[TIP] Resend free tier accounts can only send emails to the registered account owner's email address (e.g., mansurifaheem1111@gmail.com). To send to other users, please verify your custom domain on Resend (resend.com/domains) or use your owner email address for testing.";
        }
        console.error(errorMsg);
      } else {
        const result = await response.json();
        console.info(`Welcome email successfully sent via Resend API to ${to}:`, result);
      }
    } catch (error) {
      console.error("Error sending welcome email via Resend API:", error);
    }
  }
}
