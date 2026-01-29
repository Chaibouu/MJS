import React from 'react';
import { Calendar, ChevronRight, ArrowRight, Newspaper} from "lucide-react";
import appConfig from "@/settings";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Actualite {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
  link: string;
}

const actualites: Actualite[] = [
  {
    id: 1,
    title: "Lancement du Programme National de Formation",
    date: "octobre 24, 2024",
    description: "Un nouveau programme de formation professionnelle pour 10 000 jeunes nigériens",
    image: appConfig.logoUrl,
    link: "#"
  },
  {
    id: 2,
    title: "Championnat National de Football",
    date: "octobre 20, 2024",
    description: "Finale du championnat national de football des jeunes",
    image: appConfig.logoUrl,
    link: "#"
  },
  {
    id: 3,
    title: "Concours d'Innovation Jeunesse",
    date: "octobre 25, 2024",
    description: "Appel à candidatures pour le concours d'innovation 2024",
    image: appConfig.logoUrl,
    link: "#"
  },
  {
    id: 4,
    title: "Concours d'Innovation Jeunesse",
    date: "octobre 25, 2024",
    description: "Appel à candidatures pour le concours d'innovation 2024",
    image: appConfig.logoUrl,
    link: "#"
  },
  {
    id: 5,
    title: "Concours d'Innovation Jeunesse",
    date: "octobre 25, 2024",
    description: "Appel à candidatures pour le concours d'innovation 2024",
    image: appConfig.logoUrl,
    link: "#"
  },
  {
    id: 6,
    title: "Concours d'Innovation Jeunesse",
    date: "octobre 25, 2024",
    description: "Appel à candidatures pour le concours d'innovation 2024",
    image: appConfig.logoUrl,
    link: "#"
  },
  {
    id: 7,
    title: "Concours d'Innovation Jeunesse",
    date: "octobre 25, 2024",
    description: "Appel à candidatures pour le concours d'innovation 2024",
    image: appConfig.logoUrl,
    link: "#"
  },
  {
    id: 8,
    title: "Concours d'Innovation Jeunesse",
    date: "octobre 25, 2024",
    description: "Appel à candidatures pour le concours d'innovation 2024",
    image: appConfig.logoUrl,
    link: "#"
  },
];

export default function Actualites() {
  const displayedActualites = actualites.slice(0, 6);
  const hasMore = actualites.length > 6;

  return (
    <div>
      <section id="actualites" className="py-20 bg-gradient-to-br from-gray-50 via-white to-primaryLightTransparentColor">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primaryColor/10 border-2 border-primaryColor/30 rounded-full mb-6">
              <Newspaper className="h-8 w-8 text-primaryColor" />
            </div>
            <h2 className={cn("text-3xl md:text-4xl font-bold mb-4 text-gray-900")}>
              Actualités & Événements
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Restez informé des dernières nouvelles du ministère
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedActualites.map((actualite) => {
              const primaryColorWithOpacity = appConfig.pprimaryColor + '40'; // 40 = 25% opacity in hex
              
              return (
              <article 
                key={actualite.id} 
                className="group transition-all duration-300 bg-white border-2 border-primaryLightTransparentColor rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:border-primaryColor"
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 10px 25px -5px ${primaryColorWithOpacity}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <a href={actualite.link} className="block">
                  <div className="w-full h-48 overflow-hidden">
                    <Image
                      src={actualite.image}
                      width={300}
                      height={200}
                      alt={actualite.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </a>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primaryColor transition-colors line-clamp-2">
                    <a href={actualite.link} className="hover:underline">
                      {actualite.title}
                    </a>
                  </h3>
                  <div className="text-sm text-gray-500 mb-3 flex items-center">
                    <div className="w-8 h-8 bg-primaryLightTransparentColor rounded-lg flex items-center justify-center mr-2">
                      <Calendar className="h-4 w-4 text-primaryColor" />
                    </div>
                    <time>{actualite.date}</time>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {actualite.description}
                  </p>
                  <a 
                    href={actualite.link} 
                    className="bg-secondaryColor text-white font-medium hover:bg-secondaryDarkColor inline-flex items-center px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Lire la suite »
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </article>
              );
            })}
          </div>

          {hasMore && (
            <div className="text-center mt-16 pt-8">
              <Link href="/actualites">
                <Button 
                  className="bg-primaryColor text-white hover:bg-primaryDarkColor px-8 py-6 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: appConfig.pprimaryColor }}
                >
                  Voir plus d'actualités
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}