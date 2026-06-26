/* ─────────────────────────────────────────────
   CORE DOMAIN TYPES — Swiss Trails
───────────────────────────────────────────── */

export type Difficulty = "easy" | "moderate" | "challenging" | "expert";
export type Season = "spring" | "summer" | "autumn" | "winter" | "year-round";
export type LocationCategory =
  | "hidden-lake"
  | "viewpoint"
  | "waterfall"
  | "gorge"
  | "sunset-spot"
  | "night-sky"
  | "road-trip"
  | "photo-spot"
  | "forest"
  | "glacier"
  | "alpine-meadow"
  | "river";

export type Region =
  | "bern"
  | "zurich"
  | "graubunden"
  | "valais"
  | "lucerne"
  | "uri"
  | "ticino"
  | "st-gallen"
  | "appenzell"
  | "fribourg"
  | "vaud"
  | "obwalden"
  | "nidwalden"
  | "schwyz"
  | "glarus"
  | "jura"
  | "neuchatel"
  | "solothurn";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationImage {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  credit?: string;
  isHero?: boolean;
}

export interface Location {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription?: string;
  category: LocationCategory;
  difficulty: Difficulty;
  region: Region;
  coordinates: Coordinates;
  heroImage: LocationImage;
  gallery: LocationImage[];
  tags: string[];
  bestSeason: Season[];
  travelTimeMinutes: number;
  visitDurationHours: { min: number; max: number };
  highlights: string[];
  tips: string[];
  whatToBring: string[];
  accessInfo: string;
  parkingAvailable: boolean;
  publicTransport: boolean;
  elevation?: number;
  distanceKm?: number;
  isFeatured: boolean;
  isNew: boolean;
  viewCount: number;
  saveCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: LocationCategory;
  name: string;
  description: string;
  icon: string;
  count: number;
  gradient: string;
}

export interface Testimonial {
  id: string;
  name: string;
  age?: number;
  city: string;
  country: string;
  avatar?: string;
  content: string;
  rating: number;
  date: string;
  verified: boolean;
  locationVisited?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: "one-time" | "monthly" | "yearly";
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
  stripeProductId?: string;
  stripePriceId?: string;
}

/* ─────────────────────────────────────────────
   USER / AUTH TYPES
───────────────────────────────────────────── */

export type UserRole = "user" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  hasPurchased: boolean;
  purchasedAt: string | null;
  stripeCustomerId: string | null;
  favoriteCount: number;
  createdAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "refunded";
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  locationId: string;
  location?: Location;
  createdAt: string;
}

/* ─────────────────────────────────────────────
   SOCIAL TYPES — reactions / counts
───────────────────────────────────────────── */

/** The three social reactions a user can give a location. */
export type ReactionKind = "like" | "wantToGo" | "beenThere";

/** Aggregate social counts for a single location. */
export interface SocialCounts {
  like: number;
  wantToGo: number;
  beenThere: number;
}

/* ─────────────────────────────────────────────
   HIKE BUDDY TYPES (gated feature)
───────────────────────────────────────────── */

export type HikePace = "relaxed" | "steady" | "brisk";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type AvailabilitySlot = "weekday" | "weekend";

/**
 * A matchable hiker profile used by the Hike Buddy feature. The current user
 * edits their own profile; seed candidates are matched against it.
 */
export interface HikeBuddyProfile {
  id: string;
  displayName: string;
  /** Single uppercase initial used for the avatar fallback. */
  avatarInitial: string;
  /** Preferred trail difficulty. */
  preferredDifficulty: Difficulty;
  /** Cantons / regions the hiker likes to explore. */
  preferredRegions: Region[];
  /** Walking pace preference. */
  pace: HikePace;
  /** When the hiker is typically free to hike. */
  availability: AvailabilitySlot[];
  /** Overall hiking experience. */
  experience: ExperienceLevel;
  /** Spoken languages (ISO-ish short codes, e.g. "de", "fr", "en", "it"). */
  languages: string[];
  /** Optional short bio shown on the candidate card. */
  bio?: string;
}

/* ─────────────────────────────────────────────
   APP STATE TYPES
───────────────────────────────────────────── */

export interface MapState {
  selectedLocationId: string | null;
  hoveredLocationId: string | null;
  zoom: number;
  center: Coordinates;
  isBottomSheetOpen: boolean;
  bottomSheetSnap: "peek" | "half" | "full";
  activeFilters: LocationFilters;
  searchQuery: string;
}

export interface LocationFilters {
  categories: LocationCategory[];
  difficulties: Difficulty[];
  regions: Region[];
  seasons: Season[];
  featuredOnly: boolean;
  hasParking: boolean | null;
  hasPublicTransport: boolean | null;
}

export interface SearchResult {
  locations: Location[];
  total: number;
  hasMore: boolean;
}

/* ─────────────────────────────────────────────
   API TYPES
───────────────────────────────────────────── */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/* ─────────────────────────────────────────────
   SUPABASE DATABASE TYPES
───────────────────────────────────────────── */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          role: UserRole;
          has_purchased: boolean;
          purchased_at: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      locations: {
        Row: {
          id: string;
          slug: string;
          name: string;
          tagline: string;
          description: string;
          long_description: string | null;
          category: LocationCategory;
          difficulty: Difficulty;
          region: Region;
          lat: number;
          lng: number;
          hero_image_url: string;
          hero_image_alt: string;
          tags: string[];
          best_season: Season[];
          travel_time_minutes: number;
          visit_duration_min: number;
          visit_duration_max: number;
          highlights: string[];
          tips: string[];
          what_to_bring: string[];
          access_info: string;
          parking_available: boolean;
          public_transport: boolean;
          elevation: number | null;
          distance_km: number | null;
          is_featured: boolean;
          is_published: boolean;
          view_count: number;
          save_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["locations"]["Row"], "created_at" | "updated_at" | "view_count" | "save_count">;
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
      };
      location_images: {
        Row: {
          id: string;
          location_id: string;
          url: string;
          alt: string;
          width: number | null;
          height: number | null;
          credit: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["location_images"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["location_images"]["Insert"]>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          location_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["favorites"]["Row"], "created_at">;
        Update: never;
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          stripe_session_id: string;
          stripe_payment_intent_id: string | null;
          amount: number;
          currency: string;
          status: "pending" | "completed" | "refunded";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["purchases"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["purchases"]["Insert"]>;
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          age: number | null;
          city: string;
          country: string;
          avatar_url: string | null;
          content: string;
          rating: number;
          is_published: boolean;
          location_visited: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["testimonials"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
      };
    };
  };
}
