package com.musify.api.exception;


public class DuplicateSongException extends RuntimeException {
    public DuplicateSongException(String message) {
        super(message);
    }

}
