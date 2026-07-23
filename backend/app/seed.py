from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import Base, engine
from app.models import Admin, Category, Dish, DishMedia, Promotion, RestaurantSettings
from app.services.auth import hash_password
from app.services.media import media_storage


def init_db() -> None:
    media_storage.root.mkdir(parents=True, exist_ok=True)
    from pathlib import Path

    db_path = get_settings().database_url.replace("sqlite:///", "")
    if db_path.startswith("./"):
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    Base.metadata.create_all(bind=engine)


def seed_if_empty(db: Session) -> None:
    settings = get_settings()

    if not db.query(Admin).first():
        db.add(
            Admin(
                username=settings.admin_username,
                password_hash=hash_password(settings.admin_password),
            )
        )

    restaurant = db.query(RestaurantSettings).filter(RestaurantSettings.id == 1).first()
    if not restaurant:
        restaurant = RestaurantSettings(
            id=1,
            name="Bistro Lumière",
            slug="bistro-lumiere",
            description="Современная кухня с акцентом на сезонность. Смотрите блюда в видео-меню.",
            primary_color="#1c1917",
            accent_color="#c4a574",
            phone="+7 (495) 123-45-67",
            address="Москва, ул. Примерная, 12",
            working_hours="Пн–Вс 12:00–23:00",
            map_url="https://maps.google.com",
            instagram_url="https://instagram.com",
            telegram_url="https://t.me",
            whatsapp_url="https://wa.me/74951234567",
            is_published=True,
        )
        db.add(restaurant)

    if not db.query(Category).first():
        starters = Category(
            name="Закуски",
            slug="starters",
            description="Лёгкое начало вечера",
            sort_order=1,
        )
        mains = Category(
            name="Основные блюда",
            slug="mains",
            description="Сытные позиции кухни",
            sort_order=2,
        )
        desserts = Category(
            name="Десерты",
            slug="desserts",
            description="Сладкий финал",
            sort_order=3,
        )
        db.add_all([starters, mains, desserts])
        db.flush()

        dishes = [
            Dish(
                category_id=starters.id,
                name="Тартар из говядины",
                slug="beef-tartare",
                description="Классический тартар с каперсами, желтком и хрустящим тостом.",
                composition="Говядина, каперсы, лук, желток, тост",
                price=890,
                weight_g=180,
                calories=320,
                is_featured=True,
                sort_order=1,
            ),
            Dish(
                category_id=starters.id,
                name="Буррата с томатами",
                slug="burrata",
                description="Кремовая буррата, черри и базиликовое масло.",
                composition="Буррата, томаты, базилик, оливковое масло",
                price=780,
                weight_g=220,
                is_featured=True,
                sort_order=2,
            ),
            Dish(
                category_id=mains.id,
                name="Стейк рибай",
                slug="ribeye",
                description="Рибай на гриле с маслом трав и молодым картофелем.",
                composition="Говядина, масло трав, картофель",
                price=2450,
                weight_g=350,
                calories=680,
                is_featured=True,
                sort_order=1,
            ),
            Dish(
                category_id=mains.id,
                name="Паста с морепродуктами",
                slug="seafood-pasta",
                description="Лингвини в соусе из белого вина с креветками и мидиями.",
                composition="Лингвини, креветки, мидии, чеснок, вино",
                price=1290,
                weight_g=320,
                sort_order=2,
            ),
            Dish(
                category_id=desserts.id,
                name="Шоколадный фондан",
                slug="fondant",
                description="Тёплый фондан с жидкой сердцевиной и ванильным мороженым.",
                composition="Шоколад, яйцо, масло, мороженое",
                price=590,
                weight_g=160,
                calories=450,
                is_featured=True,
                sort_order=1,
            ),
        ]
        db.add_all(dishes)
        db.flush()

        # Placeholder media URLs (unsplash) — work without local uploads
        media_items = [
            DishMedia(
                dish_id=dishes[0].id,
                type="photo",
                url="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
                is_primary=True,
                sort_order=0,
            ),
            DishMedia(
                dish_id=dishes[1].id,
                type="photo",
                url="https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80",
                is_primary=True,
                sort_order=0,
            ),
            DishMedia(
                dish_id=dishes[2].id,
                type="photo",
                url="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
                is_primary=True,
                sort_order=0,
            ),
            DishMedia(
                dish_id=dishes[3].id,
                type="photo",
                url="https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80",
                is_primary=True,
                sort_order=0,
            ),
            DishMedia(
                dish_id=dishes[4].id,
                type="photo",
                url="https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
                is_primary=True,
                sort_order=0,
            ),
        ]
        db.add_all(media_items)

        db.add(
            Promotion(
                title="Счастливые часы",
                description="Скидка 20% на закуски с 16:00 до 18:00 в будни.",
                image_url="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=80",
                is_active=True,
                sort_order=1,
            )
        )

    db.commit()


def main() -> None:
    """Idempotent bootstrap for first deploy / demo."""
    init_db()
    from app.db import SessionLocal

    db = SessionLocal()
    try:
        seed_if_empty(db)
        print("Seed complete: demo restaurant/menu ready (skipped if already filled).")
    finally:
        db.close()


if __name__ == "__main__":
    main()

