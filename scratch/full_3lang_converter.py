import json
import re

# Dictionary for common culinary terms and ingredients
TRANS_DICT = {
    # Ingredients / Dishes terms
    "яйца": ("tuxum", "eggs"),
    "яйцо": ("tuxum", "egg"),
    "лосось": ("losos baliq", "salmon"),
    "авокадо": ("avokado", "avocado"),
    "хлеб": ("non", "bread"),
    "масло": ("sariyog'", "butter"),
    "зелень": ("ko'katlar", "herbs"),
    "бекон": ("bekon", "bacon"),
    "томаты": ("pomidor", "tomatoes"),
    "соус": ("sous", "sauce"),
    "овсяные хлопья": ("suli yormasi", "oatmeal"),
    "молоко": ("sut", "milk"),
    "ягоды": ("mevalar", "berries"),
    "мёд": ("asal", "honey"),
    "творог": ("tvorog pishloq", "cottage cheese"),
    "сметана": ("smetana", "sour cream"),
    "джем": ("djem", "jam"),
    "сахар": ("shakar", "sugar"),
    "куриное филе": ("tovuq filesi", "chicken fillet"),
    "говядина": ("mol go'shti", "beef"),
    "ветчина": ("vetchina", "ham"),
    "сыр": ("pishloq", "cheese"),
    "тесто": ("xamirturushli xamir", "dough"),
    "креветки": ("krevetkalar", "shrimps"),
    "тунец": ("tunez baliq", "tuna"),
    "грибы": ("qo'ziqorinlar", "mushrooms"),
    "сливки": ("qaymoq", "cream"),
    "картофель": ("kartoshka", "potatoes"),
    "огурцы": ("bodring", "cucumber"),
    "лук": ("piyoz", "onion"),
    "чеснок": ("sarimsoqpiyoz", "garlic"),
    "перец": ("murch", "pepper"),
    "соль": ("tuz", "salt"),
    "паста": ("pasta", "pasta"),
    "лимон": ("limon", "lemon"),
    "мята": ("yalpiz", "mint"),
    "лед": ("muz", "ice"),
    "сироп": ("sirop", "syrup"),
    "кофе": ("kofe", "coffee"),
    "чай": ("choy", "tea"),
    "восьмиугольник": ("badiyan", "star anise"),
    "корица": ("dolchin", "cinnamon"),
    "апельсин": ("apelsin", "orange"),
    "клубника": ("qulupnay", "strawberry"),
    "персик": ("shaftoli", "peach"),
    "маракуйя": ("marakuyya", "passion fruit"),
    "вода": ("suv", "water")
}

def auto_translate(text_ru):
    if not text_ru:
        return ("", "")
    
    uz = text_ru
    en = text_ru

    for ru_k, (uz_v, en_v) in TRANS_DICT.items():
        # Case insensitive replacement
        pattern = re.compile(re.escape(ru_k), re.IGNORECASE)
        uz = pattern.sub(uz_v, uz)
        en = pattern.sub(en_v, en)

    return (uz, en)

# Process dishes.json
with open('data/dishes.json', 'r', encoding='utf-8') as f:
    dishes = json.load(f)

for dish in dishes:
    name_ru = dish.get('name_ru') or dish.get('name') or ''
    ing_ru = dish.get('ingredients_ru') or dish.get('ingredients') or ''
    cat_ru = dish.get('category') or ''

    dish['name_ru'] = name_ru
    dish['ingredients_ru'] = ing_ru

    # Ensure UZ & EN fields exist
    if not dish.get('name_uz'):
        name_uz, name_en = auto_translate(name_ru)
        dish['name_uz'] = name_uz
        dish['name_en'] = name_en

    if not dish.get('ingredients_uz'):
        ing_uz, ing_en = auto_translate(ing_ru)
        dish['ingredients_uz'] = ing_uz
        dish['ingredients_en'] = ing_en

with open('data/dishes.json', 'w', encoding='utf-8') as f:
    json.dump(dishes, f, ensure_ascii=False, indent=2)

# Process drinks.json
with open('data/drinks.json', 'r', encoding='utf-8') as f:
    drinks = json.load(f)

for drink in drinks:
    name_ru = drink.get('name_ru') or drink.get('name') or ''
    ing_ru = drink.get('ingredients_ru') or drink.get('ingredients') or ''
    serv_ru = drink.get('serving_ru') or drink.get('serving') or ''

    drink['name_ru'] = name_ru
    drink['ingredients_ru'] = ing_ru
    drink['serving_ru'] = serv_ru

    if not drink.get('name_uz'):
        n_uz, n_en = auto_translate(name_ru)
        drink['name_uz'] = n_uz
        drink['name_en'] = n_en

    if not drink.get('ingredients_uz'):
        i_uz, i_en = auto_translate(ing_ru)
        drink['ingredients_uz'] = i_uz
        drink['ingredients_en'] = i_en

    if not drink.get('serving_uz'):
        s_uz, s_en = auto_translate(serv_ru)
        drink['serving_uz'] = s_uz
        drink['serving_en'] = s_en

with open('data/drinks.json', 'w', encoding='utf-8') as f:
    json.dump(drinks, f, ensure_ascii=False, indent=2)

print("dishes.json and drinks.json successfully enriched with 3-language fields!")
