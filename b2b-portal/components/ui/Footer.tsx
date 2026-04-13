export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <p>&copy; {year} B2B Portal. Alle rechten voorbehouden.</p>
      </div>
    </footer>
  );
}
