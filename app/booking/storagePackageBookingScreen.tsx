import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "@/components/typography/SectionText";
import ReusableButton from "@/components/buttons/ReusableButton";
import FrameCard from "@/components/cards/FrameCard";
import TermsAndConditions from "@/components/steps/TermsAndConditions";
import { useLocalSearchParams } from "expo-router";
import { getServiceById } from "@/services/serviceService";
import { ServiceDetails } from "@/interfaces/service";
import BodyText from "@/components/typography/BodyText";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ValidationError } from "yup";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cpApi } from "@/services/cpApi";
import Toast from "react-native-toast-message";
import EventCateringDateDetails from "@/components/steps/eventcatering/EventCateringDateDetails";
import EventCateringBookingSummary from "@/components/steps/eventcatering/EventCateringBookingSummary";
import PaymentModal from "@/components/modals/PaymentModal";
import StorageOptionDisplay from "@/components/steps/storagepackage/StorageOptionDisplay";
import StorageOptionSelections from "@/components/steps/storagepackage/StorageOptionSelections";

type BookingStepKey = "terms" | "storageBookingDesc" | "optionSelection" | "location" | "serviceOption" | "menuClassSelection" | "chooseMenus" | "review";

interface EventCateringBookingFormValues {
    acceptedTerms: boolean;
    menuTotalPrice: number;

    riceOneDish: string;
    riceTwoDish: string;
    soupOneDish: string;
    soupTwoDish: string;
    sideDish: string;

    addProteinToRice: boolean;
    enabledVeganMode: boolean;

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

    deliveryAddress: string;
    additionalNote: string;
    startDate: Date | undefined
    endDate?: Date | undefined
    arrivalTime: Date | undefined
    serviceTime: Date | undefined
}

interface StepDefinition {
    key: BookingStepKey;
    fields: (keyof EventCateringBookingFormValues)[];
    schema: Yup.AnyObjectSchema;
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
        key: "storageBookingDesc",
        fields: ["deliveryAddress"],
        schema: Yup.object({
            deliveryAddress: Yup.string().trim().min(5, "Delivery address is too short.").required("Delivery address is required."),

        }),
    },
    {
        key: "optionSelection",
        fields: ["riceOneDish", "riceTwoDish", "soupOneDish", "soupTwoDish", "sideDish", "addProteinToRice", "enabledVeganMode"],
        schema: Yup.object({
            riceOneDish: Yup.string().trim().min(1, "Rice one dish is required.").required("Rice one dish is required."),
            riceTwoDish: Yup.string().trim().min(1, "Rice two dish is required.").required("Rice two dish is required."),
            soupOneDish: Yup.string().trim().min(1, "Soup one dish is required.").required("Soup one dish is required."),
            soupTwoDish: Yup.string().trim().min(1, "Soup two dish is required.").required("Soup two dish is required."),
            sideDish: Yup.string().trim().min(1, "Side dish is required.").required("Side dish is required."),
            addProteinToRice: Yup.boolean(),
            enabledVeganMode: Yup.boolean(),
        }),
    },
    {
        key: "location",
        fields: ["startDate", "arrivalTime", "serviceTime", "additionalNote"],
        schema: Yup.object({
            startDate: Yup.date().required("Start date is required."),
            arrivalTime: Yup.date().required("Arrival time is required."),
            serviceTime: Yup.date().required("Service time is required."),
            additionalNote: Yup.string().trim().min(1, "Additional note is required.").required("Additional note is required."),
        }),
    },
    {
        key: "review",
        fields: [],
        schema: Yup.object({}),
    },
];

