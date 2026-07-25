# PowerShell Dataset Enrichment Script for Safia 3-Language PWA

$dishesPath = "c:\Users\VICTUS-2023\Desktop\Safia\data\dishes.json"
$drinksPath = "c:\Users\VICTUS-2023\Desktop\Safia\data\drinks.json"

$dishes = Get-Content -Raw $dishesPath | ConvertFrom-Json
$drinks = Get-Content -Raw $drinksPath | ConvertFrom-Json

# Category Dictionary
$catDict = @{
    "Завтраки" = @{ uz = "Nonushtalar"; en = "Breakfasts" }
    "Вторые блюда" = @{ uz = "Ikkinchi taomlar"; en = "Main Courses" }
    "Салаты" = @{ uz = "Salatlar"; en = "Salads" }
    "Супы" = @{ uz = "Suplar va krem-suplar"; en = "Soups & Cream Soups" }
    "Пиццы" = @{ uz = "Pitsalar"; en = "Pizzas" }
    "Сэндвичи" = @{ uz = "Sendvich va paninilar"; en = "Sandwiches & Paninis" }
    "Паста" = @{ uz = "Pasta va makaronlar"; en = "Pasta & Italian" }
    "Десерты" = @{ uz = "Shirinliklar va desertlar"; en = "Desserts" }
    "Авторские чаи" = @{ uz = "Mualliflik choylari"; en = "Signature Teas" }
    "Кофейные напитки" = @{ uz = "Kofe ichimliklari"; en = "Coffee Drinks" }
    "Лимонады" = @{ uz = "Limonad va salqin ichimliklar"; en = "Lemonades & Refreshers" }
    "Смузи и Фреши" = @{ uz = "Smuzi va yangi sharbatlar"; en = "Smoothies & Fresh Juices" }
}

