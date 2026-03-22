import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Foundation } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { toggleFavorite } from '@/store/slices/menuSlice';
import type { AppDispatch } from '@/store';

interface Props {
  visible: boolean;
  onClose: () => void;
  menuId: string;
  alreadyFaved:boolean
}
const AddToFavoritesModal: React.FC<Props> = ({ visible, onClose, menuId, alreadyFaved }) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const handleAdd = async () => {
    if (!menuId) return Toast.show({ type: 'error', text1: 'No menu selected' });
    console.log('AddToFavoritesModal:menuId', menuId);
    setLoading(true);
    try {
      const resultAction: any = await dispatch(toggleFavorite(menuId));
      console.log('AddToFavoritesModal:toggleFavorite resultAction', resultAction);
      if (resultAction?.payload?.success) {
        Toast.show({ type: 'success', text1: resultAction.payload.message || 'Added to favourites' });
        onClose();
      } else {
        Toast.show({ type: 'error', text1: resultAction?.payload?.message || 'Failed' });
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message || err.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to favourites</Text>
            <TouchableOpacity onPress={onClose}>
              <Foundation size={24} name="x-circle" />
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={{ marginBottom: 12 }}>{alreadyFaved ? 'Would you like to add this special menu to your favourites?':'Would you like to remove this special menu from your favourites?'}</Text>
            <TouchableOpacity onPress={handleAdd} style={[styles.button, { backgroundColor: '#E39325' }]}> 
              <Text style={styles.buttonText}>{loading ? 'Saving...' : alreadyFaved ? 'Yes, add to favourites':'Yes, remove from favourites'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={[styles.button, { marginTop: 10 }]}> 
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: '16@ms' },
  header: { width: '100%', justifyContent: 'space-between', flexDirection: 'row' },
  title: { fontSize: '16@ms', fontWeight: '700' },
  button: { padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#eee' },
  buttonText: { color: '#fff', fontWeight: '700' },
});

export default AddToFavoritesModal;
