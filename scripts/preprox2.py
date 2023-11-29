import pandas as pd
import numpy as np

#load the csv station_service_counts

station_service_counts = pd.read_csv('data/station_service_counts.csv')

#load the csv station_disruption_counts, use ; as the delimiter

station_disruption_counts = pd.read_csv('data/station_disruption_counts.csv', delimiter=';')

#load the csv data/tariff-distances-2022-01.csv

tariff_distances = pd.read_csv('data/tariff-distances-2022-01.csv')

#put every element of the first column of the tariff_distances dataframe into a list

tariff_distances_list = tariff_distances.iloc[:,0].tolist()


print(station_service_counts.columns)
print(station_disruption_counts.columns)

#merge the two dataframes on the station code only if the station code is the same in both dataframes and the station code is in the tariff_distances_list

station_service_disruption_counts = pd.merge(station_service_counts, station_disruption_counts, on='Station Code', how='inner', validate='one_to_one')

station_service_disruption_counts = station_service_disruption_counts[station_service_disruption_counts['Station Code'].isin(tariff_distances_list)]

#display the first few rows of the new dataframe

print(station_service_disruption_counts.head())

#save the dataframe to a csv file

station_service_disruption_counts.to_csv('data/station_service_disruption_counts.csv', index=False)