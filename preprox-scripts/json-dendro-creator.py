import csv

    
with open('data/shortest-paths.csv', 'r') as csv_file:
    csv_reader = csv.reader(csv_file)
    stations = next(csv_reader)
    stations = stations[1:]
    print(stations)
    count = 0
    for line in csv_reader:
        # if count > 16:
        #     break
        count += 1
        children = {}
        root = line[0]
        # print(root)
        children[root] = []

        max_depth = 0
        
        for path in line[1:]:
            path = path[1:-1].split(' ')
            path = path[1:-1]
            max_depth = max(max_depth, len(path))
            # print(path)
            for i in range(len(path)):
                if i == 0:
                    if not path[i] in children[root]:
                        children[root].append(path[i])
                    continue

                if not path[i-1] in children:
                    children[path[i-1]] = []
                
                if not path[i] in children[path[i-1]]:
                    children[path[i-1]].append(path[i])

        print(max_depth)
        
        # print('children')
        # for el in children:
        #     print(el, children[el])

        f_out = open('data/trees/' + root + '.json', 'w')
        stack = [root]
        depth = 0
        level_counters = [0]
        max_depth = 0
        opened = 0
        closed = 0
        while len(stack) > 0:
            el = stack.pop()
            for _ in range(depth):
                f_out.write("\t")
            opened += 1
            f_out.write("{\"name\": \"" + el + "\",")
            max_depth = max(max_depth, depth)
            level_counters[depth] -= 1
            level_counters.append(0)

            if el in children:
                f_out.write("\"children\": [\n")
                depth += 1
                for i in children[el]:
                    stack.append(i)
                    level_counters[depth] += 1
                # remove el from children
                # children.pop(el)
            else:
                closed += 1
                f_out.write("\"colname\": \"level" + str(depth) + "\"}")
                if level_counters[depth] > 0:
                    f_out.write(",\n")
                else:
                    f_out.write("\n")
            
            while level_counters[depth] == 0 and depth >= 0:
                depth -= 1
                closed += 1
                for _ in range(depth):
                    f_out.write("\t")
                f_out.write("], \"colname\": \"level" + str(depth))
                if level_counters[depth] > 0:
                    f_out.write("\"},\n")
                else:
                    f_out.write("\"}\n") 
                level_counters.pop()

        if (opened > 398) or (closed > 398):
            print(root)
            print(opened)
            print(closed)
        
        f_out.close()
