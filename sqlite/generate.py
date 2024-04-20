import os
import random
import sqlite3
import sys

from faker import Faker


def create_tables(cursor):
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            specialization TEXT NOT NULL
        )
    """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            doctor_id INTEGER,
            FOREIGN KEY (doctor_id) REFERENCES doctors (id)
        )
    """
    )


def generate_doctors(cursor, num_doctors):
    faker = Faker()
    doctors = []
    for _ in range(num_doctors):
        name = faker.name()
        specialization = faker.job()
        doctors.append((name, specialization))
    cursor.executemany(
        "INSERT INTO doctors (name, specialization) VALUES (?, ?)", doctors
    )


def generate_patients(cursor, num_patients, num_doctors):
    faker = Faker()
    patients = []
    for _ in range(num_patients):
        name = faker.name()
        age = random.randint(0, 100)
        doctor_id = random.randint(1, num_doctors) if num_doctors > 0 else None
        patients.append((name, age, doctor_id))
    cursor.executemany(
        "INSERT INTO patients (name, age, doctor_id) VALUES (?, ?, ?)", patients
    )


def main(num_doctors, num_patients):
    db_filename = "hospital.db"

    # Delete the existing database file if it exists
    if os.path.exists(db_filename):
        os.remove(db_filename)

    # Create a new database and tables
    connection = sqlite3.connect(db_filename)
    cursor = connection.cursor()
    create_tables(cursor)

    # Generate random data for doctors and patients
    page_size = 100_000
    for x in range(0, num_doctors, page_size):
        print(f"Doctors {x/num_doctors: .5%}")
        temp = min(page_size, num_doctors - x)
        generate_doctors(cursor, temp)
        connection.commit()
    for x in range(0, num_patients, page_size):
        print(f"Patients {x/num_patients: .5%}")
        temp = min(page_size, num_patients - x)
        generate_patients(cursor, temp, num_doctors)
        connection.commit()

    # Commit changes and close connection
    connection.close()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <num_doctors> <num_patients>")
        sys.exit(1)

    num_doctors = int(sys.argv[1])
    num_patients = int(sys.argv[2])
    main(num_doctors, num_patients)
