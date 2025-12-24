module.exports = {
    apps: [
        {
            name: 'nerd-society',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000 // Đổi port nếu cần
            },
        },
    ],
};