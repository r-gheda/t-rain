import csv

f_in = open('../data/shortest-paths.csv', 'r')
disr_in = csv.reader(open('../data/disruptions-2022.csv', 'r'))
services_in = csv.reader(open('../services-2023-01.csv', 'r'))

# read header of disruptions
next(disr_in)
station_disruptions = {}
station_to_code = {}

# read disruptions
for row in disr_in:
    id = row[0]
    stations = row[5].split(',')
    for st in stations:
        if st not in station_disruptions:
            station_disruptions[st] = []
        station_disruptions[st].append(id)

next(services_in)
direct_services = {}
prev_stations = []
last_train_num = -1
for row in services_in:
    train_num = row[4]
    if train_num != last_train_num:
        prev_stations = []
        last_train_num = train_num
    station = row[9]
    for prev in prev_stations:
        if (prev, station) not in direct_services:
            direct_services[(prev, station)] = 1
        else:
            direct_services[(prev, station)] += 1
    prev_stations.append(station)

stations = f_in.readline().strip().split(',')[1:]
count = 0
for line in f_in:
    st = stations[count]
    f_out = open('../data/relative-features/' + st + '.csv', 'w')
    f_out.write('station,distance,services_per_day,n_of_disruptions\n')
    for path in line.strip().split(',')[1:]:
        dist = path.split(' ')[-1][:-1]
        goal = path.split(' ')[-2]
        if len(goal) > 0 and goal[1:] == st:
            continue
        
        if (goal, st) not in direct_services:
            services = 0
        else:
            services = direct_services[(goal, st)] / 31
        # print(services)
        
        s = set()
        routers = path.split(' ')[1:-2]
        for router in routers:
            if not router in station_disruptions:
                continue
            for id in station_disruptions[router]:
                s.add(id)
        n_of_disruptions = len(s)

        f_out.write(goal + ',' + dist + ',' + str(services) + ',' + str(n_of_disruptions)+ '\n')

    count += 1