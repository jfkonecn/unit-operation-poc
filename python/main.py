import json
import os
import sqlite3


def get_all(page: int, page_size: int):
    script_path = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(script_path, "..", "sqlite", "hospital.db")
    connection = sqlite3.connect(db_path)

    cursor = connection.cursor()

    offset = (page - 1) * page_size

    query = """
    SELECT d.name, d.specialization, p.name, p.age
    FROM doctors d
    LEFT JOIN patients p ON d.id = p.doctor_id
    ORDER BY d.name, p.name
    LIMIT ? OFFSET ?
    """
    cursor.execute(query, (page_size, offset))

    rows = cursor.fetchall()
    connection.close()
    return rows


def query_data(page: int, page_size: int):
    rows = get_all(page, page_size)
    doctors = {}
    for row in rows:
        doc_name, specialization, pat_name, pat_age = row
        if doc_name not in doctors:
            doctors[doc_name] = {
                "name": doc_name,
                "specialization": specialization,
                "patients": [],
            }
        if pat_name and pat_age:
            doctors[doc_name]["patients"].append({"name": pat_name, "age": pat_age})

    return doctors


if __name__ == "__main__":
    doctors = query_data(1, 50)
    for doctor in doctors.values():
        print(json.dumps(doctor, indent=4))
