import { ImageSourcePropType } from "react-native";

export default {
  p:{
    fontSize:'16@ms',
  },
  title:{
    fontSize:'38@ms',
  },
  header:{
    fontSize:'54@ms',
  }
};



export const serviceCatIcons: Record<string, ImageSourcePropType> = {
  "residential-service": require("../assets/icons/houseIcon.png"),
  "daily-service": require("../assets/icons/chefIcon.png"),
};

export const serviceIcons: Record<string, ImageSourcePropType> = {
  "Alase Service": require("../assets/icons/serviceicons/alaseService.png"),
  "Daily Chef": require("../assets/icons/serviceicons/dailyChefService.png"),
  "Date Night": require("../assets/icons/serviceicons/dateNightService.png"),
  "Dinner Party": require("../assets/icons/serviceicons/dinnerPartyService.png"),
  "Event Catering": require("../assets/icons/serviceicons/eventService.png"),
  "Storage Package": require("../assets/icons/serviceicons/storageService.png"),
};

export const chefCategoryIcons: Record<string, ImageSourcePropType> = {
  "Pro Chef": require("../assets/icons/chefCategoryIcons/proChef.png"),
  "Sous Chef": require("../assets/icons/chefCategoryIcons/souChef.png"),
  "Junior Chef": require("../assets/icons/chefCategoryIcons/juniorChef.png"),
  "Exclusive Chef": require("../assets/icons/chefCategoryIcons/exclusiveChef.png"),
};

export const packageIcons: Record<string, ImageSourcePropType> = {
  "Lagos Moonlight Dinner": require("../assets/icons/pckgIcons/Group 43.png"),
  "Continental Romance": require("../assets/icons/pckgIcons/Group 45.png"),
  "Afro Fusion Experience": require("../assets/icons/pckgIcons/fancyWineicon.png"),
  "Garden Grill & Chill": require("../assets/icons/pckgIcons/ricePotIcon.png"),
};
