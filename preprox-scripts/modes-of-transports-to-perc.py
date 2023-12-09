f_in = open("data/modes-of-transport.csv", 'r')
f_out = open("data/modes-of-transportation.csv", 'w')

header = f_in.readline()
f_out.write(header)

for line in f_in:
    data = line.split(',')
    year = data[0]
    data = data[1:]
    tot  = sum([float(x) for x in data])
    norm_data = [str(float(x)*100/tot) for x in data]
    f_out.write(year + ',' + ','.join(norm_data))
    f_out.write('\n')