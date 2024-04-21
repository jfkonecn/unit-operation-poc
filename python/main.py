import json
import os
import sqlite3


def create_connection():
    script_path = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(script_path, "..", "sqlite", "hospital.db")
    return sqlite3.connect(db_path)


def get_just_doctors_at_once(page: int, page_size: int):
    connection = create_connection()

    cursor = connection.cursor()

    offset = (page - 1) * page_size

    query = """
    SELECT d.id, d.name, d.specialization
    FROM doctors d
    ORDER BY d.name
    LIMIT ? OFFSET ?
    """
    cursor.execute(query, (page_size, offset))

    rows = cursor.fetchall()
    connection.close()
    return rows


def get_patients_by_doctor_ids(ids):
    def get_chunks(lst, chunk_size):
        for i in range(0, len(lst), chunk_size):
            yield lst[i : i + chunk_size]

    connection = create_connection()

    cursor = connection.cursor()

    rows = []

    for chunk in get_chunks(ids, 100_000):
        query = f"""
        SELECT p.doctor_id, p.name, p.age
        FROM patients p
        WHERE doctor_id IN ({','.join('?'*len(chunk))})
        """
        cursor.execute(query, chunk)
        for row in cursor:
            rows.append(row)

    connection.close()
    return rows


def in_memory_join(page: int, page_size: int):
    doctor_rows = get_just_doctors_at_once(page, page_size)
    doctors = {}
    doctors_ids = []
    for row in doctor_rows:
        doc_id, doc_name, specialization = row
        doctors_ids.append(doc_id)
        if doc_id not in doctors:
            doctors[doc_id] = {
                "name": doc_name,
                "specialization": specialization,
                "patients": [],
            }
    patients_rows = get_patients_by_doctor_ids(doctors_ids)
    for row in patients_rows:
        doc_id, pat_name, pat_age = row
        if pat_name and pat_age:
            doctors[doc_id]["patients"].append({"name": pat_name, "age": pat_age})

    return doctors


def get_all_at_once(page: int, page_size: int):
    connection = create_connection()

    cursor = connection.cursor()

    offset = (page - 1) * page_size

    query = """
    SELECT d.id, d.name, d.specialization, p.name, p.age
    FROM doctors d
    LEFT JOIN patients p ON d.id = p.doctor_id
    ORDER BY d.name, p.name
    LIMIT ? OFFSET ?
    """
    cursor.execute(query, (page_size, offset))

    rows = cursor.fetchall()
    connection.close()
    return rows


def row_to_doctor(row, doctors):
    doc_id, doc_name, specialization, pat_name, pat_age = row
    if doc_id not in doctors:
        doctors[doc_id] = {
            "name": doc_name,
            "specialization": specialization,
            "patients": [],
        }
    if pat_name and pat_age:
        doctors[doc_id]["patients"].append({"name": pat_name, "age": pat_age})


def map_joined_tables(rows):
    doctors = {}
    for row in rows:
        row_to_doctor(row, doctors)
    return doctors


def query_all_and_map(page: int, page_size: int):
    rows = get_all_at_once(page, page_size)
    doctors = map_joined_tables(rows)
    return doctors


def get_one_row_at_a_time(page: int, page_size: int):
    connection = create_connection()

    cursor = connection.cursor()

    offset = (page - 1) * page_size

    query = """
    SELECT d.id, d.name, d.specialization, p.name, p.age
    FROM doctors d
    LEFT JOIN patients p ON d.id = p.doctor_id
    ORDER BY d.name, p.name
    LIMIT ? OFFSET ?
    """
    cursor.execute(query, (page_size, offset))

    doctors = {}
    for row in cursor:
        row_to_doctor(row, doctors)

    connection.close()
    return doctors


if __name__ == "__main__":
    doctors = query_all_and_map(1, 1)
    for doctor in doctors.values():
        print(json.dumps(doctor, indent=4))

    doctors = get_one_row_at_a_time(1, 1)
    for doctor in doctors.values():
        print(json.dumps(doctor, indent=4))

    doctors = in_memory_join(1, 1)
    for doctor in doctors.values():
        print(json.dumps(doctor, indent=4))
