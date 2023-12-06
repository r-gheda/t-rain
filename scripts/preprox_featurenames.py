#for all the csv files in the station-features folder, rename the attributes (except the first one) to be name_attribute + name of the file (excluding .csv)

import os
import sys
import csv

for filename in os.listdir('data/relative-features'):
    print(filename)
    if filename.endswith(".csv"):
        with open('./data/relative-features/' + filename, 'r') as f:
            reader = csv.reader(f)
            attributes = next(reader)
            attributes = attributes[1:]
            for i in range(len(attributes)):
                attributes[i] = attributes[i] + '_' + filename[:-4]
            attributes.insert(0, 'Station Code')
        with open('./data/relative-features/' + filename, 'r') as f:
            reader = csv.reader(f)
            next(reader)
            with open('./data/relative-features/' + filename[:-4] + '_new.csv', 'w') as f2:
                writer = csv.writer(f2)
                writer.writerow(attributes)
                for row in reader:
                    writer.writerow(row)
        os.remove('./data/relative-features/' + filename)
        os.rename('./data/relative-features/' + filename[:-4] + '_new.csv', './data/relative-features/' + filename)
