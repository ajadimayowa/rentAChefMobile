import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Button, Card, Checkbox, IconButton, Switch, Text, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { callApi } from "@/services/apiClient";
import { useNavigation } from "@react-navigation/native";

export interface BookingField {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  options?: { label: string; value: string }[];
  showWhen?: { field: string; value: string | boolean };
}

interface OptionItem {
  label: string;
  value: string;
  description?: string;
  icon?: string;
  priceLabel?: string;
}

interface SliderControl {
  type: "slider";
  name: string;
  label?: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  required?: boolean;
}

interface OptionsControl {
  type: "options";
  name: string;
  label?: string;
  options: OptionItem[];
  multiple?: boolean;
  variant?: "card" | "pill";
  required?: boolean;
}

interface DateControl {
  type: "date";
  name: string;
  label: string;
  required?: boolean;
}

interface TimeItem {
  name: string;
  label: string;
}

interface TimeListControl {
  type: "timeList";
  label?: string;
  items: TimeItem[];
  required?: boolean;
}

interface DateTimeField {
  name: string;
  label: string;
}

interface DateTimeControl {
  type: "dateTime";
  date: DateTimeField;
  arrival: DateTimeField;
  service: DateTimeField;
  required?: boolean;
}

interface CounterItem {
  id: string;
  label: string;
  priceLabel?: string;
  description?: string;
  section?: string;
}

interface CounterListControl {
  type: "counterList";
  name: string;
  label?: string;
  items: CounterItem[];
  required?: boolean;
}

interface SummaryItem {
  label: string;
  valueKey?: string;
  staticValue?: string;
  options?: OptionItem[];
  highlight?: boolean;
}

interface SummaryControl {
  type: "summary";
  items: SummaryItem[];
  note?: string;
  required?: boolean;
}

interface ToggleItem {
  name: string;
  label: string;
  description?: string;
}

interface ToggleGroupControl {
  type: "toggleGroup";
  items: ToggleItem[];
  required?: boolean;
}

type CalloutTone = "info" | "warning";

interface CalloutItem {
  tone: CalloutTone;
  title: string;
  body?: string;
  bullets?: string[];
}

interface CalloutControl {
  type: "callout";
  items: CalloutItem[];
}

interface StatusControl {
  type: "status";
  icon: string;
  title: string;
  subtitle?: string;
  infoText?: string;
  alertTitle?: string;
  alertText?: string;
  ctaLabel?: string;
  ctaMessage?: string;
}

interface PaymentRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface PaymentSection {
  title: string;
  subtitle?: string;
  rows: PaymentRow[];
  highlight?: boolean;
}

interface PaymentSummaryControl {
  type: "paymentSummary";
  sections: PaymentSection[];
  note?: string;
}

interface PackageChip {
  label: string;
  icon?: string;
}

interface PackageCardControl {
  type: "packageCard";
  price: string;
  subtitle: string;
  chips: PackageChip[];
  required?: boolean;
}

type BookingControl =
  | SliderControl
  | OptionsControl
  | DateControl
  | TimeListControl
  | DateTimeControl
  | CounterListControl
  | SummaryControl
  | ToggleGroupControl
  | PackageCardControl
  | CalloutControl
  | StatusControl
  | PaymentSummaryControl;

export interface BookingStep {
  key: string;
  title: string;
  description?: string;
  endpoint?: string;
  fields?: BookingField[];
  fieldsPosition?: "before" | "after";
  termsText?: string[];
  control?: BookingControl;
  controls?: BookingControl[];
  nextLabel?: string;
  backLabel?: string;
  hideBack?: boolean;
  hideProgress?: boolean;
}

interface Props {
  title: string;
  serviceId?: string;
  serviceName?: string;
  steps: BookingStep[];
}

const resolveEndpoint = (endpoint: string, serviceId?: string) => {
  return endpoint.replace(":serviceId", serviceId || "");
};

type FormValue = string | number | string[] | boolean;

