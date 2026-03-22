import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import api from '@/services/apiConfig';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import SectionText from '@/components/typography/SectionText';
import BodyText from '@/components/typography/BodyText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

const MenuSchema = Yup.object().shape({
  month: Yup.string().required('Month is required'),
  weeks: Yup.array()
    .of(
      Yup.object().shape({
        days: Yup.array()
          .of(
            Yup.object().shape({
              breakfast: Yup.string().required('Required'),
              lunch: Yup.string().required('Required'),
              dinner: Yup.string().required('Required'),
            })
          )
          .length(7)
      })
    )
    .length(4)
});

const MONTH_OPTIONS = [
  { label: 'February', value: '2026-02' },
  { label: 'March', value: '2026-03' },
  { label: 'April', value: '2026-04' },
];

export default function AddChefMenuScreen() {
  const chefProfile = useSelector((s: RootState) => s.chef?.chefData);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const DAYS_OF_WEEK = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  const pickImage = async () => {
    const res:any = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.cancelled) setImage(res.uri);
  };

  const handleSubmit = async (values: any) => {
    if (!image) return Toast.show({ type: 'error', text1: 'Please pick a menu image' });
    setUploading(true);
    try {
      const weeksPayload = values.weeks.map((w: any, idx: number) => {
        const days = w.days.map((d: any, dIdx: number) => ({
          day: DAYS_OF_WEEK[dIdx],
          breakfast: d.breakfast,
          lunch: d.lunch,
          dinner: d.dinner,
        }));
        return { weekNumber: idx + 1, days };
      });

      const formData = new FormData();
      formData.append('chefId', chefProfile?.id || chefProfile?.staffId || '');
      formData.append('createdBy', 'chef');
      formData.append('month', values.month);
      formData.append('weeks', JSON.stringify(weeksPayload));

      const uriParts = image.split('/');
      const name = uriParts[uriParts.length - 1];
      const file: any = { uri: Platform.OS === 'ios' && image.startsWith('file://') ? image : image, name, type: 'image/jpeg' };
      formData.append('menuPic', file as any);

      const res = await api.post('/menu/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res?.data) {
        Toast.show({ type: 'success', text1: 'Menu uploaded' });
      }
    } catch (err: any) {
      console.error(err);
      Toast.show({ type: 'error', text1: err?.response?.data?.message || err.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <SectionText text="Create Monthly Menu" />

      <Formik
        initialValues={{
          month: MONTH_OPTIONS[0].value,
          weeks: Array.from({ length: 4 }).map(() => ({ days: Array.from({ length: 7 }).map(() => ({ breakfast: '', lunch: '', dinner: '' })) })),
        }}
        validationSchema={MenuSchema}
        onSubmit={handleSubmit}
      >{({ values, handleChange, handleSubmit, errors, touched, setFieldValue }) => (
        <>
          <BodyText text="Month" />
          <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 8 }}>
            <Picker selectedValue={values.month} onValueChange={(v) => setFieldValue('month', v)}>
              {MONTH_OPTIONS.map((m) => <Picker.Item key={m.value} label={m.label} value={m.value} />)}
            </Picker>
          </View>
          {errors.month && touched.month && <Text style={styles.err}>{errors.month}</Text>}

          <View style={{ marginTop: 12 }}>
            <BodyText text="Weeks (4 weeks) - Fill each day's meals" />
            {values.weeks.map((w: any, wIdx: number) => (
              <View key={wIdx} style={{ marginTop: 12, padding: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 8 }}>
                <Text style={{ fontWeight: '700', marginBottom: 8 }}>{`Week ${wIdx + 1}`}</Text>
                {w.days.map((d: any, dIdx: number) => (
                  <View key={dIdx} style={{ marginBottom: 10 }}>
                    <Text style={{ fontWeight: '600' }}>{DAYS_OF_WEEK[dIdx]}</Text>
                    <TextInput placeholder="Breakfast" value={d.breakfast} onChangeText={(t) => setFieldValue(`weeks[${wIdx}].days[${dIdx}].breakfast`, t)} style={styles.input} />
                    <TextInput placeholder="Lunch" value={d.lunch} onChangeText={(t) => setFieldValue(`weeks[${wIdx}].days[${dIdx}].lunch`, t)} style={styles.input} />
                    <TextInput placeholder="Dinner" value={d.dinner} onChangeText={(t) => setFieldValue(`weeks[${wIdx}].days[${dIdx}].dinner`, t)} style={styles.input} />
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={{ marginTop: 12 }}>
            <BodyText text="Menu Image" />
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}><Text>Select Image</Text></TouchableOpacity>
            {image && <Image source={{ uri: image }} style={{ width: '100%', height: 180, marginTop: 8 }} />}
          </View>

          <TouchableOpacity onPress={() => handleSubmit()} style={[styles.submit, { backgroundColor: uploading ? '#ccc' : '#E39325' }]} disabled={uploading}><Text style={{ color: '#fff' }}>{uploading ? 'Uploading...' : 'Create Menu'}</Text></TouchableOpacity>
        </>
      )}</Formik>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  input: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 8 },
  err: { color: 'red' },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  imagePicker: { padding: 10, backgroundColor: '#f2f2f2', marginTop: 8, borderRadius: 6, alignItems: 'center' },
  submit: { padding: 12, alignItems: 'center', borderRadius: 8, marginTop: 16 }
});
