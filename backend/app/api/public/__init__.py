from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import (
    CategoryOut,
    CategoryWithDishes,
    DishOut,
    PromotionOut,
    RestaurantOut,
)
from app.services.catalog import menu_catalog

router = APIRouter(prefix="/api/v1", tags=["public"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/restaurant", response_model=RestaurantOut)
def get_restaurant(db: Annotated[Session, Depends(get_db)]) -> RestaurantOut:
    restaurant = menu_catalog.get_restaurant(db)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not configured")
    return restaurant


@router.get("/menu", response_model=list[CategoryWithDishes])
def get_menu(db: Annotated[Session, Depends(get_db)]) -> list[CategoryWithDishes]:
    categories = menu_catalog.get_full_menu(db)
    return [
        CategoryWithDishes(
            id=c.id,
            name=c.name,
            slug=c.slug,
            description=c.description,
            image_url=c.image_url,
            sort_order=c.sort_order,
            is_active=c.is_active,
            dishes=sorted(
                [d for d in c.dishes if d.is_available],
                key=lambda d: (d.sort_order, d.id),
            ),
        )
        for c in categories
    ]


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Annotated[Session, Depends(get_db)]) -> list[CategoryOut]:
    return menu_catalog.list_categories(db, active_only=True)


@router.get("/categories/{slug}", response_model=CategoryWithDishes)
def get_category(slug: str, db: Annotated[Session, Depends(get_db)]) -> CategoryWithDishes:
    category = menu_catalog.get_category_by_slug(db, slug, public=True)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    dishes = [d for d in category.dishes if d.is_available]
    dishes.sort(key=lambda d: (d.sort_order, d.id))
    return CategoryWithDishes(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        image_url=category.image_url,
        sort_order=category.sort_order,
        is_active=category.is_active,
        dishes=dishes,
    )


@router.get("/dishes", response_model=list[DishOut])
def list_dishes(
    db: Annotated[Session, Depends(get_db)],
    featured: Annotated[bool | None, Query()] = None,
) -> list[DishOut]:
    if featured:
        return menu_catalog.list_featured_dishes(db)
    raise HTTPException(status_code=400, detail="Use featured=true or /dishes/{slug}")


@router.get("/dishes/{slug}", response_model=DishOut)
def get_dish(slug: str, db: Annotated[Session, Depends(get_db)]) -> DishOut:
    dish = menu_catalog.get_dish_by_slug(db, slug, public=True)
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")
    return dish


@router.get("/promotions", response_model=list[PromotionOut])
def list_promotions(db: Annotated[Session, Depends(get_db)]) -> list[PromotionOut]:
    return menu_catalog.list_promotions(db, public=True)
