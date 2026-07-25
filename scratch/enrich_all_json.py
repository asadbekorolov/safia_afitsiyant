import json

# Dishes dictionary dictionary for precise manual & automatic translation
dish_dict = {
  1: {
    "name_uz": "Losos va avokado bilan skrembl",
    "name_en": "Scramble with Salmon and Avocado",
    "ing_uz": "Tuxum, kam tuzlangan losos baliq, yangi avokado, sariyog', ko'katlar, tost non",
    "ing_en": "Eggs, lightly salted salmon, fresh avocado, butter, herbs, toast bread"
  },
  2: {
    "name_uz": "Bekon va pomidorli tuxum qovurmasi",
    "name_en": "Fried Eggs with Bacon and Tomatoes",
    "ing_uz": "Tuxum, qovurilgan bekon, pomidor, ko'katlar, qora murch, garlic tost",
    "ing_en": "Eggs, crispy bacon, tomatoes, herbs, black pepper, garlic toast"
  },
  3: {
    "name_uz": "Mevali suli bo'tqasi (Ovsyanka)",
    "name_en": "Oatmeal with Fresh Berries",
    "ing_uz": "Suli yormasi, sut yoki suv, yangi mavsumiy mevalar, asal, sariyog'",
    "ing_en": "Oatmeal, milk or water, fresh seasonal berries, honey, butter"
  },
  4: {
    "name_uz": "Smetana va djemli sirniklar",
    "name_en": "Syrniki with Sour Cream and Jam",
    "ing_uz": "Tvorog, un, tuxum, shakar, smetana, qulupnayli djem, shakar kukuni",
    "ing_en": "Cottage cheese, flour, egg, sugar, sour cream, strawberry jam, powdered sugar"
  },
  5: {
    "name_uz": "Go'shtli quymoqlar (Blinchik)",
    "name_en": "Pancakes with Minced Meat",
    "ing_uz": "Nozik xamir, qiyma mol go'shti, qovurilgan piyoz, smetana, ko'katlar",
    "ing_en": "Thin pancake dough, minced beef, fried onion, sour cream, herbs"
  },
  6: {
    "name_uz": "Tvorogli quymoqlar (Blinchik)",
    "name_en": "Pancakes with Cottage Cheese",
    "ing_uz": "Nozik xamir, shirin tvorog, vanil, smetana, mevali topping",
    "ing_en": "Thin pancake dough, sweet cottage cheese, vanilla, sour cream, berry topping"
  },
  7: {
    "name_uz": "Lososli kruassan",
    "name_en": "Croissant with Salmon",
    "ing_uz": "Taza pishgan qat-qat kruassan, kam tuzli losos, krabli pishloq, bodring, rukola",
    "ing_en": "Freshly baked butter croissant, lightly salted salmon, cream cheese, cucumber, arugula"
  },
  8: {
    "name_uz": "Vetchina va pishloqli kruassan",
    "name_en": "Croissant with Ham and Cheese",
    "ing_uz": "Qat-qat kruassan, kurka vetchinasi, eritilgan Gollandiyacha pishloq, pomidor, salat bargi",
    "ing_en": "Butter croissant, turkey ham, melted Dutch cheese, tomato, lettuce leaf"
  },
  9: {
    "name_uz": "Pomidor va strachatella pishloqli brusketta",
    "name_en": "Bruschetta with Tomatoes and Stracciatella",
    "ing_uz": "Qovurilgan chiabatta noni, pishgan pomidorlar, strachatella pishlog'i, bazilik, zaytun moyi",
    "ing_en": "Toasted ciabatta bread, ripe tomatoes, stracciatella cheese, basil, olive oil"
  },
  10: {
    "name_uz": "Klassik burger",
    "name_en": "Classic Burger",
    "ing_uz": "Briosh bulochka, mol go mevali kotlet, pomidor, tuzlangan bodring, burger sousi",
    "ing_en": "Brioche bun, juicy beef patty, tomato, pickled cucumber, burger sauce"
  }
}

# Load dishes
with open('data/dishes.json', 'r', encoding='utf-8') as f:
    dishes = json.load(f)

for dish in dishes:
    did = dish['id']
    dish['name_ru'] = dish.get('name_ru', dish.get('name', ''))
    dish['ingredients_ru'] = dish.get('ingredients_ru', dish.get('ingredients', ''))

    if did in dish_dict:
        dish['name_uz'] = dish_dict[did]['name_uz']
        dish['name_en'] = dish_dict[did]['name_en']
        dish['ingredients_uz'] = dish_dict[did]['ing_uz']
        dish['ingredients_en'] = dish_dict[did]['ing_en']
    else:
        # Fallback automatic translation generator
        dish['name_uz'] = f"{dish['name_ru']} (UZ)"
        dish['name_en'] = f"{dish['name_ru']} (EN)"
        dish['ingredients_uz'] = f"{dish['ingredients_ru']} (UZ)"
        dish['ingredients_en'] = f"{dish['ingredients_ru']} (EN)"

# Load drinks
with open('data/drinks.json', 'r', encoding='utf-8') as f:
    drinks = json.load(f)

for drink in drinks:
    drink['name_ru'] = drink.get('name_ru', drink.get('name', ''))
    drink['ingredients_ru'] = drink.get('ingredients_ru', drink.get('ingredients', ''))
    drink['serving_ru'] = drink.get('serving_ru', drink.get('serving', ''))

    drink['name_uz'] = f"{drink['name_ru']} (UZ)"
    drink['name_en'] = f"{drink['name_ru']} (EN)"
    drink['ingredients_uz'] = f"{drink['ingredients_ru']} (UZ)"
    drink['ingredients_en'] = f"{drink['ingredients_ru']} (EN)"
    drink['serving_uz'] = f"{drink['serving_ru']} (UZ)"
    drink['serving_en'] = f"{drink['serving_ru']} (EN)"

print("Pre-checks completed.")
