package com.musify.api.controller;

import com.musify.api.dto.MusicTrackRequest;
import com.musify.api.dto.UploadUrlResponse;
import com.musify.api.model.MusicTrack;
import com.musify.api.service.MusicTrackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/musictrack")
@RequiredArgsConstructor
public class MusicTrackController {

    private final MusicTrackService musicTrackService;

    @GetMapping("/upload-url")
    public ResponseEntity<UploadUrlResponse> getUploadUrl(@RequestParam String artistName, @RequestParam String songName) {
        UploadUrlResponse uploadUrl = musicTrackService.getUploadUrl(artistName, songName);
        return new ResponseEntity<>(uploadUrl, HttpStatus.OK);
    }

    @PostMapping("/metadata")
    public ResponseEntity<MusicTrack> uploadMetadata(@Valid @RequestBody MusicTrackRequest musicTrackRequest) {
        MusicTrack musicTrackToSave = MusicTrack.builder()
                .artistName(musicTrackRequest.getArtistName())
                .songName(musicTrackRequest.getSongName())
                .s3Key(musicTrackRequest.getS3Key())
                .duration(musicTrackRequest.getDuration())
                .build();

        MusicTrack addMusicTrack = musicTrackService.addMusicTrack(musicTrackToSave);
        return new ResponseEntity<>(addMusicTrack, HttpStatus.CREATED);
    }

    @GetMapping("/{songId}")
    public ResponseEntity<MusicTrack> getSongById(@PathVariable String songId) {
        MusicTrack musicTrack = musicTrackService.getSongById(songId);
        return new ResponseEntity<>(musicTrack, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<MusicTrack>> getAllSongs() {
        List<MusicTrack> musicTracks = musicTrackService.getAllSongs();
        return new ResponseEntity<>(musicTracks, HttpStatus.OK);
    }

    /**
     *
     * @return String - the preSigned URL to stream the song
     */
    @GetMapping("/stream")
    public ResponseEntity<String> streamSong(@RequestParam String key) {
        String streamUrl = musicTrackService.getStreamUrl(key);
        return new ResponseEntity<>(streamUrl, HttpStatus.OK);
    }


    @DeleteMapping("/{songId}")
    public ResponseEntity<Void> deleteSong(@PathVariable String songId) {
        musicTrackService.deleteSong(songId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
