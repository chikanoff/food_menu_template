from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from app.models import Category, Dish, Promotion, RestaurantSettings


class MenuCatalog:
    def get_restaurant(self, db: Session) -> RestaurantSettings | None:
        return db.query(RestaurantSettings).filter(RestaurantSettings.id == 1).first()

    def list_categories(self, db: Session, *, active_only: bool = True) -> list[Category]:
        q = db.query(Category)
        if active_only:
            q = q.filter(Category.is_active.is_(True))
        return q.order_by(Category.sort_order, Category.id).all()

    def get_category_by_slug(self, db: Session, slug: str, *, public: bool = True) -> Category | None:
        q = (
            db.query(Category)
            .options(joinedload(Category.dishes).joinedload(Dish.media))
            .filter(Category.slug == slug)
        )
        if public:
            q = q.filter(Category.is_active.is_(True))
        return q.first()

    def get_dish_by_slug(self, db: Session, slug: str, *, public: bool = True) -> Dish | None:
        q = db.query(Dish).options(joinedload(Dish.media)).filter(Dish.slug == slug)
        if public:
            q = q.filter(Dish.is_available.is_(True))
        return q.first()

    def list_featured_dishes(self, db: Session) -> list[Dish]:
        return (
            db.query(Dish)
            .options(joinedload(Dish.media))
            .filter(Dish.is_featured.is_(True), Dish.is_available.is_(True))
            .order_by(Dish.sort_order, Dish.id)
            .all()
        )

    def get_full_menu(self, db: Session) -> list[Category]:
        return (
            db.query(Category)
            .options(joinedload(Category.dishes).joinedload(Dish.media))
            .filter(Category.is_active.is_(True))
            .order_by(Category.sort_order, Category.id)
            .all()
        )

    def list_promotions(self, db: Session, *, public: bool = True) -> list[Promotion]:
        q = db.query(Promotion)
        if public:
            now = datetime.utcnow()
            q = q.filter(Promotion.is_active.is_(True))
            q = q.filter((Promotion.starts_at.is_(None)) | (Promotion.starts_at <= now))
            q = q.filter((Promotion.ends_at.is_(None)) | (Promotion.ends_at >= now))
        return q.order_by(Promotion.sort_order, Promotion.id).all()


menu_catalog = MenuCatalog()
