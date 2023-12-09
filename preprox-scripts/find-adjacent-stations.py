
# importing the pandas library 
import pandas as pd 
import csv
  
# reading the csv file 
df = pd.read_csv("data/tariff-distances-2022-01.csv") 
station_to_index = {}

for index, row in df.iterrows():
    station_to_index[row['Station']] = index

for index, row in df.iterrows():
    for st in station_to_index:
        df.loc[index, st] = 0

with open('services-2023-01.csv', 'r') as csv_file:
    csv_reader = csv.reader(csv_file)

    # skip the first row
    next(csv_reader)
    iter = 0
    las_station = ''
    las_train_num = -1
    # iterate over each row
    for line in csv_reader:
        if iter % 100000 == 0:
            print(iter)
        iter += 1

        train_num = line[4]
        station = line[9]
        if station == 'NA':
            station = 'NEA'

        if las_train_num != train_num:
            las_station = ''
        elif (las_station != '') and (las_station in station_to_index) and (station in station_to_index):
            # update row station column las_station
            df.loc[station_to_index[las_station], station] = 1
            df.loc[station_to_index[station], las_station] = 1



        las_train_num = train_num
        las_station = station
  
# writing into the file 
df.to_csv("data/station-adj-2.csv", index=False) 

