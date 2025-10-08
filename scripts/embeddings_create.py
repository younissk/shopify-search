import os
from huggingface_hub import InferenceClient
import psycopg2
import psycopg2.extras as extras
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

print("DATABASE_URL:", os.environ.get("DATABASE_URL"))

client = InferenceClient(
    provider="hf-inference",
    api_key=os.environ["HF_TOKEN"],
)

source_sentence = "That is a happy person"
other_sentences = [
    "That is a happy dog",
    "That is a very happy person",
    "Today is a sunny day"
]

# The InferenceClient.feature_extraction method expects only one positional argument (the input(s)), and the model should be passed as a keyword argument.
# To embed multiple sentences, pass a list of sentences as the first argument.
embeddings = client.feature_extraction(
    [source_sentence],
    model="sentence-transformers/all-MiniLM-L6-v2",
)

print(len(embeddings[0]))

result = client.sentence_similarity(
    source_sentence,
    other_sentences,
    model="sentence-transformers/all-MiniLM-L6-v2",
)

print(result)


def _require_database_url() -> str:
    database_url = os.environ.get("DATABASE_URL", "").strip()
    if not database_url:
        raise SystemExit(
            "DATABASE_URL is not set. Set an IPv4-compatible Session Pooler URL "
            "(e.g., postgresql://postgres.<project_ref>:[PASSWORD]@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require)"
        )
    # Ensure SSL is required for Supabase and most hosted Postgres setups
    if "sslmode=" not in database_url:
        sep = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{sep}sslmode=require"
    return database_url


BATCH_SIZE = 512
TEXT_FIELD = "title"  # or combine fields if needed


def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i+n]


def main():
    db_url = _require_database_url()
    conn = psycopg2.connect(db_url)
    conn.autocommit = False

    with conn.cursor(cursor_factory=extras.DictCursor) as cur:
        cur.execute("""
          SELECT domain, product_id, COALESCE(title, '') AS text
          FROM public.products
          WHERE embedding IS NULL
        """)
        rows = cur.fetchall()

    total = len(rows)
    print(f"Rows to embed: {total}")
    if total == 0:
        conn.close()
        return

    for batch in tqdm(list(chunks(rows, BATCH_SIZE))):
        texts = [r["text"] for r in batch]
        embeddings = client.feature_extraction(
            texts, model="sentence-transformers/all-MiniLM-L6-v2")

        update_rows = [
            (emb.tolist(), r["domain"], r["product_id"])
            for emb, r in zip(embeddings, batch)
        ]

        # Use execute_values for efficient bulk updates
        with conn.cursor() as cur:
            extras.execute_values(
                cur,
                """
                UPDATE public.products AS p SET embedding = data.emb
                FROM (VALUES %s) AS data(emb, domain, product_id)
                WHERE p.domain = data.domain AND p.product_id = data.product_id
                """,
                update_rows,
                template="(%s::vector, %s, %s)",
                page_size=1000
            )
        conn.commit()

    conn.close()
    print("Done.")


if __name__ == "__main__":
    main()
