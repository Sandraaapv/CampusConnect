package com.campusconnect.service;

import com.campusconnect.model.CaptchaChallenge;
import com.campusconnect.repository.CaptchaChallengeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DefaultCaptchaService implements CaptchaService {

    // Characters without look-alikes: no 0, O, 1, I, l
    private static final String CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final CaptchaChallengeRepository challengeRepository;
    private final int expirationSeconds;

    // In-memory short-lived store for raw answer to render audio during challenge lifetime
    private final Map<String, CachedAnswer> audioAnswerCache = new ConcurrentHashMap<>();

    private record CachedAnswer(String answer, long expiresAtMillis) {}

    public DefaultCaptchaService(
            CaptchaChallengeRepository challengeRepository,
            @Value("${campusconnect.security.captcha-expiration-seconds:180}") int expirationSeconds) {
        this.challengeRepository = challengeRepository;
        this.expirationSeconds = expirationSeconds;
    }

    @Override
    @Transactional
    public CaptchaResponse generateCaptcha() {
        cleanExpiredCache();

        int length = 5 + RANDOM.nextInt(2); // 5 or 6 characters
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CAPTCHA_CHARS.charAt(RANDOM.nextInt(CAPTCHA_CHARS.length())));
        }
        String text = sb.toString();
        String captchaId = UUID.randomUUID().toString();
        String answerHash = hashAnswer(captchaId, text);

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(expirationSeconds);
        CaptchaChallenge challenge = new CaptchaChallenge(captchaId, answerHash, expiresAt);
        challengeRepository.save(challenge);

        audioAnswerCache.put(captchaId, new CachedAnswer(text, System.currentTimeMillis() + (expirationSeconds * 1000L)));

        String imageBase64 = renderCaptchaImage(text);
        return new CaptchaResponse(captchaId, imageBase64, expirationSeconds);
    }

    @Override
    public byte[] generateAudioCaptcha(String captchaId) {
        cleanExpiredCache();
        CachedAnswer cached = audioAnswerCache.get(captchaId);
        String text = (cached != null) ? cached.answer() : "CC";
        return synthesizeWavAudio(text);
    }

    @Override
    @Transactional
    public boolean validateCaptcha(String captchaId, String answer) {
        if (captchaId == null || captchaId.trim().isEmpty() || answer == null || answer.trim().isEmpty()) {
            return false;
        }

        audioAnswerCache.remove(captchaId);

        return challengeRepository.findById(captchaId)
                .map(challenge -> {
                    if (challenge.isUsed() || challenge.isExpired()) {
                        challenge.setUsed(true);
                        challengeRepository.save(challenge);
                        return false;
                    }

                    // Single-use: mark used immediately
                    challenge.setUsed(true);
                    challengeRepository.save(challenge);

                    String expectedHash = challenge.getAnswerHash();
                    String actualHash = hashAnswer(captchaId, answer.trim());
                    return MessageDigest.isEqual(
                            expectedHash.getBytes(StandardCharsets.UTF_8),
                            actualHash.getBytes(StandardCharsets.UTF_8)
                    );
                })
                .orElse(false);
    }

    private String hashAnswer(String id, String answer) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String normalized = id + ":" + answer.trim().toUpperCase();
            byte[] digest = md.digest(normalized.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm missing", e);
        }
    }

    private String renderCaptchaImage(String text) {
        int width = 180;
        int height = 54;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // Background: clean off-white / slight warmth
        g.setColor(new Color(246, 246, 244));
        g.fillRect(0, 0, width, height);

        // Background noise lines
        for (int i = 0; i < 6; i++) {
            g.setColor(new Color(200 + RANDOM.nextInt(40), 190 + RANDOM.nextInt(40), 180 + RANDOM.nextInt(40)));
            int x1 = RANDOM.nextInt(width);
            int y1 = RANDOM.nextInt(height);
            int x2 = RANDOM.nextInt(width);
            int y2 = RANDOM.nextInt(height);
            g.drawLine(x1, y1, x2, y2);
        }

        // Draw individual letters with subtle rotation and distinct high-contrast colors
        Color[] textColors = {
                new Color(24, 24, 27),
                new Color(15, 23, 42),
                new Color(30, 41, 59),
                new Color(39, 39, 42)
        };

        Font baseFont = new Font("Arial", Font.BOLD, 28);
        g.setFont(baseFont);

        int charStep = (width - 30) / text.length();
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            g.setColor(textColors[RANDOM.nextInt(textColors.length)]);

            AffineTransform orig = g.getTransform();
            double angle = (RANDOM.nextDouble() - 0.5) * 0.45; // ~ -13 to +13 deg
            int x = 16 + (i * charStep) + RANDOM.nextInt(4);
            int y = 36 + (RANDOM.nextInt(6) - 3);

            g.translate(x, y);
            g.rotate(angle);
            g.drawString(String.valueOf(c), 0, 0);
            g.setTransform(orig);
        }

        // Foreground wave line
        g.setColor(new Color(180, 160, 120, 140));
        g.setStroke(new BasicStroke(1.8f));
        int prevX = 0;
        int prevY = 20 + RANDOM.nextInt(15);
        for (int x = 20; x <= width; x += 20) {
            int curY = 20 + RANDOM.nextInt(20);
            g.drawLine(prevX, prevY, x, curY);
            prevX = x;
            prevY = curY;
        }

        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            ImageIO.write(image, "PNG", baos);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Error writing captcha image", e);
        }
    }

    /**
     * Synthesizes a valid PCM 8000Hz 16-bit mono WAV audio announcing characters with distinct tone bursts.
     */
    private byte[] synthesizeWavAudio(String text) {
        int sampleRate = 8000;
        int bytesPerSample = 2; // 16-bit
        double durationPerChar = 0.35; // 350ms per char
        double pause = 0.15; // 150ms pause
        int samplesPerChar = (int) (sampleRate * durationPerChar);
        int pauseSamples = (int) (sampleRate * pause);

        int totalSamples = text.length() * (samplesPerChar + pauseSamples) + (sampleRate / 4);
        byte[] audioData = new byte[totalSamples * bytesPerSample];
        int index = 0;

        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            // Unique frequency for character
            double baseFreq = 300.0 + ((c % 32) * 28.0);

            for (int s = 0; s < samplesPerChar; s++) {
                double time = (double) s / sampleRate;
                // Harmonic synthesis
                double angle1 = 2.0 * Math.PI * baseFreq * time;
                double angle2 = 2.0 * Math.PI * (baseFreq * 1.5) * time;
                double amp = Math.sin(angle1) * 0.7 + Math.sin(angle2) * 0.3;

                // Envelope attack/decay
                double env = 1.0;
                if (s < 200) env = (double) s / 200.0;
                else if (s > samplesPerChar - 200) env = (double) (samplesPerChar - s) / 200.0;

                short val = (short) (amp * env * 12000.0);
                audioData[index++] = (byte) (val & 0xFF);
                audioData[index++] = (byte) ((val >> 8) & 0xFF);
            }

            // Silence pause
            for (int p = 0; p < pauseSamples; p++) {
                audioData[index++] = 0;
                audioData[index++] = 0;
            }
        }

        // Construct standard RIFF WAV Header (44 bytes)
        int dataSize = audioData.length;
        int chunkSize = 36 + dataSize;
        ByteArrayOutputStream wavOut = new ByteArrayOutputStream(44 + dataSize);

        try {
            wavOut.write(new byte[]{'R', 'I', 'F', 'F'});
            wavOut.write(intToByteArray(chunkSize));
            wavOut.write(new byte[]{'W', 'A', 'V', 'E'});
            wavOut.write(new byte[]{'f', 'm', 't', ' '});
            wavOut.write(intToByteArray(16)); // Subchunk1Size (16 for PCM)
            wavOut.write(shortToByteArray((short) 1)); // AudioFormat (1 = PCM)
            wavOut.write(shortToByteArray((short) 1)); // NumChannels (1 = Mono)
            wavOut.write(intToByteArray(sampleRate)); // SampleRate
            wavOut.write(intToByteArray(sampleRate * bytesPerSample)); // ByteRate
            wavOut.write(shortToByteArray((short) bytesPerSample)); // BlockAlign
            wavOut.write(shortToByteArray((short) 16)); // BitsPerSample
            wavOut.write(new byte[]{'d', 'a', 't', 'a'});
            wavOut.write(intToByteArray(dataSize));
            wavOut.write(audioData);
        } catch (IOException e) {
            throw new RuntimeException("Error generating audio WAV", e);
        }

        return wavOut.toByteArray();
    }

    private byte[] intToByteArray(int val) {
        return new byte[]{
                (byte) (val & 0xFF),
                (byte) ((val >> 8) & 0xFF),
                (byte) ((val >> 16) & 0xFF),
                (byte) ((val >> 24) & 0xFF)
        };
    }

    private byte[] shortToByteArray(short val) {
        return new byte[]{
                (byte) (val & 0xFF),
                (byte) ((val >> 8) & 0xFF)
        };
    }

    private void cleanExpiredCache() {
        long now = System.currentTimeMillis();
        audioAnswerCache.entrySet().removeIf(entry -> entry.getValue().expiresAtMillis() < now);
    }
}
