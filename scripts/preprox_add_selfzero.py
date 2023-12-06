import os
import csv

# File path for the reference CSV
ref_file_path = 'data/station_features/station_service_disruption_delays_cancel_counts_with_names.csv'

# Directory containing the CSV files to be modified
directory = 'data/relative-features'

# Read the reference file and extract unique Station Codes
unique_station_codes = set()
with open(ref_file_path, 'r') as f:
    reader = csv.reader(f)
    header = next(reader)  # Assuming the first row is a header
    for row in reader:
        unique_station_codes.add(row[0])  # Assuming 'Station Code' is in the first column

# Function to add zeros based on the number of columns
def add_zeros(num_columns):
    return [0] * num_columns

# Process each file in the directory
for filename in os.listdir(directory):
    if filename.endswith(".csv"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            reader = csv.reader(f)
            header = next(reader, None)  # Read the header
            rows = list(reader)

        # Check existing station codes in this file
        existing_codes = {row[0] for row in rows}  # Assuming 'Station Code' is in the first column
        missing_codes = unique_station_codes - existing_codes

        # Add rows for missing station codes
        for code in missing_codes:
            new_row = [code] + add_zeros(len(header) - 1)
            rows.append(new_row)

        # Write the updated data back to the file
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)
            if header:
                writer.writerow(header)  # Write the header back first
            writer.writerows(rows)
