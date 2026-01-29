"use client"

import Main from "@/components/main";
import Contact from "@/components/main/contact";
import Actualites from "@/components/main/actualites";
import Hero from "@/components/main/hero";

export default function Home() {
  return (
    <>
      <Hero />
      <Main />
      <Actualites />
      <Contact />
    </>
  )
}
