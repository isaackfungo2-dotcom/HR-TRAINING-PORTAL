package com.hrtrainingportal.controller;

import com.hrtrainingportal.dto.TrainingAssessmentDto;
import com.hrtrainingportal.security.JwtTokenProvider;
import com.hrtrainingportal.service.AssessmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final JwtTokenProvider jwtTokenProvider;

    public AssessmentController(AssessmentService assessmentService, JwtTokenProvider jwtTokenProvider) {
        this.assessmentService = assessmentService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private String getEmail(String authHeader) {
        return jwtTokenProvider.getEmailFromToken(authHeader.replace("Bearer ", ""));
    }

    @GetMapping("request/{requestId}")
    public ResponseEntity<List<TrainingAssessmentDto>> getForRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(assessmentService.getAssessmentsForRequest(requestId));
    }

    @PostMapping("request/{requestId}/level/{level}/submit")
    public ResponseEntity<TrainingAssessmentDto> submit(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long requestId,
            @PathVariable int level,
            @RequestBody Map<String, String> body) {
        String email = getEmail(auth);
        return ResponseEntity.ok(assessmentService.submitEmployeeAssessment(email, requestId, level, body.get("formData")));
    }

    @PostMapping("request/{requestId}/level/{level}/draft")
    public ResponseEntity<TrainingAssessmentDto> saveDraft(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long requestId,
            @PathVariable int level,
            @RequestBody Map<String, String> body) {
        String email = getEmail(auth);
        return ResponseEntity.ok(assessmentService.saveDraft(email, requestId, level, body.get("formData")));
    }

    @PostMapping("{assessmentId}/supervisor-submit")
    public ResponseEntity<TrainingAssessmentDto> supervisorSubmit(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long assessmentId,
            @RequestBody Map<String, String> body) {
        String email = getEmail(auth);
        return ResponseEntity.ok(assessmentService.submitSupervisorAssessment(email, assessmentId, body.get("formData")));
    }

    @PostMapping("{assessmentId}/hr-review")
    public ResponseEntity<TrainingAssessmentDto> hrReview(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long assessmentId,
            @RequestBody Map<String, String> body) {
        String email = getEmail(auth);
        return ResponseEntity.ok(assessmentService.hrReview(email, assessmentId, body.get("comments")));
    }
}
