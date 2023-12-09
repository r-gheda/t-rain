f_in = open('data/station-adj-2.csv', 'r')

stations = f_in.readline().split(',')[1:]

for line in f_in:
    # line = line.split(' ')
    # print(line)
    count = sum([int(x) for x in line.strip().split(',')[1:]])
    if (count < 3) or (line.strip().split(',')[0] == 'HRY'):
        adj_idx = [i for i, x in enumerate(line.strip().split(',')[1:]) if x == '1']
        idx = 0
        for i in adj_idx:
            adj_idx[idx] = stations[i]
            idx += 1
        print(line.strip().split(',')[0] + ' ' + str(count) + str(adj_idx))