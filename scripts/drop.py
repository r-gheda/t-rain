#for all files in data/relative-features, print the number of rows in each file
import os
import sys
import csv

for filename in os.listdir('data/relative-features'):

    if filename.endswith(".csv"):
        with open('./data/relative-features/' + filename, 'r') as f:
            reader = csv.reader(f)
            next(reader)
            count = 0
            for row in reader:
                count += 1
            if count != 393:
                print(filename,count)
            