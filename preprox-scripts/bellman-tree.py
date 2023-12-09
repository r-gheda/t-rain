import pandas as pd
import csv
import heapq
from typing import List, Tuple

station_to_index = {}
index_to_station = {}
shortest_paths = {}

def bellman_ford(edges, vertices: int, source: int) -> None:
    # Step 1: Initialize distances from source to all vertices as INFINITE
    distances = [float("inf")] * vertices
    distances[source] = 0

    # Step 2: Initialize a list to keep track of the predecessor of each vertex
    predecessors = [-1] * vertices

    # Step 3: Relax all edges |V| - 1 times
    for _ in range(vertices - 1):
        for u, v in edges:
            weight = float(edges[(u, v)])
            if distances[u] != float("inf") and distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
                predecessors[v] = u

    # Step 4: Check for negative-weight cycles
    for u, v in edges:
        weight = float(edges[(u, v)])
        if distances[u] != float("inf") and distances[u] + weight < distances[v]:
            print("The graph contains a negative-weight cycle")
            return

    # Step 5: Print the shortest path from source to all vertices
    shortest_paths[source] = []
    for i in range(vertices):
        # print_path(predecessors, i)
        # print(f", Distance: {distances[i]}")
        path = get_path(predecessors, i)
        path.append(distances[i])
        shortest_paths[source].append(path)

def get_path(predecessors, vertex):
    if vertex == -1:
        return []
    return get_path(predecessors, predecessors[vertex]) + [index_to_station[vertex]]

def print_path(predecessors, vertex):
    if vertex == -1:
        return 
    print_path(predecessors, predecessors[vertex])
    print(index_to_station[vertex], end=" ")


ds = pd.read_csv("data/tariff-distances-2022-01.csv")
adj = pd.read_csv("data/station-adj.csv")

for index, row in ds.iterrows():
    if type(row['Station']) != str:
        index_to_station[index] = 'NA'
        station_to_index['NA'] = index
        continue
    station_to_index[row['Station']] = index
    index_to_station[index] = row['Station']

# convert ds to a numpy distance atrix
ds_mat = ds.drop(columns=['Station'])
ds_mat = ds.to_numpy()

ideal_ds_mat = ds_mat.copy()

#convert adj to a numpy adjacency matrix
adj_mat = adj.drop(columns=['Station'])
adj_mat = adj.to_numpy()

# drop first column
ds_mat = ds_mat[:, 1:]
ideal_ds_mat = ideal_ds_mat[:, 1:]
adj_mat = adj_mat[:, 1:]

for i in range(len(adj_mat)):
    for j in range(len(adj_mat)):
        if adj_mat[i][j] == 0:
            ds_mat[i][j] = float('inf')


# for i in range(len(ds_mat)):
#     print(index_to_station[i] +' '+ str(ds_mat[i]))

mat_edges = {}

for i in range(len(ds_mat)):
    for j in range(len(ds_mat)):
        if ds_mat[i][j] == float('inf'):
            continue
        mat_edges[(i, j)] = ds_mat[i][j]

for i in range(len(ds_mat)):
    bellman_ford(mat_edges, len(ds_mat), i)
    print('done with ' + index_to_station[i])
    # if i > 10:
        # break

for source in shortest_paths:
        for path in shortest_paths[source]:
            goal = path[-2]
            path_out = '['
            for i in range(len(path) - 1):
                path_out += path[i] + ' '
            path_out += str(path[-1])
            path_out += ']'
            # print(path_out)
            goal_idx = station_to_index[goal]
            # print(source)
            # print(goal_idx)
            adj.loc[source, goal] = path_out

# writing into the file
print('writing...')
adj.to_csv("data/shortest-paths.csv", index=False)