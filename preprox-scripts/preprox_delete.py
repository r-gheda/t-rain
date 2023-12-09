import os
import csv

# List of station codes to be excluded
exclude_station_codes = ['ESE', 'GBR', '[HRY', 'LEER', '[NEA', 'UTM']

# Directory containing the CSV files
directory = 'data/relative-features'

# Iterate over each file in the directory
for filename in os.listdir(directory):
    if filename.endswith(".csv"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            # Read the file
            reader = csv.reader(f)
            # Store the rows that don't have the specified station codes
            filtered_rows = [row for row in reader if row[0] not in exclude_station_codes]

        # Write the filtered data back to the file
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerows(filtered_rows)
