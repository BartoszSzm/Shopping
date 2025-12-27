from typing import Iterable, Optional

from thefuzz import fuzz

from shoppingAPI.app_types import ItemTypeRow


def normalize(text: str) -> str:
    return text.strip().capitalize()


def find_category(
    word: str,
    collection: Iterable[ItemTypeRow],
    threshold: int = 80,
) -> Optional[ItemTypeRow]:

    normalized_word = normalize(word)

    best_item: Optional[ItemTypeRow] = None
    best_score: tuple[int, int] = (0, 0)
    # (ratio_score, secondary_score)

    for item in collection:
        name = normalize(item["name"])

        ratio_score = fuzz.ratio(normalized_word, name)
        secondary_score = max(
            fuzz.partial_ratio(normalized_word, name),
            fuzz.token_sort_ratio(normalized_word, name),
        )

        score = (ratio_score, secondary_score)

        if score > best_score:
            best_score = score
            best_item = item

    if best_score[0] >= threshold:
        return best_item

    return None
