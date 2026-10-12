package com.campusconnect;

import com.campusconnect.dto.CreateRequestInput;
import com.campusconnect.dto.RequestItemDto;
import com.campusconnect.model.StudentRecord;
import com.campusconnect.model.User;
import com.campusconnect.repository.StudentRequestRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.service.RequestService;
import com.campusconnect.service.SimulationScheduler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class RequestFlowIntegrationTest {

    @Autowired
    private RequestService requestService;

    @Autowired
    private StudentRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimulationScheduler simulationScheduler;

    @Test
    @DisplayName("Request Flow: Submit request, check status, verify document generation")
    void testRequestSubmissionAndLifecycle() {
        User user = userRepository.findByIdentifier("21CS042").orElseThrow();
        StudentRecord record = user.getStudentRecord();

        CreateRequestInput input = new CreateRequestInput(
                "No-dues",
                "Graduation Lab Clearance",
                Map.of("reason", "Graduation clearance test")
        );

        RequestItemDto created = requestService.createRequest(user.getId(), input, record);
        assertNotNull(created.getId());
        assertEquals("Submitted", created.getStatus());
        assertEquals(4, created.getDepartmentStages().size());

        // Run simulation step
        simulationScheduler.runSimulation();

        RequestItemDto updated = requestService.getRequestById(created.getId(), user.getId()).orElseThrow();
        // Moved to Faculty Review or beyond
        assertNotEquals("Submitted", updated.getStatus());
        assertTrue(updated.getComments().size() >= 2);

        // Check PDF document generation for an approved request
        // REQ-ND-8842 was seeded as Approved
        byte[] pdf = requestService.generateDocument("REQ-ND-8842", user.getId(), record);
        assertNotNull(pdf);
        assertTrue(pdf.length > 500); // PDF contains data
        // Verify PDF magic bytes '%PDF'
        assertEquals('%', (char) pdf[0]);
        assertEquals('P', (char) pdf[1]);
        assertEquals('D', (char) pdf[2]);
        assertEquals('F', (char) pdf[3]);
    }
}
