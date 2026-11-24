import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ExperienceGate } from "@/components/3d/ExperienceGate";
import { Nav } from "@/components/ui/Nav";
import { Loader } from "@/components/ui/Loader";
import { Cursor } from "@/components/ui/Cursor";
import { ProgressRail } from "@/components/ui/ProgressRail";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Solutions } from "@/components/sections/Solutions";
import { Applications } from "@/components/sections/Applications";
import { WhyAutomatica } from "@/components/sections/WhyAutomatica";
import { Process } from "@/components/sections/Process";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <div id="app-root" className="relative">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SmoothScroll>
        <ExperienceGate />
        <Loader />
        <Nav />
        <ProgressRail />
        <main id="main" className="relative z-10">
          <Hero />
          <Intro />
          <Solutions />
          <Applications />
          <WhyAutomatica />
          <Process />
          <FinalCTA />
          <Contact />
        </main>
        <Footer />
        <Cursor />
      </SmoothScroll>
    </div>
  );
}
