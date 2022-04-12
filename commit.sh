id=$1
commits=$(($2 + 0))

echo $commits > LOG

for i in $(seq 1 $commits)
do
    git commit --allow-empty -m "[slave-$id]: $i"
done