# Function to translate ingredients text
function Translate-Ingredients($textRu, $lang) {
    if ([string]::IsNullOrWhiteSpace($textRu)) { return "" }
    $res = $textRu

    $wordsUz = @(
        @{ ru = "Яйца"; uz = "Tuxum" },
        @{ ru = "Яйцо"; uz = "Tuxum" },
        @{ ru = "багет турке"; uz = "turkcha baget noni" },
        @{ ru = "сосиски куриные"; uz = "tovuq sosiskalari" },
        @{ ru = "микс салата"; uz = "salat barglari miksi" },
        @{ ru = "помидоры черри"; uz = "cherri pomidorlari" },
        @{ ru = "огурцы"; uz = "bodring" },
        @{ ru = "огурец маринованный"; uz = "tuzlangan bodring" },
        @{ ru = "консервированная фасоль"; uz = "konservalangan loviya" },
        @{ ru = "томатная база"; uz = "pomidorli sous bazasi" },
        @{ ru = "греческий соус"; uz = "grekcha sous" },
        @{ ru = "грибы шампиньоны"; uz = "shampinyon qo'ziqorinlari" },
        @{ ru = "кинза"; uz = "kashnich (kinza)" },
        @{ ru = "масло сливочное"; uz = "sariyog'" },
        @{ ru = "масло растительное"; uz = "o'simlik moyi" },
        @{ ru = "приправа 5 перцев"; uz = "5 xil murch ziravori" },
        @{ ru = "микрозелень"; uz = "mikrozelen (yangi maysalar)" },
        @{ ru = "соус Ширирача (острый соус)"; uz = "shiriracha achchiq sousi" },
        @{ ru = "сырный микс"; uz = "pishloqlar miksi" },
        @{ ru = "соль"; uz = "tuz" },
        @{ ru = "Сырники"; uz = "Sirniklar" },
        @{ ru = "мука"; uz = "un" },
        @{ ru = "сметана"; uz = "smetana" },
        @{ ru = "черничное варенье"; uz = "chernika murebbosi" },
        @{ ru = "консервированный персик"; uz = "konservalangan shaftoli" },
        @{ ru = "малина"; uz = "moruq (malina)" },
        @{ ru = "ежевика"; uz = "maymunjon" },
        @{ ru = "голубика"; uz = "golubika maysasi" },
        @{ ru = "мята"; uz = "yalpiz barglari" },
        @{ ru = "Блинчики"; uz = "Quymoqlar (Blinchik)" },
        @{ ru = "сгущённое молоко"; uz = "quyilttirilgan sut (sgushchonka)" },
        @{ ru = "нутелла"; uz = "Nutella shokolad pastasi" },
        @{ ru = "банан"; uz = "banan" },
        @{ ru = "корица молотая"; uz = "yanchilgan dolchin" },
        @{ ru = "Рис"; uz = "Guruch" },
        @{ ru = "молоко"; uz = "sut" },
        @{ ru = "Овсянка"; uz = "Suli yormasi (ovsyanka)" },
        @{ ru = "мёд"; uz = "tabiiy asal" },
        @{ ru = "куриные слайсы"; uz = "qovurilgan tovuq go'shti bo'laklari" },
        @{ ru = "авокадо"; uz = "avokado" },
        @{ ru = "сыр Лабне"; uz = "Labne yumshoq pishlog'i" },
        @{ ru = "жареные овощи"; uz = "qovurilgan sabzavotlar" },
        @{ ru = "боланьезе"; uz = "bolonyeze go'shtli sousi" },
        @{ ru = "Котлеты говяд"; uz = "Mol go'shtli kotletlar" },
        @{ ru = "картофельное пюре"; uz = "kartoshka pyuresi" },
        @{ ru = "Куриная грудка"; uz = "Tovuq ko'krak filesi" },
        @{ ru = "сыр виола"; uz = "Viola pishlog'i" },
        @{ ru = "чеснок"; uz = "sarimsoqpiyoz" },
        @{ ru = "соус винигрет"; uz = "vinegret sousi" },
        @{ ru = "медово-горчичный соус"; uz = "asal-gorchitsa sousi" },
        @{ ru = "Бон филе нарезка"; uz = "Bon file mol go'shti" },
        @{ ru = "картофель чипсы"; uz = "kartoshka chipslari" },
        @{ ru = "Куриное филе су-вид"; uz = "Su-vid usulida pishgan tovuq filesi" },
        @{ ru = "айсберг"; uz = "Aysberg salat bargi" },
        @{ ru = "перепелиные яйца"; uz = "bepana tuxumi" },
        @{ ru = "сухарики из багета"; uz = "baget suxariklari" },
        @{ ru = "сыр пармезан джукас"; uz = "Parmezan pishlog'i" },
        @{ ru = "соус цезарь"; uz = "Sezar sousi" },
        @{ ru = "сыр фетакса"; uz = "Fetatsa pishlog'i" },
        @{ ru = "болгарский перец"; uz = "bulg'or qalampiri" },
        @{ ru = "маслины"; uz = "qora zaytun (maslini)" },
        @{ ru = "оливки жареные"; uz = "qovurilgan zaytun" },
        @{ ru = "лук фиолетовый"; uz = "binafsharang piyoz" },
        @{ ru = "Консервированный тунец"; uz = "Konservalangan tunez baliq" }
    )

    $wordsEn = @(
        @{ ru = "Яйца"; en = "Eggs" },
        @{ ru = "сосиски куриные"; en = "chicken sausages" },
        @{ ru = "микс салата"; en = "salad mix" },
        @{ ru = "помидоры черри"; en = "cherry tomatoes" },
        @{ ru = "огурцы"; en = "cucumbers" },
        @{ ru = "масло сливочное"; en = "butter" },
        @{ ru = "масло растительное"; en = "vegetable oil" },
        @{ ru = "микрозелень"; en = "microgreens" },
        @{ ru = "Сырники"; en = "Syrniki (Cottage cheese pancakes)" },
        @{ ru = "сметана"; en = "sour cream" },
        @{ ru = "мята"; en = "fresh mint" },
        @{ ru = "Блинчики"; en = "Pancakes" },
        @{ ru = "нутелла"; en = "Nutella" },
        @{ ru = "банан"; en = "banana" },
        @{ ru = "Рис"; en = "Rice" },
        @{ ru = "молоко"; en = "milk" },
        @{ ru = "Овсянка"; en = "Oatmeal" },
        @{ ru = "мёд"; en = "honey" },
        @{ ru = "авокадо"; en = "avocado" },
        @{ ru = "картофельное пюре"; en = "mashed potatoes" },
        @{ ru = "Куриная грудка"; en = "Chicken breast fillet" },
        @{ ru = "чеснок"; en = "garlic" },
        @{ ru = "Куриное филе су-вид"; en = "Sous-vide chicken fillet" },
        @{ ru = "айсберг"; en = "Iceberg lettuce" },
        @{ ru = "соус цезарь"; en = "Caesar sauce" }
    )

    $words = if ($lang -eq 'uz') { $wordsUz } else { $wordsEn }

    foreach ($pair in $words) {
        $r = $pair.ru
        $t = if ($lang -eq 'uz') { $pair.uz } else { $pair.en }
        $res = $res -ireplace [regex]::Escape($r), $t
    }

    return $res
}

