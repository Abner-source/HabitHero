from typing import List, Optional
import re


# ─── Motivational Quotes ─────────────────────────────────────────────────────

QUOTES = [
    {"quote": "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "author": "Aristotle", "category": "motivation"},
    {"quote": "Motivation is what gets you started. Habit is what keeps you going.", "author": "Jim Ryun", "category": "habits"},
    {"quote": "Success is the sum of small efforts repeated day in and day out.", "author": "Robert Collier", "category": "success"},
    {"quote": "You don't rise to the level of your goals, you fall to the level of your systems.", "author": "James Clear", "category": "habits"},
    {"quote": "The secret of getting ahead is getting started.", "author": "Mark Twain", "category": "motivation"},
    {"quote": "Small daily improvements are the key to staggering long-term results.", "author": "Robin Sharma", "category": "growth"},
    {"quote": "You will never always be motivated, so you must learn to be disciplined.", "author": "Unknown", "category": "discipline"},
    {"quote": "Consistency is the key to achieving and maintaining momentum.", "author": "Darren Hardy", "category": "consistency"},
    {"quote": "Take care of your body. It's the only place you have to live.", "author": "Jim Rohn", "category": "health"},
    {"quote": "An investment in knowledge pays the best interest.", "author": "Benjamin Franklin", "category": "learning"},
    {"quote": "The only way to do great work is to love what you do.", "author": "Steve Jobs", "category": "work"},
    {"quote": "It does not matter how slowly you go, as long as you do not stop.", "author": "Confucius", "category": "perseverance"},
    {"quote": "Your future is created by what you do today, not tomorrow.", "author": "Robert Kiyosaki", "category": "motivation"},
    {"quote": "Discipline is choosing between what you want now and what you want most.", "author": "Abraham Lincoln", "category": "discipline"},
    {"quote": "Each morning we are born again. What we do today is what matters most.", "author": "Buddha", "category": "mindfulness"},
]


# ─── Habit Suggestions ────────────────────────────────────────────────────────

SUGGESTIONS_BY_CATEGORY = {
    "health": [
        {"name": "Drink 8 glasses of water", "icon": "💧", "reason": "Hydration is the foundation of good health.", "difficulty": "easy"},
        {"name": "Sleep 7–8 hours", "icon": "😴", "reason": "Quality sleep boosts energy and cognition.", "difficulty": "medium"},
        {"name": "Take a daily vitamin", "icon": "💊", "reason": "Fill nutritional gaps in your diet.", "difficulty": "easy"},
    ],
    "fitness": [
        {"name": "Morning 20-min walk", "icon": "🚶", "reason": "Walking is the easiest cardio habit.", "difficulty": "easy"},
        {"name": "10-min stretch routine", "icon": "🧘", "reason": "Improves flexibility and reduces injury risk.", "difficulty": "easy"},
        {"name": "100 push-ups a day", "icon": "💪", "reason": "Build upper body strength progressively.", "difficulty": "hard"},
    ],
    "mental_health": [
        {"name": "5-min meditation", "icon": "🧠", "reason": "Reduces stress and builds focus.", "difficulty": "easy"},
        {"name": "Gratitude journal", "icon": "📖", "reason": "Shifts mindset to positivity.", "difficulty": "easy"},
        {"name": "Digital detox 1hr before bed", "icon": "📵", "reason": "Improves sleep quality significantly.", "difficulty": "medium"},
    ],
    "learning": [
        {"name": "Read 20 pages daily", "icon": "📚", "reason": "14 books a year at this pace!", "difficulty": "medium"},
        {"name": "Learn 5 new words", "icon": "🔤", "reason": "Vocabulary builds over time exponentially.", "difficulty": "easy"},
        {"name": "Watch 1 educational video", "icon": "🎓", "reason": "Learn something new every day.", "difficulty": "easy"},
    ],
    "productivity": [
        {"name": "Plan tomorrow the night before", "icon": "📋", "reason": "Structured days achieve 2× more.", "difficulty": "easy"},
        {"name": "Time-block your calendar", "icon": "🗓️", "reason": "Protect deep work from interruptions.", "difficulty": "medium"},
        {"name": "Weekly review session", "icon": "🔍", "reason": "Review what worked and what didn't.", "difficulty": "medium"},
    ],
    "work": [
        {"name": "Deep work 2-hour block", "icon": "🎯", "reason": "Focused work produces highest quality output.", "difficulty": "hard"},
        {"name": "Clear inbox daily", "icon": "📧", "reason": "Reduces cognitive load and stress.", "difficulty": "medium"},
        {"name": "Stand up & move every hour", "icon": "🪑", "reason": "Combat the effects of prolonged sitting.", "difficulty": "easy"},
    ],
    "social": [
        {"name": "Call a friend or family member", "icon": "📞", "reason": "Nurture relationships proactively.", "difficulty": "easy"},
        {"name": "Write a thank-you message", "icon": "💌", "reason": "Gratitude strengthens social bonds.", "difficulty": "easy"},
    ],
    "finance": [
        {"name": "Track daily spending", "icon": "💰", "reason": "Awareness is the first step to saving.", "difficulty": "easy"},
        {"name": "Review budget weekly", "icon": "📊", "reason": "Stay on track with financial goals.", "difficulty": "medium"},
    ],
    "creativity": [
        {"name": "Draw or sketch for 10 min", "icon": "🎨", "reason": "Develops creative thinking and focus.", "difficulty": "easy"},
        {"name": "Write 200 words of fiction", "icon": "✍️", "reason": "Build a creative writing practice.", "difficulty": "medium"},
    ],
}


# ─── Mood Analysis ─────────────────────────────────────────────────────────────

POSITIVE_WORDS = {
    "great", "amazing", "awesome", "wonderful", "happy", "excited", "motivated", "productive",
    "focused", "strong", "energetic", "fantastic", "excellent", "good", "love", "enjoyed",
    "accomplished", "proud", "grateful", "refreshed", "energized", "calm", "peaceful", "joy",
    "brilliant", "fantastic", "thrilled", "delighted", "inspired", "confident", "healthy",
    "fit", "rested", "improved", "succeeded", "peace", "progress", "mindful", "relief", "relieved",
    "satisfied", "glad", "cheerful", "happy", "accomplish", "proudly", "grateful", "outstanding",
}

NEGATIVE_WORDS = {
    "bad", "tired", "exhausted", "lazy", "stressed", "anxious", "sad", "depressed", "difficult",
    "hard", "struggle", "failed", "missed", "skip", "skipped", "awful", "terrible", "horrible",
    "unmotivated", "frustrated", "bored", "overwhelmed", "sick", "pain", "hurt", "disappointed",
    "worried", "nervous", "angry", "upset", "miserable", "drained", "stressful", "waste",
    "useless", "slow", "fatigue", "headache", "guilty", "regret", "unproductive", "fail",
    "straining", "unfocused", "struggled", "disappointing", "annoyed", "annoying",
}

NEGATIONS = {
    "not", "no", "never", "dont", "didnt", "wasnt", "cant", "cannot", "havent", "hadnt", "isnt", "arent",
    "shouldnt", "couldnt", "wouldnt", "wont", "neither", "nor", "lack", "lacked", "lacking", "without"
}


def analyze_mood(text: str) -> float:
    """Return mood score: -1.0 (very negative) to 1.0 (very positive)."""
    if not text:
        return 0.0

    # Clean text: remove punctuation except spaces and apostrophes, lowercase it
    cleaned_text = re.sub(r"[^\w\s']", "", text.lower())
    words = cleaned_text.split()

    pos_score = 0
    neg_score = 0

    for i, word in enumerate(words):
        # Normalize word (remove apostrophes for dict checks, e.g., don't -> dont)
        norm_word = word.replace("'", "")

        is_positive = norm_word in POSITIVE_WORDS
        is_negative = norm_word in NEGATIVE_WORDS

        if not is_positive and not is_negative:
            continue

        # Check for negation in preceding 2 words
        negated = False
        for offset in (1, 2):
            if i - offset >= 0:
                prev_word = words[i - offset].replace("'", "")
                if prev_word in NEGATIONS:
                    negated = True
                    break

        if is_positive:
            if negated:
                neg_score += 1
            else:
                pos_score += 1
        elif is_negative:
            if negated:
                pos_score += 1
            else:
                neg_score += 1

    total = pos_score + neg_score
    if total == 0:
        return 0.0
    return round((pos_score - neg_score) / total, 2)


def get_daily_quote(day_of_year: int) -> dict:
    """Return a deterministic daily quote based on day of year."""
    return QUOTES[day_of_year % len(QUOTES)]


def get_suggestions(existing_categories: List[str], avg_mood: float = 0.0) -> List[dict]:
    """Suggest habits based on mood trend and missing categories."""
    suggestions = []
    covered = set(existing_categories)
    
    # Priority categories based on mood
    if avg_mood < -0.2:
        priority_categories = ["mental_health", "social", "health"]
    elif avg_mood > 0.2:
        priority_categories = ["learning", "creativity", "productivity"]
    else:
        priority_categories = []
        
    # First add from priority categories based on mood
    for cat in priority_categories:
        habits = SUGGESTIONS_BY_CATEGORY.get(cat, [])
        for h in habits[:2]:
            entry = {**h, "category": cat}
            if entry not in suggestions:
                suggestions.append(entry)
                
    # Then suggest from categories not yet used
    for cat, habits in SUGGESTIONS_BY_CATEGORY.items():
        if cat not in covered and cat not in priority_categories:
            for h in habits[:1]:
                suggestions.append({**h, "category": cat})

    # Fill remaining from anywhere up to 8
    for cat in covered:
        if len(suggestions) >= 8: break
        cat_suggestions = SUGGESTIONS_BY_CATEGORY.get(cat, [])
        for h in cat_suggestions:
            entry = {**h, "category": cat}
            if entry not in suggestions:
                suggestions.append(entry)

    return suggestions[:8]
