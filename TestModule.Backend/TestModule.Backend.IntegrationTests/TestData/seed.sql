-- =============================================================
-- Seed script for integration tests.
-- Inserts a fixed set of products and dishes with well-known IDs
-- so that filter/search tests can rely on their existence.
-- Uses ON CONFLICT DO NOTHING — safe to run repeatedly.
-- =============================================================

-- ---------------------------------------------------------------
-- Products
-- Enum mapping:
--   Category:  0=Frozen 1=Meat 2=Vegetables 3=Greens 4=Spices
--              5=Cereals 6=Canned 7=Liquid 8=Sweets
--   Necessity: 0=ReadyToEat 1=SemiFinished 2=RequiresCooking
--   Flags:     0=None 1=Vegan 2=GlutenFree 4=SugarFree
-- ---------------------------------------------------------------
INSERT INTO "Products" ("Id","Title","Calories","Proteins","Fats","Carbohydrates","Description","Category","Necessity","Flags","DateCreated")
VALUES
    -- seed-product-sweets: Category=8 (Sweets), Necessity=0 (ReadyToEat), Flags=0 (None)
    ('a1000000-0000-0000-0000-000000000001',
     'Seed Шоколадный торт', 420, 6, 22, 55, 'Seed product – sweets category', 8, 0, 0, NOW()),

    -- seed-product-vegan: Category=2 (Vegetables), Necessity=0 (ReadyToEat), Flags=1 (Vegan)
    ('a1000000-0000-0000-0000-000000000002',
     'Seed Веганский овощной микс', 80, 3, 2, 14, 'Seed product – vegan flag', 2, 0, 1, NOW()),

    -- seed-product-ready: Category=7 (Liquid), Necessity=0 (ReadyToEat), Flags=0 (None)
    ('a1000000-0000-0000-0000-000000000003',
     'Seed Минеральная вода', 0, 0, 0, 0, 'Seed product – ready to eat', 7, 0, 0, NOW()),

    -- seed-product-cooking: Category=1 (Meat), Necessity=2 (RequiresCooking), Flags=0 (None)
    ('a1000000-0000-0000-0000-000000000004',
     'Seed Куриная грудка', 165, 31, 3, 0, 'Seed product – requires cooking', 1, 2, 0, NOW()),

    -- seed-product-macro-source: used for macro-recalculation tests
    -- 100 kcal / 10g proteins / 5g fats / 15g carbs per 100g
    ('a1000000-0000-0000-0000-000000000005',
     'Seed Macro Source Product', 100, 10, 5, 15, 'Known macros: 100kcal per 100g', 2, 0, 0, NOW())

ON CONFLICT ("Id") DO NOTHING;

-- ---------------------------------------------------------------
-- Dishes
-- Enum mapping:
--   Category: 0=Dessert 1=FirstCourse 2=SecondCourse 3=Drink
--             4=Salad 5=Soup 6=Snack
--   Flags:    0=None 1=Vegan 2=GlutenFree 4=SugarFree
-- ---------------------------------------------------------------
INSERT INTO "Dishes" ("Id","Title","PortionSize","Calories","Proteins","Fats","Carbohydrates","Category","Flags","DateCreated")
VALUES
    -- seed-dish-dessert: Category=0 (Dessert), Flags=0 (None)
    ('b1000000-0000-0000-0000-000000000001',
     'Seed Тирамису', 150, 350, 7, 18, 40, 0, 0, NOW()),

    -- seed-dish-vegan-salad: Category=4 (Salad), Flags=1 (Vegan)
    ('b1000000-0000-0000-0000-000000000002',
     'Seed Веганский салат', 200, 120, 4, 5, 18, 4, 1, NOW()),

    -- seed-dish-soup: Category=5 (Soup), Flags=0 (None)
    ('b1000000-0000-0000-0000-000000000003',
     'Seed Борщ', 300, 180, 9, 6, 22, 5, 0, NOW())

ON CONFLICT ("Id") DO NOTHING;

-- ---------------------------------------------------------------
-- DishProducts — link seed dishes to seed products
-- ---------------------------------------------------------------
INSERT INTO "DishProducts" ("DishId","ProductId","AmountInGrams")
VALUES
    -- Seed Веганский салат uses Seed Веганский овощной микс (100g)
    ('b1000000-0000-0000-0000-000000000002',
     'a1000000-0000-0000-0000-000000000002', 100),

    -- Seed Борщ uses Seed Куриная грудка (200g)
    ('b1000000-0000-0000-0000-000000000003',
     'a1000000-0000-0000-0000-000000000004', 200)

ON CONFLICT DO NOTHING;
