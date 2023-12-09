
f_in = open('data/shortest-paths.csv', 'r')

# skip header
stations = f_in.readline().strip().split(',')[1:]

for line in f_in:
    paths = line.strip().split(',')
    start = paths[0]
    f_out = open('data/barplot/' + start + ".csv", 'w')
    f_out.write('hopcount,size,stations\n')

    hopcounts = {}

    for i in range(1, len(paths)):
        paths[i-1] = paths[i][1:-1].split(' ')[1:-1]
    
    for s in range(len(stations)):
        hops = len(paths[s])
        if not hops in hopcounts.keys():
            hopcounts[hops] = []
        hopcounts[hops].append(stations[s])
    
    for h in range(1, max(hopcounts.keys()) + 1):
        if not h in hopcounts.keys():
            hopcounts[h] = []
        l = ""
        for s in hopcounts[h]:
            l += s + ' '
        # print(hopcounts[h])
        # print(l)
        f_out.write(str(h) + ',' + str(len(hopcounts[h])) + ',' + str(l) + '\n')

    f_out.close()

    
