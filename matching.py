from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_description_match(desc1, desc2):
    if not desc1 or not desc2:
        return 0.0

    desc1 = desc1.lower().strip()
    desc2 = desc2.lower().strip()

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([desc1, desc2])
    score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])

    return round(float(score[0][0]), 2)


def calculate_location_match(location1, location2):
    if not location1 or not location2:
        return 0.0

    location1 = location1.lower().strip()
    location2 = location2.lower().strip()

    if location1 == location2:
        return 1.0

    if location1 in location2 or location2 in location1:
        return 0.7

    return 0.0


def calculate_total_match(desc_score, location_score, image_score=0.0):
    DESC_WEIGHT = 0.5
    LOCATION_WEIGHT = 0.3
    IMAGE_WEIGHT = 0.2

    total = (
        desc_score * DESC_WEIGHT +
        location_score * LOCATION_WEIGHT +
        image_score * IMAGE_WEIGHT
    )

    return round(total, 2)