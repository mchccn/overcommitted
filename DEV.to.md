So I saw this post by [Virej Dasani](https://github.com/virejdasani/): [Which GitHub repo has the most commits?](https://dev.to/virejdasani/which-github-repo-has-the-most-commits-2i18?signin=true), and I wondered, "Is there a faster, more efficient way of reaching 3,000,000 commits?"

Well, of course the answer is yes, and the answer deals with multi-threading and hacky Git tricks.

First off, I use the [Master/slave](<https://en.wikipedia.org/wiki/Master/slave_(technology)>) design pattern:

```ts
if (__filename.split("/").reverse()[1] === "master") {
    // process is master (folder names determine status)

    console.log(`Spawning ${threads} slave${threads !== 1 ? "s" : ""}...`);

    for (let i = 0; i < threads; i++) {
        // spawn slaves
    }
} else {
    // process is slave
}
```

You might think that you'd just spawn multiple processes that spam empty commits, just like how Virej used a Python loop, but no, that won't work.

It is almost certain that two processes will commit at the same time, resulting in the `HEAD.lock` file in the `.git/` directory not matching.
**Error!** It's _fatal_ and also it's _slower_ to ignore this with traditional try-catch.
Plus, if we have many processes (10+), this will happen almost every time a commit is made, hindering progress.

Instead we will provide each slave its own Git repository, where it can commit happily as it chooses, separate from other slaves.

```ts
for (let i = 0; i < threads; i++) {
    execSync(`git clone ../master ../slave-${i}`);

    execSync(`tsc ../slave-${i}/index.ts`);

    const slave = fork(`../slave-${i}/index.js`, [...process.argv.slice(2), i.toString()], { cwd: join(process.cwd(), "..", `slave-${i}`) });

    // ...
}
```

We also pass the identifier to the slave using `fork`'s `argv` parameter, and we also set the cwd of the slave to its repository's root.

Each slave will make its own branch to commit on, and when it's done, it will notify the master process.
The master will then merge the slave's commits onto the master branch, and then proceeds to delete the slave's Git repository and kill its process.

```ts
const id = process.argv[4];

execSync(`git checkout -b slave-${id}`);

for (let i = 1; i < commits * 1000; i++) {
    execSync(`git commit --allow-empty -m "[slave-${id}]: ${i}"`);

    process.send!(`commit ${i}`);
}

process.send!("EXIT");
```

Using `process.send`, we can send a message to the master process:

```ts
slave.on("message", (msg) => {
    if (msg === "EXIT") {
        execSync(`git remote remove local`);
        execSync(`git remote add local ../slave-${i}`);
        execSync(`git fetch local`);
        execSync(`git merge local/slave-${i}`);

        rmSync(`../slave-${i}`, { recursive: true, force: true });

        return slave.kill();
    }

    return console.log(`[slave-${i}]: ${msg.toString()}`);
});
```

Finally, we can add a little more flair if we wish:

```ts

```
