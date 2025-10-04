import SearchBar from "@/components/SearchBar";
import { Button } from "@mantine/core";
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "1200px", margin: "0 auto", flex: 1, justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <h1>Shop for your products from thousands of Shopify stores</h1>
      <SearchBar />
      <Button component={Link} href="/search">
        Search
      </Button>
    </div>
  );
}