const ServiceBookingFlowScreen: React.FC<Props> = ({ title, serviceId, serviceName, steps }) => {
  const navigation = useNavigation();
  const [stepIndex, setStepIndex] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});
  const [loading, setLoading] = useState(false);
  const [stepData, setStepData] = useState<any>(null);
  const [termsText, setTermsText] = useState<string[]>([]);
  const [termsLoading, setTermsLoading] = useState(false);
  const termsCacheRef = useRef<Record<string, string[]>>({});
  const [pickerState, setPickerState] = useState<{ fieldName: string; mode: "date" | "time"; value: Date } | null>(
    null,
  );
  const [counterValues, setCounterValues] = useState<Record<string, Record<string, number>>>({});

  const currentStep = steps[stepIndex];
  const isTermsStep = useMemo(() => currentStep?.key === "terms", [currentStep?.key]);
  const currentControls = useMemo(() => {
    if (currentStep?.controls?.length) return currentStep.controls;
    return currentStep?.control ? [currentStep.control] : [];
  }, [currentStep?.control, currentStep?.controls]);

  useEffect(() => {
    const headerTitle = serviceName || title;
    navigation.setOptions({ title: headerTitle });
  }, [navigation, serviceName, title]);

  useEffect(() => {
    const sliderControl = currentControls.find((control) => control.type === "slider") as SliderControl | undefined;
    if (!sliderControl) return;
    if (formValues[sliderControl.name] !== undefined) return;
    setFormValues((prev) => ({ ...prev, [sliderControl.name]: sliderControl.min }));
  }, [currentControls, formValues]);

  useEffect(() => {
    const fetchTerms = async () => {
      if (!isTermsStep) return;
      if (!serviceId) return;
      if (termsCacheRef.current[serviceId]) {
        setTermsText(termsCacheRef.current[serviceId]);
        return;
      }
      setTermsLoading(true);
      try {
        const data: any = await callApi("GET", `/service/${serviceId}`);
        const terms = data?.data?.termsAndConditions || [];
        const normalized = Array.isArray(terms) ? terms : [];
        termsCacheRef.current[serviceId] = normalized;
        setTermsText(normalized);
      } catch (error: any) {
        setTermsText([]);
        Toast.show({ type: "error", text1: error?.message || "Failed to fetch terms" });
      } finally {
        setTermsLoading(false);
      }
    };

    fetchTerms();
  }, [isTermsStep, serviceId]);

  const handleFetchStepData = async () => {
    if (!currentStep?.endpoint) return;
    if (!serviceId) return Toast.show({ type: "info", text1: "Missing service id" });
    setLoading(true);
    try {
      const data = await callApi("GET", resolveEndpoint(currentStep.endpoint, serviceId));
      setStepData(data);
    } catch (error: any) {
      Toast.show({ type: "error", text1: error?.message || "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  };

  const isValueEmpty = (value?: FormValue) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim().length === 0;
    if (typeof value === "boolean") return false;
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

  const handleNext = () => {
    if (isTermsStep && !acceptedTerms) {
      Toast.show({ type: "info", text1: "Accept terms to continue" });
      return;
    }

    const requiredFields = (currentStep?.fields || []).filter((field) => {
      if (!field.required) return false;
      if (!field.showWhen) return true;
      const currentValue = formValues[field.showWhen.field];
      return currentValue === field.showWhen.value;
    });
    const missingField = requiredFields.find((field) => !formValues[field.name]);
    if (missingField) {
      Toast.show({ type: "info", text1: `${missingField.label} is required` });
      return;
    }

    for (const control of currentControls) {
      if ('required' in control && control.required === false) continue;
      if (control.type === "slider" || control.type === "options" || control.type === "counterList") {
        const value = formValues[control.name];
        if (isValueEmpty(value)) {
          Toast.show({ type: "info", text1: `${control.label || currentStep?.title} is required` });
          return;
        }
      }

      if (control.type === "dateTime") {
        const dateMissing = isValueEmpty(formValues[control.date.name]);
        const arrivalMissing = isValueEmpty(formValues[control.arrival.name]);
        const serviceMissing = isValueEmpty(formValues[control.service.name]);
        if (dateMissing) {
          Toast.show({ type: "info", text1: `${control.date.label} is required` });
          return;
        }
        if (arrivalMissing) {
          Toast.show({ type: "info", text1: `${control.arrival.label} is required` });
          return;
        }
        if (serviceMissing) {
          Toast.show({ type: "info", text1: `${control.service.label} is required` });
          return;
        }
      }

      if (control.type === "date") {
        if (isValueEmpty(formValues[control.name])) {
          Toast.show({ type: "info", text1: `${control.label} is required` });
          return;
        }
      }

      if (control.type === "timeList") {
        const missingTime = control.items.find((item) => isValueEmpty(formValues[item.name]));
        if (missingTime) {
          Toast.show({ type: "info", text1: `${missingTime.label} is required` });
          return;
        }
      }
    }

    if (stepIndex >= steps.length - 1) {
      Toast.show({ type: "success", text1: "Booking steps completed" });
      return;
    }
    setStepIndex((prev) => prev + 1);
    setStepData(null);
  };

  const handleBack = () => {
    if (stepIndex === 0) return;
    setStepIndex((prev) => prev - 1);
    setStepData(null);
  };

  const formatDate = (value?: FormValue) => {
    if (!value) return "Select date";
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return "Select date";
    return date.toLocaleDateString();
  };

  const formatTime = (value?: FormValue) => {
    if (!value) return "Select time";
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return "Select time";
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const openPicker = (fieldName: string, mode: "date" | "time") => {
    const currentValue = formValues[fieldName];
    const baseDate = currentValue ? new Date(String(currentValue)) : new Date();
    setPickerState({ fieldName, mode, value: Number.isNaN(baseDate.getTime()) ? new Date() : baseDate });
  };

  const handlePickerChange = (_: any, selectedDate?: Date) => {
    if (!pickerState) return;
    if (Platform.OS !== "ios") {
      setPickerState(null);
    }
    if (!selectedDate) return;
    setFormValues((prev) => ({ ...prev, [pickerState.fieldName]: selectedDate.toISOString() }));
  };

  const renderFields = () => (
    <View style={styles.fieldsWrap}>
      {(currentStep?.fields || [])
        .filter((field) => {
          if (!field.showWhen) return true;
          const currentValue = formValues[field.showWhen.field];
          return currentValue === field.showWhen.value;
        })
        .map((field) => (
          <View key={field.name}>
            {field.options && field.options.length ? (
            <View style={styles.pickerWrap}>
              <Text style={styles.pickerLabel}>{field.label}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={String(formValues[field.name] ?? "")}
                  onValueChange={(value) => setFormValues((prev) => ({ ...prev, [field.name]: String(value) }))}
                >
                  <Picker.Item label={field.placeholder || "Select option"} value="" />
                  {field.options.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
            </View>
            ) : (
              <TextInput
                label={field.label}
                placeholder={field.placeholder}
                mode="outlined"
                value={String(formValues[field.name] ?? "")}
                onChangeText={(value) => setFormValues((prev) => ({ ...prev, [field.name]: value }))}
                keyboardType={field.keyboardType || "default"}
                style={styles.input}
              />
            )}
          </View>
        ))}
    </View>
  );

  const formatSummaryValue = (key: string, value?: FormValue) => {
    if (!value) return "-";
    if (key.includes("date")) return formatDate(value);
    if (key.includes("time")) return formatTime(value);
    return String(value);
  };

  const renderControlItem = (control: BookingControl) => {
    if (!control) return null;

    if (control.type === "slider") {
      const currentValue = Number(formValues[control.name] ?? control.min);
      return (
        <View style={styles.sliderWrap}>
          <Text style={styles.sliderLabel}>{control.label}</Text>
          <Slider
            minimumValue={control.min}
            maximumValue={control.max}
            step={control.step || 1}
            value={currentValue}
            onValueChange={(value) => setFormValues((prev) => ({ ...prev, [control.name]: value }))}
            minimumTrackTintColor="#F59E0B"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#F59E0B"
          />
          <View style={styles.sliderMetaRow}>
            <Text style={styles.sliderMeta}>{control.min}</Text>
            <Text style={styles.sliderValue}>
              {currentValue} {control.unit}
            </Text>
            <Text style={styles.sliderMeta}>{control.max}</Text>
          </View>
        </View>
      );
    }

    if (control.type === "options") {
      const currentValue = formValues[control.name];
      const selectedValues = Array.isArray(currentValue) ? currentValue : currentValue ? [String(currentValue)] : [];
      if (control.variant === "pill") {
        return (
          <View style={styles.controlBlock}>
            {control.label ? <Text style={styles.controlLabel}>{control.label}</Text> : null}
            <View style={styles.pillWrap}>
              {control.options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      if (control.multiple) {
                        const updated = isSelected
                          ? selectedValues.filter((value) => value !== option.value)
                          : [...selectedValues, option.value];
                        setFormValues((prev) => ({ ...prev, [control.name]: updated }));
                        return;
                      }
                      setFormValues((prev) => ({ ...prev, [control.name]: option.value }));
                    }}
                    style={[styles.pillButton, isSelected && styles.pillButtonSelected]}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      }
      return (
        <View style={styles.optionWrap}>
          {control.label ? <Text style={styles.controlLabel}>{control.label}</Text> : null}
          {control.options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  if (control.multiple) {
                    const updated = isSelected
                      ? selectedValues.filter((value) => value !== option.value)
                      : [...selectedValues, option.value];
                    setFormValues((prev) => ({ ...prev, [control.name]: updated }));
                    return;
                  }
                  setFormValues((prev) => ({ ...prev, [control.name]: option.value }));
                }}
              >
                <Card style={[styles.optionCard, isSelected && styles.optionCardSelected]}>
                  <Card.Content>
                    <View style={styles.optionHeader}>
                      <View style={styles.optionTitleRow}>
                        {option.icon ? (
                          <View style={styles.optionIconWrap}>
                            <MaterialCommunityIcons name={option.icon as any} size={24} color="#F59E0B" />
                          </View>
                        ) : null}
                        <Text style={styles.optionTitle}>{option.label}</Text>
                      </View>
                      {option.priceLabel ? <Text style={styles.optionPrice}>{option.priceLabel}</Text> : null}
                    </View>
                    {option.description ? <Text style={styles.optionDescription}>{option.description}</Text> : null}
                  </Card.Content>
                </Card>
              </Pressable>
            );
          })}
        </View>
      );
    }

    if (control.type === "date") {
      return (
        <View style={styles.dateTimeWrap}>
          <Text style={styles.dateTimeLabel}>{control.label}</Text>
          <Button mode="outlined" onPress={() => openPicker(control.name, "date")}>
            {formatDate(formValues[control.name])}
          </Button>
        </View>
      );
    }

    if (control.type === "timeList") {
      return (
        <View style={styles.timeListWrap}>
          {control.label ? <Text style={styles.controlLabel}>{control.label}</Text> : null}
          {control.items.map((item) => (
            <View key={item.name} style={styles.timeListItem}>
              <Text style={styles.dateTimeLabel}>{item.label}</Text>
              <Button mode="outlined" onPress={() => openPicker(item.name, "time")}>
                {formatTime(formValues[item.name])}
              </Button>
            </View>
          ))}
        </View>
      );
    }

    if (control.type === "counterList") {
      const stepCounts = counterValues[currentStep?.key || ""] || {};
      const groupedItems = control.items.reduce<Record<string, CounterItem[]>>((acc, item) => {
        const section = item.section || "Items";
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
      }, {});

      return (
        <View style={styles.counterWrap}>
          {Object.entries(groupedItems).map(([section, items]) => (
            <View key={section} style={styles.counterSection}>
              <View style={styles.counterHeader}>
                <Text style={styles.counterHeaderText}>{section}</Text>
              </View>
              {items.map((item) => {
                const count = stepCounts[item.id] || 0;
                return (
                  <Card key={item.id} style={styles.counterCard}>
                    <Card.Content style={styles.counterContent}>
                      <View style={styles.counterInfo}>
                        <Text style={styles.counterTitle}>{item.label}</Text>
                        {item.priceLabel ? <Text style={styles.counterPrice}>{item.priceLabel}</Text> : null}
                        {item.description ? <Text style={styles.counterDescription}>{item.description}</Text> : null}
                      </View>
                      <View style={styles.counterActions}>
                        <IconButton
                          icon="minus"
                          size={18}
                          mode="outlined"
                          onPress={() => {
                            const updated = Math.max(0, count - 1);
                            setCounterValues((prev) => {
                              const stepValue = { ...(prev[currentStep?.key || ""] || {}) };
                              stepValue[item.id] = updated;
                              return { ...prev, [currentStep?.key || ""]: stepValue };
                            });
                            const updatedSelection = {
                              ...(counterValues[currentStep?.key || ""] || {}),
                              [item.id]: updated,
                            };
                            const selected = Object.entries(updatedSelection)
                              .filter(([, value]) => value > 0)
                              .map(([id]) => id);
                            setFormValues((prev) => ({ ...prev, [control.name]: selected }));
                          }}
                        />
                        <Text style={styles.counterValue}>{count}</Text>
                        <IconButton
                          icon="plus"
                          size={18}
                          mode="outlined"
                          onPress={() => {
                            const updated = count + 1;
                            setCounterValues((prev) => {
                              const stepValue = { ...(prev[currentStep?.key || ""] || {}) };
                              stepValue[item.id] = updated;
                              return { ...prev, [currentStep?.key || ""]: stepValue };
                            });
                            const updatedSelection = {
                              ...(counterValues[currentStep?.key || ""] || {}),
                              [item.id]: updated,
                            };
                            const selected = Object.entries(updatedSelection)
                              .filter(([, value]) => value > 0)
                              .map(([id]) => id);
                            setFormValues((prev) => ({ ...prev, [control.name]: selected }));
                          }}
                        />
                      </View>
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          ))}
        </View>
      );
    }

    if (control.type === "dateTime") {
      return (
        <View style={styles.dateTimeWrap}>
          <Text style={styles.dateTimeLabel}>{control.date.label}</Text>
          <Button mode="outlined" onPress={() => openPicker(control.date.name, "date")}>
            {formatDate(formValues[control.date.name])}
          </Button>

          <Text style={styles.dateTimeLabel}>{control.arrival.label}</Text>
          <Button mode="outlined" onPress={() => openPicker(control.arrival.name, "time")}>
            {formatTime(formValues[control.arrival.name])}
          </Button>

          <Text style={styles.dateTimeLabel}>{control.service.label}</Text>
          <Button mode="outlined" onPress={() => openPicker(control.service.name, "time")}>
            {formatTime(formValues[control.service.name])}
          </Button>
        </View>
      );
    }

    if (control.type === "summary") {
      return (
        <View style={styles.summaryWrap}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              {control.items.map((item) => {
                const rawValue = item.valueKey ? formValues[item.valueKey] : undefined;
                const fallback = item.staticValue;
                const optionMatch = item.options?.find((option) => option.value === rawValue);
                const displayValue =
                  optionMatch?.label ||
                  (rawValue !== undefined && item.valueKey
                    ? formatSummaryValue(item.valueKey, rawValue)
                    : fallback || "-");
                return (
                  <View key={item.label} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                    <Text style={[styles.summaryValue, item.highlight && styles.summaryHighlight]}>{displayValue}</Text>
                  </View>
                );
              })}
            </Card.Content>
          </Card>
          {control.note ? (
            <View style={styles.summaryNote}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#2563EB" />
              <Text style={styles.summaryNoteText}>{control.note}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    if (control.type === "toggleGroup") {
      return (
        <View style={styles.toggleWrap}>
          {control.items.map((item) => (
            <Card key={item.name} style={styles.toggleCard}>
              <Card.Content style={styles.toggleContent}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>{item.label}</Text>
                  {item.description ? <Text style={styles.toggleDescription}>{item.description}</Text> : null}
                </View>
                <Switch
                  value={Boolean(formValues[item.name])}
                  onValueChange={(value) => setFormValues((prev) => ({ ...prev, [item.name]: value }))}
                  color="#F59E0B"
                />
              </Card.Content>
            </Card>
          ))}
        </View>
      );
    }

    if (control.type === "packageCard") {
      return (
        <View style={styles.packageWrap}>
          <Card style={styles.packageCard}>
            <View style={styles.packageHeader}>
              <Text style={styles.packagePrice}>{control.price}</Text>
              <Text style={styles.packageSubtitle}>{control.subtitle}</Text>
            </View>
            <View style={styles.packageChipRow}>
              {control.chips.map((chip) => (
                <View key={chip.label} style={styles.packageChip}>
                  {chip.icon ? (
                    <MaterialCommunityIcons name={chip.icon as any} size={20} color="#111827" />
                  ) : null}
                  <Text style={styles.packageChipLabel}>{chip.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      );
    }

    if (control.type === "callout") {
      return (
        <View style={styles.calloutWrap}>
          {control.items.map((item, index) => (
            <View
              key={`${item.title}-${index}`}
              style={[styles.calloutCard, item.tone === "warning" ? styles.calloutWarning : styles.calloutInfo]}
            >
              <View style={styles.calloutHeader}>
                <MaterialCommunityIcons
                  name={item.tone === "warning" ? "alert-circle-outline" : "information-outline"}
                  size={22}
                  color={item.tone === "warning" ? "#92400E" : "#1D4ED8"}
                />
                <Text style={styles.calloutTitle}>{item.title}</Text>
              </View>
              {item.body ? <Text style={styles.calloutBody}>{item.body}</Text> : null}
              {item.bullets?.length ? (
                <View style={styles.calloutList}>
                  {item.bullets.map((bullet) => (
                    <Text key={bullet} style={styles.calloutBullet}>• {bullet}</Text>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      );
    }

    if (control.type === "status") {
      return (
        <View style={styles.statusWrap}>
          <View style={styles.statusIconWrap}>
            <MaterialCommunityIcons name={control.icon as any} size={36} color="#F59E0B" />
          </View>
          <Text style={styles.statusTitle}>{control.title}</Text>
          {control.subtitle ? <Text style={styles.statusSubtitle}>{control.subtitle}</Text> : null}
          {control.infoText ? (
            <View style={styles.statusInfoBox}>
              <Text style={styles.statusInfoText}>{control.infoText}</Text>
            </View>
          ) : null}
          {control.alertTitle || control.alertText ? (
            <View style={styles.statusAlertBox}>
              {control.alertTitle ? <Text style={styles.statusAlertTitle}>{control.alertTitle}</Text> : null}
              {control.alertText ? <Text style={styles.statusAlertText}>{control.alertText}</Text> : null}
              {control.ctaLabel ? (
                <Button
                  mode="outlined"
                  onPress={() =>
                    Toast.show({ type: "info", text1: control.ctaMessage || "Action coming soon" })
                  }
                  style={styles.statusAlertButton}
                >
                  {control.ctaLabel}
                </Button>
              ) : null}
            </View>
          ) : null}
        </View>
      );
    }

    if (control.type === "paymentSummary") {
      return (
        <View style={styles.paymentWrap}>
          {control.sections.map((section, index) => (
            <Card key={`${section.title}-${index}`} style={styles.paymentCard}>
              <Card.Content>
                <Text style={styles.paymentTitle}>{section.title}</Text>
                {section.subtitle ? <Text style={styles.paymentSubtitle}>{section.subtitle}</Text> : null}
                {section.rows.map((row) => (
                  <View key={`${section.title}-${row.label}`} style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>{row.label}</Text>
                    <Text style={[styles.paymentValue, row.highlight && styles.paymentHighlight]}>{row.value}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))}
          {control.note ? (
            <View style={styles.paymentNote}>
              <Text style={styles.paymentNoteText}>{control.note}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {!currentStep?.hideProgress ? (
        <Text style={styles.subtitle}>Step {stepIndex + 1} of {steps.length}</Text>
      ) : null}

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.stepTitle}>{currentStep?.title}</Text>
          {currentStep?.description ? <Text style={styles.stepDescription}>{currentStep.description}</Text> : null}

          {isTermsStep ? (
            <View style={styles.termsWrap}>
              {termsLoading ? (
                <Text style={styles.stepDescription}>Loading terms...</Text>
              ) : null}
              {((termsText.length ? termsText : currentStep?.termsText) || [
                "Please review the terms and conditions before continuing.",
                "Bookings are subject to chef availability and confirmation.",
              ]).map((term, idx) => (
                <Text key={`${term}-${idx}`} style={styles.termItem}>• {term}</Text>
              ))}
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={acceptedTerms ? "checked" : "unchecked"}
                  onPress={() => setAcceptedTerms((prev) => !prev)}
                />
                <Text>I accept the terms and conditions</Text>
              </View>
            </View>
          ) : (
            <View style={styles.dynamicWrap}>
              {currentStep?.fieldsPosition === "before" && currentStep?.fields?.length ? renderFields() : null}
              {currentControls.map((control, index) => (
                <View key={`${currentStep?.key || "step"}-${control.type}-${index}`}>
                  {renderControlItem(control)}
                </View>
              ))}
              {currentStep?.fieldsPosition !== "before" && currentStep?.fields?.length ? renderFields() : null}
            </View>
          )}

          {pickerState ? (
            <DateTimePicker
              value={pickerState.value}
              mode={pickerState.mode}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handlePickerChange}
            />
          ) : null}

          {currentStep?.endpoint ? (
            <Button
              mode="outlined"
              onPress={handleFetchStepData}
              loading={loading}
              style={styles.fetchButton}
            >
              Fetch step data
            </Button>
          ) : null}

          {stepData ? (
            <View style={styles.dataBox}>
              <Text style={styles.dataTitle}>API Response</Text>
              <Text style={styles.dataText}>{JSON.stringify(stepData, null, 2)}</Text>
            </View>
          ) : null}

          <View style={styles.navRow}>
            {!currentStep?.hideBack ? (
              <Button mode="outlined" onPress={handleBack} disabled={stepIndex === 0}>
                {currentStep?.backLabel || "Back"}
              </Button>
            ) : null}
            <Button mode="contained" onPress={handleNext}>
              {currentStep?.nextLabel || "Next"}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = ScaledSheet.create({
  container: { padding: "20@ms" },
  title: { fontWeight: "700", marginBottom: "6@vs" },
  subtitle: { color: "#6B7280", marginBottom: "16@vs" },
  card: { borderRadius: "16@ms", padding: "8@ms" },
  stepTitle: { fontWeight: "600", marginBottom: "6@vs" },
  stepDescription: { color: "#6B7280", marginBottom: "12@vs" },
  termsWrap: { gap: "8@vs" },
  termItem: { color: "#374151" },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: "8@vs" },
  dynamicWrap: { gap: "16@vs" },
  fieldsWrap: { gap: "12@vs" },
  input: { backgroundColor: "#fff" },
  sliderWrap: { gap: "8@vs" },
  sliderLabel: { fontWeight: "600" },
  controlBlock: { gap: "10@vs" },
  controlLabel: { fontWeight: "600", color: "#111827" },
  sliderMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sliderMeta: { color: "#9CA3AF" },
  sliderValue: { fontWeight: "600", color: "#111827" },
  optionWrap: { gap: "12@vs" },
  optionCard: { borderRadius: "14@ms", borderWidth: 1, borderColor: "#E5E7EB" },
  optionCardSelected: { borderColor: "#F59E0B", backgroundColor: "#FFFBEB" },
  optionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: "4@vs" },
  optionTitleRow: { flexDirection: "row", alignItems: "center", gap: "10@ms" },
  optionIconWrap: { width: "36@ms", height: "36@ms", borderRadius: "18@ms", backgroundColor: "#FFFBEB", alignItems: "center", justifyContent: "center" },
  optionTitle: { fontWeight: "600" },
  optionDescription: { color: "#6B7280" },
  optionPrice: { color: "#F59E0B", fontWeight: "700" },
  pillWrap: { flexDirection: "row", flexWrap: "wrap", gap: "10@ms" },
  pillButton: { borderRadius: "999@ms", borderWidth: 1, borderColor: "#E5E7EB", paddingVertical: "8@vs", paddingHorizontal: "14@ms", backgroundColor: "#fff" },
  pillButtonSelected: { borderColor: "#F59E0B", backgroundColor: "#FFFBEB" },
  pillText: { color: "#4B5563", fontWeight: "600" },
  pillTextSelected: { color: "#B45309" },
  counterWrap: { gap: "16@vs" },
  counterSection: { gap: "10@vs" },
  counterHeader: { backgroundColor: "#111827", borderRadius: "12@ms", paddingVertical: "10@vs", paddingHorizontal: "14@ms" },
  counterHeaderText: { color: "#FBBF24", fontWeight: "600" },
  counterCard: { borderRadius: "12@ms" },
  counterContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  counterInfo: { flex: 1, paddingRight: "10@ms" },
  counterTitle: { fontWeight: "600", marginBottom: "4@vs" },
  counterPrice: { color: "#F59E0B", fontWeight: "600", marginBottom: "4@vs" },
  counterDescription: { color: "#6B7280" },
  counterActions: { flexDirection: "row", alignItems: "center" },
  counterValue: { fontWeight: "600", marginHorizontal: "6@ms", minWidth: "20@ms", textAlign: "center" },
  dateTimeWrap: { gap: "10@vs" },
  dateTimeLabel: { fontWeight: "600" },
  timeListWrap: { gap: "12@vs" },
  timeListItem: { gap: "8@vs" },
  summaryWrap: { gap: "12@vs" },
  summaryCard: { borderRadius: "14@ms" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: "6@vs" },
  summaryLabel: { color: "#6B7280", fontWeight: "600" },
  summaryValue: { color: "#111827", fontWeight: "600" },
  summaryHighlight: { color: "#F59E0B" },
  summaryNote: { flexDirection: "row", alignItems: "center", gap: "8@ms", backgroundColor: "#EFF6FF", padding: "12@ms", borderRadius: "12@ms" },
  summaryNoteText: { color: "#1D4ED8", flex: 1 },
  toggleWrap: { gap: "12@vs" },
  toggleCard: { borderRadius: "14@ms" },
  toggleContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleInfo: { flex: 1, paddingRight: "12@ms" },
  toggleTitle: { fontWeight: "600", marginBottom: "4@vs" },
  toggleDescription: { color: "#6B7280" },
  pickerWrap: { gap: "8@vs" },
  pickerLabel: { fontWeight: "600", color: "#111827" },
  pickerContainer: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: "12@ms", overflow: "hidden" },
  packageWrap: { gap: "12@vs" },
  packageCard: { borderRadius: "18@ms", overflow: "hidden" },
  packageHeader: { backgroundColor: "#F59E0B", paddingVertical: "20@vs", paddingHorizontal: "16@ms", alignItems: "center" },
  packagePrice: { color: "#fff", fontWeight: "700", fontSize: "28@ms" },
  packageSubtitle: { color: "#fff", marginTop: "6@vs" },
  packageChipRow: { flexDirection: "row", justifyContent: "space-around", paddingVertical: "16@vs", backgroundColor: "#fff" },
  packageChip: { alignItems: "center", gap: "6@vs" },
  packageChipLabel: { fontWeight: "600", color: "#111827" },
  calloutWrap: { gap: "12@vs" },
  calloutCard: { borderRadius: "14@ms", padding: "14@ms", gap: "10@vs" },
  calloutInfo: { backgroundColor: "#EFF6FF" },
  calloutWarning: { backgroundColor: "#FEF3C7" },
  calloutHeader: { flexDirection: "row", alignItems: "center", gap: "8@ms" },
  calloutTitle: { fontWeight: "700", color: "#111827" },
  calloutBody: { color: "#374151" },
  calloutList: { gap: "6@vs" },
  calloutBullet: { color: "#92400E" },
  statusWrap: { alignItems: "center", gap: "14@vs" },
  statusIconWrap: { width: "84@ms", height: "84@ms", borderRadius: "42@ms", backgroundColor: "#FFFBEB", alignItems: "center", justifyContent: "center" },
  statusTitle: { fontSize: "20@ms", fontWeight: "700", textAlign: "center" },
  statusSubtitle: { color: "#6B7280", textAlign: "center" },
  statusInfoBox: { backgroundColor: "#EFF6FF", padding: "12@ms", borderRadius: "12@ms" },
  statusInfoText: { color: "#1D4ED8", textAlign: "center" },
  statusAlertBox: { backgroundColor: "#FFFBEB", padding: "14@ms", borderRadius: "14@ms", width: "100%", gap: "8@vs" },
  statusAlertTitle: { fontWeight: "700", color: "#92400E" },
  statusAlertText: { color: "#92400E" },
  statusAlertButton: { alignSelf: "flex-start" },
  paymentWrap: { gap: "14@vs" },
  paymentCard: { borderRadius: "16@ms" },
  paymentTitle: { fontWeight: "700", marginBottom: "4@vs" },
  paymentSubtitle: { color: "#6B7280", marginBottom: "10@vs" },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: "4@vs" },
  paymentLabel: { color: "#4B5563" },
  paymentValue: { fontWeight: "600", color: "#111827" },
  paymentHighlight: { color: "#F59E0B" },
  paymentNote: { backgroundColor: "#F9FAFB", padding: "12@ms", borderRadius: "12@ms" },
  paymentNoteText: { color: "#6B7280" },
  fetchButton: { marginTop: "12@vs", alignSelf: "flex-start" },
  dataBox: { marginTop: "12@vs", backgroundColor: "#F9FAFB", padding: "10@ms", borderRadius: "10@ms" },
  dataTitle: { fontWeight: "600", marginBottom: "6@vs" },
  dataText: { color: "#4B5563" },
  navRow: { marginTop: "16@vs", flexDirection: "row", justifyContent: "space-between" },
});

export default ServiceBookingFlowScreen;
