import json
import sqlite3


def query_data():
    # Connect to the SQLite database
    connection = sqlite3.connect("../sqlite/hospital.db")
    cursor = connection.cursor()

    # Query to fetch doctors and their patients
    query = """
    SELECT d.name, d.specialization, p.name, p.age
    FROM doctors d
    LEFT JOIN patients p ON d.id = p.doctor_id
    ORDER BY d.name, p.name
    """
    cursor.execute(query)

    # Fetch all results
    rows = cursor.fetchall()

    # Organizing data into a structured dictionary
    doctors = {}
    for row in rows:
        doc_name, specialization, pat_name, pat_age = row
        if doc_name not in doctors:
            doctors[doc_name] = {
                "name": doc_name,
                "specialization": specialization,
                "patients": [],
            }
        if pat_name and pat_age:  # There might be doctors with no patients
            doctors[doc_name]["patients"].append({"name": pat_name, "age": pat_age})

    # Close database connection
    connection.close()

    # Print each doctor and their patients in the desired format
    for doctor in doctors.values():
        print(json.dumps(doctor, indent=4))


if __name__ == "__main__":
    query_data()
