import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
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
import ProteinOptions, { DEFAULT_PROTEIN_OPTIONS, ProteinOptionItem } from "@/components/steps/alase/ProteinOptions";
import { ValidationError } from "yup";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cpApi } from "@/services/cpApi";
import Toast from "react-native-toast-message";
import CookingInstructions from "@/components/steps/alase/CookingInstructions";
import AlaseEventDetails from "@/components/steps/alase/AlaseEventDetails";
import AlaseBookingSummary from "@/components/steps/alase/AlaseBookingSummary";

type BookingStepKey = "terms" | "protein" | "cookingInstructions" | "location" | "review";

interface AlaseBookingFormValues {
    customerId: string;
    serviceId: string;
    serviceCategoryId: string;
    cookingInstructions: string;
    workflow: string;
    acceptedTerms: boolean;
    proteinOptions: ProteinOptionItem[];
    eventAddress: string;
    additionalNotes: string;
    startDate: Date | undefined
    endDate?: Date | undefined
    arrivalTime: Date | undefined
    serviceTime: Date | undefined
    modeOfPayment: 'Paystack' | 'Transfer' | 'Unpaid';
    transactnRef: string
}

interface StepDefinition {
    key: BookingStepKey;
    fields: (keyof AlaseBookingFormValues)[];
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
        key: "protein",
        fields: ["proteinOptions"],
        schema: Yup.object({
            proteinOptions: Yup.array()
                .of(
                    Yup.object({
                        label: Yup.string().required(),
                        value: Yup.string().required(),
                        count: Yup.number().min(0).required(),
                    })
                )
                .min(1)
                .test("has-positive-count", "Please select at least one protein quantity.", (value) => {
                    const options = value || [];
                    return options.some((item) => Number(item?.count || 0) > 0);
                }),
        }),
    },
    {
        key: "cookingInstructions",
        fields: ["cookingInstructions"],
        schema: Yup.object({
            cookingInstructions: Yup.string().required("Cooking instructions are required."),
        }),
    },
    {
        key: "location",
        fields: ["startDate", "arrivalTime", "serviceTime", "eventAddress"],
        schema: Yup.object({
            startDate: Yup.date().required("Start date is required."),
            arrivalTime: Yup.date().required("Arrival time is required."),
            serviceTime: Yup.date().required("Service time is required."),
            eventAddress: Yup.string().trim().min(5, "Event address is too short.").required("Event address is required."),
        }),
    },
    {
        key: "review",
        fields: [],
        schema: Yup.object({}),
    },
];

