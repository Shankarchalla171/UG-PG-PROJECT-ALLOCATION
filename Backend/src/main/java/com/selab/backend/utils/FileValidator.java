package com.selab.backend.utils;
import com.selab.backend.exceptions.FileValidationException;
import org.springframework.web.multipart.MultipartFile;

public class FileValidator {
    public static void validateImage(MultipartFile file, long maxSize) {

        if (file == null || file.isEmpty()) {
            throw new FileValidationException("Image file is required");
        }

        if (file.getSize() > maxSize) {
            throw new FileValidationException("Image size exceeds limit");
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new FileValidationException("Invalid image file type");
        }
    }

    public static void validatePdf(MultipartFile file, long maxSize) {

        if (file == null || file.isEmpty()) {
            throw new FileValidationException("PDF file is required");
        }

        if (file.getSize() > maxSize) {
            throw new FileValidationException("File size exceeds limit");
        }

        String contentType = file.getContentType();

        if (!"application/pdf".equals(contentType)) {
            throw new FileValidationException("File must be a PDF");
        }
    }
}
