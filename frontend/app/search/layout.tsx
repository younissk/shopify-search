import { PageContainer } from "@/components/layout/PageContainer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PageContainer>{children}</PageContainer>;
}
