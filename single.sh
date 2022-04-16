g++ single.cpp -o single

./single && git prune && git gc && echo "Restarting..." && ./single.sh