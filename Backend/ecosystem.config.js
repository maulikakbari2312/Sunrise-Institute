module.exports = {
  apps: [
    {
      name: 'backend',
      script: '/var/www/Sunrise-Institute/Backend/index.js',  // Path to your main file
      env: {
        NODE_ENV: 'development',
        PORT:7001,
        SECRET:"sunrise001",
        MONGO_URL:"mongodb+srv://leminghori:leminghori@cluster0.mz5wklt.mongodb.net/sunrise-test?retryWrites=true&w=majority",
        WHATSAPP_URL:"https://laxicon.co.in/api/send",
        ACCESS_TOKEN:"661ab712592d5",
        INSTANCE_ID_ABC:"661E271D3855F",
        INSTANCE_ID_ABRAMA:"661E27CBA8591",
        INSTANCE_ID_SITANAGAR:"66211451BEDCC",
        FRONTEND_PORT:"https://master.sunriseinstitute.net",
        MEDIA_URL:"https://master-backend.sunriseinstitute.net",
        INSTANCE_ID_DEFAULT:"661E271D3855F",
        ADMIN_EMAIL:"sunriseinstitute.tech@gmail.com"
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 7001,  // Port for production environment
      },
    },
  ],
};
