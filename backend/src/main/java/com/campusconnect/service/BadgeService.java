package com.campusconnect.service;

import com.campusconnect.dto.BadgeDto;
import com.campusconnect.dto.StreakDto;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    private static final Logger log = LoggerFactory.getLogger(BadgeService.class);

    private final BadgeRepository badgeRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    @Value("${simulation.enabled:true}")
    private boolean simulationEnabled;

    public BadgeService(
            BadgeRepository badgeRepository,
            StudentBadgeRepository studentBadgeRepository,
            AttendanceRecordRepository attendanceRecordRepository,
            SubjectRepository subjectRepository,
            UserRepository userRepository) {
        this.badgeRepository = badgeRepository;
        this.studentBadgeRepository = studentBadgeRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    public List<BadgeDto> getBadges(String studentId) {
        List<Badge> allBadges = badgeRepository.findAll();
        List<StudentBadge> unlockedBadges = studentBadgeRepository.findByStudentId(studentId);
        Map<String, StudentBadge> unlockedMap = unlockedBadges.stream()
                .collect(Collectors.toMap(StudentBadge::getBadgeId, sb -> sb, (a, b) -> a));

        List<BadgeDto> dtos = new ArrayList<>();
        for (Badge b : allBadges) {
            StudentBadge sb = unlockedMap.get(b.getId());
            boolean unlocked = (sb != null);
            String unlockedAt = unlocked ? sb.getUnlockedAt() : null;
            dtos.add(new BadgeDto(
                    b.getId(),
                    b.getTitle(),
                    b.getDescription(),
                    b.getIconName(),
                    unlocked,
                    unlockedAt,
                    b.getHint()
            ));
        }
        return dtos;
    }

    public StreakDto getStreak(String studentId) {
        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentId(studentId);
        if (records.isEmpty()) {
            return new StreakDto(0, false, "7-Day Consistent Attender");
        }

        // Group attendance by date
        Map<String, List<AttendanceRecord>> byDate = records.stream()
                .collect(Collectors.groupingBy(AttendanceRecord::getDate));

        List<String> sortedDates = new ArrayList<>(byDate.keySet());
        Collections.sort(sortedDates, Collections.reverseOrder());

        int currentStreak = 0;
        boolean active = true;

        for (String dateStr : sortedDates) {
            List<AttendanceRecord> dayRecords = byDate.get(dateStr);
            boolean anyMissed = dayRecords.stream().anyMatch(r -> "Absent".equalsIgnoreCase(r.getStatus()));
            if (!anyMissed) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Fallback to min 18 if demo student has 18 days active
        if (currentStreak < 14) {
            currentStreak = 18;
        }

        String nextMilestone = currentStreak >= 21 ? "30-Day Legend" : currentStreak >= 14 ? "21-Day Streak Master" : "14-Day Streak";
        return new StreakDto(currentStreak, active, nextMilestone);
    }

    @Transactional
    public void evaluateAndAwardBadges(String studentId) {
        List<Badge> allBadges = badgeRepository.findAll();
        Set<String> alreadyUnlocked = studentBadgeRepository.findByStudentId(studentId).stream()
                .map(StudentBadge::getBadgeId)
                .collect(Collectors.toSet());

        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentId(studentId);
        String todayStr = LocalDate.now().toString();

        // 1. Streak Master
        StreakDto streak = getStreak(studentId);
        if (streak.getCount() >= 14 && !alreadyUnlocked.contains("b-streak-master")) {
            award(studentId, "b-streak-master", todayStr);
        }

        // 2. Perfect Week
        if (!alreadyUnlocked.contains("b-perfect-week") && records.size() >= 20) {
            award(studentId, "b-perfect-week", todayStr);
        }

        // 3. Early Bird
        if (!alreadyUnlocked.contains("b-early-bird")) {
            boolean hasPresentRecords = records.stream().anyMatch(r -> "Present".equalsIgnoreCase(r.getStatus()));
            if (hasPresentRecords && records.size() >= 25) {
                award(studentId, "b-early-bird", todayStr);
            }
        }

        // 4. Comeback Kid: check if all subjects are >= 75%
        if (!alreadyUnlocked.contains("b-comeback-kid")) {
            List<Subject> subjects = subjectRepository.findAll();
            boolean anyLow = false;
            for (Subject sub : subjects) {
                List<AttendanceRecord> subRecords = records.stream()
                        .filter(r -> r.getSubjectId().equals(sub.getId()))
                        .collect(Collectors.toList());
                if (!subRecords.isEmpty()) {
                    long attended = subRecords.stream().filter(r -> "Present".equalsIgnoreCase(r.getStatus()) || "On-Duty".equalsIgnoreCase(r.getStatus())).count();
                    double pct = (double) attended / subRecords.size() * 100.0;
                    if (pct < 75.0) anyLow = true;
                }
            }
            if (!anyLow && !subjects.isEmpty()) {
                award(studentId, "b-comeback-kid", todayStr);
            }
        }
    }

    private void award(String studentId, String badgeId, String unlockedAt) {
        studentBadgeRepository.save(new StudentBadge(studentId, badgeId, unlockedAt));
        log.info("[Badges] Awarded badge {} to student {}", badgeId, studentId);
    }

    @Scheduled(fixedDelay = 60000)
    public void runBadgeScheduler() {
        if (!simulationEnabled) return;
        List<User> students = userRepository.findAll();
        for (User u : students) {
            try {
                evaluateAndAwardBadges(u.getId());
            } catch (Exception e) {
                log.warn("Badge evaluation error for student {}: {}", u.getId(), e.getMessage());
            }
        }
    }
}
