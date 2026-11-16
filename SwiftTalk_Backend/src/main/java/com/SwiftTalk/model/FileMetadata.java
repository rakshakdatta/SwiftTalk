package com.SwiftTalk.model;

import java.io.Serializable;
import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileMetadata implements Serializable {
    private boolean downloaded;
    private Instant uploadedAt;
    private String fileName;
    private String mimeType;
    private long size; // ✅ Added: to store file size in bytes
}
