import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from mycelium.environment import Environment
from mycelium.network import AdvancedMyceliumNetwork


def train_xor_network():
    print("=" * 60)
    print("Training Mycelium Network on XOR Problem")
    print("=" * 60)

    env = Environment(dimensions=2, size=1.0)

    network = AdvancedMyceliumNetwork(
        environment=env, input_size=2, output_size=1, initial_nodes=12
    )

    print(f"\nCreated network with {len(network.nodes)} nodes")

    inputs = [[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]]

    targets = [[0.0], [1.0], [1.0], [0.0]]

    print("\nTraining for 50 epochs...")
    errors = network.train(inputs, targets, epochs=50, learning_rate=0.1)

    print(f"\nTraining complete!")
    print(f"Initial error: {errors[0]:.4f}")
    print(f"Final error: {errors[-1]:.4f}")

    print("\nTesting network:")
    for inp, target in zip(inputs, targets):
        output = network.forward(inp)
        print(f"  Input: {inp} -> Output: {output[0]:.3f} (Target: {target[0]})")

    print("\nExporting trained network...")
    vis_data = network.visualize_network(
        filename="Mycelial_Vis/public/trained_network.json"
    )

    print(f"Network has {vis_data['metrics']['total_nodes']} nodes")
    print(f"Total connections: {vis_data['metrics']['total_connections']}")


if __name__ == "__main__":
    train_xor_network()
