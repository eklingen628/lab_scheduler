import requests                                                                                     
from datetime import date, timedelta
                                                                                                    
BASE_URL = "http://localhost:8000"


def post(path, body):
    res = requests.post(f"{BASE_URL}{path}", json=body)
    res.raise_for_status()
    return res.json()


def get_week_dates():
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    return [str(monday + timedelta(days=i)) for i in range(7)]


dates = get_week_dates()
print(f"Seeding week: {dates[0]} – {dates[6]}\n")

people = [
    post("/people", {"first_name": "Alice", "last_name": "Johnson",  "username": "ajohnson"}),
    post("/people", {"first_name": "Bob",   "last_name": "Martinez", "username": "bmartinez"}),
    post("/people", {"first_name": "Carol", "last_name": "Kim",      "username": "ckim"}),
]
print(f"Created {len(people)} people")



tasks_data = {
    "for_g1": [
        {"name": "Tensile Strength",  "type": "mechanical", "base_time": 2.5,  "scheduled_date": dates[0], "person_id": people[0]["id"], "position": 1},
        {"name": "Viscosity Test",    "type": "physical",   "base_time": 1.0,  "scheduled_date": dates[0], "person_id": people[1]["id"], "position": 1},
    ],

    "for_g2": [
        {"name": "pH Analysis",       "type": "chemical",   "base_time": 0.5,  "scheduled_date": dates[1], "person_id": people[0]["id"], "position": 2},
        {"name": "Thermal Cycling",   "type": "thermal",    "base_time": 4.0,  "scheduled_date": dates[1], "person_id": people[2]["id"], "position": 1},
    ],

    "for_g3": [
        {"name": "Particle Size",     "type": "physical",   "base_time": 1.5,  "scheduled_date": dates[2], "person_id": people[1]["id"], "position": 2},
        {"name": "Density Check",     "type": "physical",   "base_time": 0.75, "scheduled_date": dates[2], "person_id": people[2]["id"], "position": 2},
    ],

    "for_g4": [
        {"name": "Moisture Content",  "type": "chemical",   "base_time": 2.0,  "scheduled_date": dates[3], "person_id": people[0]["id"], "position": 3},
        {"name": "Color Measurement", "type": "optical",    "base_time": 1.0,  "scheduled_date": dates[3], "person_id": people[1]["id"], "position": 3},
        {"name": "Hardness Test",     "type": "mechanical", "base_time": 3.0,  "scheduled_date": dates[4], "person_id": people[2]["id"], "position": 3},
    ],

    "for_g5": [
        {"name": "Conductivity",      "type": "electrical", "base_time": 1.5,  "scheduled_date": dates[4], "person_id": people[0]["id"], "position": 4},
    ],

    "for_g6": [
        {"name": "Ash Content",       "type": "chemical",   "base_time": 2.2,  "scheduled_date": dates[5], "person_id": people[1]["id"], "position": 1},
        {"name": "Melting Point",     "type": "thermal",    "base_time": 1.8,  "scheduled_date": dates[5], "person_id": people[2]["id"], "position": 2},
    ],

    "for_g7": [
        {"name": "Refractive Index",  "type": "optical",    "base_time": 1.1,  "scheduled_date": dates[6], "person_id": people[0]["id"], "position": 1},
        {"name": "Compression Test",  "type": "mechanical", "base_time": 2.7,  "scheduled_date": dates[6], "person_id": people[1]["id"], "position": 2},
    ],

    "for_g8": [
        {"name": "Surface Tension",   "type": "physical",   "base_time": 1.4,  "scheduled_date": dates[1], "person_id": people[2]["id"], "position": 1},
        {"name": "Oxidation Stability","type": "chemical",  "base_time": 3.5,  "scheduled_date": dates[1], "person_id": people[0]["id"], "position": 2},
    ],

    "for_g9": [
        {"name": "UV Absorbance",     "type": "optical",    "base_time": 1.6,  "scheduled_date": dates[4], "person_id": people[1]["id"], "position": 1},
        {"name": "Shear Strength",    "type": "mechanical", "base_time": 2.9,  "scheduled_date": dates[4], "person_id": people[2]["id"], "position": 2},
    ],

    "for_g10": [
        {"name": "Dielectric Constant","type": "electrical","base_time": 2.3,  "scheduled_date": dates[5], "person_id": people[0]["id"], "position": 1},
        {"name": "Boiling Point",     "type": "thermal",    "base_time": 1.7,  "scheduled_date": dates[5], "person_id": people[1]["id"], "position": 2},
    ]
}

for group_name, tasks in tasks_data.items():
    group = post("/sample-test-groups", {"template_ids": [1], "sample_test_ids": []})
    print(f"Created sample test group id={group['id']}\n")

    for t in tasks:

        task = post("/tasks", {"sample_test_group_id": group["id"], **t})
        print(f"  {task['scheduled_date']}  {task['name']:<22}  person_id={task['person_id']}")

print("\nDone.")