package com.SwiftTalk.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.SwiftTalk.dto.FileUploadResponse;

public interface FileTransferService {

    FileUploadResponse uploadFile(MultipartFile file) throws IOException;

    byte[] downloadFile(String fileId) throws IOException;
}
