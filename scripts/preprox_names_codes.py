import pandas as pd
import numpy as np

# load the csv data/station_features/services-2023-10.csv

services_file_path = 'data/station_features/services-2023-10.csv'
services_df = pd.read_csv(services_file_path)

# load the csv data/station_features/station_service_disruption_delays_cancel_counts.csv

station_service_disruption_delays_cancel_counts_file_path = 'data/station_features/station_service_disruption_delays_cancel_counts.csv'
station_service_disruption_delays_cancel_counts_df = pd.read_csv(station_service_disruption_delays_cancel_counts_file_path)

#for each row in station_service_disruption_delays_cancel_counts_df, find the corresponding row in services_df and add the station name and code to the row in station_service_disruption_delays_cancel_counts_df

# create a new column in station_service_disruption_delays_cancel_counts_df called station_name

station_service_disruption_delays_cancel_counts_df['Station Name'] = ''

#for each station code in station_service_disruption_delays_cancel_counts_df, check the rows in services_df for the corresponding station code and add the station name to the station_name column in station_service_disruption_delays_cancel_counts_df

for index, row in station_service_disruption_delays_cancel_counts_df.iterrows():
    station_code = row['Station Code']
    station_name = services_df.loc[services_df['Stop:Station code'] == station_code, 'Stop:Station name'].iloc[0]
    station_service_disruption_delays_cancel_counts_df.at[index, 'Station Name'] = station_name

#print the first rows of station_service_disruption_delays_cancel_counts_df

print(station_service_disruption_delays_cancel_counts_df.head())

# save station_service_disruption_delays_cancel_counts_df as a csv file

station_service_disruption_delays_cancel_counts_df.to_csv('data/station_features/station_service_disruption_delays_cancel_counts_with_names.csv', index=False)




