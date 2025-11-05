const genres = [
  "Afrobeat",
  "Hip-Hop",
  "R&B",
  "Pop",
  "Soul",
  "Amapiano",
  "Dancehall",
  "Reggae",
  "Gospel",
  "Alternative",
];

const GenreMarquee = () => {
  return (
    <section className="py-8 bg-primary overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap">
        {[...genres, ...genres, ...genres].map((genre, index) => (
          <span
            key={index}
            className="inline-block text-primary-foreground text-2xl md:text-4xl font-bold mx-8"
          >
            {genre} •
          </span>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default GenreMarquee;
