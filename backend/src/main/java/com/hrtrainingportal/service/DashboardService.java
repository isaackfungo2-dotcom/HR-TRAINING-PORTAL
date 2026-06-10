package com.hrtrainingportal.service;

import com.hrtrainingportal.dto.*;
import com.hrtrainingportal.entity.*;
import com.hrtrainingportal.enums.*;
import com.hrtrainingportal.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TrainingRequestRepository requestRepo;
    private final UserRepository userRepo;

    public DashboardService(TrainingRequestRepository requestRepo, UserRepository userRepo) {
        this.requestRepo = requestRepo;
        this.userRepo = userRepo;
    }

    public DashboardMetricsDto getMetrics() {
        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate yearStart = now.withDayOfYear(1);

        List<TrainingRequest> all = requestRepo.findAll();

        long totalMonth = all.stream().filter(r -> !r.getCreatedAt().toLocalDate().isBefore(monthStart)).count();
        long totalYear = all.stream().filter(r -> !r.getCreatedAt().toLocalDate().isBefore(yearStart)).count();
        long pendingSupervisor = all.stream().filter(r -> r.getStatus() == RequestStatus.PENDING_SUPERVISOR).count();
        long pendingHr = all.stream().filter(r -> r.getStatus() == RequestStatus.SUPERVISOR_APPROVED).count();
        long approvedInCountry = all.stream().filter(r -> r.getStatus() == RequestStatus.HR_APPROVED && r.getTrainingType() == TrainingType.IN_COUNTRY).count();
        long approvedOutOfCountry = all.stream().filter(r -> r.getStatus() == RequestStatus.HR_APPROVED && r.getTrainingType() == TrainingType.OUT_OF_COUNTRY).count();
        long rejected = all.stream().filter(r -> r.getStatus() == RequestStatus.REJECTED).count();
        long upcoming30 = all.stream().filter(r -> r.getProposedStartDate().isAfter(now.minusDays(1)) && r.getProposedStartDate().isBefore(now.plusDays(31))).count();
        long upcoming60 = all.stream().filter(r -> r.getProposedStartDate().isAfter(now.minusDays(1)) && r.getProposedStartDate().isBefore(now.plusDays(61))).count();
        BigDecimal totalCostMonth = all.stream()
                .filter(r -> r.getCreatedAt().toLocalDate().isAfter(monthStart.minusDays(1)))
                .map(TrainingRequest::getEstimatedCost)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String dominantCurrency = all.stream()
                .filter(r -> r.getCreatedAt().toLocalDate().isAfter(monthStart.minusDays(1)))
                .filter(r -> r.getCurrency() != null)
                .collect(Collectors.groupingBy(TrainingRequest::getCurrency, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("USD");

        return DashboardMetricsDto.builder()
                .totalRequestsThisMonth(totalMonth)
                .totalRequestsThisYear(totalYear)
                .pendingSupervisor(pendingSupervisor)
                .pendingHr(pendingHr)
                .approvedInCountry(approvedInCountry)
                .approvedOutOfCountry(approvedOutOfCountry)
                .rejected(rejected)
                .upcoming30Days(upcoming30)
                .upcoming60Days(upcoming60)
                .totalEstimatedCostThisMonth(totalCostMonth)
                .currency(dominantCurrency)
                .build();
    }

    public List<Map<String, Object>> getRequestsByDepartment() {
        List<TrainingRequest> all = requestRepo.findAll();
        Map<String, Long> counts = new HashMap<>();
        for (TrainingRequest r : all) {
            String dept = r.getEmployee() != null && r.getEmployee().getDepartment() != null
                    ? r.getEmployee().getDepartment().getName() : "Unassigned";
            counts.put(dept, counts.getOrDefault(dept, 0L) + 1);
        }
        return counts.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("department", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getMonthlyTrend() {
        LocalDate now = LocalDate.now();
        List<TrainingRequest> all = requestRepo.findAll();
        Map<String, Long> counts = new TreeMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String key = month.getYear() + "-" + String.format("%02d", month.getMonthValue());
            counts.put(key, 0L);
        }
        for (TrainingRequest r : all) {
            LocalDate d = r.getCreatedAt().toLocalDate();
            if (!d.isBefore(now.minusMonths(5).withDayOfMonth(1))) {
                String key = d.getYear() + "-" + String.format("%02d", d.getMonthValue());
                counts.put(key, counts.getOrDefault(key, 0L) + 1);
            }
        }
        return counts.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("month", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getInCountryVsOutOfCountry() {
        List<TrainingRequest> all = requestRepo.findAll();
        long inCountry = all.stream().filter(r -> r.getTrainingType() == TrainingType.IN_COUNTRY).count();
        long outOfCountry = all.stream().filter(r -> r.getTrainingType() == TrainingType.OUT_OF_COUNTRY).count();
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> m1 = new LinkedHashMap<>(); m1.put("type", "In-Country"); m1.put("count", inCountry); list.add(m1);
        Map<String, Object> m2 = new LinkedHashMap<>(); m2.put("type", "Out-of-Country"); m2.put("count", outOfCountry); list.add(m2);
        return list;
    }

    public List<Map<String, Object>> getApprovalRates() {
        List<TrainingRequest> all = requestRepo.findAll();
        long total = all.size();
        long approved = all.stream().filter(r -> r.getStatus() == RequestStatus.HR_APPROVED).count();
        long rejected = all.stream().filter(r -> r.getStatus() == RequestStatus.REJECTED).count();
        long pending = total - approved - rejected;
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> m1 = new LinkedHashMap<>(); m1.put("status", "Approved"); m1.put("count", approved); list.add(m1);
        Map<String, Object> m2 = new LinkedHashMap<>(); m2.put("status", "Rejected"); m2.put("count", rejected); list.add(m2);
        Map<String, Object> m3 = new LinkedHashMap<>(); m3.put("status", "Pending"); m3.put("count", pending); list.add(m3);
        return list;
    }
}
