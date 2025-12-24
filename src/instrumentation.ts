export async function register() {
    // Only run on server side
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { initCronJobs } = await import('./lib/cron')
        initCronJobs()
    }
}
