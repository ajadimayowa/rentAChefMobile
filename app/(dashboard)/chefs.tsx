// app/(tabs)/guest-chefs.tsx
import React, { useEffect, useState, useLayoutEffect, useCallback } from "react";
import { View, FlatList, Text, RefreshControl, TouchableOpacity, ScrollView } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import SectionText from "@/components/typography/SectionText";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import DishCard from "@/components/DishCard";
import PrimaryLoader from "@/components/Loader";
import { IChef } from "@/interfaces/chef";
import { router, useNavigation } from "expo-router";
import BodyText from "@/components/typography/BodyText";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { TextInput } from "react-native-paper";
import { getChefLevels, IChefLevelOption } from "@/services/chefService";

const PAGE_SIZE = 10;

type FetchMode = "initial" | "refresh" | "more";

export default function ChefsScreen() {

  const [chefs, setChefs] = useState<IChef[]>([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [categories, setCategories] = useState<IChefLevelOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const navigation = useNavigation();
  const userProfile = useSelector((user: RootState) => user.auth);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: styles.headerStyle,
      headerTintColor: "#fff",

      headerTitle: () => (
        <View>
          <BodyText
          textStyle={{color:'#fff',fontSize:15, fontFamily:'titleFont'}}
            text={`Our Chefs`}
          />
          <View style={styles.searchBox}>
                  <TextInput
                    placeholder="Search chefs by name..."
                    placeholderTextColor="#999"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <Ionicons name="search-outline" size={20} color="#999" />
                </View>
        </View>
      ),

      headerTitleStyle: {
        fontWeight: "600",
        fontFamily: "titleFont",
      },

      // headerLeft: () => (
      //   <TouchableOpacity onPress={() => navigation.goBack()}>
      //     <Entypo name="chevron-left" size={24} color="white" />
      //   </TouchableOpacity>
      // ),
    });
  }, [navigation, searchQuery]);

  // Debounce the search box so we're not hitting the API on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Chef categories, fetched once, used to filter/sort the list by category
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const levels = await getChefLevels();
        setCategories(levels);
      } catch (error) {
        // Non-fatal — the list still works without category chips
      }
    };

    loadCategories();
  }, []);

  const fetchChefs = useCallback(async (targetPage: number, mode: FetchMode) => {
    if (mode === "initial") setLoading(true);
    if (mode === "refresh") setRefreshing(true);
    if (mode === "more") setLoadingMore(true);

    try {
      const params: Record<string, any> = { page: targetPage, limit: PAGE_SIZE };
      if (debouncedSearch) params.name = debouncedSearch;
      if (selectedCategoryId) params.category = selectedCategoryId;

      const res = await api.get('/chefs', { params });

      if (res?.data?.success) {
        const payload: IChef[] = res?.data?.payload || [];
        const meta = res?.data?.meta;

        setChefs((prev) => (mode === "more" ? [...prev, ...payload] : payload));
        setPage(targetPage);
        setTotalPages(meta?.totalPages ?? 1);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Network error',
          text2: res?.data?.message || 'Something went wrong!',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch chefs',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, selectedCategoryId]);

  // Re-fetch from page 1 whenever the search term or category filter changes
  // (this also covers the very first load, on mount).
  useEffect(() => {
    fetchChefs(1, "initial");
  }, [fetchChefs]);

  const handleRefresh = () => {
    fetchChefs(1, "refresh");
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || refreshing) return;
    if (page >= totalPages) return;

    fetchChefs(page + 1, "more");
  };

  const hasActiveFilters = Boolean(debouncedSearch || selectedCategoryId);

  const categoryChips = categories.length > 0 && (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryRow}
    >
      <TouchableOpacity
        onPress={() => setSelectedCategoryId(undefined)}
        style={[styles.categoryChip, !selectedCategoryId && styles.categoryChipActive]}
      >
        <Text style={[styles.categoryChipText, !selectedCategoryId && styles.categoryChipTextActive]}>
          All
        </Text>
      </TouchableOpacity>

      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategoryId(category.id)}
          style={[styles.categoryChip, selectedCategoryId === category.id && styles.categoryChipActive]}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategoryId === category.id && styles.categoryChipTextActive,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <PrimaryLoader />
      ) : (
        <FlatList
          data={chefs}
          keyExtractor={(chef, index) => chef?.id || String(index)}
          renderItem={({ item }) => (
            <View>
              <ChefCard chef={item} />
            </View>
          )}
          contentContainerStyle={{ padding: 10, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={categoryChips || null}
          ListFooterComponent={loadingMore ? <PrimaryLoader /> : null}
          ListEmptyComponent={
            <View style={{ width: '100%', height: 200, alignItems: 'center', alignSelf: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="chef-hat" size={48} style={{ margin: 10 }} color={Colors.primary.base} />
              <Text style={{ width: '100%', textAlign: 'center' }}>
                {hasActiveFilters ? 'No chefs match your search' : 'No Chefs At This Time'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerStyle: {
        backgroundColor: "#000000",
        height:'125@s'
    },
  searchBox: {
    flexDirection: "row",
    justifyContent:'space-between',
    paddingHorizontal:'10@s',
    alignItems: "center",
    backgroundColor: "#f8f8fb",
    borderRadius: "5@s",
    minWidth:'100%',
    height:'40@s'
  },
  searchInput: {color: "#333", backgroundColor:'#fbf9f9',width:'80%', height:'35@s'},
  categoryRow: {
    paddingBottom: '12@vs',
    gap: '8@s',
  },
  categoryChip: {
    paddingHorizontal: '14@s',
    paddingVertical: '7@vs',
    borderRadius: '20@s',
    backgroundColor: '#f8f8fb',
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary.base,
    borderColor: Colors.primary.base,
  },
  categoryChipText: {
    fontSize: '12@ms',
    color: '#555',
    fontFamily: 'secondaryFont',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
});
