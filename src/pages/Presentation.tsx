import { SlideDeck } from "@/components/presentation/SlideDeck";
import { allSlides } from "@/components/presentation/slides";
import { useEffect } from "react";

export default function Presentation() {
  useEffect(() => {
    document.title = "MiCasa BOS — Tech Partner Presentation";
  }, []);
  return <SlideDeck slides={allSlides} />;
}