export default function EventCateringBookingScreen() {
    const profile = useSelector((state: RootState) => state.auth.bioData) as any;
    const navigation = useNavigation();
    const params = useLocalSearchParams<{ serviceId?: string | string[]; serviceName?: string | string[]; categoryId?: string | string[]; workflow?: string | string[] }>();
    const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPreparingPayment, setIsPreparingPayment] = useState(false);
    const latestPaymentReferenceRef = useRef("");

    const [bookingSubmissionSuccessful, setBookingSubmissionSuccessful] = useState(false);

    const handleCloseSubmissionModal = () => {
        setShowSubmissionModal(false);
        setBookingSubmissionSuccessful(false);
    };

    const resolveParam = (value?: string | string[]) => {
        if (Array.isArray(value)) return String(value[0] || "").trim();
        return String(value || "").trim();
    };

    const requestedServiceId = useMemo(() => resolveParam(params?.serviceId), [params?.serviceId]);
    const requestedServiceName = useMemo(() => resolveParam(params?.serviceName), [params?.serviceName]);
    const requestedCategoryId = useMemo(() => resolveParam(params?.categoryId), [params?.categoryId]);
    const requestedWorkflow = useMemo(() => resolveParam(params?.workflow), [params?.workflow]);



    const formik = useFormik<EventCateringBookingFormValues>({
        initialValues: {

            acceptedTerms: false,
            menuTotalPrice: 80000,

            riceOneDish: "",
            riceTwoDish: "",
            soupOneDish: "",
            soupTwoDish: "",
            sideDish: "",

            addProteinToRice: false,
            enabledVeganMode: false,

            paymentOption: "instant",
            vat: 0,
            transportationCost: 0,
            serviceCharge: 0,
            totalBookingCost: 0,
            transactnRef: "",

            customerId: String(profile?.id || ""),
            serviceId: requestedServiceId,
            serviceCategoryId: requestedCategoryId,
            workflow: requestedWorkflow || "ALASE_SERVICE",

            deliveryAddress: "",
            additionalNote: "",

            startDate: undefined,
            endDate: undefined,
            arrivalTime: undefined,
            serviceTime: undefined,
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
                    startDate: typeof values.startDate === "string" ? values.startDate : values.startDate?.toISOString(),
                    endDate: typeof values.endDate === "string" ? values.endDate : values.endDate?.toISOString(),
                    arrivalTime: typeof values.arrivalTime === "string" ? values.arrivalTime : values.arrivalTime?.toISOString(),
                    serviceTime: typeof values.serviceTime === "string" ? values.serviceTime : values.serviceTime?.toISOString(),
                    deliveryAddress: values.deliveryAddress,
                    serviceName: serviceDetails?.name || requestedServiceName || "Alase Service",
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
                console.log("Booking payload sent:", payload);
            } catch (error: any) {
                Toast.show({ type: "error", text1: "Booking failed", text2: error?.message || "Please try again." });
            } finally {
                helpers.setSubmitting(false);
            }
        },
    });

    const setFormFieldValue = formik.setFieldValue;
    const formValues = formik.values;

    const instantPaymentAmount = useMemo(() => {
        const menuTotalPrice = Number(formValues.menuTotalPrice || 0);
        const serviceCharge = Number((menuTotalPrice * 0.1).toFixed(2));
        const vat = Number(((menuTotalPrice + serviceCharge) * 0.075).toFixed(2));
        const transportationCost = Number(formValues.transportationCost || 5000);
        const computedTotalBookingCost = Number((menuTotalPrice + serviceCharge + vat + transportationCost).toFixed(2));

        return computedTotalBookingCost > 0 ? computedTotalBookingCost : 0;
    }, [formValues.menuTotalPrice, formValues.transportationCost]);

    const activeStepDefinitions = useMemo(() => {
        return STEP_DEFINITIONS;
    }, []);

    const totalSteps = activeStepDefinitions.length;

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `${requestedServiceName || "Alase"} Booking`,
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
        const fallbackCategoryId = String(serviceDetails?.categoryId?._id || "");

        if (fallbackCategoryId && !formValues.serviceCategoryId) {
            setFormFieldValue("serviceCategoryId", fallbackCategoryId, false);
        }

        if (serviceDetails?.workflow && !formValues.workflow) {
            setFormFieldValue("workflow", String(serviceDetails.workflow), false);
        }
    }, [serviceDetails, setFormFieldValue, formValues.serviceCategoryId, formValues.workflow]);

    useEffect(() => {
        if (profile?.id && !formValues.customerId) {
            setFormFieldValue("customerId", String(profile.id), false);
        }
    }, [profile?.id, setFormFieldValue, formValues.customerId]);


    useEffect(() => {
        const menuTotalPrice = Number(formValues.menuTotalPrice || 0);
        const serviceCharge = Number((menuTotalPrice * 0.1).toFixed(2));
        const vat = Number(((menuTotalPrice + serviceCharge) * 0.075).toFixed(2));
        const transportationCost = 5000
        const totalBookingCost = Number((menuTotalPrice + serviceCharge + vat + transportationCost).toFixed(2));

        if (Number(formValues.vat || 0) !== vat) {
            setFormFieldValue("vat", vat, false);
        }

        if (Number(formValues.transportationCost || 0) !== transportationCost) {
            setFormFieldValue("transportationCost", transportationCost, false);
        }

        if (Number(formValues.serviceCharge || 0) !== serviceCharge) {
            setFormFieldValue("serviceCharge", serviceCharge, false);
        }

        if (Number(formValues.totalBookingCost || 0) !== totalBookingCost) {
            setFormFieldValue("totalBookingCost", totalBookingCost, false);
        }
    }, [
        formValues.menuTotalPrice,
        formValues.vat,
        formValues.transportationCost,
        formValues.serviceCharge,
        formValues.totalBookingCost,
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
        const activeStepKey = activeStepDefinitions[currentStep]?.key;

        if (activeStepKey === "terms") {
            return (
                <TermsAndConditions
                    serviceId={requestedServiceId}
                    serviceName={params.serviceName ? String(params.serviceName) : serviceDetails?.name || "Review Service"}
                    value={formik.values.acceptedTerms}
                    onChange={(nextValue) => formik.setFieldValue("acceptedTerms", nextValue)}
                    touched={!!formik.touched.acceptedTerms}
                    error={formik.errors.acceptedTerms}
                />
            );
        }

        if (activeStepKey === "storageBookingDesc") {
            return (
                <StorageOptionDisplay
                    title="Package Description"
                    description="Price for this service is fixed."
                    deliveryAddress={formik.values.deliveryAddress}
                    onDeliveryAddressChange={(nextValue) => formik.setFieldValue("deliveryAddress", nextValue)}
                    touched={!!formik.touched.deliveryAddress}
                    error={formik.errors.deliveryAddress}
                />
            );
        }

        if (activeStepKey === "optionSelection") {
            return (
                <StorageOptionSelections
                    title="Storage Package Options"
                    description="Set your preferred package options."
                    riceOneDish={formik.values.riceOneDish}
                    riceTwoDish={formik.values.riceTwoDish}
                    soupOneDish={formik.values.soupOneDish}
                    soupTwoDish={formik.values.soupTwoDish}
                    sideDish={formik.values.sideDish}
                    addProteinToRice={formik.values.addProteinToRice}
                    enabledVeganMode={formik.values.enabledVeganMode}
                    onRiceOneDishChange={(nextValue) => formik.setFieldValue("riceOneDish", nextValue)}
                    onRiceTwoDishChange={(nextValue) => formik.setFieldValue("riceTwoDish", nextValue)}
                    onSoupOneDishChange={(nextValue) => formik.setFieldValue("soupOneDish", nextValue)}
                    onSoupTwoDishChange={(nextValue) => formik.setFieldValue("soupTwoDish", nextValue)}
                    onSideDishChange={(nextValue) => formik.setFieldValue("sideDish", nextValue)}
                    onAddProteinToRiceChange={(nextValue) => formik.setFieldValue("addProteinToRice", nextValue)}
                    onEnabledVeganModeChange={(nextValue) => formik.setFieldValue("enabledVeganMode", nextValue)}
                    onFieldTouch={(field) => formik.setFieldTouched(field, true, false)}
                    touched={{
                        riceOneDish: !!formik.touched.riceOneDish,
                        riceTwoDish: !!formik.touched.riceTwoDish,
                        soupOneDish: !!formik.touched.soupOneDish,
                        soupTwoDish: !!formik.touched.soupTwoDish,
                        sideDish: !!formik.touched.sideDish,
                        addProteinToRice: !!formik.touched.addProteinToRice,
                        enabledVeganMode: !!formik.touched.enabledVeganMode,
                    }}
                    errors={{
                        riceOneDish: formik.errors.riceOneDish,
                        riceTwoDish: formik.errors.riceTwoDish,
                        soupOneDish: formik.errors.soupOneDish,
                        soupTwoDish: formik.errors.soupTwoDish,
                        sideDish: formik.errors.sideDish,
                        addProteinToRice: formik.errors.addProteinToRice,
                        enabledVeganMode: formik.errors.enabledVeganMode,
                    }}
                />
            );
        }
        if (activeStepKey === "location") {
            return (
                <EventCateringDateDetails
                    startDate={formik.values.startDate}
                    arrivalTime={formik.values.arrivalTime}
                    serviceTime={formik.values.serviceTime}
                    additionalNote={formik.values.additionalNote}
                    onAdditionalNoteChange={(nextValue) => formik.setFieldValue("additionalNote", nextValue)}
                    onStartDateChange={(nextValue) => {
                        formik.setFieldValue("startDate", nextValue);
                        formik.setFieldTouched("startDate", true, false);
                    }}
                    onArrivalTimeChange={(nextValue) => formik.setFieldValue("arrivalTime", nextValue)}
                    onServiceTimeChange={(nextValue) => formik.setFieldValue("serviceTime", nextValue)}
                    touched={!!formik.touched.startDate || !!formik.touched.arrivalTime || !!formik.touched.serviceTime || !!formik.touched.additionalNote}
                    error={formik.errors.startDate || formik.errors.arrivalTime || formik.errors.serviceTime || formik.errors.additionalNote}
                />
            );
        }

        if (activeStepKey === "review") {
            return (
                <EventCateringBookingSummary
                    bookingSummary={formik.values}
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
                <BodyText text={`Service: ${requestedServiceName || serviceDetails?.name || "Alase Service"}`} />
                <BodyText text={`Workflow: ${formik.values.workflow || "ALASE_SERVICE"}`} />
                <BodyText text={`Event date: ${formik.values.startDate?.toLocaleDateString() || "-"}`} />
                <BodyText text={`Arrival time: ${formik.values.arrivalTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "-"}`} />
                <BodyText text={`Service time: ${formik.values.serviceTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "-"}`} />
                <BodyText text={`Address: ${formik.values.deliveryAddress || "-"}`} />
            </FrameCard>
        );
    };

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                // Fetch service details using the serviceId from params
                const response = await getServiceById(requestedServiceId)
                setServiceDetails(response);
            } catch (error) {
                console.error("Error fetching service details:", error);
            }
        };
        if (requestedServiceId) {
            fetchServiceDetails();
        }
    }, [requestedServiceId]);
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <View style={styles.container}>
                <View style={styles.containerHeader}>
                    <SectionText text={`Step ${currentStep + 1} of ${totalSteps}`} />
                </View>
                <ScrollView style={styles.containerScroll}>
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
            </View>

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


})

