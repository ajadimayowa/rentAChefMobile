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
import EventCateringBriefData from "@/components/steps/eventcatering/EventCateringBriefData";
import EventCateringDateDetails from "@/components/steps/eventcatering/EventCateringDateDetails";
import ServiceOptionSelection from "@/components/steps/eventcatering/ServiceOptionSelection";
import EventCateringBookingSummary from "@/components/steps/eventcatering/EventCateringBookingSummary";
import EventCateringMenuClassSelection from "@/components/steps/eventcatering/EventCateringMenuClassSelection";
import EventCateringChooseMenu, { IMenuItem } from "@/components/steps/eventcatering/EventCateringChooseMenu";
import PaymentModal from "@/components/modals/PaymentModal";

type BookingStepKey = "terms" | "eventBriefData" | "location" | "serviceOption" | "menuClassSelection" | "chooseMenus" | "review";

interface EventCateringBookingFormValues {
    eventType: string;
    noOfGuests: number;
    serviceOption: {
        id: string;
        name: string;
        description?: string;
    } | null;
    paymentOption: string;
    menuClass: string;
    selectedMenus: IMenuItem[];
    selectedMenuClass: { id: string; name: string; value: string; description?: string } | null;
    menuTotalPrice: number;
    vat: number;
    transportationCost: number;
    serviceCharge: number;
    totalBookingCost: number;
    transactnRef: string;

    customerId: string;
    serviceId: string;
    serviceCategoryId: string;
    workflow: string;
    acceptedTerms: boolean;
    eventAddress: string;
    additionalNotes: string;
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
        key: "eventBriefData",
        fields: ["eventType", "noOfGuests", "eventAddress", "additionalNotes"],
        schema: Yup.object({
            eventType: Yup.string().required("Event type is required."),
            noOfGuests: Yup.number().min(1, "Number of guests must be at least 1.").required("Number of guests is required."),
            eventAddress: Yup.string().trim().min(5, "Event address is too short.").required("Event address is required."),
            additionalNotes: Yup.string().trim().max(500, "Additional notes cannot exceed 500 characters."),
        }),
    },
    {
        key: "location",
        fields: ["startDate", "arrivalTime", "serviceTime"],
        schema: Yup.object({
            startDate: Yup.date().required("Start date is required."),
            arrivalTime: Yup.date().required("Arrival time is required."),
            serviceTime: Yup.date().required("Service time is required."),
        }),
    },
    {
        key: "serviceOption",
        fields: ["serviceOption"],
        schema: Yup.object({
            serviceOption: Yup.object({
                id: Yup.string().required(),
                name: Yup.string().required(),
            })
                .nullable()
                .required("Please select a service option."),
        }),
    },
    {
        key: "menuClassSelection",
        fields: ["selectedMenuClass"],
        schema: Yup.object({
            selectedMenuClass: Yup.object({
                name: Yup.string().required(),
                value: Yup.string().required(),
            })
                .nullable()
                .required("Please select a menu type."),
        }),
    },
    {
        key: "chooseMenus",
        fields: ["selectedMenus"],
        schema: Yup.object({
            selectedMenus: Yup.array().min(1, "Please choose at least one menu option."),
        }),
    },
    {
        key: "review",
        fields: [],
        schema: Yup.object({}),
    },
];

