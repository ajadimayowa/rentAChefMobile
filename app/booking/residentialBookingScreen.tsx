import { Entypo, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "@/components/typography/SectionText";
import ReusableButton from "@/components/buttons/ReusableButton";
import FrameCard from "@/components/cards/FrameCard";
import { useLocalSearchParams } from "expo-router";
import { IService } from "@/interfaces/service";
import BodyText from "@/components/typography/BodyText";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ValidationError } from "yup";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cpApi } from "@/services/cpApi";
import Toast from "react-native-toast-message";
import PaymentModal from "@/components/modals/PaymentModal";
import { getServiceCategoryById } from "@/services/serviceCategoryService";
import MultiStepInput from "@/components/inputs/MultiStepInputType";
import PrimaryLoader from "@/components/Loader";
import CollapsableSelections, { CollapsableSelectionType } from "@/components/CollapsableSelections";
import { getMenus } from "@/services/menuService";
import { convertToThousand } from "@/helpers/utils";
import ResidentialTermsAndConditions from "@/components/steps/residentialChef/ResidentialTermsAndConditions";
import ChooseChef from "@/components/steps/residentialChef/ChooseChef";
import ResidentialBookingOptions from "@/components/steps/residentialChef/ResidentialBookingOptions";
import ResidentialBookingSummary from "@/components/steps/residentialChef/ResidentialBookingSummary";
import TermsAndConditions from "@/components/steps/TermsAndConditions";
import { getServiceById } from "@/services/serviceService";
import ResidentialChefLevelSelection from "@/components/steps/residentialChef/ResidentialChefLevelSelection";
import DatePickerModal from "@/components/modals/calendar/DatePickerModal";
import ListPickerModal from "@/components/modals/calendar/ListPickerModal";
import SelectActionButton from "@/components/buttons/SelectActionButton";
import ListObjectPickerModal from "@/components/modals/calendar/ListObjectPickerModal";
import ResidentialLocationDetails from "@/components/steps/residentialChef/ResidentialLocationDetails";
import ResidentialMenuAndDietry from "@/components/steps/residentialChef/ResidentialMenuAndDietry";
import ResidentialMenuWaitTime from "@/components/steps/residentialChef/ResidentialMenuWaitTime";
import ResidentialTestingSlotSelection from "@/components/steps/residentialChef/ResidentialTestingSlotSelection";

type BookingStepKey = "terms" | "selectChefLevel" | "clientDetails" | "testingSlot" | "servicePreferences" | "locationDetails" | "dietaryPreferences" | "waitingNumber" | "review";

interface IMenuSelection {
    id: string;
    name: string;
    description?: string;
    totalGroceryCost?: number;
    unitTotalGroceryCost?: number;
    noOfPeople?: number;
    menuTypeId?: string;
    menuTypeName?: string;
}

interface IChefCategoryFields {
    id: string;
    chefCatId: string;
    chefCatName: string;
    basePriceMinor: number;
    monthlySubFee: number;
    numberOfDays: number;

};

interface ResidentialServiceBookingFormValues {
    acceptedTerms: boolean;
    selectedChefLevel: IChefCategoryFields;

    fullName: string;
    startDate: Date | undefined;
    residentialAddress: string;
    noOfResidents: number;
    contactNumber: string;
    altContactNumber: string;

    testingSlotStart: string;
    testingSlotEnd: string;

    prefCuisine: string[];
    chefGenderPreference: string;
    serviceFreq: {
        frequency: number;
        fee: number;

    };
    serviceDays: string[];
    timeRange: string;
    mealTiming: {
        breakfast: {
            time: Date | undefined;
        };
        lunch: {
            time: Date | undefined;
        };
        dinner: {
            time: Date | undefined;
        };
    };

    isLocationFar: boolean;
    isGatedCommunity: boolean;
    gateAccessCode: string;
    isCodeSent: boolean;


    menuPreferences: string;
    spicyLevel: string;
    allergies: string;
    leftOverHandling: string;
    dietryPreferences: string;
    noteToChef: string;


    generatedWaitingNumber: string;

    menuTotalPrice: number;

    paymentOption: string;

    vat: number;
    transportationCost: number;
    serviceCharge: number;
    totalBookingCost: number;
    transactnRef: string;

    customerId: string;
    serviceId: string;
    serviceCategoryId: string;
    workflow: string;
}

interface StepDefinition {
    key: BookingStepKey;
    fields: (keyof ResidentialServiceBookingFormValues)[];
    schema: Yup.AnyObjectSchema;
}

interface ResidentialPaymentBreakdown {
    testingFee: number;
    monthlyPlanAmount: number;
    menuTotalPrice: number;
    serviceCharge: number;
    vat: number;
    transportationCost: number;
    dueTodayTotal: number;
    futureMonthlyRenewal: number;
}

