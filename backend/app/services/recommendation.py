import re

from app.models.club import Club, EnrollmentStatus
from app.schemas.ai import RecommendationItem, RecommendationRequest

TOKEN_PATTERN = re.compile(r"[\w+#.-]+", re.IGNORECASE)


def _tokens(values: list[str]) -> set[str]:
    joined = " ".join(values).lower()
    return {token for token in TOKEN_PATTERN.findall(joined) if len(token) > 1}


def recommend_clubs(payload: RecommendationRequest, clubs: list[Club]) -> list[RecommendationItem]:
    profile_tokens = _tokens(payload.interests + payload.skills)
    ranked: list[RecommendationItem] = []

    for club in clubs:
        score = 0
        reasons: list[str] = []

        if club.age_min <= payload.age <= club.age_max:
            score += 45
            reasons.append(f"age {payload.age} fits the {club.age_min}-{club.age_max} age group")
        else:
            distance = min(abs(payload.age - club.age_min), abs(payload.age - club.age_max))
            score += max(0, 20 - distance * 4)
            reasons.append("age is near the target group")

        club_tokens = _tokens([club.name, club.category, club.description])
        matches = sorted(profile_tokens.intersection(club_tokens))
        if matches:
            score += min(35, len(matches) * 12)
            reasons.append("matches " + ", ".join(matches[:4]))

        if club.available_seats > 0 and club.enrollment_status == EnrollmentStatus.OPEN:
            score += 15
            reasons.append("available seats are open")
        elif club.enrollment_status == EnrollmentStatus.WAITLIST:
            score += 5
            reasons.append("waitlist enrollment is possible")

        if not matches and club.category.lower() in {"robotics", "programming", "design", "mathematics"}:
            score += 5

        explanation = "Recommended because " + "; ".join(reasons) + "."
        ranked.append(
            RecommendationItem(
                club_id=club.id,
                club_name=club.name,
                category=club.category,
                score=min(score, 100),
                explanation=explanation,
            )
        )

    return sorted(ranked, key=lambda item: item.score, reverse=True)[:5]
