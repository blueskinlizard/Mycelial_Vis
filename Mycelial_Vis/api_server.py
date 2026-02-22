# this is a flask server to provide endpoints for the mycelial network data to our react frontend

import json
import os
import random
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from mycelium.enhanced.adaptive_network import AdaptiveMyceliumNetwork
from mycelium.enhanced.rich_environment import RichEnvironment
from mycelium.environment import Environment
from mycelium.network import AdvancedMyceliumNetwork

app = Flask(__name__)
CORS(app)

networks = {}
current_network_id = None


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Mycelium API is running"})


@app.route("/api/network/create", methods=["POST"])
def create_network():
    """Create a new mycelium network"""
    global current_network_id

    data = request.get_json()
    network_type = data.get("type", "basic")
    input_size = data.get("input_size", 3)
    output_size = data.get("output_size", 1)
    initial_nodes = data.get("initial_nodes", 20)
    use_rich_env = data.get("use_rich_environment", False)

    if use_rich_env:
        environment = RichEnvironment(dimensions=2, size=1.0)
    else:
        environment = Environment(dimensions=2, size=1.0)

    if network_type == "adaptive":
        network = AdaptiveMyceliumNetwork(
            environment=environment,
            input_size=input_size,
            output_size=output_size,
            initial_nodes=initial_nodes,
        )
    else:
        network = AdvancedMyceliumNetwork(
            environment=environment,
            input_size=input_size,
            output_size=output_size,
            initial_nodes=initial_nodes,
        )

    network_id = f"network_{len(networks)}"  # Store network w/ ID
    networks[network_id] = network
    current_network_id = network_id

    return jsonify(
        {
            "network_id": network_id,
            "type": network_type,
            "node_count": len(network.nodes),
            "connection_count": sum(len(n.connections) for n in network.nodes.values()),
        }
    )


@app.route("/api/network/<network_id>/visualize", methods=["GET"])
def get_network_visualization(network_id):
    """Get visualization data for a specific network"""
    if network_id not in networks:
        return jsonify({"error": "Network not found"}), 404

    network = networks[network_id]
    vis_data = network.visualize_network()

    return jsonify(vis_data)


@app.route("/api/network/<network_id>/forward", methods=["POST"])
def network_forward(network_id):
    """Run forward pass through the network"""
    if network_id not in networks:
        return jsonify({"error": "Network not found"}), 404

    data = request.get_json()
    inputs = data.get("inputs", [])

    network = networks[network_id]

    try:
        outputs = network.forward(inputs)
        vis_data = network.visualize_network()

        return jsonify({"outputs": outputs, "visualization": vis_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/network/<network_id>/train", methods=["POST"])
def train_network(network_id):
    """Train the network"""
    if network_id not in networks:
        return jsonify({"error": "Network not found"}), 404

    data = request.get_json()
    inputs = data.get("inputs", [])
    targets = data.get("targets", [])
    epochs = data.get("epochs", 10)
    learning_rate = data.get("learning_rate", 0.1)

    network = networks[network_id]

    try:
        errors = network.train(inputs, targets, epochs, learning_rate)
        vis_data = network.visualize_network()

        return jsonify(
            {
                "errors": errors,
                "final_error": errors[-1] if errors else 0,
                "visualization": vis_data,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/network/<network_id>/stats", methods=["GET"])
def get_network_stats(network_id):
    """Get network statistics"""
    if network_id not in networks:
        return jsonify({"error": "Network not found"}), 404

    network = networks[network_id]
    stats = network.get_network_statistics()

    return jsonify(stats)


@app.route("/api/network/<network_id>/specializations", methods=["GET"])
def get_specializations(network_id):
    """Get specialization statistics (for adaptive networks)"""
    if network_id not in networks:
        return jsonify({"error": "Network not found"}), 404

    network = networks[network_id]

    if isinstance(network, AdaptiveMyceliumNetwork):
        stats = network.get_specialization_statistics()
        return jsonify(stats)
    else:
        return jsonify({"error": "This endpoint is only for adaptive networks"}), 400


@app.route("/api/networks", methods=["GET"])
def list_networks():
    """List all available networks"""
    return jsonify(
        {
            "networks": [
                {
                    "id": net_id,
                    "type": (
                        "adaptive"
                        if isinstance(net, AdaptiveMyceliumNetwork)
                        else "basic"
                    ),
                    "node_count": len(net.nodes),
                    "iteration": net.iteration,
                }
                for net_id, net in networks.items()
            ],
            "current": current_network_id,
        }
    )


@app.route("/api/demo/generate", methods=["POST"])
def generate_demo_data():
    """Generate demo data for visualization testing"""
    data = request.get_json()
    iterations = data.get("iterations", 10)
    with_training = data.get("with_training", False)

    timeline = []

    if with_training:
        inputs = [[0, 0], [0, 1], [1, 0], [1, 1]]
        targets = [[0], [1], [1], [0]]

        for i in range(iterations):
            for inp in inputs:
                network.forward(inp)

            if i % 5 == 0:
                errors = network.train(inputs, targets, epochs=1, learning_rate=0.1)

            vis_data = network.visualize_network()
            timeline.append(vis_data)
    else:

        for i in range(iterations):
            inp = [random.random(), random.random()]
            network.forward(inp)

            vis_data = network.visualize_network()
            timeline.append(vis_data)

    return jsonify({"timeline": timeline, "total_frames": len(timeline)})


if __name__ == "__main__":
    print("Starting Mycelium Network API Server...")
    print("Visit http://localhost:8000/api/health to verify server is running")
    print("React frontend should connect to this server for network data")
    app.run(host="0.0.0.0", port=8000, debug=True)
