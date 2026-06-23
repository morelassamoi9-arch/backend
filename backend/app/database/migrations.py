from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


SQLITE_COLUMNS = {
    "users": [
        ("is_active", "BOOLEAN NOT NULL DEFAULT 1"),
    ],
    "demandes": [
        ("reponse", "TEXT"),
    ],
    "reponses": [
        ("resume", "TEXT"),
        ("etapes", "TEXT"),
        ("documents_requis", "TEXT"),
        ("lieu", "VARCHAR(255)"),
        ("delai", "VARCHAR(100)"),
        ("cout", "VARCHAR(100)"),
        ("contacts", "TEXT"),
        ("source", "VARCHAR(50) NOT NULL DEFAULT 'crew_ai'"),
        ("updated_at", "DATETIME"),
    ],
}


def ensure_sqlite_schema(engine: Engine) -> None:
    if engine.dialect.name != "sqlite":
        return

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as connection:
        for table_name, columns in SQLITE_COLUMNS.items():
            if table_name not in existing_tables:
                continue

            existing_columns = {
                column["name"]
                for column in inspector.get_columns(table_name)
            }
            for column_name, column_type in columns:
                if column_name not in existing_columns:
                    connection.execute(
                        text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")
                    )

        connection.execute(text("UPDATE users SET is_active = 1 WHERE is_active IS NULL"))
        connection.execute(text("UPDATE users SET updated_at = created_at WHERE updated_at IS NULL"))
        connection.execute(text("UPDATE demandes SET updated_at = created_at WHERE updated_at IS NULL"))
        connection.execute(text("UPDATE reponses SET updated_at = created_at WHERE updated_at IS NULL"))
        connection.execute(text("UPDATE reponses SET resume = message WHERE resume IS NULL AND message IS NOT NULL"))
        connection.execute(
            text(
                "UPDATE demandes SET status = 'traitee' "
                "WHERE status = 'en_attente' "
                "AND id IN (SELECT demande_id FROM reponses)"
            )
        )
