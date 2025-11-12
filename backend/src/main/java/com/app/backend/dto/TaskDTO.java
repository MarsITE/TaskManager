package com.app.backend.dto;

import com.app.backend.model.Task.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskDTO(
        @NotBlank(message = "Title cannot be blank")
        @Size(max = 100, message = "Title must be less than 100 characters")
        String title,

        @Size(max = 500, message = "Description must be less than 500 characters")
        String description,

        Status status
) {
}
