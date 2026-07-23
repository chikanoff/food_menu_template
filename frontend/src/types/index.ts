export interface Restaurant {
  id: number
  name: string
  slug: string
  description: string
  logo_url: string | null
  cover_url: string | null
  primary_color: string
  accent_color: string
  phone: string
  address: string
  working_hours: string
  map_url: string | null
  instagram_url: string | null
  telegram_url: string | null
  whatsapp_url: string | null
  is_published: boolean
}

export interface DishMedia {
  id: number
  dish_id: number
  type: "photo" | "video" | string
  url: string
  poster_url: string | null
  sort_order: number
  is_primary: boolean
}

export interface Dish {
  id: number
  category_id: number
  name: string
  slug: string
  description: string
  composition: string
  price: number | string
  currency: string
  weight_g: number | null
  calories: number | null
  is_available: boolean
  is_featured: boolean
  sort_order: number
  media: DishMedia[]
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  dishes?: Dish[]
}

export interface Promotion {
  id: number
  title: string
  description: string
  image_url: string | null
  video_url: string | null
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  sort_order: number
}

export interface DashboardStats {
  categories: number
  dishes: number
  promotions: number
  is_published: boolean
}
