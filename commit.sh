id=$1
commits=$(($2 * 1000))

for i in $(seq 1 $commits)
do
    git commit --allow-empty -m "[slave-$id]: $i"
done