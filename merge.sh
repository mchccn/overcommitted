git remote remove local
git remote add local "../slave-$1"
git fetch local
git merge "local/slave-$1"