"use client"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import appConfig from "@/settings";
import Image from "next/image";
import { Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export default function Hero() {
  // Données d'exemple pour les actualités
  const actualites = [
    {
      id: 1,
      title: "Le ministre représente le Niger à la 69ème conférence générale de l'Agence Internationale de l'Energie Atomique",
      date: "19 septembre 2025",
      image: appConfig.logoUrl,
      link: "#"
    },
    {
      id: 2,
      title: "Reunion extraordinaire du Comité National de Pilotage du Programme Intégré de Développement et d'Adaptation au Changement Climatique dans le Bassin du Niger",
      date: "24 octobre 2025",
      image: appConfig.logoUrl,
      link: "#"
    },
    {
      id: 3,
      title: "Lancement officiel de la Campagne Nationale 2025-2026 de Lutte contre les Feux de Brousse",
      date: "16 octobre 2025",
      image: appConfig.logoUrl,
      link: "#"
    }
  ];

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Suivre l'index actuel du carousel
  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play du carrousel
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 10000);

    return () => clearInterval(interval);
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <div>
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-primaryLightTransparentColor py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête de section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h2 className={cn("text-3xl font-bold")} style={{ color: appConfig.secondaryColor }}>
                Dernières actualités
              </h2>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: appConfig.secondaryColor }}></div>
            </div>
            
            {/* Navigation du carrousel */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => api?.scrollPrev()}
                className="p-2 hover:bg-primaryLightTransparentColor rounded-full transition-colors border-2 border-primaryLightTransparentColor hover:border-primaryColor"
                aria-label="Slide précédent"
              >
                <ChevronLeft className="h-5 w-5 text-primaryColor" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                className="p-2 hover:bg-primaryLightTransparentColor rounded-full transition-colors border-2 border-primaryLightTransparentColor hover:border-primaryColor"
                aria-label="Slide suivant"
              >
                <ChevronRight className="h-5 w-5 text-primaryColor" />
              </button>
            </div>
          </div>

          {/* Carrousel */}
          <Carousel 
            setApi={setApi} 
            className="w-full"
            opts={{
              align: "start",
              loop: true,
              duration: 35,
            }}
          >
            <div className="relative overflow-hidden ">
              <CarouselContent className="-ml-0">
                {actualites.map((actualite, index) => (
                  <CarouselItem key={actualite.id} className="pl-0 basis-full">
                    <div className="flex items-center gap-8 p-6 lg:p-10">
                      <div className="flex-1 space-y-6">
                        <div className="space-y-4">
                          <h1 className={cn("text-2xl lg:text-3xl font-bold leading-tight")} style={{ color: appConfig.pprimaryColor }}>
                            {actualite.title}
                          </h1>
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="w-8 h-8 bg-primaryLightTransparentColor rounded-lg flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-primaryColor" />
                            </div>
                            <span className="text-sm font-medium">
                              Publié le <time>{actualite.date}</time>
                            </span>
                          </div>
                        </div>
                        <Button 
                          className="text-white shadow-md hover:shadow-lg transition-all duration-200"
                          style={{ backgroundColor: appConfig.secondaryColor }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = appConfig.secondaryDarkColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = appConfig.secondaryColor;
                          }}
                          onClick={() => window.location.href = actualite.link}
                        >
                          Lire la publication
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      <div className="hidden lg:block flex-shrink-0">
                        <div className="relative w-80 h-80 rounded-xl overflow-hidden border-2 border-primaryLightTransparentColor shadow-lg">
                          <Image
                            src={actualite.image}
                            alt={actualite.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </div>

            {/* Indicateurs de slide */}
            <div className="flex justify-center gap-2 pb-6 pt-4">
              {actualites.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === current 
                      ? 'w-8' 
                      : 'w-2 bg-gray-300 hover:bg-secondaryLightTransparentColor'
                  }`}
                  style={{ 
                    backgroundColor: index === current ? appConfig.secondaryColor : undefined 
                  }}
                  aria-label={`Aller au slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </section>
    </div>
  )
}
