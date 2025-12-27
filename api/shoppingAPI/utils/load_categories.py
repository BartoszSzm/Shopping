import csv
from os.path import dirname
from pprint import pprint

from shoppingAPI.app_types import ItemTypeRow

PRODUCTS_PATH = dirname(__file__) + "/products.csv"


def load_item_types(file_path: str = PRODUCTS_PATH):
    item_types: list[ItemTypeRow] = []
    with open(file_path, newline="", encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            item_types.append(ItemTypeRow(name=row[0], category=row[1], icon=row[2]))
    return item_types


if __name__ == "__main__":
    item_types = load_item_types()
    pprint(item_types)
