import json
import os
import random
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


def generate_ecosystem_data():
    print("=" * 60)
    print("Generating Ecosystem Data")
    print("=" * 60)

    print("\nCreating organisms...")

    organisms = []

    for i in range(15):
        organisms.append(
            {
                "id": f"plant_{i}",
                "type": "plant",
                "position": [random.random(), random.random()],
                "energy": random.uniform(0.6, 1.0),
                "size": random.uniform(0.5, 1.2),
                "age": random.randint(0, 50),
                "alive": True,
            }
        )

    for i in range(8):
        organisms.append(
            {
                "id": f"herbivore_{i}",
                "type": "herbivore",
                "position": [random.random(), random.random()],
                "energy": random.uniform(0.5, 0.9),
                "size": random.uniform(0.3, 0.8),
                "age": random.randint(0, 30),
                "alive": True,
            }
        )

    for i in range(5):
        organisms.append(
            {
                "id": f"decomposer_{i}",
                "type": "decomposer",
                "position": [random.random(), random.random()],
                "energy": random.uniform(0.4, 0.8),
                "size": random.uniform(0.2, 0.6),
                "age": random.randint(0, 40),
                "alive": True,
            }
        )

    print(f"  Created {len(organisms)} organisms")
    print(f"    - Plants: 15")
    print(f"    - Herbivores: 8")
    print(f"    - Decomposers: 5")

    print("\nGenerating population history...")

    population_history = []
    for t in range(50):
        plant_count = max(5, 15 + random.randint(-3, 3) - int(t * 0.1))
        herbivore_count = max(2, 8 + random.randint(-2, 2))
        decomposer_count = max(2, 5 + random.randint(-1, 2))

        population_history.append(
            {
                "time": t,
                "total": plant_count + herbivore_count + decomposer_count,
                "by_type": {
                    "plant": plant_count,
                    "herbivore": herbivore_count,
                    "decomposer": decomposer_count,
                },
                "births": random.randint(0, 3),
                "deaths": random.randint(0, 2),
            }
        )

    print(f"  Generated {len(population_history)} time steps")

    print("\nCalculating energy flows...")

    energy_flow = {
        "photosynthesis": random.uniform(20, 30),
        "consumption": random.uniform(10, 15),
        "decomposition": random.uniform(5, 10),
    }

    print(f"  Photosynthesis: {energy_flow['photosynthesis']:.2f}")
    print(f"  Consumption: {energy_flow['consumption']:.2f}")
    print(f"  Decomposition: {energy_flow['decomposition']:.2f}")

    ecosystem_output = {
        "organisms": organisms,
        "populationHistory": population_history,
        "energyFlow": energy_flow,
    }

    output_path = "Mycelial_Vis/public/ecosystem_data.json"
    with open(output_path, "w") as f:
        json.dump(ecosystem_output, f, indent=2)

    print(f"Total organisms: {len(organisms)}")
    print(f"Population history: {len(population_history)} time steps")


if __name__ == "__main__":
    generate_ecosystem_data()
