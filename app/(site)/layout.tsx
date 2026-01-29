import { ReactNode } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main>
        <Navigation />     
            {children}
        <Footer />
    </main>
  );
}
