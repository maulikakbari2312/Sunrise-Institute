module.exports = {
  apps: [
    {
      name: 'cm-backend',
      script: '/var/www/Sunrise-Institute/cmBackend/index.js',  // Path to your main file
      env: {
        NODE_ENV: 'development',
        PORT: 7000,  // Port for this project
        PORT:"7000",
        SECRET:"sunrise001",
        MONGO_URL:"mongodb+srv://leminghori:leminghori@cluster0.mz5wklt.mongodb.net/cm-sunrise?retryWrites=true&w=majority",
        WHATSAPP_URL:"https://laxicon.co.in/api/send",
        ACCESS_TOKEN:"661ab712592d5",
        INSTANCE_ID_ABC:"661E271D3855F",
        INSTANCE_ID_ABRAMA:"661E27CBA8591",
        INSTANCE_ID_SITANAGAR:"66211451BEDCC",
        FRONTEND_PORT:"https://master.sunriseinstitute.net",
        MEDIA_URL:"https://master-cm-backend.sunriseinstitute.net",
        INSTANCE_ID_DEFAULT:"661E271D3855F",
        ADMIN_EMAIL:"cmsunriseinstitute.tech@gmail.com",
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 7000,  // Port for production environment
      },
    },
  ],
};