const STEP_DEFINITIONS: StepDefinition[] = [
    {
        key: "terms",
        fields: ["acceptedTerms"],
        schema: Yup.object({
            acceptedTerms: Yup.boolean().oneOf([true], "You must accept the terms and conditions."),
        }),
    },
    {
        key: "selectChefLevel",
        fields: ["selectedChefLevel"],
        schema: Yup.object({
            selectedChefLevel: Yup.mixed().test(
                "chef-category",
                "Chef category selection is required.",
                (value) => !!(value as IChefCategoryFields)?.chefCatId
            ),
        }),
    },
    {
        key: "clientDetails",
        fields: ["startDate", "residentialAddress", "noOfResidents", "contactNumber", "altContactNumber"],
        schema: Yup.object({
            startDate: Yup.date().required("Start date is required."),
            residentialAddress: Yup.string().required("Residential address is required."),
            noOfResidents: Yup.number().required("Number of residents is required."),
            contactNumber: Yup.string().required("Contact number is required."),
            altContactNumber: Yup.string().required("Alternate contact number is required."),
        }),
    },
    {
        key: "testingSlot",
        fields: ["testingSlotStart", "testingSlotEnd"],
        schema: Yup.object({
            testingSlotStart: Yup.string().required("Preferred testing slot is required."),
            testingSlotEnd: Yup.string().required("Preferred testing slot is required."),
        }),
    },
    {
        key: "servicePreferences",
        fields: ["prefCuisine", "chefGenderPreference", "serviceFreq", "serviceDays", "timeRange", "mealTiming"],
        schema: Yup.object({
            prefCuisine: Yup.array().of(Yup.string().required()).min(1, "Preferred cuisine is required.").required("Preferred cuisine is required."),
            chefGenderPreference: Yup.string().required("Chef gender preference is required."),
            serviceFreq: Yup.object({
                frequency: Yup.number().required("Service frequency is required."),
                fee: Yup.number().required("Service fee is required."),
            }).required("Service frequency is required."),
            serviceDays: Yup.array().of(Yup.string()).required("Service days are required."),
            timeRange: Yup.string().required("Time range is required."),
            mealTiming: Yup.object({
                breakfast: Yup.object({
                    time: Yup.string().required("Breakfast time is required."),
                }).required("Breakfast time is required."),
                lunch: Yup.object({
                    time: Yup.string().required("Lunch time is required."),
                }).required("Lunch time is required."),
                dinner: Yup.object({
                    time: Yup.string().required("Dinner time is required."),
                }).required("Dinner time is required."),
            }).required("Meal timing is required."),

        }),

    },
    {
        key: "locationDetails",
        fields: ["isLocationFar", "isGatedCommunity", "gateAccessCode", "isCodeSent"],
        schema: Yup.object({
            isGatedCommunity: Yup.boolean().required("Gated community selection is required."),
            gateAccessCode: Yup.string().required("Gate access code is required."),
            isLocationFar: Yup.boolean().required("Location distance selection is required."),
        }),
    },
    {
        key: "dietaryPreferences",
        fields: ["menuPreferences", "spicyLevel", "allergies", "leftOverHandling", "noteToChef", "dietryPreferences"],
        schema: Yup.object({
            menuPreferences: Yup.string().required("Menu preferences are required."),
            spicyLevel: Yup.string().required("Spicy level selection is required."),
            allergies: Yup.string().required("Allergies information is required."),
            leftOverHandling: Yup.string().required("Leftover handling selection is required."),
            dietryPreferences: Yup.string().required("Dietary preferences are required."),
            noteToChef: Yup.string().required("Note to chef is required."),

        }),
    },
    {
        key: "waitingNumber",
        fields: ["generatedWaitingNumber"],
        schema: Yup.object({
            generatedWaitingNumber: Yup.number().required("Waiting number is required."),
        }),
    },
    {
        key: "review",
        fields: [],
        schema: Yup.object({}),
    },
];

