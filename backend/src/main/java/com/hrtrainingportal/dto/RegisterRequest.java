package com.hrtrainingportal.dto;

import com.hrtrainingportal.enums.Role;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Role role;
    private Long departmentId;
    private Long supervisorId;
    private String phone;
    private Boolean active;
}
