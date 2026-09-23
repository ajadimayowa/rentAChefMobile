import React, { useEffect, useState } from "react";
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import BodyText from "./typography/BodyText";
import SectionText from "./typography/SectionText";
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { toggleFavorite } from '@/store/slices/menuSlice';
import { router } from "expo-router";
import { ISpecialMenu } from "@/interfaces/menu";
import api from "@/services/apiConfig";
import AddToFavoritesModal from "./modals/menus/AddToFavoritesModal";
import RateMenuModal from "./modals/menus/RateMenuModal";
import { RootState } from "@/store";

interface DishCardProps {
  menu: ISpecialMenu;
}

const DishCard: React.FC<DishCardProps> = ({
  menu
}) => {
  const userProfile = useSelector((state: RootState) => state.auth);
  const dispatch: any = useDispatch();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favModal, setFavModal] = useState(false);
  const [rateModal, setRateModal] = useState(false);
  const [favedLocal, setFavedLocal] = useState<boolean>(false);

  const handleHeart = async () => {
    if (!userProfile.bioData.id) {
      Toast.show({ type: 'error', text1: 'Kindly login to add favorites' });
      router.push('/login');
      return;
    }
    // setFavModal(true);

    // Optimistic update: flip locally immediately
    const prev = favedLocal;
    setFavedLocal(!prev);

    try {
      const resultAction: any = await dispatch(toggleFavorite(menu.id));
      if (resultAction?.payload?.success) {
        Toast.show({ type: 'success', text1: resultAction.payload.message || 'Updated favourites' });
      } else {
        // Revert on failure
        setFavedLocal(prev);
        Toast.show({ type: 'error', text1: resultAction?.payload?.message || 'Failed' });
      }
    } catch (err: any) {
      // Revert on error
      setFavedLocal(prev);
      Toast.show({ type: 'error', text1: err?.message || 'Network error' });
    }
  };


  const handleRating = async () => {
    if (!userProfile.bioData.id) {
      Toast.show({ type: 'error', text1: 'Kindly login to rate' });
      router.push('/login');
      return;
    }
    setRateModal(true);

    // try {
    //   const resultAction: any = await dispatch(toggleFavorite(menu.id));
    //   console.log('toggleFavorite result', resultAction);
    //   if (resultAction?.payload?.success) {
    //     Toast.show({ type: 'success', text1: resultAction.payload.message || 'Updated favourites' });
    //   } else {
    //     // Revert on failure
    //     setFavedLocal(prev);
    //     Toast.show({ type: 'error', text1: resultAction?.payload?.message || 'Failed' });
    //   }
    // } catch (err: any) {
    //   // Revert on error
    //   setFavedLocal(prev);
    //   Toast.show({ type: 'error', text1: err?.message || 'Network error' });
    // }
  };

  const fetchFavs = async () => {
    if (!userProfile.bioData.id) {
      return;
    }
    try {
      const res = await api.get('/favorites');
      if (res?.data?.success) {
        setFavorites(res?.data?.payload);
      }
    } catch (error: any) {
      // setLoading(false);
      // Toast.show({
      //   type: 'error',
      //   text1: 'Failed to fetch favorites',
      //   text2: error?.response?.message || 'Error fetching favorites',
      // });
    }
  };

  useEffect(() => {
    fetchFavs();
  }, []);

  useEffect(() => {
    const isFaved = favorites.some((fav) => fav?.specialMenuId?.id === menu.id);
    setFavedLocal(isFaved);
  }, [favorites, menu.id]);





  return (
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push({ pathname: '/viewspecialmenubooking', params: { id: menu?.id } })} style={styles.card}>
        <ImageBackground
          source={typeof menu?.image === 'string' ? { uri: menu.image } : menu.image}
          style={styles.image}
          imageStyle={styles.imageBorder}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.8)"]}
            style={styles.overlay}
          />

          <TouchableOpacity onPress={handleHeart} style={styles.heart}>
            <Ionicons name={favedLocal ? "heart" : "heart-outline"} size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRating} style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            {userProfile.bioData.id && <Text style={styles.ratingText}>{`Rate`}</Text>}
          </TouchableOpacity>

          <View style={styles.contentWrapper}>
            <View style={styles.content}>
              <SectionText textStyle={{ color: '#fff' }} text={menu?.title} />
              {menu?.description ? <BodyText textStyle={{ color: '#cdcdcdff' }} text={menu?.description} /> : null}
              <TouchableOpacity onPress={() => router.push({ pathname: '/viewspecialmenubooking', params: { id: menu?.id } })} activeOpacity={0.9} style={styles.bookBtn}>
                <SectionText text="Book Now" />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>


      <AddToFavoritesModal
        visible={favModal}
        onClose={() => { setFavModal(false);}}
        menuId={menu?.id}
        alreadyFaved={favedLocal}
      />

      <RateMenuModal
        visible={rateModal}
        onClose={() => { setRateModal(false); }}
        menuId={menu?.id}
      />
    </>
  );
};

const styles = ScaledSheet.create({
  card: {
    width: "250@s",
    height: "260@vs",
    marginRight: "12@s",
    borderRadius: "14@s",
    overflow: "hidden",
  },

  image: {
    flex: 1,
    justifyContent: "flex-end",
  },

  imageBorder: {
    borderRadius: "14@s",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  heart: {
    position: "absolute",
    top: "10@vs",
    right: "10@s",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: "6@s",
    borderRadius: "20@s",
    zIndex: 3,
  },

  ratingContainer: {
    position: "absolute",
    top: "10@vs",
    left: "10@s",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: "6@s",
    paddingVertical: "3@vs",
    borderRadius: "12@s",
    zIndex: 3,
  },

  ratingText: {
    color: "#fff",
    marginLeft: "4@s",
    fontSize: "11@s",
    fontWeight: "600",
  },

  contentWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  content: {
    padding: "12@s",
    zIndex: 2,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent'
  },

  bookBtn: {
    backgroundColor: '#E39325',
    alignItems: 'center',
    marginTop: 5,
    borderRadius: 5,
    padding: 10,
  },

  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: "14@s",
  },

  price: {
    color: "#EA7052",
    fontWeight: "700",
    marginTop: "4@vs",
    fontSize: "13@s",
  },
});

export default DishCard;
