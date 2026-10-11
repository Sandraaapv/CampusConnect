package com.campusconnect.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);
    private final Map<String, ConcurrentLinkedQueue<Long>> requestTimes = new ConcurrentHashMap<>();

    public boolean isAllowed(String key, int maxRequests, int windowSeconds) {
        long now = System.currentTimeMillis();
        long windowMillis = windowSeconds * 1000L;
        long cutoff = now - windowMillis;

        ConcurrentLinkedQueue<Long> queue = requestTimes.computeIfAbsent(key, k -> new ConcurrentLinkedQueue<>());

        // Evict expired timestamps
        while (!queue.isEmpty() && queue.peek() < cutoff) {
            queue.poll();
        }

        if (queue.size() >= maxRequests) {
            return false;
        }

        queue.add(now);
        return true;
    }

    public boolean isRegistrationCodeRequestAllowed(String ip, String registerNumber) {
        boolean ipAllowed = isAllowed("reg_ip:" + (ip != null ? ip : "unknown"), 20, 3600);
        boolean regAllowed = isAllowed("reg_num:" + registerNumber.trim().toUpperCase(), 5, 3600);
        if (!ipAllowed || !regAllowed) {
            log.warn("Registration code rate limit hit. ipAllowed={}, regAllowed={}, regNo={}", ipAllowed, regAllowed, registerNumber);
            return false;
        }
        return true;
    }

    public boolean isDailyEmailCapAllowed(String email) {
        boolean allowed = isAllowed("daily_email:" + email.trim().toLowerCase(), 5, 86400);
        if (!allowed) {
            log.warn("Daily email cap reached for recipient: {}. Blocking further email dispatches.", EmailService.maskEmail(email));
        }
        return allowed;
    }

    public boolean isForgotPasswordAllowed(String ip, String identifier) {
        boolean ipAllowed = isAllowed("fp_ip:" + (ip != null ? ip : "unknown"), 20, 3600);
        boolean idAllowed = isAllowed("fp_id:" + identifier.trim().toLowerCase(), 5, 3600);
        if (!ipAllowed || !idAllowed) {
            log.warn("Forgot password rate limit hit. ipAllowed={}, idAllowed={}, identifier={}", ipAllowed, idAllowed, identifier);
            return false;
        }
        return true;
    }
}
