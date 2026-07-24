from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models import Admin, Category, Dish, DishMedia, Promotion, RestaurantSettings
from app.schemas import (
    AdminOut,
    CategoryCreate,
    CategoryOut,
    CategoryUpdate,
    DashboardStats,
    DishCreate,
    DishMediaCreate,
    DishMediaOut,
    DishMediaUpdate,
    DishOut,
    DishUpdate,
    LoginRequest,
    PromotionCreate,
    PromotionOut,
    PromotionUpdate,
    ReorderRequest,
    RestaurantOut,
    RestaurantUpdate,
    TokenOut,
    UploadOut,
)
from app.services.auth import authenticate_admin, create_access_token, get_current_admin
from app.services.catalog import menu_catalog
from app.services.media import media_storage

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


# --- Auth ---
@router.post("/auth/login", response_model=TokenOut)
def login(body: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> TokenOut:
    admin = authenticate_admin(db, body.username, body.password)
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenOut(access_token=create_access_token(admin.username))


@router.get("/auth/me", response_model=AdminOut)
def me(admin: Annotated[Admin, Depends(get_current_admin)]) -> Admin:
    return admin


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> DashboardStats:
    restaurant = menu_catalog.get_restaurant(db)
    return DashboardStats(
        categories=db.query(Category).count(),
        dishes=db.query(Dish).count(),
        promotions=db.query(Promotion).count(),
        is_published=bool(restaurant and restaurant.is_published),
    )


# --- Settings ---
@router.get("/settings", response_model=RestaurantOut)
def get_settings_admin(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> RestaurantSettings:
    restaurant = menu_catalog.get_restaurant(db)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Not found")
    return restaurant


@router.put("/settings", response_model=RestaurantOut)
def update_settings(
    body: RestaurantUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> RestaurantSettings:
    restaurant = menu_catalog.get_restaurant(db)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(restaurant, key, value)
    db.commit()
    db.refresh(restaurant)
    return restaurant


# --- Categories ---
@router.get("/categories", response_model=list[CategoryOut])
def admin_list_categories(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> list[Category]:
    return menu_catalog.list_categories(db, active_only=False)


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(
    body: CategoryCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> Category:
    if db.query(Category).filter(Category.slug == body.slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    category = Category(**body.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/categories/{category_id}", response_model=CategoryOut)
def get_category_admin(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> Category:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Not found")
    return category


@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    body: CategoryUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> Category:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Not found")
    data = body.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] != category.slug:
        if db.query(Category).filter(Category.slug == data["slug"]).first():
            raise HTTPException(status_code=400, detail="Slug already exists")
    for key, value in data.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> None:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Not found")
    for dish in category.dishes:
        for media in dish.media:
            media_storage.delete(media.url)
            media_storage.delete(media.poster_url)
            media_storage.delete(media.preview_url)
    db.delete(category)
    db.commit()


@router.post("/categories/reorder", response_model=list[CategoryOut])
def reorder_categories(
    body: ReorderRequest,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> list[Category]:
    for item in body.items:
        category = db.get(Category, item.id)
        if category:
            category.sort_order = item.sort_order
    db.commit()
    return menu_catalog.list_categories(db, active_only=False)


# --- Dishes ---
@router.get("/dishes", response_model=list[DishOut])
def admin_list_dishes(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
    category_id: int | None = None,
) -> list[Dish]:
    q = db.query(Dish).options(joinedload(Dish.media))
    if category_id is not None:
        q = q.filter(Dish.category_id == category_id)
    return q.order_by(Dish.sort_order, Dish.id).all()


@router.post("/dishes", response_model=DishOut, status_code=201)
def create_dish(
    body: DishCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> Dish:
    if not db.get(Category, body.category_id):
        raise HTTPException(status_code=400, detail="Category not found")
    if db.query(Dish).filter(Dish.slug == body.slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    dish = Dish(**body.model_dump())
    db.add(dish)
    db.commit()
    db.refresh(dish)
    return db.query(Dish).options(joinedload(Dish.media)).filter(Dish.id == dish.id).one()


@router.get("/dishes/{dish_id}", response_model=DishOut)
def get_dish_admin(
    dish_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> Dish:
    dish = db.query(Dish).options(joinedload(Dish.media)).filter(Dish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Not found")
    return dish


@router.put("/dishes/{dish_id}", response_model=DishOut)
def update_dish(
    dish_id: int,
    body: DishUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> Dish:
    dish = db.query(Dish).options(joinedload(Dish.media)).filter(Dish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Not found")
    data = body.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] != dish.slug:
        if db.query(Dish).filter(Dish.slug == data["slug"]).first():
            raise HTTPException(status_code=400, detail="Slug already exists")
    if "category_id" in data and not db.get(Category, data["category_id"]):
        raise HTTPException(status_code=400, detail="Category not found")
    for key, value in data.items():
        setattr(dish, key, value)
    db.commit()
    db.refresh(dish)
    return dish


@router.delete("/dishes/{dish_id}", status_code=204)
def delete_dish(
    dish_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> None:
    dish = db.query(Dish).options(joinedload(Dish.media)).filter(Dish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Not found")
    for media in dish.media:
        media_storage.delete(media.url)
        media_storage.delete(media.poster_url)
        media_storage.delete(media.preview_url)
    db.delete(dish)
    db.commit()


@router.post("/dishes/reorder", response_model=list[DishOut])
def reorder_dishes(
    body: ReorderRequest,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> list[Dish]:
    for item in body.items:
        dish = db.get(Dish, item.id)
        if dish:
            dish.sort_order = item.sort_order
    db.commit()
    return db.query(Dish).options(joinedload(Dish.media)).order_by(Dish.sort_order, Dish.id).all()


# --- Media ---
@router.post("/dishes/{dish_id}/media", response_model=DishMediaOut, status_code=201)
def add_dish_media(
    dish_id: int,
    body: DishMediaCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> DishMedia:
    dish = db.get(Dish, dish_id)
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")
    if body.is_primary:
        for m in dish.media:
            m.is_primary = False
    media = DishMedia(dish_id=dish_id, **body.model_dump())
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


@router.patch("/media/{media_id}", response_model=DishMediaOut)
def update_media(
    media_id: int,
    body: DishMediaUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> DishMedia:
    media = db.get(DishMedia, media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Not found")
    data = body.model_dump(exclude_unset=True)
    if data.get("is_primary"):
        siblings = db.query(DishMedia).filter(DishMedia.dish_id == media.dish_id).all()
        for s in siblings:
            s.is_primary = False
    for key, value in data.items():
        setattr(media, key, value)
    db.commit()
    db.refresh(media)
    return media


@router.delete("/media/{media_id}", status_code=204)
def delete_media(
    media_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> None:
    media = db.get(DishMedia, media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Not found")
    media_storage.delete(media.url)
    media_storage.delete(media.poster_url)
    media_storage.delete(media.preview_url)
    db.delete(media)
    db.commit()


# --- Promotions ---
@router.get("/promotions", response_model=list[PromotionOut])
def admin_list_promotions(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> list[Promotion]:
    return menu_catalog.list_promotions(db, public=False)


@router.post("/promotions", response_model=PromotionOut, status_code=201)
def create_promotion(
    body: PromotionCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> Promotion:
    promo = Promotion(**body.model_dump())
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo


@router.put("/promotions/{promo_id}", response_model=PromotionOut)
def update_promotion(
    promo_id: int,
    body: PromotionUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> Promotion:
    promo = db.get(Promotion, promo_id)
    if not promo:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(promo, key, value)
    db.commit()
    db.refresh(promo)
    return promo


@router.delete("/promotions/{promo_id}", status_code=204)
def delete_promotion(
    promo_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[Admin, Depends(get_current_admin)],
) -> None:
    promo = db.get(Promotion, promo_id)
    if not promo:
        raise HTTPException(status_code=404, detail="Not found")
    media_storage.delete(promo.image_url)
    media_storage.delete(promo.video_url)
    db.delete(promo)
    db.commit()


# --- Upload ---
@router.post("/upload", response_model=UploadOut)
async def upload_file(
    _: Annotated[Admin, Depends(get_current_admin)],
    file: UploadFile = File(...),
) -> UploadOut:
    result = await media_storage.save(file)
    return UploadOut(
        url=result.url,
        content_type=result.content_type,
        size=result.size,
        poster_url=result.poster_url,
        preview_url=result.preview_url,
    )
