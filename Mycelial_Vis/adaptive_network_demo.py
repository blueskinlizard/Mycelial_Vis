import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from mycelium.enhanced.adaptive_network import AdaptiveMyceliumNetwork
from mycelium.enhanced.resource import ResourceType
from mycelium.enhanced.rich_environment import RichEnvironment


def generate_adaptive_network():
    print("=" * 60)
    print("Creating Adaptive Mycelium Network")
    print("=" * 60)

    env = RichEnvironment(dimensions=2, size=1.0)

    env.add_nutrient_cluster(
        center=(0.3, 0.3),
        radius=0.2,
        resource_type=ResourceType.CARBON,
        total_amount=5.0,
    )

    env.add_nutrient_cluster(
        center=(0.7, 0.7),
        radius=0.15,
        resource_type=ResourceType.NITROGEN,
        total_amount=3.0,
    )

    print("\nCreating adaptive network...")
    network = AdaptiveMyceliumNetwork(
        environment=env, input_size=3, output_size=1, initial_nodes=18
    )

    print(f"Created network with {len(network.nodes)} nodes")

    print("\nRunning 30 iterations with adaptation...")
    for i in range(30):
        inputs = [0.5, 0.4 + i * 0.01, 0.6]
        outputs = network.forward(inputs)

        if i % 10 == 0:
            print(f"  Iteration {i+1}: Output = {outputs[0]:.3f}")

    stats = network.get_specialization_statistics()

    print(f"\nSpecialization Statistics:")
    print(f"  Total nodes: {stats['node_counts']['total']}")
    print(f"  Input nodes: {stats['node_counts']['input']}")
    print(f"  Output nodes: {stats['node_counts']['output']}")
    print(f"  Regular nodes: {stats['node_counts']['regular']}")

    for spec_type in ["storage", "processing", "sensor"]:
        if spec_type in stats["node_counts"] and stats["node_counts"][spec_type] > 0:
            print(
                f"  {spec_type.capitalize()} nodes: {stats['node_counts'][spec_type]}"
            )

    print("\nExporting adaptive network...")
    vis_data = network.visualize_network_data()

    import json

    with open("Mycelial_Vis/public//adaptive_network.json", "w") as f:
        json.dump(vis_data, f, indent=2)
    print(f"\nAdaptation metrics:")
    print(
        f"  Temperature adaptation: {stats['adaptation']['temperature_adaptation']:.3f}"
    )
    print(f"  Moisture adaptation: {stats['adaptation']['moisture_adaptation']:.3f}")


if __name__ == "__main__":
    generate_adaptive_network()
