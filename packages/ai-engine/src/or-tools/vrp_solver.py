#!/usr/bin/env python3
"""
Google OR-Tools Vehicle Routing Problem (VRP) Solver for Sage Logistics.
Implements Capacitated Vehicle Routing Problem (CVRP) with Pickup & Delivery (PDP).
"""

import sys
import json
import math
from ortools.constraint_solver import routing_enums_pb2, pywrapcp

def haversine_distance_meters(lat1, lon1, lat2, lon2):
    """Calculates great-circle distance between two GPS coordinates in meters."""
    R = 6371000  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return int(R * c)

def solve_vrp(problem_data):
    """
    Solves the VRP problem using Google OR-Tools.
    Input format:
    {
        "depot": {"latitude": float, "longitude": float},
        "vehicles": [
            {"id": str, "name": str, "capacity": int, "latitude": float, "longitude": float}
        ],
        "deliveries": [
            {
                "id": str,
                "orderNumber": str,
                "pickupAddress": str,
                "pickupLat": float,
                "pickupLng": float,
                "deliveryAddress": str,
                "deliveryLat": float,
                "deliveryLng": float,
                "weightKg": int,
                "priority": str
            }
        ]
    }
    """
    vehicles = problem_data.get("vehicles", [])
    deliveries = problem_data.get("deliveries", [])
    depot = problem_data.get("depot")
    if not depot:
        raise ValueError("Explicit depot required")
    for delivery in deliveries:
        if any(delivery.get(k) is None for k in ("pickupLat", "pickupLng", "deliveryLat", "deliveryLng")):
            raise ValueError("Explicit pickup and delivery coordinates required")

    if not vehicles or not deliveries:
        return {
            "status": "NO_WORK_OR_VEHICLES",
            "total_distance_meters": 0,
            "routes": [],
            "unassigned_orders": [d["id"] for d in deliveries]
        }

    # Node 0 is Depot
    # For each delivery i:
    # Pickup node: 1 + 2*i
    # Dropoff node: 1 + 2*i + 1
    nodes = [{"lat": depot["latitude"], "lng": depot["longitude"], "type": "DEPOT", "order": None}]
    pickup_dropoff_pairs = []
    demands = [0]  # Depot has 0 demand

    for i, delivery in enumerate(deliveries):
        # Pickup Node
        p_lat = delivery["pickupLat"]
        p_lng = delivery["pickupLng"]
        p_idx = len(nodes)
        nodes.append({
            "lat": p_lat,
            "lng": p_lng,
            "type": "PICKUP",
            "order": delivery,
            "order_id": delivery["id"],
            "address": delivery.get("pickupAddress", "")
        })

        # Dropoff Node
        d_lat = delivery["deliveryLat"]
        d_lng = delivery["deliveryLng"]
        d_idx = len(nodes)
        nodes.append({
            "lat": d_lat,
            "lng": d_lng,
            "type": "DROPOFF",
            "order": delivery,
            "order_id": delivery["id"],
            "address": delivery.get("deliveryAddress", "")
        })

        pickup_dropoff_pairs.append([p_idx, d_idx])
        weight = max(1, round(float(delivery.get("weightKg", 2)) * 1000))
        demands.append(weight)   # Pickup adds to vehicle load
        demands.append(-weight)  # Dropoff removes from vehicle load

    num_locations = len(nodes)
    num_vehicles = len(vehicles)

    # Build Distance Matrix in meters
    distance_matrix = []
    for from_node in nodes:
        row = []
        for to_node in nodes:
            dist = haversine_distance_meters(from_node["lat"], from_node["lng"], to_node["lat"], to_node["lng"])
            row.append(dist)
        distance_matrix.append(row)

    # Initialize Routing Manager & Model
    manager = pywrapcp.RoutingIndexManager(num_locations, num_vehicles, 0)
    routing = pywrapcp.RoutingModel(manager)

    # Distance Transit Callback
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Capacity Dimension
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return demands[from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    vehicle_capacities = [max(1, round(float(v.get("capacity", 30)) * 1000)) for v in vehicles]

    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        vehicle_capacities,  # vehicle maximum capacities
        True,  # start cumul to zero
        "Capacity"
    )

    order_callback = routing.RegisterTransitCallback(lambda _from, _to: 1)
    routing.AddDimension(order_callback, 0, num_locations, True, "StopOrder")

    # Pickup and Delivery constraints
    for pickup_idx, dropoff_idx in pickup_dropoff_pairs:
        p_index = manager.NodeToIndex(pickup_idx)
        d_index = manager.NodeToIndex(dropoff_idx)
        routing.AddPickupAndDelivery(p_index, d_index)
        # Same vehicle constraint
        routing.solver().Add(routing.VehicleVar(p_index) == routing.VehicleVar(d_index))
        # Order dimension enforces pickup-before-dropoff independently of load.
        routing.solver().Add(
            routing.GetDimensionOrDie("StopOrder").CumulVar(p_index) <=
            routing.GetDimensionOrDie("StopOrder").CumulVar(d_index)
        )

    # Allow dropping nodes with penalty if impossible to serve
    penalty = 1000000  # High penalty for unassigned orders
    for node in range(1, num_locations):
        routing.AddDisjunction([manager.NodeToIndex(node)], penalty)

    # Setting search parameters
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 2

    # Solve
    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        return {
            "status": "INFEASIBLE",
            "total_distance_meters": 0,
            "routes": [],
            "unassigned_orders": [d["id"] for d in deliveries]
        }

    total_distance = 0
    routes_output = []
    assigned_orders = set()

    for vehicle_id_idx, vehicle_data in enumerate(vehicles):
        index = routing.Start(vehicle_id_idx)
        route_stops = []
        route_distance = 0
        current_load = 0

        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            if node_index != 0:  # Ignore starting depot node in stops list
                node_info = nodes[node_index]
                current_load += demands[node_index]
                route_stops.append({
                    "stopType": node_info["type"],
                    "orderId": node_info["order_id"],
                    "orderNumber": node_info["order"].get("orderNumber", ""),
                    "address": node_info["address"],
                    "latitude": node_info["lat"],
                    "longitude": node_info["lng"],
                    "currentLoadKg": current_load / 1000.0
                })
                assigned_orders.add(node_info["order_id"])

            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_distance += routing.GetArcCostForVehicle(previous_index, index, vehicle_id_idx)

        total_distance += route_distance

        if route_stops:
            routes_output.append({
                "vehicleId": vehicle_data["id"],
                "vehicleName": vehicle_data.get("name", f"Courier {vehicle_id_idx+1}"),
                "totalStops": len(route_stops),
                "distanceMeters": route_distance,
                "distanceKm": round(route_distance / 1000.0, 2),
                "stops": route_stops
            })

    unassigned_orders = [d["id"] for d in deliveries if d["id"] not in assigned_orders]

    return {
        "status": "FEASIBLE",
        "solver": "Google OR-Tools (CVRP + PDP)",
        "totalDistanceMeters": total_distance,
        "totalDistanceKm": round(total_distance / 1000.0, 2),
        "assignedOrdersCount": len(assigned_orders),
        "unassignedOrdersCount": len(unassigned_orders),
        "routes": routes_output,
        "unassignedOrderIds": unassigned_orders
    }

