export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {children}
    </div>
  );
}
