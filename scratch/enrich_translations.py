import json
import re

def translate_dish_name(name_ru):
    # Common dish name translations RU -> UZ & EN
    mapping_name = {
        "Скрембл с лососем и авокадо": ("Losos va avokado bilan skrembl", "Salmon and avocado scramble"),
        "Яичница с беконом и томатами": ("Bekon va pomidorli tuxum qovurmasi", "Fried eggs with bacon and tomatoes"),
        "Овсяная каша с ягодами": ("Mevali suli bo'tqasi (ovsyanka)", "Oatmeal with berries"),
        "Сырники с сметаной и джемом": ("Smetana va djemli sirniklar", "Syrniki with sour cream and jam"),
        "Блины с мясом": ("Go'shtli quymoqlar (blinchik)", "Pancakes with meat"),
        "Блины с творогом": ("Tvorogli quymoqlar (blinchik)", "Pancakes with cottage cheese"),
        "Круассан с лососем": ("Lososli kruassan", "Salmon croissant"),
        "Круассан с ветчиной и сыром": ("Vetchina va pishloqli kruassan", "Ham and cheese croissant"),
        "Брускетта с томатами и страчателлой": ("Pomidor va strachatella pishloqli brusketta", "Bruschetta with tomatoes and stracciatella"),
        "Классический бургер": ("Klassik burger", "Classic burger"),
        "Чизбургер": ("Chizburger", "Cheeseburger"),
        "Клаб сэндвич": ("Klab sendvich", "Club sandwich"),
        "Сэндвич с тунцом": ("Tunezli sendvich", "Tuna sandwich"),
        "Панини с курицей": ("Tovuqli panini", "Chicken panini"),
        "Борщ с говядиной": ("Mol go'shtli borsh sup", "Borscht with beef"),
        "Куриный суп с лапшой": ("Tovuqli ugra sup", "Chicken noodle soup"),
        "Крем-суп из грибов": ("Qo'ziqorinli krem-sup", "Mushroom cream soup"),
        "Томатный суп с морепродуктами": ("Dengiz mahsulotli pomidor sup", "Tomato seafood soup"),
        "Тыквенный крем-суп": ("Oshqovoqli krem-sup", "Pumpkin cream soup"),
        "Салат Цезарь с курицей": ("Tovuqli Sezar salati", "Caesar salad with chicken"),
        "Салат Цезарь с креветками": ("Krevetkali Sezar salati", "Caesar salad with shrimps"),
        "Греческий салат": ("Grecheskiy salati", "Greek salad"),
        "Салат с тунцом": ("Tunezli salat", "Tuna salad"),
        "Теплый салат с баклажанами": ("Baqlajonli issiq salat", "Warm eggplant salad"),
        "Паста Карбонара": ("Karbonara pastasi", "Pasta Carbonara"),
        "Паста Болоньезе": ("Bolonyeze pastasi", "Pasta Bolognese"),
        "Паста с морепродуктами": ("Dengiz mahsulotli pasta", "Seafood pasta"),
        "Феттучини с грибами и курицей": ("Qo'ziqorin va tovuqli fettuchini", "Fettuccine with chicken and mushrooms"),
        "Пенне Арабиата": ("Penne Arabiata", "Penne Arrabbiata"),
        "Стейк Рибай": ("Ribay steyki", "Ribeye steak"),
        "Медальоны из говядины": ("Mol go'shtli medalonlar", "Beef medallions"),
        "Куриное филе на гриле": ("Grilda pishirilgan tovuq filesi", "Grilled chicken fillet"),
        "Лосось на пару с овощами": ("Sabzavotli bug'da pishgan losos", "Steamed salmon with vegetables"),
        "Бефстроганов с картофельным пюре": ("Kartoshka pyuresi bilan befstorganov", "Beef Stroganoff with mashed potatoes"),
        "Картофель фри": ("Kartoshka fri", "French fries"),
        "Картофельные дольки": ("Kartoshka bo'laklari (dolkalar)", "Potato wedges"),
        "Овощи на гриле": ("Grilda pishgan sabzavotlar", "Grilled vegetables"),
        "Картофельное пюре": ("Kartoshka pyuresi", "Mashed potatoes"),
        "Отварной рис": ("Qaynatilgan guruch", "Boiled rice"),
        "Чизкейк Нью-Йорк": ("Nyuyork chizkeyki", "New York Cheesecake"),
        "Тирамису": ("Tiramisu", "Tiramisu"),
        "Яблочный штрудель": ("Ol mali shtrudel", "Apple strudel"),
        "Шоколадный fondant": ("Shokoladli fondan", "Chocolate fondant"),
        "Мороженое в ассортименте": ("Turli xil muzqaymoqlar", "Assorted ice cream")
    }

    if name_ru in mapping_name:
        return mapping_name[name_ru]
    
    # Fallback heuristic translation
    uz = name_ru.replace("Куриный", "Tovuqli").replace("Куриное", "Tovuqli").replace("говядиной", "mol go'shti bilan")
    en = name_ru
    return (uz, en)

def translate_dish_ingredients(ing_ru):
    # Common ingredient term dictionary RU -> UZ & EN
    subs_uz = [
        ("яйца", "tuxum"), ("яйцо", "tuxum"), ("лосось", "losos"), ("авокадо", "avokado"),
        ("хлеб", "non"), ("масло", "sariyog'"), ("зелень", "ko'katlar"), ("бекон", "bekon"),
        ("томаты", "pomidor"), ("томат", "pomidor"), ("соус", "sous"), ("овсяные хлопья", "suli yormasi"),
        ("молоко", "sut"), ("ягоды", "mevalar"), ("мёд", "asal"), ("творог", "tvorog"),
        ("сметана", "smetana"), ("джем", "djem"), ("сахар", "shakar"), ("куриное филе", "tovuq filesi"),
        ("говядина", "mol go'shti"), ("ветчина", "vetchina"), ("сыр", "pishloq"), ("тесто", "xamirturushli xamir"),
        ("креветки", "krevetkalar"), ("тунец", "tunez baliq"), ("грибы", "qo'ziqorinlar"),
        ("сливки", "qaymoq"), ("картофель", "kartoshka"), ("огурцы", "bodring"), ("лук", "piyoz"),
        ("чеснок", "sarimsoqpiyoz"), ("перец", "murch"), ("соль", "tuz"), ("паста", "pasta makaroni")
    ]

    subs_en = [
        ("яйца", "eggs"), ("яйцо", "egg"), ("лосось", "salmon"), ("авокаdo", "avocado"),
        ("хлеб", "bread"), ("масло", "butter"), ("зелень", "greens"), ("бекон", "bacon"),
        ("томаты", "tomatoes"), ("соус", "sauce"), ("овсяные хлопья", "oatmeal"),
        ("молоко", "milk"), ("ягоды", "berries"), ("мёд", "honey"), ("творог", "cottage cheese"),
        ("сметана", "sour cream"), ("джем", "jam"), ("сахар", "sugar"), ("куриное филе", "chicken fillet"),
        ("говядина", "beef"), ("ветчина", "ham"), ("сыр", "cheese"), ("креветки", "shrimps"),
        ("тунец", "tuna"), ("грибы", "mushrooms"), ("сливки", "cream"), ("картофель", "potatoes")
    ]

    uz = ing_ru.lower()
    for ru_w, uz_w in subs_uz:
        uz = uz.replace(ru_w, uz_w)
    
    en = ing_ru.lower()
    for ru_w, en_w in subs_en:
        en = en.replace(ru_w, en_w)

    return (uz.capitalize(), en.capitalize())

print("Translation module ready.")
