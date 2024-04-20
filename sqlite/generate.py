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
    for _ in range(num_doctors):
        name = faker.name()
        specialization = faker.job()
        cursor.execute(
            "INSERT INTO doctors (name, specialization) VALUES (?, ?)",
            (name, specialization),
        )


def generate_patients(cursor, num_patients, num_doctors):
    faker = Faker()
    for _ in range(num_patients):
        name = faker.name()
        age = random.randint(0, 100)
        doctor_id = random.randint(1, num_doctors) if num_doctors > 0 else None
        cursor.execute(
            "INSERT INTO patients (name, age, doctor_id) VALUES (?, ?, ?)",
            (name, age, doctor_id),
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
    generate_doctors(cursor, num_doctors)
    generate_patients(cursor, num_patients, num_doctors)

    # Commit changes and close connection
    connection.commit()
    connection.close()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <num_doctors> <num_patients>")
        sys.exit(1)

    num_doctors = int(sys.argv[1])
    num_patients = int(sys.argv[2])
    main(num_doctors, num_patients)
