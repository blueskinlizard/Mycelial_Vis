import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from mycelium.environment import Environment
from mycelium.network import AdvancedMyceliumNetwork


def generate_learning_data():
    print("=" * 60)
    print("Generating Learning Metrics Data")
    print("=" * 60)

    env = Environment(dimensions=2, size=1.0)

    network = AdvancedMyceliumNetwork(
        environment=env, input_size=2, output_size=1, initial_nodes=12
    )

    inputs = [[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]]

    targets = [[0.0], [1.0], [1.0], [0.0]]

    print("\nTraining for 100 epochs...")

    training_data = {"epochs": [], "rewards": [], "losses": [], "explorationRate": []}

    exploration_rate = 1.0

    for epoch in range(100):
        errors = network.train(inputs, targets, epochs=1, learning_rate=0.1)

        avg_error = errors[0] if errors else 0
        reward = 1.0 - avg_error

        training_data["epochs"].append(epoch)
        training_data["rewards"].append(reward)
        training_data["losses"].append(avg_error)
        training_data["explorationRate"].append(exploration_rate)

        exploration_rate *= 0.995

        if epoch % 20 == 0:
            print(f"  Epoch {epoch}: Error = {avg_error:.4f}, Reward = {reward:.4f}")

    print("\nGenerating Q-table simulation...")
    q_table = {}
    for i in range(50):
        state_key = f"state_{i}"
        q_table[state_key] = [0.1 * j for j in range(4)]

    learning_output = {
        "trainingData": training_data,
        "currentEpisode": 100,
        "qTable": q_table,
    }

    output_path = "Mycelial_Vis/public/learning_data.json"
    with open(output_path, "w") as f:
        json.dump(learning_output, f, indent=2)

    print(f"Generated {len(training_data['epochs'])} training epochs")
    print(f"Q-table size: {len(q_table)}")
    print(f"Final reward: {training_data['rewards'][-1]:.4f}")


if __name__ == "__main__":
    generate_learning_data()
