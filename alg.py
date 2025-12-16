# file for student recommendation algorithm (advanced feature)
import json
import os
import numpy as np
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Result
from sklearn.preprocessing import OneHotEncoder, MultiLabelBinarizer
from sentence_transformers import SentenceTransformer
from typing import Optional
# from database import db
# from sklearn.decomposition import PCA
# from sklearn.metrics.pairwise import cosine_similarity
# from sklearn.feature_extraction.text import TfidfVectorizer
# from scipy.sparse import hstack, csr_matrix, vstack
# from flask import Flask

# for runtime profile analysis
import time, cProfile, pstats
from contextlib import contextmanager

DATABASE_URI = os.environ.get(
    "DATABASE_URI",
    "mysql+pymysql://jrelling:bananas@localhost/jrelling"
)

# -- For user sliders --
DEFAULT_ALG_WEIGHTS = {
    "academics": 1.0,
    "professional": 1.0,
    "background": 1.0,
}

# to catch weight keys that don't match above
ALLOWED_WEIGHT_KEYS = set(DEFAULT_ALG_WEIGHTS.keys())

# where embeddings will be stored
EMBEDDING_TABLE = "StudentEmbeddings"

# dimensions for PCA
# PCA_DIMS = 32

# db engine instance --> UPDATE: switched to passing in engine directly in app.py
# engine = create_engine(DATABASE_URI, future=True)

# -- MySQL functions -- (currently unused)
def ensure_embeddings_table(engine):
    create_sql = f"""
    CREATE TABLE IF NOT EXISTS {EMBEDDING_TABLE} (
        NDID CHAR(9) PRIMARY KEY,
        vector JSON NOT NULL
    );
    """
    with engine.begin() as conn:
        conn.execute(text(create_sql))

def load_students(engine):
    students = {}
    with engine.connect() as conn:
        q = text("SELECT NDID, major, minor, hometown, dorm FROM Student")
        res: Result = conn.execute(q)
        for row in res.mappings():
            ndid = row["NDID"]
            students[ndid] = {
                "NDID": ndid,
                "major": row.get("major") or "",
                "minor": row.get("minor") or "",
                "hometown": row.get("hometown") or "",
                "dorm": row.get("dorm") or "",
                "clubs": [],
                "courses": [],
                "internships": [],
            }

        # loading courses -> storing in students dict
        q_courses = text(
            "SELECT s.FK_NDID as NDID, s.FK_CRN as crn FROM StudentTakesCourse s"
        )
        res = conn.execute(q_courses)
        for row in res.mappings():
            ndid = row["NDID"]
            crn = row["crn"]
            if ndid in students and crn:
                students[ndid]["courses"].append(crn)

        # loading internships
        q_intern = text("SELECT FK_NDID as NDID, company FROM Internship")
        res = conn.execute(q_intern)
        for row in res.mappings():
            ndid = row["NDID"]
            comp = row["company"]
            if ndid in students and comp:
                students[ndid]["internships"].append(comp)

        # loading clubs
        q_clubs = text("SELECT FK_NDID as NDID, FK_club_name as club_name FROM StudentInClub")
        res = conn.execute(q_clubs)
        for row in res.mappings():
            ndid = row["NDID"]
            club_name = row["club_name"]
            club_name = club_name.strip().lower()
            if ndid in students and club_name:
                students[ndid]["clubs"].append(club_name)

        all_students = [students[k] for k in sorted(students.keys())]
        return all_students

def save_embeddings_to_db(students, reduced_student_vectors, engine, table_name="student_embeddings"):
    insert_sql = text(f"""
        INSERT INTO {table_name} (NDID, vector)
        VALUES (:NDID, :vector)
        ON DUPLICATE KEY UPDATE vector = :vector;
    """)

    with engine.begin() as conn:
        for student, v in zip(students, reduced_student_vectors):
            ndid = student["NDID"]
            v_json = json.dumps(v.tolist())

            conn.execute(insert_sql, {
                "NDID": ndid,
                "vector": v_json
            })

def load_student_embedding(ndid, engine, table_name="StudentEmbeddings"):
    query = text(f"""
        SELECT vector FROM {table_name}
        WHERE NDID = :NDID
    """)

    with engine.connect() as conn:
        res = conn.execute(query, {"NDID": ndid}).fetchone()
    
    if not res:
        return None
    
    return np.array(json.loads(res[0]))

def load_student_embeddings(engine, table_name="StudentEmbeddings"):
    query = text(f"SELECT NDID, vector FROM {table_name}")

    ndids = []
    vectors = []

    with engine.connect() as conn:
        res = conn.execute(query)
        for row in res.mappings():
            ndids.append(row["NDID"])
            vectors.append(json.loads(row["vector"]))

    return ndids, np.array(vectors)

