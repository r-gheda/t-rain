import csv
import os

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
    f_out.write('Station Code,Distance from ' + st + ',Services from/to ' + st +',Disruptions on path to ' + st + '\n')
    if not os.path.exists('../data/relative-features.bak/' +  st + '.csv'):
        print(st + ' not found')
        count += 1
        continue
    serv_file = csv.reader(open('../data/relative-features.bak/' + st + '.csv', 'r'))
    (next(serv_file))
    skip_prev = False
    for path in line.strip().split(',')[1:]:
        dist = (float(path.split(' ')[-1][:-1]))
        goal = path.split(' ')[-2]
        if len(goal) > 0 and goal[1:] == st and goal[0] == '[':
            # print('skipping ' + st )
            if st == 'GN':
                print('skipping ' + st  + ' ' + goal[1:])
                print(goal)
            f_out.write(st + ',' + '0' + ',' + '0.0' + ',' + '0' + '\n')
            next(serv_file)
            continue

        if st == 'GN':
            print(st + ' ' + goal + ' ' + str(dist))
        
        if dist > 5000:
            # print(st + ' ' + goal + ' ' + str(dist))
            continue
        # if st == 'GN' and goal == 'BGN':
        #     print(st + ' ' + goal + ' ' + str(dist))
        dist = str(int(dist))
        # print(st)
        if not skip_prev:
            l = next(serv_file)
        # print(l)
        # print(path)
        # print(goal)
        # print(l[0])
        if (l[0] != goal):
            # print(l[0])
            # print(goal)
            # print(l[0])
            skip_prev = True
            continue
        skip_prev = False
        services = float(l[2])
        # print('ok')
        # break

        
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