export default function ResidentialServiceBookingScreen() {
    const profile = useSelector((state: RootState) => state.auth.bioData) as any;
    const navigation = useNavigation();
    const params = useLocalSearchParams<{ serviceId?: string | string[]; serviceName?: string | string[]; categoryId?: string | string[]; workflow?: string | string[] }>();
    const [serviceDetails, setServiceDetails] = useState<IService | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPreparingPayment, setIsPreparingPayment] = useState(false);
    const latestPaymentReferenceRef = useRef("");
    const [menuTypes, setMenuTypes] = useState<CollapsableSelectionType[]>([]);
    const [loadingMenus, setLoadingMenus] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);


    const [bookingSubmissionSuccessful, setBookingSubmissionSuccessful] = useState(false);

    const handleCloseSubmissionModal = () => {
        setShowSubmissionModal(false);
        setBookingSubmissionSuccessful(false);
    };

    const resolveParam = (value?: string | string[]) => {
        if (Array.isArray(value)) return String(value[0] || "").trim();
        return String(value || "").trim();
    };

    const requestedServiceId = params.serviceId;
    const requestedServiceName = useMemo(() => resolveParam(params?.serviceName), [params?.serviceName]);
    const requestedCategoryId = useMemo(() => resolveParam(params?.categoryId), [params?.categoryId]);
    const requestedWorkflow = useMemo(() => resolveParam(params?.workflow), [params?.workflow]);

    const activeStepDefinitions = useMemo(() => STEP_DEFINITIONS, []);
    const activeStepKey = activeStepDefinitions[currentStep]?.key;




    const formik = useFormik<ResidentialServiceBookingFormValues>({
        initialValues: {
            acceptedTerms: false,
            selectedChefLevel: {
                id: "",
                chefCatId: "",
                chefCatName: "",
                basePriceMinor: 0,
                monthlySubFee: 0,
                numberOfDays: 0,
            },

            fullName: profile?.fullName || "",
            startDate: undefined,
            residentialAddress: "",
            noOfResidents: 0,
            contactNumber: "",
            altContactNumber: "",

            testingSlotStart: "",
            testingSlotEnd: "",

            prefCuisine: [],
            chefGenderPreference: "",
            serviceFreq: {
                frequency: 0,
                fee: 0,
            },
            serviceDays: [],
            timeRange: "",
            mealTiming: {
                breakfast: {
                    time: undefined,
                },
                lunch: {
                    time: undefined,
                },
                dinner: {
                    time: undefined,
                },
            },

            isLocationFar: false,
            isGatedCommunity: false,
            gateAccessCode: "",
            isCodeSent: false,


            menuPreferences: "",
            spicyLevel: "",
            allergies: "",
            leftOverHandling: "",
            dietryPreferences: "",
            noteToChef: "",
            generatedWaitingNumber: "",

            customerId: String(profile?.id || ""),
            serviceId: params?.serviceId ? String(requestedServiceId) : "",
            serviceCategoryId: requestedCategoryId,
            workflow: requestedWorkflow || "ALASE_SERVICE",

            menuTotalPrice: 0,
            vat: 0,
            transportationCost: 0,
            serviceCharge: 0,
            totalBookingCost: 0,
            paymentOption: "",
            transactnRef: "",

        },
        onSubmit: async (values, helpers) => {
            setShowSubmissionModal(true);
            setBookingSubmissionSuccessful(false);

            if (!values.customerId) {
                Toast.show({ type: "error", text1: "Login required", text2: "Please login before creating booking." });
                helpers.setSubmitting(false);
                return;
            }

            const payload = {
                customerId: String(values.customerId),
                serviceId: String(values.serviceId),
                serviceCategoryId: String(values.serviceCategoryId),
                workflow: values.workflow,
                transactnRef: values.transactnRef || latestPaymentReferenceRef.current,
                bookingData: {
                    acceptedTerms: values.acceptedTerms,
                    chefComeInDays: values.serviceDays,
                    noOfResidents: values.noOfResidents,
                    selectedChefLevel: values.selectedChefLevel,
                    frequency: values.serviceFreq,
                    serviceDays: values.serviceDays,
                    testingFee: values.selectedChefLevel?.basePriceMinor || 0,
                    monthlySubFee: values.selectedChefLevel?.monthlySubFee || 0,
                    dayFreqMonthlySubFee: values.serviceFreq.fee || 0,
                    selectedDayFreq: values.serviceFreq.frequency || 0,
                    mealTiming: values.mealTiming,
                    prefCuisine: values.prefCuisine,
                    chefGenderPreference: values.chefGenderPreference,
                    residentialAddress: values.residentialAddress,
                    contactNumber: values.contactNumber,
                    altContactNumber: values.altContactNumber,
                    testingSlotStart: values.testingSlotStart,
                    testingSlotEnd: values.testingSlotEnd,
                    isLocationFar: values.isLocationFar,
                    isGatedCommunity: values.isGatedCommunity,
                    gateAccessCode: values.gateAccessCode,
                    isCodeSent: values.isCodeSent,
                    menuPreferences: values.menuPreferences,
                    spicyLevel: values.spicyLevel,
                    allergies: values.allergies,
                    leftOverHandling: values.leftOverHandling,
                    dietryPreferences: values.dietryPreferences,
                    noteToChef: values.noteToChef,
                    generatedWaitingNumber: values.generatedWaitingNumber,
                    fullName: values.fullName,
                    startDate: typeof values.startDate === "string" ? values.startDate : values.startDate?.toISOString(),
                    prefServTiming: values.timeRange,
                    serviceName: serviceDetails?.name || requestedServiceName || "Residential Service",
                    paymentOption: "instant",
                    menuTotalPrice: values.menuTotalPrice,
                    vat: values.vat,
                    transportationCost: values.transportationCost,
                    serviceCharge: values.serviceCharge,
                    totalBookingCost: values.totalBookingCost,
                    transactnRef: values.transactnRef || latestPaymentReferenceRef.current,
                },
            };

            try {
                await cpApi.createBooking(payload);
                Toast.show({ type: "success", text1: "Booking created" });
                setBookingSubmissionSuccessful(true);
            } catch (error: any) {
                Toast.show({ type: "error", text1: "Booking failed", text2: error?.message || "Please try again." });
                setShowSubmissionModal(false);
            } finally {
                helpers.setSubmitting(false);
            }
        },
    });

    const setFormFieldValue = formik.setFieldValue;
    const formValues = formik.values;

    const paymentBreakdown = useMemo<ResidentialPaymentBreakdown>(() => {
        const testingFee = Number(formValues.selectedChefLevel?.basePriceMinor || 0);
        const monthlyPlanAmount = Number(formValues.serviceFreq?.fee || formValues.selectedChefLevel?.monthlySubFee || 0);
        const menuTotalPrice = Number(formValues.menuTotalPrice || 0);
        const serviceCharge = Number((menuTotalPrice * 0.1).toFixed(2));
        const vat = Number(((menuTotalPrice + serviceCharge) * 0.075).toFixed(2));
        const transportationCost = 5000;
        const dueTodayTotal = Number((testingFee + monthlyPlanAmount + menuTotalPrice + serviceCharge + vat + transportationCost).toFixed(2));
        const futureMonthlyRenewal = Number(monthlyPlanAmount.toFixed(2));

        return {
            testingFee,
            monthlyPlanAmount,
            menuTotalPrice,
            serviceCharge,
            vat,
            transportationCost,
            dueTodayTotal,
            futureMonthlyRenewal,
        };
    }, [formValues.selectedChefLevel, formValues.serviceFreq, formValues.menuTotalPrice]);

    const instantPaymentAmount = paymentBreakdown.dueTodayTotal > 0 ? paymentBreakdown.dueTodayTotal : 0;

    const totalSteps = activeStepDefinitions.length;

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `${requestedServiceName || "Home Residential"} Booking`,
            headerShown: true,
            headerStyle: styles.headerStyle,
            headerTintColor: "#fff",
            headerTitleStyle: {
                fontWeight: "600",
                fontFamily: "titleFont",
            },
            headerLeft: () => <TouchableOpacity onPress={() => navigation.goBack()}><Entypo name="chevron-left" size={24} color="white" /></TouchableOpacity>
        });
    }, [navigation, requestedServiceName]);

    useEffect(() => {
        const fallbackCategoryId = String(
            (typeof serviceDetails?.categoryId === "string" ? serviceDetails.categoryId : serviceDetails?.categoryId?.id) || ""
        );
        const fallbackServiceId = String((serviceDetails as any)?.serviceId || (serviceDetails as any)?.id || "");

        if (fallbackCategoryId && !formValues.serviceCategoryId) {
            setFormFieldValue("serviceCategoryId", fallbackCategoryId, false);
        }

        if (fallbackServiceId && !formValues.serviceId) {
            setFormFieldValue("serviceId", fallbackServiceId, false);
        }

        if (serviceDetails?.workflow && !formValues.workflow) {
            setFormFieldValue("workflow", String(serviceDetails.workflow), false);
        }
    }, [serviceDetails, setFormFieldValue, formValues.serviceCategoryId, formValues.serviceId, formValues.workflow]);

    useEffect(() => {
        if (profile?.id && !formValues.customerId) {
            setFormFieldValue("customerId", String(profile.id), false);
        }
    }, [profile?.id, setFormFieldValue, formValues.customerId]);


    useEffect(() => {
        const { serviceCharge, vat, transportationCost, dueTodayTotal } = paymentBreakdown;

        if (Number(formValues.vat || 0) !== vat) {
            setFormFieldValue("vat", vat, false);
        }

        if (Number(formValues.transportationCost || 0) !== transportationCost) {
            setFormFieldValue("transportationCost", transportationCost, false);
        }

        if (Number(formValues.serviceCharge || 0) !== serviceCharge) {
            setFormFieldValue("serviceCharge", serviceCharge, false);
        }

        if (Number(formValues.totalBookingCost || 0) !== dueTodayTotal) {
            setFormFieldValue("totalBookingCost", dueTodayTotal, false);
        }
    }, [
        formValues.vat,
        formValues.transportationCost,
        formValues.serviceCharge,
        formValues.totalBookingCost,
        paymentBreakdown,
        setFormFieldValue,
    ]);



    useEffect(() => {
        if (currentStep > totalSteps - 1) {
            setCurrentStep(Math.max(totalSteps - 1, 0));
        }
    }, [currentStep, totalSteps]);

    const markCurrentStepTouched = () => {
        const currentFields = activeStepDefinitions[currentStep]?.fields || [];
        currentFields.forEach((fieldName) => {
            formik.setFieldTouched(fieldName, true, false);
        });
    };

    const validateStep = async () => {
        const activeStep = activeStepDefinitions[currentStep];
        if (!activeStep) return true;

        try {
            await activeStep.schema.validate(formik.values, { abortEarly: false });
            return true;
        } catch (error) {
            const nextErrors: Record<string, string> = {};

            if (error instanceof ValidationError) {
                error.inner.forEach((validationError) => {
                    if (validationError.path && !nextErrors[validationError.path]) {
                        nextErrors[validationError.path] = validationError.message;
                    }
                });
            }

            formik.setErrors({
                ...formik.errors,
                ...nextErrors,
            });
            markCurrentStepTouched();

            return false;
        }
    };

    const handleNext = async () => {
        const isValidCurrentStep = await validateStep();
        if (!isValidCurrentStep) return;

        if (currentStep < totalSteps - 1) {
            setCurrentStep((previousStep) => previousStep + 1);
            return;
        }

        formik.setFieldValue("paymentOption", "instant", false);
        setIsPreparingPayment(true);
        setShowPaymentModal(true);
    };

    const handleInstantPaymentSuccess = async (reference: string) => {
        if (!reference) {
            Toast.show({ type: "error", text1: "Payment error", text2: "Payment reference was not returned." });
            setIsPreparingPayment(false);
            return;
        }

        setShowPaymentModal(false);
        setIsPreparingPayment(false);
        latestPaymentReferenceRef.current = reference;
        await formik.setFieldValue("transactnRef", reference, false);
        await formik.submitForm();
    };

    const handlePrevious = () => {
        setCurrentStep((previousStep) => Math.max(previousStep - 1, 0));
    };


    const renderStep = () => {
        if (activeStepKey === "terms") {
            return (
                <TermsAndConditions
                    serviceId={formik.values.serviceId || ""}
                    serviceName={requestedServiceName ? String(requestedServiceName) : serviceDetails?.name || "Review Service"}
                    value={formik.values.acceptedTerms}
                    onChange={(nextValue) => formik.setFieldValue("acceptedTerms", nextValue)}
                    touched={!!formik.touched.acceptedTerms}
                    error={formik.errors.acceptedTerms}
                />
            );
        }

        if (activeStepKey === "selectChefLevel") {
            return (
                <ResidentialChefLevelSelection
                    title="Select Chef Expert Level"
                    description="Select the level of support you need. Our operations team will match and assign your specific chef after payment."
                    serviceId={formik.values.serviceId || ""}
                    selectedChefLevel={formik.values.selectedChefLevel as any}
                    onChange={(nextValue: IChefCategoryFields) => {
                        formik.setFieldValue("selectedChefLevel", nextValue);
                        formik.setFieldTouched("selectedChefLevel", true);
                    }}
                    touched={!!formik.touched.selectedChefLevel}
                    error={typeof formik.errors.selectedChefLevel === "string" ? formik.errors.selectedChefLevel : undefined}
                />
            );
        }

        if (activeStepKey === "clientDetails") {
            return (
                <>
                    <FrameCard style={{ alignItems: "center" }}>
                        <SectionText text="Client Details" />
                        <BodyText text="Basic information for your booking." textStyle={{ textAlign: "center" }} />
                    </FrameCard>

                    {Number(formik.values.noOfResidents) > 5 && (
                        <FrameCard style={{ backgroundColor: "#FFF7E6", borderWidth: 1, borderColor: "#F5A623" }}>
                            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "transparent" }}>
                                <Ionicons name="alert-circle-outline" size={20} color="#B45309" />
                                <BodyText
                                    text="Kindly note that each chef can serve a maximum of 5 residents. For more than 5 residents, an additional junior chef will be required, and the cost will be added to your invoice."
                                    textStyle={{ color: "#92400E", flex: 1 }}
                                />
                            </View>
                        </FrameCard>
                    )}

                    <FrameCard>
                        <SelectActionButton
                            value={formik.values.startDate ? formik.values.startDate.toDateString() : ""}
                            onPress={() => setShowDatePicker(true)}
                            label="Choose Start Date"
                        />
                        {
                            formik.touched.startDate && formik.errors.startDate &&
                            <BodyText text={String(formik.errors.startDate)} textStyle={{ color: "#B42318", marginTop: 6, marginBottom: 8 }} />
                        }

                        <MultiStepInput
                            label="Residential Address"
                            value={formik.values.residentialAddress || ""}
                            onChangeText={(nextValue) => {
                                formik.setFieldValue("residentialAddress", nextValue);
                            }}
                            onBlur={() => formik.setFieldTouched("residentialAddress", true)}
                            inputType="multiline"
                            touched={!!formik.touched.residentialAddress}
                            error={typeof formik.errors.residentialAddress === "string" ? formik.errors.residentialAddress : undefined}
                            placeholder="Enter your address"

                        />

                        <MultiStepInput
                            label="Number of Residents"
                            value={String(formik.values.noOfResidents || "")}
                            onChangeText={(nextValue) => {
                                const digitsOnly = nextValue.replace(/[^0-9]/g, "");
                                formik.setFieldValue("noOfResidents", digitsOnly);
                            }}
                            onBlur={() => formik.setFieldTouched("noOfResidents", true)}
                            inputType="number"
                            touched={!!formik.touched.noOfResidents}
                            error={typeof formik.errors.noOfResidents === "string" ? formik.errors.noOfResidents : undefined}
                            placeholder="0"
                        />

                        <MultiStepInput
                            label="Phone Contact (Very important)"
                            value={formik.values.contactNumber || ""}
                            onChangeText={(nextValue) => {
                                formik.setFieldValue("contactNumber", nextValue.replace(/[^0-9]/g, ""));
                            }}
                            onBlur={() => formik.setFieldTouched("contactNumber", true)}
                            inputType="number"
                            touched={!!formik.touched.contactNumber}
                            error={typeof formik.errors.contactNumber === "string" ? formik.errors.contactNumber : undefined}
                            placeholder="Enter your phone number"
                        />

                        <MultiStepInput
                            label="Alternative Phone Contact (Optional)"
                            value={formik.values.altContactNumber || ""}
                            onChangeText={(nextValue) => {
                                formik.setFieldValue("altContactNumber", nextValue.replace(/[^0-9]/g, ""));
                            }}
                            onBlur={() => formik.setFieldTouched("altContactNumber", true)}
                            inputType="number"
                            touched={!!formik.touched.altContactNumber}
                            error={typeof formik.errors.altContactNumber === "string" ? formik.errors.altContactNumber : undefined}
                            placeholder="Enter your phone number"
                        />
                    </FrameCard>
                </>
            );
        }

        if (activeStepKey === "testingSlot") {
            return (
                <ResidentialTestingSlotSelection
                    selectedStartDate={formik.values.testingSlotStart}
                    onChange={(slot) => {
                        formik.setFieldValue("testingSlotStart", slot.startDate);
                        formik.setFieldValue("testingSlotEnd", slot.endDate);
                        formik.setFieldTouched("testingSlotStart", true);
                        formik.setFieldTouched("testingSlotEnd", true);
                    }}
                    touched={!!formik.touched.testingSlotStart}
                    error={typeof formik.errors.testingSlotStart === "string" ? formik.errors.testingSlotStart : undefined}
                />
            );
        }

        if (activeStepKey === "servicePreferences") {
            return (
                <ResidentialBookingOptions
                    prefferedCuisine={formik.values.prefCuisine}
                    chefLevelName={formik.values.selectedChefLevel?.chefCatName}
                    onPrefferedCuisineChange={(nextValue) => {
                        formik.setFieldValue("prefCuisine", nextValue);
                        formik.setFieldTouched("prefCuisine", true);
                    }}

                    chefGenderPreference={formik.values.chefGenderPreference}
                    onChefGenderPreferenceChange={(nextValue) => {
                        formik.setFieldValue("chefGenderPreference", nextValue);
                        formik.setFieldTouched("chefGenderPreference", true);
                    }}
                    serviceFrequency={formik.values.serviceFreq}
                    onServiceFrequencyChange={(nextValue) => {
                        formik.setFieldValue("serviceFreq", nextValue);
                        formik.setFieldTouched("serviceFreq", true);
                    }}
                    chefComeInDays={formik.values.serviceDays}
                    onChefComeInDaysChange={(nextValue) => {
                        formik.setFieldValue("serviceDays", nextValue);
                        formik.setFieldTouched("serviceDays", true);
                    }}
                    prefTimeOfDay={formik.values.timeRange}
                    onPrefTimeOfDayChange={(nextValue) => {
                        formik.setFieldValue("timeRange", nextValue);
                        formik.setFieldTouched("timeRange", true);
                    }}
                    breakFastTime={formik.values.mealTiming.breakfast.time}
                    onBreakFastTimeChange={(nextValue) => {
                        formik.setFieldValue("mealTiming.breakfast.time", nextValue);
                        formik.setFieldTouched("mealTiming.breakfast.time", true);
                    }}
                    lunchTime={formik.values.mealTiming.lunch.time}
                    onLunchTimeChange={(nextValue) => {
                        formik.setFieldValue("mealTiming.lunch.time", nextValue);
                        formik.setFieldTouched("mealTiming.lunch.time", true);
                    }}
                    dinnerTime={formik.values.mealTiming.dinner.time}
                    onDinnerTimeChange={(nextValue) => {
                        formik.setFieldValue("mealTiming.dinner.time", nextValue);
                        formik.setFieldTouched("mealTiming.dinner.time", true);
                    }}

                />
            );
        }

        if (activeStepKey === "locationDetails") {
            return (
                <ResidentialLocationDetails
                    isFarArea={formik.values.isLocationFar ? 'Yes' : 'No'}
                    isGatedCommunity={formik.values.isGatedCommunity ? 'Yes' : 'No'}
                    gateAccessCode={formik.values.gateAccessCode}
                    isCodeSent={formik.values.isCodeSent ? 'Yes' : 'No'}
                    onIsFarAreaChange={(nextValue) => {
                        formik.setFieldValue("isLocationFar", nextValue === 'Yes');
                        formik.setFieldTouched("isLocationFar", true);
                    }}
                    onIsGatedCommunityChange={(nextValue) => {
                        formik.setFieldValue("isGatedCommunity", nextValue === 'Yes');
                        formik.setFieldTouched("isGatedCommunity", true);
                    }}
                    onGateAccessCodeChange={(nextValue) => {
                        formik.setFieldValue("gateAccessCode", nextValue);
                        formik.setFieldTouched("gateAccessCode", true);
                    }}
                    onIsCodeSentChange={(nextValue) => {
                        formik.setFieldValue("isCodeSent", nextValue === 'Yes');
                        formik.setFieldTouched("isCodeSent", true);
                    }}
                    onFieldTouched={formik.setFieldTouched}
                />
            );
        }

        if (activeStepKey === "dietaryPreferences") {
            return (
                <ResidentialMenuAndDietry
                    menuPreferences={formik.values.menuPreferences}
                    spicyLevel={formik.values.spicyLevel}
                    allergies={formik.values.allergies}
                    leftOverHandling={formik.values.leftOverHandling}
                    dietaryPreferences={formik.values.dietryPreferences || ""}
                    chefNotes={formik.values.noteToChef || ""}

                    onMenuPreferencesChange={(nextValue) => {
                        formik.setFieldValue("menuPreferences", nextValue);
                        formik.setFieldTouched("menuPreferences", true);
                    }}
                    onSpicyLevelChange={(nextValue) => {
                        formik.setFieldValue("spicyLevel", nextValue);
                        formik.setFieldTouched("spicyLevel", true);
                    }}
                    onAllergiesChange={(nextValue) => {
                        formik.setFieldValue("allergies", nextValue);
                        formik.setFieldTouched("allergies", true);
                    }}
                    onLeftOverHandlingChange={(nextValue) => {
                        formik.setFieldValue("leftOverHandling", nextValue);
                        formik.setFieldTouched("leftOverHandling", true);
                    }}
                    onDietaryPreferencesChange={(nextValue) => {
                        formik.setFieldValue("dietryPreferences", nextValue);
                        formik.setFieldTouched("dietryPreferences", true);
                    }}
                    onChefNotesChange={(nextValue) => {
                        formik.setFieldValue("noteToChef", nextValue);
                        formik.setFieldTouched("noteToChef", true);
                    }}
                    onFieldTouched={formik.setFieldTouched}
                />
            );
        }

        if (activeStepKey === "waitingNumber") {
            return (
                <ResidentialMenuWaitTime
                title="Your match is next"
                description={formik.values.generatedWaitingNumber
                    ? `You are number ${formik.values.generatedWaitingNumber} in the matching queue.`
                    : "Generating your matching queue number..."}
                chefLevelName={formik.values.selectedChefLevel?.chefCatName}
                serviceId={formik.values.serviceId || ""}
                customerId={formik.values.customerId || ""}
                    bookingWaitNumber={formik.values.generatedWaitingNumber}
                    onBookingWaitNumberChange={(nextValue) => {
                        formik.setFieldValue("generatedWaitingNumber", nextValue);
                        formik.setFieldTouched("generatedWaitingNumber", true);
                    }}
                    
                    onFieldTouched={formik.setFieldTouched}
                />
            );
        }

        if (activeStepKey === "review") {
            return (
                <ResidentialBookingSummary
                    bookingSummary={formik.values}
                    paymentBreakdown={paymentBreakdown}
                    submitLoading={formik.isSubmitting}
                    submitSuccess={bookingSubmissionSuccessful}
                    submitModalVisible={showSubmissionModal}
                    onSubmissionModalClose={handleCloseSubmissionModal}
                />
            );
        }

        return (
            <FrameCard>
                <SectionText text="Review booking" />
                <BodyText text={`Service: ${requestedServiceName || serviceDetails?.name || "Residential Service"}`} />
                <BodyText text={`Workflow: ${formik.values.workflow || "RESIDENTIAL_SERVICE"}`} />
                <BodyText text={`Event date: ${formik.values.startDate?.toLocaleDateString() || "-"}`} />
            </FrameCard>
        );
    };

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                // Fetch service details using the serviceId from params
                const response = await getServiceById(params.serviceId ? String(params.serviceId) : "");
                setServiceDetails(response);
            } catch (error) {
                console.error("Error fetching service details:", error);
            }
        };
        if (params.serviceId) {
            fetchServiceDetails();
        }
    }, [params.serviceId]);
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.containerHeader}>
                    <SectionText text={`Step ${currentStep + 1} of ${totalSteps}`} />
                </View>
                <ScrollView style={styles.containerScroll} keyboardShouldPersistTaps="handled">
                    {/* <BodyText text={serviceDetails?.name || ""} /> */}
                    {renderStep()}
                </ScrollView>

                <View style={styles.containerBottom}>
                    {currentStep > 0 && <ReusableButton title="Back" onPress={handlePrevious} style={{ width: "40%", borderRadius: 10 }} />}
                    <ReusableButton
                        title={
                            currentStep === totalSteps - 1
                                ? (isPreparingPayment ? "Preparing..." : "Pay")
                                : "Continue"
                        }
                        onPress={handleNext}
                        disabled={currentStep === totalSteps - 1 && isPreparingPayment}
                        style={{ width: currentStep > 0 ? "40%" : "90%", borderRadius: 10 }}
                    />
                </View>
            </KeyboardAvoidingView>

            <PaymentModal
                visible={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    setIsPreparingPayment(false);
                }}
                title="Complete Your Payment"
                description=""
                customerEmail={profile?.email ? String(profile.email) : ""}
                amount={instantPaymentAmount}
                onPaymentSuccess={handleInstantPaymentSuccess}
                onInitializationStateChange={(state: "idle" | "initializing" | "ready" | "error") => {
                    if (state === "ready" || state === "error" || state === "idle") {
                        setIsPreparingPayment(false);
                        return;
                    }

                    if (state === "initializing") {
                        setIsPreparingPayment(true);
                    }
                }}
            />

            <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                selectedDate={formik.values.startDate}
                onSelectDate={(date) => {
                    formik.setFieldValue("startDate", date);
                    formik.setFieldTouched("startDate", true);
                    setShowDatePicker(false);
                }}
            />
        </>

    )

}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F3F5"
    },
    containerHeader: {
        width: "100%",
        height: "50@vs",
        backgroundColor: "#ffffffff",
        padding: "10@ms",
        justifyContent: "center",
    },
    containerScroll: {
        width: "100%",
        backgroundColor: "#F3F3F5",
        padding: "10@s",
        flex: 1
    },
    containerBottom: {
        flexDirection: "row",
        gap: 10,
        width: "100%",
        height: "80@vs",
        backgroundColor: "#fff",
        padding: "10@ms",
        justifyContent: "center",
        alignItems: "center",
    },
    headerStyle: {
        backgroundColor: "#000000",
    },
    textInput: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#D0D5DD",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginTop: 12,
        backgroundColor: "#fff",
    },
    textArea: {
        minHeight: "100@vs",
        textAlignVertical: "top",
    },
    checkboxRowInline: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        marginTop: "10@vs",
        backgroundColor: "transparent",
    },
    checkableInline: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "transparent",
    },
    checkboxBase: {
        width: "20@ms",
        height: "20@ms",
        borderRadius: "4@ms",
        borderWidth: 1,
        borderColor: "#98A2B3",
        backgroundColor: "#fff",
    },
    checkboxChecked: {
        borderColor: "#111827",
        backgroundColor: "#111827",
    },

})