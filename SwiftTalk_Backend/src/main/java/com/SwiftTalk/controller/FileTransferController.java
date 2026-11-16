package com.SwiftTalk.controller;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.SwiftTalk.dto.FileUploadResponse;
import com.SwiftTalk.model.FileMetadata;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/attachments")
public class FileTransferController {

    private static final long MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    private static final Duration UNTOUCHED_EXPIRY = Duration.ofDays(7);
    private static final Duration POST_DOWNLOAD_EXPIRY = Duration.ofHours(8);

    private static final String FILE_PREFIX = "file:";
    private static final String META_PREFIX = "meta:";

    @Autowired
    private RedisTemplate<String, byte[]> redisTemplate;

    @Autowired
    private RedisTemplate<String, String> redisStringTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/upload-temp")
    public ResponseEntity<FileUploadResponse> uploadFile(@RequestParam("file") MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File exceeds max allowed size of 25MB");
        }

        String fileId = UUID.randomUUID().toString();
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        String mimeType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        long size = file.getSize();
        byte[] fileBytes = file.getBytes();

        // Store file with TTL
        redisTemplate.opsForValue().set(FILE_PREFIX + fileId, fileBytes, UNTOUCHED_EXPIRY);

        FileMetadata metadata = new FileMetadata(false, Instant.now(), filename, mimeType, size);
        redisStringTemplate.opsForValue().set(META_PREFIX + fileId, objectMapper.writeValueAsString(metadata));
        redisStringTemplate.expire(META_PREFIX + fileId, UNTOUCHED_EXPIRY);

        FileUploadResponse response = new FileUploadResponse(
                fileId,
                filename,
                mimeType,
                "/attachments/download/" + fileId,
                Instant.now().plus(UNTOUCHED_EXPIRY).toString()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<?> downloadFile(
            @PathVariable String fileId,
            @RequestParam(value = "mode", defaultValue = "download") String mode) {

        String fileKey = FILE_PREFIX + fileId;
        String metaKey = META_PREFIX + fileId;

        byte[] fileBytes = redisTemplate.opsForValue().get(fileKey);
        String metaJson = redisStringTemplate.opsForValue().get(metaKey);

        if (fileBytes == null || metaJson == null) {
            return ResponseEntity.status(410).body("File has expired or does not exist.");
        }

        try {
            FileMetadata metadata = objectMapper.readValue(metaJson, FileMetadata.class);

            // First download: update TTL
            if (!metadata.isDownloaded()) {
                metadata.setDownloaded(true);
                redisStringTemplate.opsForValue().set(metaKey, objectMapper.writeValueAsString(metadata));
                redisStringTemplate.expire(metaKey, POST_DOWNLOAD_EXPIRY);
                redisTemplate.expire(fileKey, POST_DOWNLOAD_EXPIRY);
            }

            String filename = metadata.getFileName() != null ? metadata.getFileName() : "file";
            String contentType = metadata.getMimeType() != null ? metadata.getMimeType() : "application/octet-stream";

            String disposition = switch (mode.toLowerCase()) {
                case "open" -> "inline";
                case "download" -> "attachment";
                default -> "attachment";
            };

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileBytes);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to read file metadata.");
        }
    }

    @GetMapping("/meta/{fileId}")
    public ResponseEntity<?> getFileMeta(@PathVariable String fileId) {
        String metaKey = META_PREFIX + fileId;
        String metaJson = redisStringTemplate.opsForValue().get(metaKey);

        if (metaJson == null) {
            return ResponseEntity.status(404).body("Metadata not found");
        }

        try {
            FileMetadata metadata = objectMapper.readValue(metaJson, FileMetadata.class);
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to parse metadata");
        }
    }
}
