package com.hrtrainingportal.config;

import com.hrtrainingportal.entity.*;
import com.hrtrainingportal.enums.*;
import com.hrtrainingportal.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(DepartmentRepository departmentRepo,
                                      UserRepository userRepo,
                                      TrainingRequestRepository requestRepo,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepo.count() > 0) return;

            Department hrDept = departmentRepo.save(Department.builder().name("Human Resources").description("HR Department").build());
            Department itDept = departmentRepo.save(Department.builder().name("Information Technology").description("IT Department").build());
            Department finDept = departmentRepo.save(Department.builder().name("Finance").description("Finance Department").build());
            Department opsDept = departmentRepo.save(Department.builder().name("Operations").description("Operations Department").build());

            User admin = userRepo.save(User.builder()
                    .firstName("System").lastName("Admin")
                    .email("admin@hrportal.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN).active(true).department(hrDept).build());

            User hr = userRepo.save(User.builder()
                    .firstName("Jane").lastName("HRManager")
                    .email("hr@hrportal.com")
                    .password(passwordEncoder.encode("hr123"))
                    .role(Role.HR).active(true).department(hrDept).build());

            User supervisor1 = userRepo.save(User.builder()
                    .firstName("John").lastName("Supervisor")
                    .email("supervisor@hrportal.com")
                    .password(passwordEncoder.encode("supervisor123"))
                    .role(Role.SUPERVISOR).active(true).department(itDept).build());

            User emp1 = userRepo.save(User.builder()
                    .firstName("Alice").lastName("Employee")
                    .email("alice@hrportal.com")
                    .password(passwordEncoder.encode("alice123"))
                    .role(Role.EMPLOYEE).active(true).department(itDept).supervisor(supervisor1).build());

            User emp2 = userRepo.save(User.builder()
                    .firstName("Bob").lastName("Builder")
                    .email("bob@hrportal.com")
                    .password(passwordEncoder.encode("bob123"))
                    .role(Role.EMPLOYEE).active(true).department(finDept).supervisor(supervisor1).build());

            requestRepo.save(TrainingRequest.builder()
                    .employee(emp1).supervisor(supervisor1)
                    .title("Java Advanced Patterns")
                    .description("Advanced Java patterns and practices training")
                    .objectives("Improve code quality")
                    .trainingType(TrainingType.IN_COUNTRY)
                    .proposedStartDate(LocalDate.now().plusDays(10))
                    .proposedEndDate(LocalDate.now().plusDays(12))
                    .provider("Tech Academy")
                    .institution("Tech Academy Center")
                    .estimatedCost(new BigDecimal("1500.00"))
                    .currency("USD")
                    .justification("Skill improvement")
                    .expectedBenefits("Better code quality")
                    .status(RequestStatus.PENDING_SUPERVISOR)
                    .build());

            requestRepo.save(TrainingRequest.builder()
                    .employee(emp2).supervisor(supervisor1)
                    .title("International Finance Summit")
                    .description("Global finance trends summit")
                    .objectives("Understand global markets")
                    .trainingType(TrainingType.OUT_OF_COUNTRY)
                    .proposedStartDate(LocalDate.now().plusDays(20))
                    .proposedEndDate(LocalDate.now().plusDays(25))
                    .provider("Global Finance Org")
                    .institution("London Finance Center")
                    .estimatedCost(new BigDecimal("5000.00"))
                    .currency("USD")
                    .justification("Market awareness")
                    .expectedBenefits("Strategic insights")
                    .status(RequestStatus.SUPERVISOR_APPROVED)
                    .build());

            requestRepo.save(TrainingRequest.builder()
                    .employee(emp1).supervisor(supervisor1)
                    .title("Spring Boot Workshop")
                    .description("Hands-on Spring Boot development")
                    .objectives("Master Spring Boot")
                    .trainingType(TrainingType.IN_COUNTRY)
                    .proposedStartDate(LocalDate.now().plusDays(5))
                    .proposedEndDate(LocalDate.now().plusDays(7))
                    .provider("Code Labs")
                    .institution("Code Labs Center")
                    .estimatedCost(new BigDecimal("1200.00"))
                    .currency("USD")
                    .justification("Project needs")
                    .expectedBenefits("Faster delivery")
                    .status(RequestStatus.HR_APPROVED)
                    .hrApprover(hr)
                    .build());
        };
    }
}
