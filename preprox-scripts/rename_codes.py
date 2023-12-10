import os
import pandas as pd

def rename_columns(file_path):
    # Read the CSV file
    df = pd.read_csv(file_path)

    # Extract the CODE from the filename
    code = file_path.split('/')[-1].split('.')[0]

    # Rename the columns
    df = df.rename(columns={
        f"distance_{code}": f"Distance from {code}",
        f"services_per_day_{code}": f"Services from/to {code}",
        f"n_of_disruptions_{code}": f"Disruptions on path to {code}"
    })

    # Save the file with the updated columns
    df.to_csv(file_path, index=False)

# Directory containing the CSV files
directory = "data/relative-features"

# Iterate through each file in the directory
for filename in os.listdir(directory):
    if filename.endswith(".csv"):
        file_path = os.path.join(directory, filename)
        rename_columns(file_path)
        print(f"Processed {filename}")
