import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  title: string;
  price: number;
  domain: string;
  image?: string;
  id: string;
}

export default function ProductCard({
  title,
  price,
  domain,
  image,
  id,
}: ProductCardProps) {
  return (
    <div>
      <Link href={`/domain/${domain}/product/${id}`}>
        <Image
          src={image ? image : "https://placehold.co/600x400"}
          height={160}
          width={300}
          alt="Product"
          style={{
            width: "100%",
            height: "160px",
            objectFit: "cover",
            borderRadius: "0 20px 0 20px",
          }}
          unoptimized
        />
      </Link>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        }}
      >
        <h3 style={{ fontWeight: 500, margin: 0, fontSize: "1rem" }}>
          {title}
        </h3>
        <span
          style={{
            fontWeight: 600,
            fontSize: "1rem",
            color: "#212529",
            marginLeft: "1rem",
            whiteSpace: "nowrap",
          }}
        >
          {price}
        </span>
      </div>

      <p
        style={{
          fontSize: "0.875rem",
          color: "#6c757d",
          margin: 0,
          lineHeight: "1.4",
        }}
      >
        <Link href={`/domain/${domain}`}>{domain}</Link>
      </p>
    </div>
  );
}
