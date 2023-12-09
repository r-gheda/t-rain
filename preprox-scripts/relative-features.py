import csv

f_in = open('../data/shortest-paths.csv', 'r')
disr_in = csv.reader(open('../data/disruptions-2022.csv', 'r'))
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
        
        services = 0
        
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