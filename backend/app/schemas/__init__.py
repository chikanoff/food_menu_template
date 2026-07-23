from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class OrmModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- Restaurant ---
class RestaurantOut(OrmModel):
    id: int
    name: str
    slug: str
    description: str
    logo_url: str | None
    cover_url: str | None
    primary_color: str
    accent_color: str
    phone: str
    address: str
    working_hours: str
    map_url: str | None
    instagram_url: str | None
    telegram_url: str | None
    whatsapp_url: str | None
    is_published: bool


class RestaurantUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    logo_url: str | None = None
    cover_url: str | None = None
    primary_color: str | None = None
    accent_color: str | None = None
    phone: str | None = None
    address: str | None = None
    working_hours: str | None = None
    map_url: str | None = None
    instagram_url: str | None = None
    telegram_url: str | None = None
    whatsapp_url: str | None = None
    is_published: bool | None = None


# --- Media ---
class DishMediaOut(OrmModel):
    id: int
    dish_id: int
    type: str
    url: str
    poster_url: str | None
    sort_order: int
    is_primary: bool


class DishMediaCreate(BaseModel):
    type: str = Field(pattern="^(photo|video)$")
    url: str
    poster_url: str | None = None
    sort_order: int = 0
    is_primary: bool = False


class DishMediaUpdate(BaseModel):
    sort_order: int | None = None
    is_primary: bool | None = None
    poster_url: str | None = None


# --- Dish ---
class DishOut(OrmModel):
    id: int
    category_id: int
    name: str
    slug: str
    description: str
    composition: str
    price: Decimal
    currency: str
    weight_g: int | None
    calories: int | None
    is_available: bool
    is_featured: bool
    sort_order: int
    media: list[DishMediaOut] = []


class DishCreate(BaseModel):
    category_id: int
    name: str
    slug: str
    description: str = ""
    composition: str = ""
    price: Decimal = Decimal("0")
    currency: str = "₽"
    weight_g: int | None = None
    calories: int | None = None
    is_available: bool = True
    is_featured: bool = False
    sort_order: int = 0


class DishUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    composition: str | None = None
    price: Decimal | None = None
    currency: str | None = None
    weight_g: int | None = None
    calories: int | None = None
    is_available: bool | None = None
    is_featured: bool | None = None
    sort_order: int | None = None


# --- Category ---
class CategoryOut(OrmModel):
    id: int
    name: str
    slug: str
    description: str
    image_url: str | None
    sort_order: int
    is_active: bool


class CategoryWithDishes(CategoryOut):
    dishes: list[DishOut] = []


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    image_url: str | None = None
    sort_order: int = 0
    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    image_url: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


# --- Promotion ---
class PromotionOut(OrmModel):
    id: int
    title: str
    description: str
    image_url: str | None
    video_url: str | None
    starts_at: datetime | None
    ends_at: datetime | None
    is_active: bool
    sort_order: int


class PromotionCreate(BaseModel):
    title: str
    description: str = ""
    image_url: str | None = None
    video_url: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_active: bool = True
    sort_order: int = 0


class PromotionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    image_url: str | None = None
    video_url: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_active: bool | None = None
    sort_order: int | None = None


# --- Auth / misc ---
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminOut(OrmModel):
    id: int
    username: str


class ReorderItem(BaseModel):
    id: int
    sort_order: int


class ReorderRequest(BaseModel):
    items: list[ReorderItem]


class UploadOut(BaseModel):
    url: str
    content_type: str
    size: int


class DashboardStats(BaseModel):
    categories: int
    dishes: int
    promotions: int
    is_published: bool
