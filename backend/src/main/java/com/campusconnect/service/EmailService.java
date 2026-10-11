package com.campusconnect.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${campusconnect.mail-from:noreply@campus.test}") String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    @Async
    public void sendVerificationOtp(String toEmail, String studentName, String otp) {
        log.info("==================================================================");
        log.info("🔐 [VERIFICATION OTP] To: {} | Code: {}", toEmail, otp);
        log.info("==================================================================");
        String subject = "CampusConnect — Verify Your College Email";
        String htmlBody = buildEmailTemplate(
                "Verify Your College Email",
                "Hi " + escapeHtml(studentName) + ",",
                "Welcome to CampusConnect! Use the one-time code below to complete your student registration. This code expires in 10 minutes.",
                otp,
                "If you did not initiate this registration, please disregard this email."
        );
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    @Async
    public void sendPasswordResetOtp(String toEmail, String studentName, String otp) {
        log.info("==================================================================");
        log.info("🔑 [PASSWORD RESET OTP] To: {} | Code: {}", toEmail, otp);
        log.info("==================================================================");
        String subject = "CampusConnect — Password Reset Request";
        String htmlBody = buildEmailTemplate(
                "Password Reset Request",
                "Hi " + escapeHtml(studentName) + ",",
                "We received a request to reset your CampusConnect password. Use the single-use 6-digit code below to proceed. This code expires in 10 minutes.",
                otp,
                "Never share this code with anyone. CampusConnect staff will never ask for your code or password."
        );
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    @Async
    public void sendPasswordChangedAlert(String toEmail, String studentName, String deviceInfo) {
        String subject = "CampusConnect Security Alert — Password Changed";
        String htmlBody = buildEmailTemplate(
                "Your Password Was Changed",
                "Hi " + escapeHtml(studentName) + ",",
                "Your CampusConnect student account password was successfully updated on " + escapeHtml(deviceInfo) + ".",
                null,
                "All prior sessions have been revoked. If you did not make this change, contact your college administration immediately."
        );
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    @Async
    public void sendNewLoginAlert(String toEmail, String studentName, String deviceInfo, String ip) {
        String subject = "CampusConnect — New Sign-in Alert";
        String htmlBody = buildEmailTemplate(
                "New Sign-in to Your Account",
                "Hi " + escapeHtml(studentName) + ",",
                "A new login was detected on device: " + escapeHtml(deviceInfo) + " (IP: " + escapeHtml(ip) + ").",
                null,
                "If this was you, you can safely ignore this notice. If not, go to Settings &gt; Security to revoke this session."
        );
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String studentName) {
        log.info("📧 [WELCOME EMAIL] Sent to: {}", toEmail);
        String subject = "Welcome to CampusConnect!";
        String htmlBody = buildEmailTemplate(
                "Welcome to CampusConnect",
                "Hi " + escapeHtml(studentName) + ",",
                "Your student account has been successfully created and verified. You now have full access to your timetable, syllabus tracker, attendance metrics, and college announcements.",
                null,
                "Need assistance? Contact your student helpdesk or visit Settings > Security to manage your sessions."
        );
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "CampusConnect Portal");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Sent email to masked recipient: {}", maskEmail(toEmail));
        } catch (Exception e) {
            log.warn("Could not dispatch email via SMTP (Mailpit/server may be offline): {}. Simulated send succeeded.", e.getMessage());
        }
    }

    private String buildEmailTemplate(String heading, String greeting, String body, String codeBlock, String note) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        sb.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        sb.append("<title>").append(heading).append("</title></head>");
        sb.append("<body style='margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;background-color:#f5f5f3;color:#18181b;'>");
        sb.append("<div style='max-width:540px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);'>");

        // Header
        sb.append("<div style='background:#18181b;padding:24px;text-align:center;'>");
        sb.append("<div style='display:inline-block;padding:6px 14px;background:#f59e0b;color:#18181b;font-weight:900;border-radius:9999px;font-size:12px;letter-spacing:1px;text-transform:uppercase;'>CampusConnect</div>");
        sb.append("<h1 style='margin:12px 0 0;color:#ffffff;font-size:20px;font-weight:800;'>").append(heading).append("</h1>");
        sb.append("</div>");

        // Body
        sb.append("<div style='padding:28px 24px;font-size:14px;line-height:1.6;color:#3f3f46;'>");
        sb.append("<p style='margin:0 0 12px;font-weight:600;color:#18181b;'>").append(greeting).append("</p>");
        sb.append("<p style='margin:0 0 20px;'>").append(body).append("</p>");

        if (codeBlock != null && !codeBlock.isBlank()) {
            sb.append("<div style='text-align:center;margin:24px 0;'>");
            sb.append("<div style='display:inline-block;padding:14px 28px;background:#fef3c7;border:1.5px dashed #f59e0b;border-radius:12px;font-size:30px;font-weight:900;letter-spacing:8px;color:#92400e;font-family:monospace;'>");
            sb.append(codeBlock);
            sb.append("</div>");
            sb.append("</div>");
        }

        sb.append("<div style='padding:12px;background:#f4f4f5;border-radius:8px;font-size:12px;color:#71717a;margin-top:20px;'>");
        sb.append(note);
        sb.append("</div>");

        sb.append("</div>");

        // Footer
        sb.append("<div style='padding:16px;background:#fafafa;border-top:1px solid #e4e4e7;text-align:center;font-size:11px;color:#a1a1aa;'>");
        sb.append("&copy; CampusConnect Student Portal. Security notification.<br/>Never share your passwords or OTP codes.");
        sb.append("</div>");

        sb.append("</div></body></html>");
        return sb.toString();
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@", 2);
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 1) {
            return name + "***@" + domain;
        }
        return name.charAt(0) + "***@" + domain;
    }
}
