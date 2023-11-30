import pandas as pd
import numpy as np

# Load the provided CSV file
services_file_path = 'data/services-2023-10.csv'
services_df = pd.read_csv(services_file_path)



#count the occurences of each station code (attribute Stop:Station code) but only with the entries that have the attribute Stop:Departure delay > 0 and not null or the attribute Stop:Arrival delay > 0 and not null
#save the result in a new dataframe called station_delays_counts that has two columns: Station Code and Delay Count
#sort the dataframe by the column Delay Count in descending order

station_delays_counts = services_df[(services_df['Stop:Departure delay'] > 0) | (services_df['Stop:Arrival delay'] > 0)].groupby('Stop:Station code').size().reset_index(name='Delay Count').sort_values(by='Delay Count', ascending=False)

#display the first few rows of the new dataframe

print(station_delays_counts.head())

#save the dataframe to a csv file but change the name Stop:Station code to Station Code

station_delays_counts.to_csv('data/station_delays_counts.csv', index=False)



