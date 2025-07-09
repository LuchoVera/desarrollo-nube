import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Genre } from "../../models/Genre";
import { GenreRepository } from "../../repositories/GenreRepository";
import "./home.css";

const Home: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      try {
        const genreRepo = new GenreRepository();
        const allGenres = await genreRepo.getAll();
        setGenres(allGenres);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (loading) return <p>Loading genres...</p>;
  if (error) return <p>Error loading genres: {error}</p>;

  return (
    <div className="home-container">
      <h1>Explore Genres</h1>
      <div className="genre-grid">
        {genres.length > 0 ? (
          genres.map((genre) => (
            <Link
              to={`/genre/${genre.id}`}
              key={genre.id}
              className="item-card"
            >
              <img src={genre.imageUrl} alt={genre.name} />
              <h3>{genre.name}</h3>
            </Link>
          ))
        ) : (
          <p>
            No genres have been added yet. An administrator needs to add them.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
