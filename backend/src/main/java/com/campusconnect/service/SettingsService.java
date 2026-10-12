package com.campusconnect.service;

import com.campusconnect.model.StudentSettings;
import com.campusconnect.repository.StudentSettingsRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class SettingsService {

    private final StudentSettingsRepository studentSettingsRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SettingsService(StudentSettingsRepository studentSettingsRepository) {
        this.studentSettingsRepository = studentSettingsRepository;
    }

    public Map<String, Object> getSettings(String studentId) {
        StudentSettings s = studentSettingsRepository.findById(studentId)
                .orElseGet(() -> new StudentSettings(
                        studentId, 75, 8.5, 4, 50, 50,
                        "{\"attendanceRisk\":true,\"newCircular\":true,\"gradePublished\":true}",
                        "system"
                ));

        Map<String, Object> res = new HashMap<>();
        res.put("theme", s.getTheme() != null ? s.getTheme() : "system");
        res.put("attendanceThreshold", s.getAttendanceThreshold());
        res.put("targetCgpa", s.getTargetCgpa());
        res.put("targetSgpa", s.getTargetCgpa());
        res.put("dailyStudyHours", s.getDailyStudyHours());
        res.put("internalWeight", s.getInternalWeight());
        res.put("endSemWeight", s.getEndSemWeight());
        res.put("gradingScheme", "SRM 2021 Regulation (10-pt Absolute)");

        Map<String, Boolean> alerts = new HashMap<>();
        alerts.put("attendanceRisk", true);
        alerts.put("newCircular", true);
        alerts.put("gradePublished", true);
        if (s.getEmailAlertsJson() != null && !s.getEmailAlertsJson().isBlank()) {
            try {
                alerts = objectMapper.readValue(s.getEmailAlertsJson(), new TypeReference<Map<String, Boolean>>() {});
            } catch (Exception ignored) {}
        }
        res.put("emailAlerts", alerts);
        return res;
    }

    @Transactional
    public Map<String, Object> updateSettings(String studentId, Map<String, Object> updates) {
        StudentSettings s = studentSettingsRepository.findById(studentId)
                .orElseGet(() -> new StudentSettings(
                        studentId, 75, 8.5, 4, 50, 50,
                        "{\"attendanceRisk\":true,\"newCircular\":true,\"gradePublished\":true}",
                        "system"
                ));

        if (updates.containsKey("theme")) {
            s.setTheme((String) updates.get("theme"));
        }
        if (updates.containsKey("attendanceThreshold")) {
            Object val = updates.get("attendanceThreshold");
            s.setAttendanceThreshold(val instanceof Number ? ((Number) val).intValue() : Integer.parseInt(val.toString()));
        }
        if (updates.containsKey("targetCgpa")) {
            Object val = updates.get("targetCgpa");
            s.setTargetCgpa(val instanceof Number ? ((Number) val).doubleValue() : Double.parseDouble(val.toString()));
        } else if (updates.containsKey("targetSgpa")) {
            Object val = updates.get("targetSgpa");
            s.setTargetCgpa(val instanceof Number ? ((Number) val).doubleValue() : Double.parseDouble(val.toString()));
        }
        if (updates.containsKey("dailyStudyHours")) {
            Object val = updates.get("dailyStudyHours");
            s.setDailyStudyHours(val instanceof Number ? ((Number) val).intValue() : Integer.parseInt(val.toString()));
        }
        if (updates.containsKey("internalWeight")) {
            Object val = updates.get("internalWeight");
            s.setInternalWeight(val instanceof Number ? ((Number) val).intValue() : Integer.parseInt(val.toString()));
        }
        if (updates.containsKey("endSemWeight")) {
            Object val = updates.get("endSemWeight");
            s.setEndSemWeight(val instanceof Number ? ((Number) val).intValue() : Integer.parseInt(val.toString()));
        }
        if (updates.containsKey("emailAlerts")) {
            try {
                s.setEmailAlertsJson(objectMapper.writeValueAsString(updates.get("emailAlerts")));
            } catch (Exception ignored) {}
        }

        studentSettingsRepository.save(s);
        return getSettings(studentId);
    }
}
