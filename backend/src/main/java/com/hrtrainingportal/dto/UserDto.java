package com.hrtrainingportal.dto;

import com.hrtrainingportal.enums.Role;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private String phone;
    private String departmentName;
    private Long departmentId;
    private String supervisorName;
    private Long supervisorId;
    private boolean active;
}
