#!/usr/bin/env python3
import json
import sys
import os

files = [
    "data/dishes.json",
    "data/drinks.json",
    "data/standards.json"
]

errors = []
for fname in files:
    try:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Validate structure
        if fname.endswith('dishes.json'):
            assert isinstance(data, list), "dishes.json should be array"
            assert len(data) == 44, f"Expected 44 dishes, got {len(data)}"
            for i, dish in enumerate(data):
                assert 'id' in dish, f"Dish {i} missing id"
                assert 'name_ru' in dish, f"Dish {i} missing name_ru"
                assert 'image' in dish, f"Dish {i} missing image"
                assert dish['id'] == i + 1, f"Dish id mismatch at {i}"

        elif fname.endswith('drinks.json'):
            assert isinstance(data, list), "drinks.json should be array"
            assert len(data) >= 45, f"Expected at least 45 drinks, got {len(data)}"
            for i, drink in enumerate(data):
                assert 'id' in drink, f"Drink {i} missing id"
                assert 'name_ru' in drink, f"Drink {i} missing name_ru"
                assert 'serving_ru' in drink, f"Drink {i} missing serving_ru"
                assert 'image' in drink, f"Drink {i} missing image"

        elif fname.endswith('standards.json'):
            assert isinstance(data, dict), "standards.json should be object"
            assert 'restaurant' in data, "Missing restaurant name"
            assert 'sections' in data, "Missing sections"

        print(f"✓ {fname}: Valid JSON ({len(data) if isinstance(data, (list, dict)) else 'object'})")

    except json.JSONDecodeError as e:
        errors.append(f"✗ {fname}: JSON Syntax Error: {e}")
    except AssertionError as e:
        errors.append(f"✗ {fname}: Validation Error: {e}")
    except Exception as e:
        errors.append(f"✗ {fname}: Error: {e}")

if errors:
    for err in errors:
        print(err)
    sys.exit(1)
else:
    print("\n✓ All JSON files validated successfully!")

    # Print summary
    with open("data/dishes.json") as f:
        dishes = json.load(f)
    with open("data/drinks.json") as f:
        drinks = json.load(f)
    with open("data/standards.json") as f:
        standards = json.load(f)

    print(f"\nSummary:")
    print(f"  Dishes:  {len(dishes)}")
    print(f"  Drinks:  {len(drinks)}")
    print(f"  Standards: {len(standards.get('sections', []))} sections")
