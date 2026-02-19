package com.musify.api.service;

import com.musify.api.repository.MusicTrackRepository;
import com.musify.api.dto.UploadUrlResponse;
import com.musify.api.dto.PaginatedResponse;
import com.musify.api.exception.DuplicateSongException;
import com.musify.api.model.MusicTrack;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MusicTrackService {

    private final MusicTrackRepository musicTrackRepository;
    private final S3Service s3Service;

    public MusicTrack addMusicTrack(MusicTrack musicTrack) {
        log.info("Adding new music track: {}", musicTrack.getSongName());
        return musicTrackRepository.save(musicTrack);
    }

    public MusicTrack getSongById(String songId) {
        log.debug("Fetching song with ID: {}", songId);
        // return musicTrackRepository.findByPartitionKeyAndSortKey(songId);
        return null;
    }

    public PaginatedResponse getAllSongs(int limit, String nextToken, String searchQuery) {
        log.debug("Fetching all songs with limit: {}, nextToken: {}, search: {}", limit, nextToken, searchQuery);
        return musicTrackRepository.findAll(limit, nextToken, searchQuery);
    }

    public MusicTrack updateSong(MusicTrack musicTrack) {
        log.info("Updating song: {}", musicTrack.getSongName());
        return musicTrackRepository.updateSong(musicTrack);
    }

    public void deleteSong(String songId) {
        log.info("Deleting song with ID: {}", songId);
        // musicTrackRepository.deleteSongByPartitionAndSortKey(songId);
    }

    public UploadUrlResponse getUploadUrl(String artistName, String songName) {
        log.info("Generating upload URL for artist: {}, song: {}", artistName, songName);
        if (musicTrackRepository.exists(artistName, songName)) {
            log.warn("Duplicate song detected for artist: {}, song: {}", artistName, songName);
            throw new DuplicateSongException("Song with " + artistName + " and " + songName + " already exists");
        }

        String s3Key = "tracks/" + artistName + "/" + songName + ".mp3";
        String url = s3Service.presignedPutObjectRequestUrl(s3Key);
        log.debug("Upload URL generated for Key: {}", s3Key);
        return new UploadUrlResponse(s3Key, url);
    }

    public String getStreamUrl(String key) {
        log.debug("Generating stream URL for key: {}", key);
        return s3Service.presignedGetObjectRequestUrl(key);

    }

}
