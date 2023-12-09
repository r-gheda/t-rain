import pandas as pd
import numpy as np

#load the csv services-2023-10.csv

services_df = pd.read_csv('data/services-2023-10.csv')

#create a new dataset with two columns: Station Code and Cancel Count where Cancel Count is the number of times a service was cancelled at that station
#a service is cancelled at a station if the attribute Stop:Departure cancelled is true or the attribute Stop:Arrival cancelled is true

station_cancel_counts = services_df[(services_df['Stop:Departure cancelled'] == True) | (services_df['Stop:Arrival cancelled'] == True)].groupby('Stop:Station code').size().reset_index(name='Cancel Count')

#display the first few rows of the new dataframe



#sort the dataframe by the column Cancel Count in descending order

station_cancel_counts = station_cancel_counts.sort_values(by='Cancel Count', ascending=False)

print(station_cancel_counts.head())

#save the dataframe to a csv file but change the name Stop:Station code to Station Code

station_cancel_counts.to_csv('data/station_cancel_counts.csv', index=False)
