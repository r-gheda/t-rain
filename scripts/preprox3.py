import pandas as pd
import numpy as np

#load the csv station_service_disruption_counts

station_service_disruption_delays_counts = pd.read_csv('data/station_service_disruption_delays_counts.csv')

#load the csv station_delays_counts

station_cancel_counts = pd.read_csv('data/station_cancel_counts.csv')

print(station_service_disruption_delays_counts.columns)
print(station_cancel_counts.columns)

#merge the two dataframes on the station code only if the station code is the same in both dataframes

station_service_disruption_delays_cancel_counts = pd.merge(station_service_disruption_delays_counts, station_cancel_counts, on='Station Code', how='inner', validate='one_to_one')


#display the first few rows of the new dataframe

print(station_service_disruption_delays_cancel_counts.head())

#save the dataframe to a csv file

station_service_disruption_delays_cancel_counts.to_csv('data/station_service_disruption_delays_cancel_counts.csv', index=False)


