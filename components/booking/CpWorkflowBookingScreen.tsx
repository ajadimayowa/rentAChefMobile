import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { RootState } from '@/store';
import { CPChefLevel, CPWorkflowCode, cpApi } from '@/services/cpApi';

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
}

interface Props {
  title: string;
  workflowCode: CPWorkflowCode;
  fields: FieldDef[];
}

const chefLevels: CPChefLevel[] = ['JUNIOR', 'SENIOR', 'EXECUTIVE'];

export default function CpWorkflowBookingScreen({ title, workflowCode, fields }: Props) {
  const profile = useSelector((state: RootState) => state.auth.bioData) as any;
  const params = useLocalSearchParams<{
    serviceId?: string;
    serviceName?: string;
    categoryId?: string;
    workflow?: string;
  }>();

  const [chefLevel, setChefLevel] = useState<CPChefLevel>('JUNIOR');
  const [paymentModel, setPaymentModel] = useState<'instant' | 'quotation'>('instant');
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const bookingData = useMemo(() => {
    const payload: Record<string, unknown> = {};
    fields.forEach((field) => {
      const value = values[field.key];
      if (value !== undefined && value !== '') {
        const maybeNumber = Number(value);
        payload[field.key] = Number.isNaN(maybeNumber) ? value : maybeNumber;
      }
    });
    return payload;
  }, [fields, values]);

  const onSubmit = async () => {
    if (!profile?.id) {
      Toast.show({ type: 'error', text1: 'Login required' });
      return;
    }

    setLoading(true);
    try {
      const booking = await cpApi.createBooking({
        customerId: String(profile.id),
        serviceId: String(params.serviceId || ''),
        serviceCategoryId: String(params.categoryId || ''),
        workflow: params.workflow || 'HOME_CHEF',
        chefLevel,
        paymentModel,
        bookingData,
      });

      Toast.show({
        type: 'success',
        text1: 'Booking created',
        text2: `Booking No: ${booking?.bookingNumber || '-'}`,
      });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Booking failed', text2: error?.message || 'Try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Workflow: {workflowCode}</Text>

      <Text style={styles.section}>Chef Level</Text>
      <View style={styles.rowWrap}>
        {chefLevels.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.chip, chefLevel === level && styles.chipActive]}
            onPress={() => setChefLevel(level)}
          >
            <Text style={[styles.chipText, chefLevel === level && styles.chipTextActive]}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>Payment Model</Text>
      <View style={styles.rowWrap}>
        {['INSTANT', 'QUOTATION'].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.chip, paymentModel === mode && styles.chipActive]}
            onPress={() => setPaymentModel(mode.toLowerCase() as 'instant' | 'quotation')}
          >
            <Text style={[styles.chipText, paymentModel === mode.toLowerCase() && styles.chipTextActive]}>{mode}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>Booking Details</Text>
      {fields.map((field) => (
        <View key={field.key} style={styles.inputBlock}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            value={values[field.key] || ''}
            onChangeText={(text) => setValues((prev) => ({ ...prev, [field.key]: text }))}
            placeholder={field.placeholder}
            style={styles.input}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.submitBtn} disabled={loading} onPress={onSubmit}>
        <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Submit Booking'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  subtitle: { color: '#64748b' },
  section: { marginTop: 6, fontSize: 14, fontWeight: '600', color: '#1e293b' },
  rowWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 999 },
  chipActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  chipText: { color: '#334155', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  inputBlock: { gap: 6 },
  label: { fontSize: 13, color: '#334155', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  submitBtn: { marginTop: 8, backgroundColor: '#f97316', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700' },
});