SAMPLE_DEMO_DATA = {
    "depot": {"latitude": 6.5244, "longitude": 3.3792},
    "vehicles": [
        {"id": "v1", "name": "Babatunde (Motorcycle)", "capacity": 25, "latitude": 6.5244, "longitude": 3.3792},
        {"id": "v2", "name": "Chinedu (Van)", "capacity": 60, "latitude": 6.5244, "longitude": 3.3792}
    ],
    "deliveries": [
        {
            "id": "ord-1",
            "orderNumber": "SG-101",
            "pickupAddress": "Computer Village, Ikeja",
            "pickupLat": 6.5937,
            "pickupLng": 3.3422,
            "deliveryAddress": "Admiralty Way, Lekki Phase 1",
            "deliveryLat": 6.4474,
            "deliveryLng": 3.4849,
            "weightKg": 4,
            "priority": "EXPRESS"
        },
        {
            "id": "ord-2",
            "orderNumber": "SG-102",
            "pickupAddress": "Oregun, Ikeja",
            "pickupLat": 6.6010,
            "pickupLng": 3.3610,
            "deliveryAddress": "Victoria Island, Lagos",
            "deliveryLat": 6.4281,
            "deliveryLng": 3.4219,
            "weightKg": 12,
            "priority": "STANDARD"
        }
    ]
}

def main():
    try:
        if "--test" in sys.argv or "--demo" in sys.argv:
            result = solve_vrp(SAMPLE_DEMO_DATA)
            print(json.dumps(result, indent=2))
            return

        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"error": "Empty input"}))
            return
        data = json.loads(raw_input)
        result = solve_vrp(data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e), "status": "ERROR"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
