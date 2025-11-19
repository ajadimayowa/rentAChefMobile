import 'dotenv/config';

export default {
  expo: {
    name: 'rentAChef',
    slug: 'rentAChef',
    scheme: 'rentAChef',
    extra: {
      apiUrl: process.env.API_BASEURL,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      nodeEnv: process.env.NODE_ENV,
    },
  },
};
