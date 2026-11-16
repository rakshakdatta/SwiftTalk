package com.SwiftTalk.service.serviceIMPL;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.SwiftTalk.dto.FileUploadResponse;
import com.SwiftTalk.model.FileMetadata;
import com.SwiftTalk.service.FileTransferService;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class FileTransferServiceImpl implements FileTransferService {

    private static final long MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
    private static final long INITIAL_TTL_SECONDS = 7 * 24 * 3600; // 7 days
    private static final long TTL_AFTER_DOWNLOAD_SECONDS = 8 * 3600; // 8 hours

    @Autowired
    private RedisTemplate<String, byte[]> redisTemplate;

    @Autowired
    private RedisTemplate<String, String> stringRedisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String FILE_PREFIX = "file:";
    private static final String META_PREFIX = "meta:";

    @Override
    public FileUploadResponse uploadFile(MultipartFile file) throws IOException {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds 25MB limit");
        }

        String fileId = UUID.randomUUID().toString();
        byte[] bytes = file.getBytes();
        String mimeType = file.getContentType();
        String fileName = file.getOriginalFilename();
        long size = file.getSize();

        // Store file in Redis with 7-day TTL
        redisTemplate.opsForValue().set(FILE_PREFIX + fileId, bytes, INITIAL_TTL_SECONDS, TimeUnit.SECONDS);

        // Store metadata including size
        FileMetadata metadata = new FileMetadata(false, Instant.now(), fileName, mimeType, size);
        String metadataJson = objectMapper.writeValueAsString(metadata);
        stringRedisTemplate.opsForValue().set(META_PREFIX + fileId, metadataJson);
        stringRedisTemplate.expire(META_PREFIX + fileId, INITIAL_TTL_SECONDS, TimeUnit.SECONDS);

        Instant expiresAt = Instant.now().plus(INITIAL_TTL_SECONDS, ChronoUnit.SECONDS);

        return new FileUploadResponse(
                fileId,
                fileName,
                mimeType,
                "/attachments/download/" + fileId,
                expiresAt.toString()
        );
    }

    @Override
    public byte[] downloadFile(String fileId) throws IOException {
        String fileKey = FILE_PREFIX + fileId;
        String metaKey = META_PREFIX + fileId;

        byte[] fileData = redisTemplate.opsForValue().get(fileKey);
        if (fileData == null) {
            return null; // Will be handled as 410 in controller
        }

        String metaJson = stringRedisTemplate.opsForValue().get(metaKey);
        if (metaJson != null) {
            FileMetadata metadata = objectMapper.readValue(metaJson, FileMetadata.class);

            // If not downloaded yet, update TTL to 8 hours from now
            if (!metadata.isDownloaded()) {
                redisTemplate.expire(fileKey, TTL_AFTER_DOWNLOAD_SECONDS, TimeUnit.SECONDS);
                stringRedisTemplate.expire(metaKey, TTL_AFTER_DOWNLOAD_SECONDS, TimeUnit.SECONDS);
                metadata.setDownloaded(true);
                stringRedisTemplate.opsForValue().set(metaKey, objectMapper.writeValueAsString(metadata));
            }
        }

        return fileData;
    }
}
