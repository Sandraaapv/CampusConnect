package com.campusconnect;

import com.campusconnect.service.AttendanceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AttendanceServiceTest {

    private final AttendanceService attendanceService = new AttendanceService(null, null, null);

    @Test
    @DisplayName("Safe skips formula: floor(a / 0.75 - t)")
    void testSafeSkipsFormula() {
        // 36 attended out of 40 total, threshold 75%
        // 36 / 0.75 - 40 = 48 - 40 = 8 safe skips
        int skips = attendanceService.calculateSafeSkips(36, 40, 75);
        assertEquals(8, skips);

        // 30 attended out of 40 total = 75% exactly
        // 30 / 0.75 - 40 = 40 - 40 = 0 safe skips
        int exactSkips = attendanceService.calculateSafeSkips(30, 40, 75);
        assertEquals(0, exactSkips);

        // Below threshold: 28 attended out of 40 (70%)
        // 28 / 0.75 - 40 = 37.33 - 40 = -2.66 -> bounded to 0
        int lowSkips = attendanceService.calculateSafeSkips(28, 40, 75);
        assertEquals(0, lowSkips);

        // Zero classes held
        assertEquals(0, attendanceService.calculateSafeSkips(0, 0, 75));
    }

    @Test
    @DisplayName("Classes needed to recover: ceil((75*t - 100*a) / 25) = ceil(3t - 4a)")
    void testClassesNeededToRecover() {
        // Computer Networks demo case: total = 38, attended = 28 (73.7%)
        // 3 * 38 - 4 * 28 = 114 - 112 = 2 classes needed
        int needed = attendanceService.calculateClassesToRecover(28, 38, 75);
        assertEquals(2, needed);

        // Verify: after 2 classes, total = 40, attended = 30 -> 30/40 = 75.0% (recovered!)
        assertEquals(75.0, (30.0 / 40.0) * 100.0);

        // Already above threshold (e.g. 35/40 = 87.5%)
        assertEquals(0, attendanceService.calculateClassesToRecover(35, 40, 75));

        // Zero classes held
        assertEquals(0, attendanceService.calculateClassesToRecover(0, 0, 75));
    }

    @Test
    @DisplayName("Attendance codes: H (>=90%), 9 (80-89.9%), 8 (75-79.9%), L (<75%)")
    void testAttendanceCodes() {
        assertEquals("H", attendanceService.getAttendanceCode(95.0));
        assertEquals("H", attendanceService.getAttendanceCode(90.0));
        assertEquals("9", attendanceService.getAttendanceCode(85.5));
        assertEquals("9", attendanceService.getAttendanceCode(80.0));
        assertEquals("8", attendanceService.getAttendanceCode(77.2));
        assertEquals("8", attendanceService.getAttendanceCode(75.0));
        assertEquals("L", attendanceService.getAttendanceCode(74.9));
        assertEquals("L", attendanceService.getAttendanceCode(55.0));
    }
}
