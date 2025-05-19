# AWS SES Integration Guide for Dashboard Notifications

Here's a conceptual example of how to integrate AWS SES for sending notifications from both a user dashboard and an admin area. This involves a backend API endpoint and frontend JavaScript calls.

## 1. Backend API Endpoint (Example using Node.js/Express and AWS SDK v3)

First, install the AWS SDK SES client:
```bash
npm install @aws-sdk/client-ses
```

Then, create an API endpoint to handle sending emails:

```javascript
// filepath: server/routes/emailApi.js
import { Router } from 'express';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"; // ES Modules syntax

// Configure AWS SES Client
// Ensure your AWS credentials (access key, secret key) and region
// are configured via environment variables, IAM role, or AWS config file.
const sesClient = new SESClient({ region: "YOUR_AWS_REGION" }); // e.g., "us-east-1"

const router = Router();

router.post('/send-email', async (req, res) => {
    const { recipientEmail, subject, bodyHtml, sourceEmail } = req.body;

    // Basic validation
    if (!recipientEmail || !subject || !bodyHtml || !sourceEmail) {
        return res.status(400).json({ message: 'Missing required fields: recipientEmail, subject, bodyHtml, sourceEmail' });
    }

    const params = {
        Source: sourceEmail, // Your verified sender email address in SES
        Destination: {
            ToAddresses: [recipientEmail],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8',
            },
            Body: {
                Html: {
                    Data: bodyHtml,
                    Charset: 'UTF-8',
                },
                // Optional: Add Text part for non-HTML clients
                // Text: {
                //   Data: textBody,
                //   Charset: 'UTF-8',
                // }
            },
        },
        // Optional: ReplyToAddresses, ConfigurationSetName, etc.
    };

    try {
        const command = new SendEmailCommand(params);
        const data = await sesClient.send(command);
        console.log("Email sent! Message ID:", data.MessageId);
        res.status(200).json({ success: true, message: 'Email sent successfully!', messageId: data.MessageId });
    } catch (err) {
        console.error("Error sending email:", err);
        res.status(500).json({ success: false, message: 'Failed to send email.', error: err.message });
    }
});

export default router; // ES Modules syntax
// If using CommonJS: module.exports = router;
```

**Notes:**

*   Replace `"YOUR_AWS_REGION"` with your actual AWS region.
*   Ensure the `sourceEmail` you use is verified within your AWS SES console.
*   Configure AWS credentials securely (environment variables are recommended).
*   Add this route to your main Express app.
*   For sending attachments, you would use `SendRawEmailCommand` which is more complex as it requires constructing the raw MIME message.

## 2. Frontend JavaScript (Example using `fetch`)

This function can be called from both the user dashboard and the admin area.

```javascript
// filepath: public/js/emailSender.js

async function sendNotification(recipientEmail, subject, bodyHtml) {
    // Get the verified source email from config or context
    const sourceEmail = 'notifications@yourdomain.com'; // Replace with your verified SES sender email

    try {
        const response = await fetch('/api/send-email', { // Your backend endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if needed (e.g., JWT token)
                // 'Authorization': `Bearer ${your_auth_token}`
            },
            body: JSON.stringify({
                recipientEmail,
                subject,
                bodyHtml,
                sourceEmail
            }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('Notification sent successfully:', result.messageId);
            alert('Notification sent successfully!'); // Or update UI more gracefully
            return true;
        } else {
            console.error('Failed to send notification:', result.message || response.statusText);
            alert(`Error: ${result.message || 'Failed to send notification.'}`);
            return false;
        }
    } catch (error) {
        console.error('Network or other error sending notification:', error);
        alert('An error occurred while trying to send the notification.');
        return false;
    }
}

// --- Integration Examples ---

// **User Dashboard (e.g., Send Invoice Button)**
function setupDashboardButtons() {
    document.querySelectorAll('.send-invoice-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const invoiceId = event.target.dataset.invoiceId; // Get relevant ID
            const customerEmail = event.target.dataset.customerEmail; // Get recipient email
            const subject = `Your Invoice ${invoiceId} is ready`;
            // Ideally, fetch or generate the invoice HTML body dynamically
            const bodyHtml = `<p>Hello,</p><p>Your invoice #${invoiceId} is attached or available at [link].</p><p>Thank you!</p>`;

            // Disable button while sending
            event.target.disabled = true;
            event.target.textContent = 'Sending...';

            const success = await sendNotification(customerEmail, subject, bodyHtml);

            // Re-enable button and update text
            event.target.disabled = false;
            event.target.textContent = success ? 'Sent!' : 'Send Invoice';
            if (success) {
                 // Optionally update invoice status in the UI
            }
        });
    });
}

// **Admin Area (e.g., Manual Notification Form)**
function setupAdminNotificationForm() {
    const form = document.getElementById('admin-notify-form');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const recipient = document.getElementById('recipient-email').value;
            const subject = document.getElementById('notification-subject').value;
            const body = document.getElementById('notification-body').value; // Assuming a textarea for HTML body
            const submitButton = form.querySelector('button[type="submit"]');

            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            const success = await sendNotification(recipient, subject, body);

            submitButton.disabled = false;
            submitButton.textContent = 'Send Notification';

            if (success) {
                form.reset(); // Clear form on success
            }
        });
    }
}

// Call setup functions when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupDashboardButtons();
    setupAdminNotificationForm();
});
```

## 3. Integration Steps

1.  **Deploy Backend:** Deploy the backend code with the `/api/send-email` endpoint.
2.  **Include Frontend JS:** Include the `emailSender.js` script (or similar logic) in your dashboard and admin HTML pages.
3.  **User Dashboard:** Add buttons or links with appropriate `data-*` attributes (like `data-invoice-id`, `data-customer-email`) next to items that need sending capability. Add the class `send-invoice-button` (or similar) to trigger the event listener.
4.  **Admin Area:** Create an HTML form (`id="admin-notify-form"`) with input fields for recipient email (`id="recipient-email"`), subject (`id="notification-subject"`), and body (`id="notification-body"`), and a submit button.
5.  **Styling & UX:** Add loading indicators and feedback messages for a better user experience.
6.  **Security:** Ensure your backend endpoint is protected (e.g., requires user authentication/authorization) to prevent abuse. Validate inputs rigorously on the backend.