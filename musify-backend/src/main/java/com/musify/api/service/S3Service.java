package com.musify.api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;

@Component
@RequiredArgsConstructor
@Slf4j
public class S3Service {

        @Value("${aws.s3.bucket-name}")
        private String bucketName;

        private final S3Client s3Client;

        public String presignedGetObjectRequestUrl(String key) {
                log.debug("Generating presigned GET URL for key: {}", key);
                S3Presigner presigner = getS3Presigner();
                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                                .bucket(bucketName)
                                .key(key)
                                .build();

                GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
                                .signatureDuration(Duration.ofMinutes(60))
                                .getObjectRequest(getObjectRequest)
                                .build();

                PresignedGetObjectRequest presignedGetObjectRequest = presigner
                                .presignGetObject(getObjectPresignRequest);
                log.debug("Presigned GET URL generated successfully");
                return presignedGetObjectRequest.url().toString();
        }

        public String presignedPutObjectRequestUrl(String key) {
                log.debug("Generating presigned PUT URL for key: {}", key);
                S3Presigner presigner = getS3Presigner();

                PutObjectRequest objectRequest = PutObjectRequest.builder()
                                .bucket(bucketName)
                                .key(key)
                                .build();

                PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                                .signatureDuration(Duration.ofMinutes(5))
                                .putObjectRequest(objectRequest)
                                .build();

                PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);
                log.debug("Presigned PUT URL generated successfully");
                return presignedRequest.url().toString();
        }

        private S3Presigner getS3Presigner() {
                return S3Presigner.builder()
                                .s3Client(s3Client)
                                .build();
        }

}
