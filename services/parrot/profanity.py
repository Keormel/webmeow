import re

from config import settings

# Character used to mask a profane word, preserving its length. Single source of
# truth so store-derived metrics (admin.py) can detect a masked message.
MASK_CHAR = "*"

# Stop list sourced from PROFANITY_WORDS (config.py), comma-separated, falling back
# to the curated default when unset.
PROFANITY_WORDS = [w.strip() for w in settings.profanity_words.split(",") if w.strip()]

# Match the stop list as a raw substring alternation, longest-first so multi-letter
# words win over their prefixes. Case-insensitive so "ASS" masks the same as "ass".
_PATTERN = re.compile(
    "|".join(re.escape(w) for w in sorted(PROFANITY_WORDS, key=len, reverse=True)),
    re.IGNORECASE,
)


# Lengths of mask runs produced by mask_profanity (one run per censored word).
_MASK_LENGTHS = {len(w) for w in PROFANITY_WORDS}
_MASK_RUN = re.compile(rf"{re.escape(MASK_CHAR)}+")


def mask_profanity(text: str) -> str:
    """Mask profane words in user-supplied text, preserving length with '*'."""
    if not text:
        return text
    return _PATTERN.sub(lambda m: MASK_CHAR * len(m.group(0)), text)


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
