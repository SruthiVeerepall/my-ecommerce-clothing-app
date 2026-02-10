package com.example.ecommerce.dto;

public class ApiResponse {
    private String message;
    private Long id;
    private boolean success;

    public ApiResponse() {}

    public ApiResponse(String message, Long id, boolean success) {
        this.message = message;
        this.id = id;
        this.success = success;
    }

    public ApiResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
