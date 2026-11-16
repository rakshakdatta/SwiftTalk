package com.SwiftTalk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    private String fileId;
    private String fileName;
    private String mimeType;
    private String downloadUrl;
    private String expiresAt; // ISO 8601 formatted (e.g., "2025-05-14T16:45:00Z")
}
