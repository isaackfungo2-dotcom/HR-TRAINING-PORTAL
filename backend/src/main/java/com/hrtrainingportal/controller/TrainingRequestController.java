package com.hrtrainingportal.controller;

import com.hrtrainingportal.dto.*;
import com.hrtrainingportal.service.*;
import com.hrtrainingportal.security.JwtTokenProvider;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("requests")
public class TrainingRequestController {

    private final TrainingRequestService trainingRequestService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditLogService auditLogService;

    public TrainingRequestController(TrainingRequestService trainingRequestService,
                                     JwtTokenProvider jwtTokenProvider,
                                     AuditLogService auditLogService) {
        this.trainingRequestService = trainingRequestService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.auditLogService = auditLogService;
    }

    private String getEmail(String authHeader) {
        return jwtTokenProvider.getEmailFromToken(authHeader.replace("Bearer ", ""));
    }

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TrainingRequestDto> createRequest(
            @RequestHeader("Authorization") String authHeader,
            @RequestPart("data") CreateTrainingRequest data,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        String email = getEmail(authHeader);
        return ResponseEntity.ok(trainingRequestService.createRequest(email, data, files));
    }

    @GetMapping("my")
    public ResponseEntity<List<TrainingRequestDto>> getMyRequests(@RequestHeader("Authorization") String authHeader) {
        String email = getEmail(authHeader);
        return ResponseEntity.ok(trainingRequestService.getEmployeeRequests(email));
    }

    @GetMapping("supervisor/pending")
    public ResponseEntity<List<TrainingRequestDto>> getSupervisorPending(@RequestHeader("Authorization") String authHeader) {
        String email = getEmail(authHeader);
        return ResponseEntity.ok(trainingRequestService.getSupervisorPendingRequests(email));
    }

    @GetMapping("supervisor/all")
    public ResponseEntity<List<TrainingRequestDto>> getSupervisorAll(@RequestHeader("Authorization") String authHeader) {
        String email = getEmail(authHeader);
        return ResponseEntity.ok(trainingRequestService.getSupervisorAllRequests(email));
    }

    @GetMapping("")
    public ResponseEntity<List<TrainingRequestDto>> getAllRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(trainingRequestService.getAllRequests(
                status != null ? com.hrtrainingportal.enums.RequestStatus.valueOf(status) : null,
                departmentId, keyword));
    }

    @GetMapping("{id}")
    public ResponseEntity<TrainingRequestDto> getRequest(@PathVariable Long id) {
        return ResponseEntity.ok(trainingRequestService.getRequest(id));
    }

    @PostMapping("{id}/supervisor-action")
    public ResponseEntity<TrainingRequestDto> supervisorAction(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody ApprovalAction action) {
        String email = getEmail(authHeader);
        return ResponseEntity.ok(trainingRequestService.supervisorAction(id, email, action));
    }

    @PostMapping("{id}/hr-action")
    public ResponseEntity<TrainingRequestDto> hrAction(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody ApprovalAction action) {
        String email = getEmail(authHeader);
        return ResponseEntity.ok(trainingRequestService.hrAction(id, email, action));
    }

    @GetMapping("{id}/documents")
    public ResponseEntity<List<TrainingDocumentDto>> getDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(trainingRequestService.getDocumentsForRequest(id));
    }

    @GetMapping("{id}/audit-logs")
    public ResponseEntity<List<AuditLogDto>> getAuditLogs(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogService.getLogsForRequest(id));
    }
}