# -- User Weight Functions --
def load_user_weights(ndid, engine):
    query = text(f"SELECT weights FROM UserSimilarityPreferences WHERE NDID = :NDID")

    with engine.connect() as conn:
        row = conn.execute(query, {"NDID": ndid}).fetchone()

    if not row or not row[0]:
        return DEFAULT_ALG_WEIGHTS.copy()
    
    try:
        raw = json.loads(row[0])
        stored = {}
        for k, v in raw.items():
            if k in ALLOWED_WEIGHT_KEYS:
                try:
                    stored[k] = float(v)
                except (TypeError, ValueError):
                    continue
    except Exception:
        return DEFAULT_ALG_WEIGHTS.copy()

    merged = DEFAULT_ALG_WEIGHTS.copy()
    merged.update(stored)
    return merged
    
def save_user_weights(ndid, weights, engine):
    query = text(f"INSERT INTO UserSimilarityPreferences (NDID, weights) VALUES (:NDID, :weights) ON DUPLICATE KEY UPDATE weights = :weights")

    filtered = {}
    for k, v in (weights or {}).items():
        if k in ALLOWED_WEIGHT_KEYS:
            try:
                filtered[k] = float(v)
            except (TypeError, ValueError):
                continue

    if not filtered:
        filtered = DEFAULT_ALG_WEIGHTS.copy()

    with engine.begin() as conn:
        conn.execute(query, {
            "NDID": ndid,
            "weights": json.dumps(filtered)
        })

# -- Algorithm functions --
def fit_encoders(students):
    # load sentence transformer model (pretrained)
    model = SentenceTransformer("all-MiniLM-L6-v2")

    # 1. build vectors -> embedding plan on google doc
    hometowns = [[student["hometown"]] for student in students]
    dorms = [[student["dorm"]] for student in students]
    
    hometown_encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    dorm_encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)

    clubs = [student["clubs"] for student in students]
    courses = [student["courses"] for student in students]
    internships = [student["internships"] for student in students]

    clubs_mlb = MultiLabelBinarizer()
    courses_mlb = MultiLabelBinarizer()
    internships_mlb = MultiLabelBinarizer()

    # 2. fit on full data set -> ex: MLB.fit
    hometown_encoder.fit(hometowns)
    dorm_encoder.fit(dorms)

    clubs_mlb.fit(clubs)
    courses_mlb.fit(courses)
    internships_mlb.fit(internships) 

    N = len(students)

    # Getting count of each course, club, internship for rarity weighting
    course_counts = np.array(courses_mlb.transform(courses).sum(axis=0)).flatten()
    club_counts = np.array(clubs_mlb.transform(clubs).sum(axis=0)).flatten()
    internship_counts = np.array(internships_mlb.transform(internships).sum(axis=0)).flatten()

    # Calculating IDF (inverse document frequency)
    course_idf = np.log(N / (1 + course_counts))
    club_idf = np.log(N / (1 + club_counts))
    internship_idf = np.log(N / (1 + internship_counts))

    encoders = {
        "model": model,
        "hometown": hometown_encoder,
        "dorm": dorm_encoder,
        "clubs": clubs_mlb,
        "courses": courses_mlb,
        "internships": internships_mlb,
        "course_idf": course_idf,
        "club_idf": club_idf,
        "internship_idf": internship_idf
    }

    return encoders

# helper for average embedding (for clubs and internships)
def embed_avg(model, texts):
    if not texts:
        return np.zeros(model.get_sentence_embedding_dimension())
    embeddings = model.encode(texts)
    return np.mean(embeddings, axis=0)

# helper for group normalization
def normalize_vec(vec):
    norm = np.linalg.norm(vec)
    return vec if norm == 0 else vec / norm

def encode_student(student, encoders):
    model = encoders["model"]
    
    # 3. 1 high dimensional vector per student
    # Semantic embeddings
    major_embedding = normalize_vec(model.encode(student["major"]))
    minor_embedding = normalize_vec(model.encode(student["minor"]))

    club_embedding = normalize_vec(embed_avg(model, student["clubs"]))
    internship_embedding = normalize_vec(embed_avg(model, student["internships"]))

    hometown_vec = encoders["hometown"].transform([[student["hometown"]]]).flatten()
    hometown_vec = normalize_vec(hometown_vec)
    dorm_vec = encoders["dorm"].transform([[student["dorm"]]]).flatten()
    dorm_vec = normalize_vec(dorm_vec)

    # For rarity weighting, multiply encoded vector by particular feature idf (calculated at encoding)
    clubs_vec = encoders["clubs"].transform([student["clubs"]]).flatten()
    clubs_vec = clubs_vec * encoders["club_idf"]
    clubs_vec = normalize_vec(clubs_vec)

    courses_vec = encoders["courses"].transform([student["courses"]]).flatten()
    courses_vec = courses_vec * encoders["course_idf"]
    courses_vec = normalize_vec(courses_vec)

    internships_vec = encoders["internships"].transform([student["internships"]]).flatten()
    internships_vec = internships_vec * encoders["internship_idf"]
    internships_vec = normalize_vec(internships_vec)

    return {
        "academics": np.hstack([major_embedding, minor_embedding, courses_vec]),
        "professional": np.hstack([clubs_vec, internships_vec, club_embedding, internship_embedding]),
        "background": np.hstack([hometown_vec, dorm_vec]),
        # "semantic": np.hstack([club_embedding, internship_embedding]),
    }

