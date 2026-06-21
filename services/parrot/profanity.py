import re
import unicodedata

from config import settings

# Character used to mask a profane word, preserving its length. Single source of
# truth so store-derived metrics (admin.py) can detect a masked message.
MASK_CHAR = "*"

# Stop list sourced from PROFANITY_WORDS (config.py), comma-separated, falling back
# to the curated default when unset.
PROFANITY_WORDS = [w.strip() for w in settings.profanity_words.split(",") if w.strip()]

# Common leet / symbol substitutions mapped onto the letters they stand in for.
_LEET_TO_LETTER = str.maketrans({
    "@": "a",
    "4": "a",
    "8": "b",
    "(": "c",
    "3": "e",
    "9": "g",
    "1": "i",
    "!": "i",
    "|": "l",
    "0": "o",
    "$": "s",
    "5": "s",
    "7": "t",
    "+": "t",
    "2": "z",
})

# Letters that may appear in place of each normalized letter when building patterns.
_LEET_VARIANTS: dict[str, str] = {
    "a": "a@4",
    "b": "b8",
    "c": "c(",
    "e": "e3",
    "g": "g9",
    "i": "i1!|",
    "l": "l1|",
    "o": "o0",
    "s": "s$5",
    "t": "t7+",
    "z": "z2",
}


def normalize_text(text: str) -> str:
    """Lowercase, strip accents, and map common leet symbols to letters."""
    if not text:
        return text
    normalized = unicodedata.normalize("NFKD", text)
    normalized = normalized.encode("ascii", "ignore").decode("ascii")
    return normalized.translate(_LEET_TO_LETTER).lower()


def _leet_char_class(ch: str) -> str:
    ch = ch.lower()
    variants = {ch}
    if ch in _LEET_VARIANTS:
        variants.update(_LEET_VARIANTS[ch])
    return "[" + "".join(re.escape(c) for c in sorted(variants)) + "]"


def _word_boundary_pattern(word: str) -> str:
    """Match a profanity word as its own token, not as part of another word."""
    parts = [_leet_char_class(ch) for ch in normalize_text(word)]
    body = r"[\W_]*".join(parts)
    return rf"(?<![a-zA-Z0-9@$]){body}(?![a-zA-Z0-9@$])"


def _compile_patterns(words: list[str]) -> list[re.Pattern[str]]:
    unique = sorted({w.lower() for w in words if w}, key=len, reverse=True)
    return [re.compile(_word_boundary_pattern(word), re.IGNORECASE) for word in unique]


_PATTERNS = _compile_patterns(PROFANITY_WORDS)

# Lengths of mask runs produced by mask_profanity (one run per censored word).
_MASK_LENGTHS = {len(w) for w in PROFANITY_WORDS}
_MASK_RUN = re.compile(rf"{re.escape(MASK_CHAR)}+")


def mask_profanity(text: str) -> str:
    """Mask profane words in user-supplied text, preserving length with '*'."""
    if not text:
        return text

    masked = text
    for pattern in _PATTERNS:
        masked = pattern.sub(lambda m: MASK_CHAR * len(m.group(0)), masked)
    return masked


def was_censored(text: str) -> bool:
    """True if mask_profanity would alter this text."""
    if not text:
        return False
    return mask_profanity(text) != text


def contains_mask(text) -> bool:
    """True if text carries a profanity mask produced by mask_profanity."""
    if not text or not isinstance(text, str):
        return False

    stripped = text.strip()
    if stripped and all(c == MASK_CHAR for c in stripped):
        return False

    return any(len(match.group(0)) in _MASK_LENGTHS for match in _MASK_RUN.finditer(text))