export default function AlaseBookingScreen() {
    const profile = useSelector((state: RootState) => state.auth.bioData) as any;
    const navigation = useNavigation();
    const params = useLocalSearchParams<{ serviceId?: string | string[]; serviceName?: string | string[]; categoryId?: string | string[]; workflow?: string | string[] }>();
    const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
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

    const formik = useFormik<AlaseBookingFormValues>({
        initialValues: {
            customerId: String(profile?.id || ""),
            serviceId: requestedServiceId,
            cookingInstructions: "",
            serviceCategoryId: requestedCategoryId,
            workflow: requestedWorkflow || "ALASE_SERVICE",
            acceptedTerms: false,
            proteinOptions: DEFAULT_PROTEIN_OPTIONS,
            eventAddress: "",
            additionalNotes: "",
            startDate: undefined,
            endDate: undefined,
            arrivalTime: undefined,
            serviceTime: undefined,
            transactnRef: "",
            modeOfPayment: 'Unpaid',
        },
        onSubmit: async (values, helpers) => {
            setShowSubmissionModal(true);
            setBookingSubmissionSuccessful(false);

            if (!values.customerId) {
                Toast.show({ type: "error", text1: "Login required", text2: "Please login before creating booking." });
                setShowSubmissionModal(false);
                helpers.setSubmitting(false);
                return;
            }

            const payload = {
                customerId: String(values.customerId),
                serviceId: String(values.serviceId),
                serviceCategoryId: String(values.serviceCategoryId),
                workflow: values.workflow,
                transactnRef: values.transactnRef,
                modeOfPayment: values.modeOfPayment,
                bookingData: {
                    acceptedTerms: values.acceptedTerms,
                    proteinOptions: values.proteinOptions,
                    startDate: typeof values.startDate === "string" ? values.startDate : values.startDate?.toISOString(),
                    endDate: typeof values.endDate === "string" ? values.endDate : values.endDate?.toISOString(),
                    arrivalTime: typeof values.arrivalTime === "string" ? values.arrivalTime : values.arrivalTime?.toISOString(),
                    serviceTime: typeof values.serviceTime === "string" ? values.serviceTime : values.serviceTime?.toISOString(),
                    eventAddress: values.eventAddress,
                    additionalNotes: values.additionalNotes,
                    serviceName: serviceDetails?.name || requestedServiceName || "Alase Service",
                },
            };

            try {
                await cpApi.createBooking(payload);
                Toast.show({ type: "success", text1: "Booking created" });
                setBookingSubmissionSuccessful(true);
                console.log("Booking payload sent:", payload);
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

    const totalSteps = STEP_DEFINITIONS.length;

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

    const markCurrentStepTouched = () => {
        const currentFields = STEP_DEFINITIONS[currentStep]?.fields || [];
        currentFields.forEach((fieldName) => {
            formik.setFieldTouched(fieldName, true, false);
        });
    };

    const validateStep = async () => {
        const activeStep = STEP_DEFINITIONS[currentStep];
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

        formik.handleSubmit();
    };

    const handlePrevious = () => {
        setCurrentStep((previousStep) => Math.max(previousStep - 1, 0));
    };

    const renderStep = () => {
        if (currentStep === 0) {
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

        if (currentStep === 1) {
            const proteinOptionsError = typeof formik.errors.proteinOptions === "string" ? formik.errors.proteinOptions : undefined;
            return (
                <ProteinOptions
                    serviceId={requestedServiceId}
                    description="Set the quantity for each protein option."
                    value={formik.values.proteinOptions}
                    onChange={(nextValue) => formik.setFieldValue("proteinOptions", nextValue)}
                    touched={!!formik.touched.proteinOptions}
                    error={proteinOptionsError}
                />
            );
        }

        if (currentStep === 2) {
            return (
                <CookingInstructions
                    value={formik.values.cookingInstructions}
                    onChange={(nextValue) => formik.setFieldValue("cookingInstructions", nextValue)}
                    touched={!!formik.touched.cookingInstructions}
                    error={formik.errors.cookingInstructions}
                />
            );
        }

        if (currentStep === 3) {
            const eventErrors = [
                formik.errors.startDate,
                formik.errors.arrivalTime,
                formik.errors.serviceTime,
                formik.errors.eventAddress,
            ].find((value) => typeof value === "string") as string | undefined;

            const eventTouched = Boolean(
                formik.touched.startDate ||
                formik.touched.arrivalTime ||
                formik.touched.serviceTime ||
                formik.touched.eventAddress
            );

            return (
                <AlaseEventDetails
                    startDate={formik.values.startDate}
                    endDate={formik.values.endDate}
                    arrivalTime={formik.values.arrivalTime}
                    serviceTime={formik.values.serviceTime}
                    addressOfEvent={formik.values.eventAddress}
                    onStartDateChange={(nextValue) => formik.setFieldValue("startDate", nextValue)}
                    onEndDateChange={(nextValue) => formik.setFieldValue("endDate", nextValue)}
                    onArrivalTimeChange={(nextValue) => formik.setFieldValue("arrivalTime", nextValue)}
                    onServiceTimeChange={(nextValue) => formik.setFieldValue("serviceTime", nextValue)}
                    onAddressOfEventChange={(nextValue) => formik.setFieldValue("eventAddress", nextValue)}
                    touched={eventTouched}
                    error={eventErrors}
                />
            );
        }

        if (currentStep === 4) {
            return (
                   <AlaseBookingSummary
                       bookingSummary={formik.values}
                      submitLoading={formik.isSubmitting}
                      submitSuccess={bookingSubmissionSuccessful}
                      submitModalVisible={showSubmissionModal}
                       onSubmissionModalClose={handleCloseSubmissionModal}
                   />
            );
        }

        if (currentStep === 5) {
            return (
                <FrameCard>
                    <SectionText text="Review booking" />
                    <BodyText text={`Service: ${requestedServiceName || serviceDetails?.name || "Alase Service"}`} />
                    <BodyText
                        text={`Protein options: ${formik.values.proteinOptions
                            .map((item) => `${item.label} (${item.count})`)
                            .join(", ") || "-"}`}
                    />
                    <BodyText text={`Event date: ${formik.values.startDate?.toLocaleDateString() || "-"}`} />
                    <BodyText text={`Arrival time: ${formik.values.arrivalTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "-"}`} />
                    <BodyText text={`Service time: ${formik.values.serviceTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "-"}`} />
                    <BodyText text={`Address: ${formik.values.eventAddress || "-"}`} />
                </FrameCard>
            );
        }
        return (
            <FrameCard>
                <SectionText text="Review booking" />
                <BodyText text={`Service: ${requestedServiceName || serviceDetails?.name || "Alase Service"}`} />
                <BodyText
                    text={`Protein options: ${formik.values.proteinOptions
                        .map((item) => `${item.label} (${item.count})`)
                        .join(", ") || "-"}`}
                />
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
                        title={currentStep === totalSteps - 1 ? "Submit" : "Continue"}
                        onPress={handleNext}
                        style={{ width: currentStep > 0 ? "40%" : "90%", borderRadius: 10 }}
                    />
                </View>
            </View>
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

