import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { getUploadUrl, uploadToS3, saveMetadata } from '../services/api';

interface UploadModalProps {
    onClose: () => void;
    onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [artistName, setArtistName] = useState('');
    const [songName, setSongName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const getDuration = (file: File): Promise<number> => {
        return new Promise((resolve, reject) => {
            const audio = new Audio(URL.createObjectURL(file));
            audio.onloadedmetadata = () => {
                resolve(Math.round(audio.duration));
            };
            audio.onerror = () => {
                reject(new Error('Failed to load audio file'));
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!file || !artistName || !songName) {
            setError('Please fill in all fields and select a file.');
            return;
        }

        setUploading(true);
        setMessage('Starting upload...');

        try {
            // 1. Get Duration first to fail fast if audio is invalid
            let duration = 0;
            try {
                duration = await getDuration(file);
            } catch (err) {
                console.warn("Could not determine duration, default to 0", err);
            }

            // 2. Get Upload URL
            setMessage('Getting upload URL from server...');
            const { s3Key, uploadUrl } = await getUploadUrl(artistName, songName);

            // 3. Upload to S3
            setMessage('Uploading file to S3...');
            await uploadToS3(uploadUrl, file);

            // 4. Save Metadata
            setMessage('Saving song metadata...');
            await saveMetadata({
                artistName,
                songName,
                s3Key,
                duration,
            });

            setMessage('Upload successful!');
            setUploading(false);
            onUploadSuccess();
            setTimeout(onClose, 1500);

        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'Upload failed. Please try again.');
            setUploading(false);
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="bg-white rounded p-4 shadow w-100" style={{ maxWidth: '500px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0 text-dark">Upload Track</h4>
                    <button onClick={onClose} className="btn-close" disabled={uploading}></button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {message && <div className="alert alert-info">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-dark">Artist Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={artistName}
                            onChange={(e) => setArtistName(e.target.value)}
                            disabled={uploading}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-dark">Song Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={songName}
                            onChange={(e) => setSongName(e.target.value)}
                            disabled={uploading}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-dark">Audio File</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="audio/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={uploading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={uploading}>
                            {uploading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} /> Upload
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
