package com.campusconnect;

import com.campusconnect.dto.StudyPlanResultDto;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import com.campusconnect.service.ExamService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class StudyPlannerTest {

    @Test
    @DisplayName("Study planner enforces daily study cap and correctly assigns units")
    void testStudyPlanEnforcesDailyCap() {
        ExamRepository examRepo = Mockito.mock(ExamRepository.class);
        SyllabusUnitRepository unitRepo = Mockito.mock(SyllabusUnitRepository.class);
        StudentUnitProgressRepository progRepo = Mockito.mock(StudentUnitProgressRepository.class);
        SubjectRepository subRepo = Mockito.mock(SubjectRepository.class);
        MarkRecordRepository markRepo = Mockito.mock(MarkRecordRepository.class);
        StudentSettingsRepository setRepo = Mockito.mock(StudentSettingsRepository.class);

        Subject sub1 = new Subject("sub-1", "CS101", "Programming", 4, "Dr Smith", 60);
        Subject sub2 = new Subject("sub-2", "CS102", "Data Structures", 4, "Dr Jones", 60);
        when(subRepo.findAll()).thenReturn(List.of(sub1, sub2));

        String examDate1 = LocalDate.now().plusDays(4).toString();
        String examDate2 = LocalDate.now().plusDays(10).toString();
        Exam e1 = new Exam("ex-1", "student-1", "sub-1", "CS101", "Programming", examDate1, "10:00", "3h", "Hall 1");
        Exam e2 = new Exam("ex-2", "student-1", "sub-2", "CS102", "Data Structures", examDate2, "10:00", "3h", "Hall 2");
        when(examRepo.findByStudentId("student-1")).thenReturn(List.of(e1, e2));

        SyllabusUnit u1 = new SyllabusUnit("u-1", "sub-1", 1, "Basics of C", 3);
        SyllabusUnit u2 = new SyllabusUnit("u-2", "sub-1", 2, "Pointers", 4);
        SyllabusUnit u3 = new SyllabusUnit("u-3", "sub-2", 1, "Arrays & Lists", 4);
        when(unitRepo.findAll()).thenReturn(List.of(u1, u2, u3));

        when(progRepo.findByStudentId("student-1")).thenReturn(List.of());
        when(markRepo.findByStudentId("student-1")).thenReturn(List.of(
                new MarkRecord("student-1", "sub-1", 15.0, 15.0, 10.0, 40.0, 50, 4, "college"),
                new MarkRecord("student-1", "sub-2", 20.0, 20.0, 10.0, 50.0, 50, 4, "college")
        ));
        when(setRepo.findById("student-1")).thenReturn(Optional.of(new StudentSettings(
                "student-1", 75, 8.5, 3, 50, 50, "", "system"
        )));

        ExamService examService = new ExamService(examRepo, unitRepo, progRepo, subRepo, markRepo, setRepo);

        StudyPlanResultDto plan = examService.buildStudyPlan("student-1", 3);

        assertNotNull(plan);
        assertEquals(3, plan.getDailyHoursCap());
        assertEquals(7, plan.getDays().size());

        // Each day must not exceed the daily cap of 3 hours
        for (var day : plan.getDays()) {
            assertTrue(day.getAllocatedHours() <= 3.01, "Allocated hours should not exceed cap: " + day.getAllocatedHours());
        }
    }
}
