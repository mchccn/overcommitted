id=$1
commits=$(($2 * 1000))

echo $commits

if [ -z $3 ]; then
    for i in $(seq 1 $commits)
    do
        git commit --allow-empty -m "[slave-$id]: $i"
    done
else
    i=$((0))

    while true
    do
        git commit --allow-empty -m "[slave-$id]: $i"
    done
fi
