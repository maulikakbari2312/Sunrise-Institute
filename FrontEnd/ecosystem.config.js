module.exports = {
    apps: [
        {
            name: "sunrise-admin",
            script: "npm",
            args: "start -- --port 3001",
            watch: true,
            ignore_watch: ["node_modules"],
        },
    ],
};