def encode_all_students(students, encoders):
    student_vectors = {}

    for student in students:
        student_vectors[student["NDID"]] = encode_student(student, encoders)

    return student_vectors

def compute_cosine(a, b):
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def weighted_similarity(vectors1, vectors2, weights):
    score = 0.0
    denom = 0.0

    for key, w in weights.items():
        if w <=0 or key not in vectors1:
            continue
        similarity = compute_cosine(vectors1[key], vectors2[key])
        score += w * similarity
        denom += w

    return score / denom if denom > 0 else 0.0  # handle default case
    
def return_similarities_weighted(user_id, engine, weights, n=None):
    students = load_students(engine)
    encoders = fit_encoders(students)

    encoded_students = encode_all_students(students, encoders)

    if user_id not in encoded_students:
        raise ValueError("User not found")
    
    user_vectors = encoded_students[user_id]
    
    results = []
    for ndid, vectors in encoded_students.items():
        if ndid == user_id:
            continue
        score = weighted_similarity(user_vectors, vectors, weights)
        results.append((ndid, score))
    
    results.sort(key=lambda x: x[1], reverse=True)
    return results if not n else results[:n]

def rebuild_on_new_user(engine):
    students = load_students(engine)
    encoders = fit_encoders(students)
    encoded_students = encode_all_students(students, encoders)

    print("Rebuilding embeddings for", len(students), "students")

    return encoded_students

# -- Testing --

@contextmanager
def timed(label, times):
    t0 = time.perf_counter()
    yield
    times[label] = time.perf_counter() - t0
    print(f"[timed] {label}: {times[label]:.3f}s")

def main():
    times = {}

    with timed("load_students", times):
        test_engine = create_engine(DATABASE_URI, future=True)
        students = load_students(test_engine)
    
    with timed("fit_encoders", times):
        encoders = fit_encoders(students)
    
    model = encoders["model"]
    _orig_encode = model.encode
    encode_stats = {"calls": 0, "secs": 0.0, "items": 0}
    
    def _wrapped_encode(texts, *args, **kwargs):
        t0 = time.perf_counter()
        out = _orig_encode(texts, *args, **kwargs)
        dt = time.perf_counter() - t0
        n_items = len(texts) if isinstance(texts, (list, tuple)) else 1
        encode_stats["calls"] += 1
        encode_stats["secs"] += dt
        encode_stats["items"] += n_items
        return out
    
    model.encode = _wrapped_encode

    prof = cProfile.Profile()
    prof.enable()
    with timed("encode_all_students", times):
        encoded = encode_all_students(students, encoders)

    # test user
    test_ndid = next(iter(encoded.keys()))
    w = DEFAULT_ALG_WEIGHTS.copy()
    with timed("weighted_top10", times):
        _ = return_similarities_weighted(test_ndid, test_engine, w, n=10)
    prof.disable()

    # Test results
    dims = {k: len(v) for k, v in encoded[test_ndid].items()}
    print(f"\nSummary:")
    print(f"- students: {len(encoded)}")
    print(f"- dims: {dims} (total={sum(dims.values())})")
    if encode_stats["calls"]:
        avg_batch = encode_stats["items"] / encode_stats["calls"]
    else:
        avg_batch = 0.0
    print(f"- SentenceTransformer.encode: calls={encode_stats['calls']}, "
          f"items={encode_stats['items']}, time={encode_stats['secs']:.3f}s, "
          f"avg_batch={avg_batch:.2f}")

    print("\nPhase timings (s):")
    for k in ["load_students", "fit_encoders", "encode_all_students", "weighted_top10"]:
        if k in times:
            print(f"  {k:>20}: {times[k]:.3f}")

    print("\nTop cProfile entries (cumtime):")
    pstats.Stats(prof).strip_dirs().sort_stats("cumtime").print_stats(30)

if __name__ == "__main__":
    main()
