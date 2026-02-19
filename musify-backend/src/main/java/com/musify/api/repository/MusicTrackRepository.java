package com.musify.api.repository;

import com.musify.api.dto.PaginatedResponse;
import com.musify.api.model.MusicTrack;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.Page;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.*;

@Repository
@RequiredArgsConstructor
@Slf4j
public class MusicTrackRepository {
    private final DynamoDbEnhancedClient dynamoDbEnhancedClient;
    private DynamoDbTable<MusicTrack> musicTrackTable;
    private static final Logger logger = LoggerFactory.getLogger(MusicTrackRepository.class);


    @PostConstruct
    public void init() {
        musicTrackTable = dynamoDbEnhancedClient.table("MusicTrack", TableSchema.fromBean(MusicTrack.class));
    }

    public MusicTrack save(MusicTrack musicTrack) {
        if (musicTrack.getArtistName() != null) {
            musicTrack.setArtistNameLower(musicTrack.getArtistName().toLowerCase());
        }
        if (musicTrack.getSongName() != null) {
            musicTrack.setSongNameLower(musicTrack.getSongName().toLowerCase());
        }
        musicTrackTable.putItem(musicTrack);
        return musicTrack;
    }

    public MusicTrack findByPartitionKeyAndSortKey(String artistName, String songName) {
        final String finalArtistName = artistName.trim();
        final String finalSongName = songName.trim();
        return musicTrackTable.getItem(r -> r.key(k -> k.partitionValue(finalArtistName).sortValue(finalSongName)));
    }

    public PaginatedResponse findAll(int limit, String nextToken, String searchQuery) {
        log.info("Fetching songs from DynamoDB...");
        List<MusicTrack> items = new ArrayList<>();
        String newNextToken = null;
        try {
        ScanEnhancedRequest.Builder requestBuilder = ScanEnhancedRequest.builder().limit(limit);

        // 1. Handle Pagination (NextToken)
        if (nextToken != null && !nextToken.isEmpty()) {
            try {
                // Decode Base64 -> JSON String -> Map<String, AttributeValue>
                // For simplicity in this demo, we'll assume nextToken is PartitionKey#SortKey
                // string
                // format for now?
                // No, better to try to reconstruct the key.
                // Since our PK is artistName and SK is songName, we need both.
                // Let's rely on a simple custom format: "ArtistName|SongName" encoded in Base64

                String decoded = new String(Base64.getDecoder().decode(nextToken));
                String[] parts = decoded.split("\\|", 2);
                if (parts.length == 2) {
                    Map<String, AttributeValue> startKey = new HashMap<>();
                    startKey.put("artistName", AttributeValue.builder().s(parts[0]).build());
                    startKey.put("songName", AttributeValue.builder().s(parts[1]).build());
                    requestBuilder.exclusiveStartKey(startKey);
                }
            } catch (Exception e) {
                // ignore invalid token
            }
        }

        // 2. Handle Search Filter
        if (searchQuery != null && !searchQuery.isEmpty()) {
            String query = searchQuery.trim().toLowerCase();
            // Filter: contains(artistNameLower, query) OR contains(songNameLower, query)
            Expression expression = Expression.builder()
                    .expression("contains(artistNameLower, :q) OR contains(songNameLower, :q)")
                    .putExpressionValue(":q", AttributeValue.builder().s(query).build())
                    .build();
            requestBuilder.filterExpression(expression);
        }

        // 3. Execute Scan (Iterate over ONE page)
        /*
         * Note: scan() returns an iterable. We want just the first page of results
         * relative to the start key.
         */
        Iterator<Page<MusicTrack>> iterator = musicTrackTable.scan(requestBuilder.build()).iterator();



        if (iterator.hasNext()) {
            Page<MusicTrack> page = iterator.next();
            items.addAll(page.items());

            Map<String, AttributeValue> lastKey = page.lastEvaluatedKey();
            if (lastKey != null && !lastKey.isEmpty()) {
                AttributeValue artistAttr = lastKey.get("artistName");
                AttributeValue songAttr = lastKey.get("songName");
                if (artistAttr != null && songAttr != null) {
                    String rawToken = artistAttr.s() + "|" + songAttr.s();
                    newNextToken = Base64.getEncoder().encodeToString(rawToken.getBytes());
                }
            }
        }
        } catch (Exception e) {
            log.error(e.getMessage(), e);
        }

        return new PaginatedResponse(items, newNextToken);
    }

    public void deleteSongByPartitionAndSortKey(String artistName, String songName) {
        final String finalArtistName = artistName.trim().toLowerCase();
        final String finalSongName = songName.trim().toLowerCase();
        musicTrackTable.deleteItem(k -> k.key(k1 -> k1.partitionValue(finalArtistName).sortValue(finalSongName)));
    }

    public MusicTrack updateSong(MusicTrack musicTrack) {
        if (musicTrack.getArtistName() != null) {
            musicTrack.setArtistNameLower(musicTrack.getArtistName().toLowerCase());
        }
        if (musicTrack.getSongName() != null) {
            musicTrack.setSongNameLower(musicTrack.getSongName().toLowerCase());
        }
        musicTrackTable.putItem(musicTrack);
        return musicTrack;
    }

    public boolean exists(String artistName, String songName) {
        return findByPartitionKeyAndSortKey(artistName, songName) != null;
    }
}
