import type { Testimonial } from "@/types";

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-001",
    name: "Lena M.",
    age: 24,
    city: "Zürich",
    country: "Switzerland",
    content:
      "I've lived in Switzerland my whole life, but Swiss Trails showed me corners of the country I'd never discovered. Found my new favourite place on the very first weekend. Already planning the next three trips.",
    rating: 5,
    date: "2024-07-12",
    verified: true,
    locationVisited: "Hidden Alpine Lake",
  },
  {
    id: "t-002",
    name: "Noah K.",
    age: 28,
    city: "Bern",
    country: "Switzerland",
    content:
      "Honestly the best CHF 29 I've ever spent. Three trips in, all of them completely unforgettable. My friends keep asking how I always find these spots — and I keep the secret to myself.",
    rating: 5,
    date: "2024-08-03",
    verified: true,
    locationVisited: "Secret Panorama Ridge",
  },
  {
    id: "t-003",
    name: "Julia & Marco",
    age: 26,
    city: "Basel",
    country: "Switzerland",
    content:
      "We do a road trip every summer. This year we used Swiss Trails and it was on another level. Every stop was worth it. The hidden lakes section alone is worth double the price.",
    rating: 5,
    date: "2024-08-18",
    verified: true,
    locationVisited: "The Golden Valley Drive",
  },
  {
    id: "t-004",
    name: "Tim S.",
    age: 22,
    city: "Geneva",
    country: "Switzerland",
    content:
      "As a photographer, the viewpoints section is pure gold. Every spot was worth the hike and the shots were unlike anything I'd seen on social media. Real hidden gems.",
    rating: 5,
    date: "2024-07-28",
    verified: true,
    locationVisited: "The Reflection Point",
  },
  {
    id: "t-005",
    name: "Anna R.",
    age: 20,
    city: "St. Gallen",
    country: "Switzerland",
    content:
      "I was sceptical about paying for a map. Then I found a lake so beautiful I literally cried. Now I'm going back next month. If you're on the fence — just do it.",
    rating: 5,
    date: "2024-09-01",
    verified: true,
  },
  {
    id: "t-006",
    name: "Lukas W.",
    age: 30,
    city: "Lucerne",
    country: "Switzerland",
    content:
      "Summer 2024 was the best summer of my life because of this. We planned 8 weekends using Swiss Trails and every single one was incredible. Worth every franc.",
    rating: 5,
    date: "2024-09-15",
    verified: true,
    locationVisited: "Midnight Observatory Peak",
  },
];

export const SOCIAL_PROOF_STATS = [
  { label: "Explorers", value: "3,200+" },
  { label: "Locations", value: "50+" },
  { label: "Rating", value: "★ 4.9" },
  { label: "New locations", value: "Monthly" },
];
