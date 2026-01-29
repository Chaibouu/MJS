// export { default } from "./(site)/page";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import Home from "./(site)/page";

export default function RootHome() {
  return (
    <main>
      <Navigation />
      <Home />
      <Footer />
    </main>
  );
}