const EMPTY_MENU_CLASS_SELECTION = { id: "", name: "", value: "", description: "" };
const PAY_PER_HEAD_MODEL = {
    id: "3",
    name: "Pay Per Head Catering",
    value: "perhead",
    description: "Full-service catering package including all ingredients and staff.",
};

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
            eventType: "",
            noOfGuests: 0,
            serviceOption: null,
            paymentOption: "",
            menuClass: "",
            selectedMenus: [],
            selectedMenuClass:null,
            menuTotalPrice: 0,
            vat: 0,
            transportationCost: 0,
            serviceCharge: 0,
            totalBookingCost: 0,
            transactnRef: "",

            customerId: String(profile?.id || ""),
            serviceId: requestedServiceId,
            serviceCategoryId: requestedCategoryId,
            workflow: requestedWorkflow || "ALASE_SERVICE",
            acceptedTerms: false,

            additionalNotes: "",

            eventAddress: "",
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

            const isInstantPayment = String(values.paymentOption || "").toLowerCase() === "instant";

            const payload = {
                customerId: String(values.customerId),
                serviceId: String(values.serviceId),
                serviceCategoryId: String(values.serviceCategoryId),
                workflow: values.workflow,
                transactnRef: isInstantPayment ? (values.transactnRef || latestPaymentReferenceRef.current) : "",
                bookingData: {
                    acceptedTerms: values.acceptedTerms,
                    startDate: typeof values.startDate === "string" ? values.startDate : values.startDate?.toISOString(),
                    endDate: typeof values.endDate === "string" ? values.endDate : values.endDate?.toISOString(),
                    arrivalTime: typeof values.arrivalTime === "string" ? values.arrivalTime : values.arrivalTime?.toISOString(),
                    serviceTime: typeof values.serviceTime === "string" ? values.serviceTime : values.serviceTime?.toISOString(),
                    eventAddress: values.eventAddress,
                    additionalNotes: values.additionalNotes,
                    serviceName: serviceDetails?.name || requestedServiceName || "Alase Service",
                    paymentOption: isInstantPayment ? "instant" : "",
                    selectedMenus: isInstantPayment ? values.selectedMenus : [],
                    menuTotalPrice: isInstantPayment ? values.menuTotalPrice : 0,
                    vat: isInstantPayment ? values.vat : 0,
                    transportationCost: isInstantPayment ? values.transportationCost : 0,
                    serviceCharge: isInstantPayment ? values.serviceCharge : 0,
                    totalBookingCost: isInstantPayment ? values.totalBookingCost : 0,
                    transactnRef: isInstantPayment ? (values.transactnRef || latestPaymentReferenceRef.current) : "",
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
    const isPayPerHeadSelected = String(formValues.serviceOption?.id || "") === "3";
    const hasMenuSelections = (formValues.selectedMenus || []).length > 0;

    const instantPaymentAmount = useMemo(() => {
        const computedTotalBookingCost = Number(formValues.totalBookingCost || 0);
        return computedTotalBookingCost > 0 ? computedTotalBookingCost : 100;
    }, [formValues.totalBookingCost]);

    const activeStepDefinitions = useMemo(() => {
        if (isPayPerHeadSelected) {
            return STEP_DEFINITIONS;
        }

        return STEP_DEFINITIONS.filter((step) => step.key !== "menuClassSelection" && step.key !== "chooseMenus");
    }, [isPayPerHeadSelected]);

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
        const totalMenuCost = (formValues.selectedMenus || []).reduce((sum, menu) => {
            return sum + Number(menu?.totalGroceryCost || 0);
        }, 0);

        if (Number(formValues.menuTotalPrice || 0) !== totalMenuCost) {
            setFormFieldValue("menuTotalPrice", totalMenuCost, false);
        }
    }, [formValues.selectedMenus, formValues.menuTotalPrice, setFormFieldValue]);

    useEffect(() => {
        if (hasMenuSelections && formValues.paymentOption !== "instant") {
            setFormFieldValue("paymentOption", "instant", false);
            return;
        }

        if (!hasMenuSelections && formValues.paymentOption !== "") {
            setFormFieldValue("paymentOption", "", false);
        }
    }, [hasMenuSelections, formValues.paymentOption, setFormFieldValue]);

    useEffect(() => {
        const menuTotalPrice = Number(formValues.menuTotalPrice || 0);
        const serviceCharge = hasMenuSelections ? Number((menuTotalPrice * 0.1).toFixed(2)) : 0;
        const vat = hasMenuSelections ? Number(((menuTotalPrice + serviceCharge) * 0.075).toFixed(2)) : 0;
        const transportationCost = hasMenuSelections ? 5000 : 0;
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
        hasMenuSelections,
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

        if (hasMenuSelections) {
            setIsPreparingPayment(true);
            setShowPaymentModal(true);
            return;
        }

        formik.handleSubmit();
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

        if (activeStepKey === "eventBriefData") {
            return (
                <EventCateringBriefData
                    eventType={formik.values.eventType}
                    onEventTypeChange={(nextValue) => {
                        formik.setFieldValue("eventType", nextValue);
                        formik.setFieldTouched("eventType", true, false);
                    }}
                    noOfGuests={formik.values.noOfGuests}
                    additionalNotes={formik.values.additionalNotes}
                    addressOfEvent={formik.values.eventAddress}



                    onNoOfGuestsChange={(nextValue) => formik.setFieldValue("noOfGuests", nextValue)}
                    onAdditionalNotesChange={(nextValue) => formik.setFieldValue("additionalNotes", nextValue)}
                    onAddressOfEventChange={(nextValue) => formik.setFieldValue("eventAddress", nextValue)}
                    touched={!!formik.touched.noOfGuests || !!formik.touched.additionalNotes || !!formik.touched.eventAddress}
                    error={formik.errors.noOfGuests || formik.errors.additionalNotes || formik.errors.eventAddress}
                />
            );
        }

        if (activeStepKey === "location") {
            return (
                <EventCateringDateDetails
                additionalNote={formik.values.additionalNotes}
                onAdditionalNoteChange={(nextValue) => formik.setFieldValue("additionalNotes", nextValue)}
                    startDate={formik.values.startDate}
                    arrivalTime={formik.values.arrivalTime}
                    serviceTime={formik.values.serviceTime}
                    onStartDateChange={(nextValue) => {
                        formik.setFieldValue("startDate", nextValue);
                        formik.setFieldTouched("startDate", true, false);
                    }}
                    onArrivalTimeChange={(nextValue) => formik.setFieldValue("arrivalTime", nextValue)}
                    onServiceTimeChange={(nextValue) => formik.setFieldValue("serviceTime", nextValue)}
                    touched={!!formik.touched.startDate || !!formik.touched.arrivalTime || !!formik.touched.serviceTime}
                    error={formik.errors.startDate || formik.errors.arrivalTime || formik.errors.serviceTime}
                />
            );
        }

        if (activeStepKey === "serviceOption") {
            return (
                <ServiceOptionSelection
                    title="Service Option"
                    description="Please select a service option for your event."
                    serviceOption={formik.values.serviceOption}
                    error={typeof formik.errors.serviceOption === "string" ? formik.errors.serviceOption : undefined}
                    touched={!!formik.touched.serviceOption}
                    onServiceOptionChange={(nextValue) => {
                        formik.setFieldValue("serviceOption", nextValue);
                        formik.setFieldTouched("serviceOption", true, false);

                        if (String(nextValue?.id || "") !== "3") {
                            formik.setFieldValue("selectedMenuClass", null);
                            formik.setFieldValue("selectedMenus", []);
                        }
                    }}
                />
            );
        }

        if (activeStepKey === "menuClassSelection") {
            return (
                <EventCateringMenuClassSelection
                    title="Choose Menu Type"
                    description=""
                    selectedMenuClass={formik.values.selectedMenuClass || EMPTY_MENU_CLASS_SELECTION}
                    onMenuClassChange={(nextValue) => {
                        formik.setFieldValue("selectedMenuClass", {
                            id: String((nextValue as any)?.id || ""),
                            name: String(nextValue?.name || ""),
                            value: String(nextValue?.value || ""),
                            description: nextValue?.description,
                        });
                        formik.setFieldTouched("selectedMenuClass", true);
                        formik.setFieldValue("selectedMenus", []);
                    }}
                    selectedMenuClassTouched={!!formik.touched.selectedMenuClass}
                    selectedMenuClassError={
                        typeof formik.errors.selectedMenuClass === "string"
                            ? formik.errors.selectedMenuClass
                            : undefined
                    }
                />
            );
        }

        if (activeStepKey === "chooseMenus") {
            return (
                <EventCateringChooseMenu
                    title={"Choose Menus"}
                    description="Select dishes and number of people for each"
                    serviceId={requestedServiceId || ""}
                    selectedPricingModel={PAY_PER_HEAD_MODEL}
                    selectedMenuClass={formik.values.selectedMenuClass || undefined}
                    selectedMenus={formik.values.selectedMenus}
                    onSelectedMenusChange={(nextValue) => {
                        formik.setFieldValue("selectedMenus", nextValue);
                        formik.setFieldTouched("selectedMenus", true);
                    }}
                    selectedMenusTouched={!!formik.touched.selectedMenus}
                    selectedMenusError={
                        typeof formik.errors.selectedMenus === "string"
                            ? formik.errors.selectedMenus
                            : undefined
                    }
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
                <BodyText text={`Additional Notes: ${formik.values.additionalNotes || "-"}`} />
                <BodyText text={`Event date: ${formik.values.startDate?.toLocaleDateString() || "-"}`} />
                <BodyText text={`Arrival time: ${formik.values.arrivalTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "-"}`} />
                <BodyText text={`Service time: ${formik.values.serviceTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "-"}`} />
                <BodyText text={`Address: ${formik.values.eventAddress || "-"}`} />
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
                                ? (hasMenuSelections ? (isPreparingPayment ? "Preparing..." : "Pay") : "Submit")
                                : "Continue"
                        }
                        onPress={handleNext}
                        disabled={currentStep === totalSteps - 1 && hasMenuSelections && isPreparingPayment}
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

