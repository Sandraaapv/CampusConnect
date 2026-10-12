package com.campusconnect.service;

import com.campusconnect.dto.AttendanceSummaryDto;
import com.campusconnect.model.AttendanceRecord;
import com.campusconnect.model.StudentSettings;
import com.campusconnect.model.Subject;
import com.campusconnect.repository.AttendanceRecordRepository;
import com.campusconnect.repository.StudentSettingsRepository;
import com.campusconnect.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final SubjectRepository subjectRepository;
    private final StudentSettingsRepository studentSettingsRepository;

    public AttendanceService(
            AttendanceRecordRepository attendanceRecordRepository,
            SubjectRepository subjectRepository,
            StudentSettingsRepository studentSettingsRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.subjectRepository = subjectRepository;
        this.studentSettingsRepository = studentSettingsRepository;
    }

    public List<AttendanceRecord> getAttendance(String studentId) {
        return attendanceRecordRepository.findByStudentId(studentId);
    }

    public List<AttendanceSummaryDto> getAttendanceSummary(String studentId) {
        int threshold = studentSettingsRepository.findById(studentId)
                .map(StudentSettings::getAttendanceThreshold)
                .orElse(75);

        List<Subject> subjects = subjectRepository.findAll();
        List<AttendanceRecord> allRecords = attendanceRecordRepository.findByStudentId(studentId);
        List<AttendanceSummaryDto> summaryList = new ArrayList<>();

        for (Subject sub : subjects) {
            List<AttendanceRecord> subRecords = allRecords.stream()
                    .filter(r -> r.getSubjectId().equals(sub.getId()))
                    .toList();

            int total = subRecords.size();
            int attended = (int) subRecords.stream()
                    .filter(r -> "present".equalsIgnoreCase(r.getStatus()) || "od".equalsIgnoreCase(r.getStatus()))
                    .count();

            double currentPercent = total > 0
                    ? Math.round((attended * 100.0 / total) * 10.0) / 10.0
                    : 100.0;

            int safeSkips = calculateSafeSkips(attended, total, threshold);
            int classesNeeded = calculateClassesToRecover(attended, total, threshold);

            String code = getAttendanceCode(currentPercent);
            boolean isAtRisk = currentPercent < threshold;
            boolean isEligible = currentPercent >= threshold;

            summaryList.add(new AttendanceSummaryDto(
                    sub,
                    total,
                    attended,
                    currentPercent,
                    safeSkips,
                    classesNeeded,
                    isAtRisk,
                    isEligible,
                    code
            ));
        }

        return summaryList;
    }

    /**
     * Safe skips formula: floor(attended / (threshold / 100.0) - total)
     * strictly bounded >= 0.
     */
    public int calculateSafeSkips(int attended, int total, int threshold) {
        if (total <= 0 || attended <= 0) return 0;
        double minRatio = threshold / 100.0;
        int skips = (int) Math.floor((attended / minRatio) - total);
        return Math.max(0, skips);
    }

    /**
     * Classes needed to recover formula: ceil((threshold * total - 100 * attended) / (100 - threshold))
     * For threshold = 75: ceil((75 * total - 100 * attended) / 25) = ceil(3 * total - 4 * attended)
     * strictly bounded >= 0.
     */
    public int calculateClassesToRecover(int attended, int total, int threshold) {
        if (total <= 0) return 0;
        if ((attended * 100.0 / total) >= threshold) return 0;
        double needed = Math.ceil(((threshold * total) - (100.0 * attended)) / (100.0 - threshold));
        return Math.max(0, (int) needed);
    }

    public String getAttendanceCode(double percent) {
        if (percent >= 90.0) return "H";
        if (percent >= 80.0) return "9";
        if (percent >= 75.0) return "8";
        return "L";
    }
}