# Translate Dishes
foreach ($d in $dishes) {
    # Names
    if (-not $d.name_uz) {
        switch -regex ($d.name_ru) {
            "Английское утро" { $d.name_uz = "Angliya tongi nonushtasi"; $d.name_en = "English Breakfast" }
            "Шакшука" { $d.name_uz = "Shakshuka (pomidorli tuxum)"; $d.name_en = "Shakshuka" }
            "Сырники" { $d.name_uz = "Sirniklar (tvorogli ponchiklar)"; $d.name_en = "Syrniki (Cottage Cheese Pancakes)" }
            "Блинчики классические" { $d.name_uz = "Klassik quymoqlar (Blinchik)"; $d.name_en = "Classic Pancakes" }
            "Блинчики с нутеллой и бананом" { $d.name_uz = "Nutella va bananli quymoqlar"; $d.name_en = "Pancakes with Nutella & Banana" }
            "Каша рисовая фруктовая" { $d.name_uz = "Mevali guruchli bo'tqa"; $d.name_en = "Fruit Rice Porridge" }
            "Каша овсяная на меду" { $d.name_uz = "Asalli suli bo'tqasi (Ovsyanka)"; $d.name_en = "Honey Oatmeal Porridge" }
            "Боул с рисом и куриным филе" { $d.name_uz = "Tovuqli va guruchli Boul"; $d.name_en = "Chicken & Rice Bowl" }
            "Яичный омлет с овощами и сыром" { $d.name_uz = "Sabzavot va pishloqli omlet"; $d.name_en = "Veggie & Cheese Omlette" }
            "Яичный омлет лазанья" { $d.name_uz = "Lazanya uslubidagi omlet"; $d.name_en = "Omlette Lasagna Style" }
            "Говяжьи котлеты с картофельным пюре" { $d.name_uz = "Mol go'shtli kotlet va kartoshka pyuresi"; $d.name_en = "Beef Cutlets with Mashed Potatoes" }
            "Куриное филе в сливочном соусе" { $d.name_uz = "Qaymoqli sousdagi tovuq filesi"; $d.name_en = "Chicken Fillet in Creamy Sauce" }
            "Котлета по-киевски" { $d.name_uz = "Kiyevcha sariyog'li tovuq kotlet"; $d.name_en = "Chicken Kiev Cutlet" }
            "Картофель с говядиной" { $d.name_uz = "Qovurilgan mol go'shti va kartoshka"; $d.name_en = "Beef & Fried Potato Mix" }
            "Салат Цезарь" { $d.name_uz = "Tovuqli Sezar salati"; $d.name_en = "Chicken Caesar Salad" }
            "Салат Греческий" { $d.name_uz = "Grekcha (Grecheskiy) salat"; $d.name_en = "Greek Fresh Salad" }
            "Салат с тунцом" { $d.name_uz = "Tunez baliqli salat"; $d.name_en = "Tuna Salad" }
            default {
                $d.name_uz = Translate-Ingredients $d.name_ru 'uz'
                $d.name_en = Translate-Ingredients $d.name_ru 'en'
            }
        }
    }

    # Categories
    if ($catDict.ContainsKey($d.category)) {
        $d.category_uz = $catDict[$d.category].uz
        $d.category_en = $catDict[$d.category].en
    } else {
        $d.category_uz = $d.category
        $d.category_en = $d.category
    }

    # Ingredients
    if (-not $d.ingredients_uz) {
        $d.ingredients_uz = Translate-Ingredients $d.ingredients_ru 'uz'
    }
    if (-not $d.ingredients_en) {
        $d.ingredients_en = Translate-Ingredients $d.ingredients_ru 'en'
    }
}

# Translate Drinks
foreach ($dr in $drinks) {
    if (-not $dr.name_uz) {
        $dr.name_uz = Translate-Ingredients $dr.name_ru 'uz'
        $dr.name_en = Translate-Ingredients $dr.name_ru 'en'
    }

    $groupName = if ($dr.group) { $dr.group } else { "Bar" }
    if ($catDict.ContainsKey($groupName)) {
        $dr.group_uz = $catDict[$groupName].uz
        $dr.group_en = $catDict[$groupName].en
    } else {
        $dr.group_uz = $groupName
        $dr.group_en = $groupName
    }

    if (-not $dr.ingredients_uz) {
        $dr.ingredients_uz = Translate-Ingredients $dr.ingredients_ru 'uz'
    }
    if (-not $dr.ingredients_en) {
        $dr.ingredients_en = Translate-Ingredients $dr.ingredients_ru 'en'
    }

    if (-not $dr.serving_uz) {
        $dr.serving_uz = Translate-Ingredients $dr.serving_ru 'uz'
    }
    if (-not $dr.serving_en) {
        $dr.serving_en = Translate-Ingredients $dr.serving_ru 'en'
    }
}

# Save back formatted JSON files
$dishes | ConvertTo-Json -Depth 10 | Set-Content -Path $dishesPath -Encoding UTF8
$drinks | ConvertTo-Json -Depth 10 | Set-Content -Path $drinksPath -Encoding UTF8

Write-Host "Enrichment script completed successfully."
