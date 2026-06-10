package com.hrtrainingportal.service;

import com.hrtrainingportal.dto.*;
import com.hrtrainingportal.entity.*;
import com.hrtrainingportal.enums.Role;
import com.hrtrainingportal.exception.BadRequestException;
import com.hrtrainingportal.exception.ResourceNotFoundException;
import com.hrtrainingportal.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final DepartmentRepository deptRepo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepo, DepartmentRepository deptRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.deptRepo = deptRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto createUser(RegisterRequest dto) {
        if (userRepo.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole() != null ? dto.getRole() : Role.EMPLOYEE)
                .phone(dto.getPhone())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
        if (dto.getDepartmentId() != null) {
            user.setDepartment(deptRepo.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found")));
        }
        if (dto.getSupervisorId() != null) {
            user.setSupervisor(userRepo.findById(dto.getSupervisorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supervisor not found")));
        }
        return toDto(userRepo.save(user));
    }

    public UserDto updateUser(Long id, RegisterRequest dto) {
        User user = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getRole() != null) user.setRole(dto.getRole());
        if (dto.getActive() != null) user.setActive(dto.getActive());
        if (dto.getDepartmentId() != null) {
            user.setDepartment(deptRepo.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found")));
        }
        if (dto.getSupervisorId() != null) {
            user.setSupervisor(userRepo.findById(dto.getSupervisorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supervisor not found")));
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        return toDto(userRepo.save(user));
    }

    public void deleteUser(Long id) {
        User user = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(false);
        userRepo.save(user);
    }

    public void setUserActive(Long id, boolean active) {
        User user = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(active);
        userRepo.save(user);
    }

    public UserDto getUser(Long id) {
        return toDto(userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    public List<UserDto> getAllUsers() {
        return userRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<DepartmentDto> getAllDepartments() {
        return deptRepo.findAll().stream().map(d -> DepartmentDto.builder()
                .id(d.getId())
                .name(d.getName())
                .description(d.getDescription())
                .build()).collect(Collectors.toList());
    }

    public DepartmentDto createDepartment(String name, String description) {
        Department d = Department.builder().name(name).description(description).build();
        return toDto(deptRepo.save(d));
    }

    private DepartmentDto toDto(Department d) {
        return DepartmentDto.builder().id(d.getId()).name(d.getName()).description(d.getDescription()).build();
    }

    private UserDto toDto(User u) {
        return UserDto.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .role(u.getRole())
                .phone(u.getPhone())
                .departmentId(u.getDepartment() != null ? u.getDepartment().getId() : null)
                .departmentName(u.getDepartment() != null ? u.getDepartment().getName() : null)
                .supervisorId(u.getSupervisor() != null ? u.getSupervisor().getId() : null)
                .supervisorName(u.getSupervisor() != null ? u.getSupervisor().getFullName() : null)
                .active(u.isActive())
                .build();
    }
}
