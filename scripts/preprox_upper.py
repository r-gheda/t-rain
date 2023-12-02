import pandas as pd

# load the csv data/station_features/station_service_disruption_delays_cancel_counts_with_names.csv

station_service_disruption_delays_cancel_counts_with_names_file_path = 'data/station_features/station_service_disruption_delays_cancel_counts_with_names.csv'
station_service_disruption_delays_cancel_counts_with_names_df = pd.read_csv(station_service_disruption_delays_cancel_counts_with_names_file_path)

#convert all the Station Names to uppercase

station_service_disruption_delays_cancel_counts_with_names_df['Station Name'] = station_service_disruption_delays_cancel_counts_with_names_df['Station Name'].str.upper().replace('_', '', regex=True)

# save station_service_disruption_delays_cancel_counts_with_names_df as a csv file

station_service_disruption_delays_cancel_counts_with_names_df.to_csv('data/station_features/station_service_disruption_delays_cancel_counts_with_names.csv', index=False)
