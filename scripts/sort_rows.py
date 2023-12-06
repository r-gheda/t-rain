import os
import csv

# Directory containing the CSV files
directory = 'data/relative-features'

# Function to get the key for sorting (assuming 'Station Code' is the first column)
def sort_key(row):
    return row[0]

# Iterate over each file in the directory
for filename in os.listdir(directory):
    if filename.endswith(".csv"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            # Read the file
            reader = csv.reader(f)
            header = next(reader, None)  # Read the header
            rows = sorted(reader, key=sort_key)  # Sort the rows

        # Write the sorted data back to the file
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)
            if header:
                writer.writerow(header)  # Write the header back first
            writer.writerows(rows)
