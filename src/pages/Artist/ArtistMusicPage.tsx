import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SongRepository } from "../../repositories/SongRepository";
import { ArtistRepository } from "../../repositories/ArtistRepository";
import type { Song } from "../../models/Song";
import type { Artist } from "../../models/Artist";
import "./ArtistMusicPage.css";
import { analytics } from "../../firebaseinit";
import { logEvent } from "firebase/analytics";

const ArtistMusicPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) return;

    const fetchArtistAndSongs = async () => {
      setLoading(true);
      try {
        const artistRepo = new ArtistRepository();
        const songRepo = new SongRepository();

        const [artistDetails, artistSongs] = await Promise.all([
          artistRepo.getById(artistId),
          songRepo.getByArtistId(artistId),
        ]);

        setArtist(artistDetails);
        setSongs(artistSongs);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistAndSongs();
  }, [artistId]);

  const handlePlaySong = (song: Song) => {
    logEvent(analytics, "play_audio", {
      song_id: song.id,
      song_name: song.name,
      artist_id: song.artistId,
      artist_name: song.artistName,
    });
  };

  if (loading) return <p>Loading artist...</p>;
  if (error) return <p>Error loading artist details: {error}</p>;
  if (!artist) return <p>Artist not found.</p>;

  return (
    <div className="artist-music-container">
      <img
        src={artist.imageUrl}
        alt={artist.name}
        className="artist-header-image"
      />
      <h1>{artist.name}</h1>
      <br />
      <p>All songs from this artist</p>

      <div className="song-list">
        {songs.length > 0 ? (
          songs.map((song) => (
            <div key={song.id} className="song-card">
              <img src={song.imageUrl} alt={song.name} className="song-image" />
              <div className="song-details">
                <h3 className="song-title">{song.name}</h3>
                <audio
                  controls
                  src={song.audioUrl}
                  className="song-player"
                  onPlay={() => handlePlaySong(song)}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          ))
        ) : (
          <p>This artist hasn't uploaded any songs yet.</p>
        )}
      </div>
    </div>
  );
};

export default ArtistMusicPage;
