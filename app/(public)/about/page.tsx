import Hero from "./components/Hero";
import Philosophy from "./components/Philosophy";
import Problem from "./components/Problem";
import WhatWeDo from "./components/WhatWeDo";
import Audience from "./components/Audience";
import BrandIdentity from "./components/BrandIdentity";
import FinalCTA from "./components/FinalCTA";

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <Hero />
      <Philosophy />
      <Problem />
      <WhatWeDo />
      <Audience />
      <BrandIdentity />
      <FinalCTA />
    </div>
  );
}
