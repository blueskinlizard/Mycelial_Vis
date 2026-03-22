import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from mycelium.environment import Environment
from mycelium.network import AdvancedMyceliumNetwork


def generate_simple_network():
    print("Creating mycelium network...")

    env = Environment(dimensions=2, size=1.0)

    network = AdvancedMyceliumNetwork(
        environment=env, input_size=3, output_size=2, initial_nodes=15
    )

    print(f"Created network with {len(network.nodes)} nodes")

    print("\nRunning 20 forward passes...")
    for i in range(20):
        inputs = [0.5 + i * 0.02, 0.3, 0.7 - i * 0.01]
        outputs = network.forward(inputs)

        if i % 5 == 0:
            print(f"  Iteration {i+1}: Outputs = [{outputs[0]:.3f}, {outputs[1]:.3f}]")

    print("\nExporting visualization data...")
    vis_data = network.visualize_network(
        filename="Mycelial_Vis/public/network_data.json"
    )

    print(f"Network has {vis_data['metrics']['total_nodes']} nodes")
    print(f"Total connections: {vis_data['metrics']['total_connections']}")


if __name__ == "__main__":
    generate_simple_network()
