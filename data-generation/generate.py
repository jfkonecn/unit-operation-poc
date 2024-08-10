import random
import sys

from faker import Faker


def generate_patients(num_patients: int):
    faker = Faker()
    print("name,age")
    for _ in range(num_patients):
        name: str = faker.name()
        age = random.randint(0, 100)
        print(f"{name},{age}")


if __name__ == "__main__":
    random.seed(1)
    if len(sys.argv) != 2:
        print("Usage: python generate.py <num_patients>")
        sys.exit(1)

    num_patients = int(sys.argv[1])
    generate_patients(num_patients)
