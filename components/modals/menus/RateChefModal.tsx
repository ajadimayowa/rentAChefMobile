import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Foundation } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { rateMenu } from '@/store/slices/menuSlice';
import { AppDispatch } from '@/store';
import { rateChef } from '@/store/slices/chefSlice';

interface Props {
  visible: boolean;
  onClose: () => void;
  chefId: string | null;
  bookingId?: string | null;
}

const RateChefModal: React.FC<Props> = ({ visible, onClose, chefId, bookingId }) => {
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const submit = async () => {
    if (!chefId) return Toast.show({ type: 'error', text1: 'No chef selected' });
    if (!bookingId) return Toast.show({ type: 'error', text1: 'No booking selected' });
    console.log('RateChefModal:chefId', chefId, 'rating', rating, 'review', review);
    if (rating < 1 || rating > 5) return Toast.show({ type: 'error', text1: 'Rating must be between 1 and 5' });

    setLoading(true);
    try {
      const resultAction: any = await dispatch(rateChef({ bookingId: bookingId!, chefId: chefId, rating, review }));
      console.log('RateChefModal:rateChef resultAction', resultAction);
      if (resultAction?.payload?.success) {
        Toast.show({ type: 'success', text1: 'Thanks for your feedback' });
        onClose();
      } else {
        Toast.show({ type: 'error', text1: resultAction?.payload?.message || 'Failed to submit rating' });
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
            <Text style={styles.title}>Rate chef</Text>
            <TouchableOpacity onPress={onClose}>
              <Foundation size={24} name="x-circle" />
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={{ marginBottom: 8 }}>Rating (1 - 5)</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {[1,2,3,4,5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} style={{ padding: 8, backgroundColor: s <= rating ? '#E39325' : '#eee', borderRadius: 6 }}>
                  <Text style={{ color: s <= rating ? '#fff' : '#000' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput placeholder="Optional review" value={review} onChangeText={setReview} multiline style={{ minHeight: 80, borderColor: '#ddd', borderWidth: 1, padding: 8, borderRadius: 6 }} />

            <TouchableOpacity onPress={submit} style={[styles.button, { backgroundColor: '#E39325', marginTop: 12 }]}> 
              <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Submit rating'}</Text>
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

export default RateChefModal;
