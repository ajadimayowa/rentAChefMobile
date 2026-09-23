import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "@/components/typography/SectionText";
import ReusableButton from "@/components/buttons/ReusableButton";
import TermsAndConditions from "@/components/steps/TermsAndConditions";
import { useLocalSearchParams } from "expo-router";
import { getServiceById } from "@/services/serviceService";
import { ServiceDetails } from "@/interfaces/service";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ValidationError } from "yup";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cpApi } from "@/services/cpApi";
import Toast from "react-native-toast-message";
import ChefLevel from "@/components/steps/dailychef/ChefLevel";
import ChooseChef from "@/components/steps/dailychef/ChooseChef";
import ChooseMenuSelectionOption, { IMenuItem, IUploadedMenuImage } from "@/components/steps/dailychef/ChooseMenuSelectionOption";
import DailyChefEventDetails from "@/components/steps/dailychef/DailyChefEventDetails";
import ProcurementPurchaseStyle, { ICombinedGroceryItem } from "@/components/steps/dailychef/ProcurementPurchaseStyle";
import DailyChefBookingSummary from "@/components/steps/dailychef/DailyChefBookingSummary";
import PaymentModal from "@/components/modals/PaymentModal";

type BookingStepKey = "terms" | "chefCategory" | "chefSelection" | "menuSelectionOption" | "location" | "procurement" | "review" | "payment";

interface DailyChefBookingFormValues {
    acceptedTerms: false,
    chefCategory: {
        id: string,
        chefCatId: string,
        name: string,
        basePriceMinor: number,
    },
    vat?: number;
    transportationCost?: number;
    serviceCharge?: number;
    selectedChef: {
        id: string,
        chefCatId: string,
        name: string,
    },
    menuDeliveryOption: {
        name: string;
        value: string;
        description?: string;
    },
    selectedMenus: IMenuItem[],
    uploadedMenuImageUri: string,
    uploadedMenuImage: IUploadedMenuImage | null,
    menuTotalPrice: number,
    transactnRef: string,
    ingredientProcurementOption: {
        name: string;
        value: string;
        description?: string;
    }
    totalBookingCost: number
    combinedGroceries: ICombinedGroceryItem[]
    paymentOption: string
    eventAddress: string
    additionalNotes: string
    startDate: Date | undefined
    endDate?: Date | undefined
    arrivalTime: Date | undefined
    serviceTime: Date | undefined

    customerId: string
    serviceId: string
    serviceCategoryId: string
    workflow: string
}

interface ChefCategory {
    id: string;
    chefCatId: string;
    name: string;
    basePriceMinor: number;
}

interface IChef {
    id: string;
    name: string;
}

interface StepDefinition {
    key: BookingStepKey;
    fields: (keyof DailyChefBookingFormValues)[];
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
        key: "chefCategory",
        fields: ["chefCategory"],
        schema: Yup.object({
            chefCategory: Yup.mixed().test(
                "chef-category",
                "Chef category selection is required.",
                value => !!(value as ChefCategory)?.chefCatId
            ),
        }),
    },
    {
        key: "chefSelection",
        fields: ["selectedChef"],
        schema: Yup.object({
            selectedChef: Yup.mixed().test(
                "chef",
                "Chef selection is required.",
                value => !!(value as IChef)?.id
            ).required("Chef selection is required."),
        }),
    },
    {
        key: "menuSelectionOption",
        fields: ["menuDeliveryOption", "selectedMenus"],
        schema: Yup.object({
            menuDeliveryOption: Yup.mixed().test(
                "menu-delivery-option",
                "Menu delivery option is required.",
                value => !!(value as { name: string; value: string; description?: string })?.value
            ),
            selectedMenus: Yup.array().when("menuDeliveryOption", {
                is: (menuDeliveryOption: { value?: string }) => ["chef", "organization"].includes(menuDeliveryOption?.value || ""),
                then: (schema) => schema.min(1, "At least one menu must be selected."),
                otherwise: (schema) => schema,
            }),
            uploadedMenuImageUri: Yup.string().when("menuDeliveryOption", {
                is: (menuDeliveryOption: { value?: string }) => menuDeliveryOption?.value === "upload",
                then: (schema) => schema.trim().required("Please upload a menu picture."),
                otherwise: (schema) => schema,
            }),
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
        key: "procurement",
        fields: ["ingredientProcurementOption"],
        schema: Yup.object({
            ingredientProcurementOption: Yup.mixed().test(
                "ingredient-procurement-option",
                "Ingredient procurement option is required.",
                value => !!(value as { name: string; value: string; description?: string })?.value
            )
        }).required("Ingredient procurement option is required."),
    },
    {
        key: "review",
        fields: [],
        schema: Yup.object({}),
    }
];

export default function DailyChefBookingScreen() {
    const profile = useSelector((state: RootState) => state.auth.bioData) as any;
    const navigation = useNavigation();
    const params = useLocalSearchParams<{ serviceId?: string | string[]; serviceName?: string | string[]; categoryId?: string | string[]; workflow?: string | string[] }>();
    const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [bookingSubmissionSuccessful, setBookingSubmissionSuccessful] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPreparingPayment, setIsPreparingPayment] = useState(false);
    const latestPaymentReferenceRef = useRef("");

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

    const formik = useFormik<DailyChefBookingFormValues>({
        initialValues: {
            acceptedTerms: false,
            chefCategory: {
                id: "",
                chefCatId: "",
                name: "",
                basePriceMinor: 0,
            },
            vat: 0,
            transportationCost: 5000,
            serviceCharge: 0,
            selectedChef: {
                id: "",
                chefCatId: "",
                name: "",
            },
            selectedMenus: [],
            uploadedMenuImageUri: "",
            uploadedMenuImage: null,
            menuTotalPrice: 0,
            menuDeliveryOption: {
                name: "",
                value: "",
                description: "",
            },
            ingredientProcurementOption: {
                name: "",
                value: "",
                description: "",
            },
            totalBookingCost: 0,
            combinedGroceries: [],
            paymentOption: "",
            eventAddress: "",
            additionalNotes: "",
            startDate: undefined,
            endDate: undefined,
            arrivalTime: undefined,
            serviceTime: undefined,
            customerId: profile?.id ? String(profile.id) : "",
            serviceId: requestedServiceId || "",
            serviceCategoryId: requestedCategoryId || "",
            workflow: requestedWorkflow || "",
            transactnRef:''
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
                transactnRef: values.transactnRef || latestPaymentReferenceRef.current,
                bookingData: {
                    acceptedTerms: values.acceptedTerms,
                    startDate: typeof values.startDate === "string" ? values.startDate : values.startDate?.toISOString(),
                    endDate: typeof values.endDate === "string" ? values.endDate : values.endDate?.toISOString(),
                    arrivalTime: typeof values.arrivalTime === "string" ? values.arrivalTime : values.arrivalTime?.toISOString(),
                    serviceTime: typeof values.serviceTime === "string" ? values.serviceTime : values.serviceTime?.toISOString(),
                    eventAddress: values.eventAddress,
                    additionalNotes: values.additionalNotes,
                    serviceName: serviceDetails?.name || requestedServiceName,
                    menuTotalPrice: values.menuTotalPrice,
                    vat: values.vat,
                    transportationCost: values.transportationCost,
                    serviceCharge: values.serviceCharge,
                    totalBookingCost: values.totalBookingCost,
                },
            };
console.log("Booking payload to be sent:", payload);
            try {
                await cpApi.createBooking(payload);
                console.log("Booking payload sent:", payload);
                // Toast.show({ type: "success", text1: "Booking created" });
                setBookingSubmissionSuccessful(true);
                // console.log("Booking payload sent:", payload);
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

    const instantPaymentAmount = useMemo(() => {
        const computedTotalBookingCost = Number(formValues.totalBookingCost || 0);
        return computedTotalBookingCost > 0 ? computedTotalBookingCost : 100;
    }, [formValues.totalBookingCost]);

    const handleCombinedGroceriesChange = useCallback((nextValue: ICombinedGroceryItem[]) => {
        const current = formValues.combinedGroceries || [];
        const next = nextValue || [];
        if (JSON.stringify(current) === JSON.stringify(next)) {
            return;
        }
        setFormFieldValue("combinedGroceries", next, false);
    }, [formValues.combinedGroceries, setFormFieldValue]);

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

    useEffect(() => {
        const totalMenuCost = (formValues.selectedMenus || []).reduce((sum, menu) => {
            return sum + Number(menu?.totalGroceryCost || 0);
        }, 0);

        if (formValues.menuTotalPrice !== totalMenuCost) {
            setFormFieldValue("menuTotalPrice", totalMenuCost, false);
        }
    }, [formValues.selectedMenus, formValues.menuTotalPrice, setFormFieldValue]);

    useEffect(() => {
        const basePriceMinor = Number(formValues.chefCategory?.basePriceMinor || 0);
        const menuTotalPrice = Number(formValues.menuTotalPrice || 0);
        const procurementOption = String(formValues.ingredientProcurementOption?.value || "").toLowerCase();
        const isOrganizationProcurement = procurementOption === "organization";
        const menuCostContribution = isOrganizationProcurement ? menuTotalPrice : 0;
        const vatBase = basePriceMinor + menuCostContribution;

        const vat = Number((vatBase * 0.075).toFixed(2));
        const transportationCost = 5000;
        const serviceCharge = isOrganizationProcurement ? Number((menuTotalPrice * 0.1).toFixed(2)) : 0;
        const totalBookingCost = Number((basePriceMinor + vat + transportationCost + serviceCharge + menuCostContribution).toFixed(2));

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
        formValues.chefCategory?.basePriceMinor,
        formValues.menuTotalPrice,
        formValues.ingredientProcurementOption?.value,
        formValues.vat,
        formValues.transportationCost,
        formValues.serviceCharge,
        formValues.totalBookingCost,
        setFormFieldValue,
    ]);

    useEffect(() => {
        const deliveryOption = formValues.menuDeliveryOption?.value || "";
        const procurementOption = formValues.ingredientProcurementOption?.value || "";
        const nextPaymentOption =
            deliveryOption === "upload" || procurementOption === "self"
                ? "quotation"
                : deliveryOption
                    ? "instant"
                    : "";

        if (formValues.paymentOption !== nextPaymentOption) {
            setFormFieldValue("paymentOption", nextPaymentOption, false);
        }
    }, [
        formValues.menuDeliveryOption?.value,
        formValues.ingredientProcurementOption?.value,
        formValues.paymentOption,
        setFormFieldValue,
    ]);

    const markCurrentStepTouched = () => {
        const currentFields = STEP_DEFINITIONS[currentStep]?.fields || [];
        currentFields.forEach((fieldName) => {
            formik.setFieldTouched(fieldName, true, false);
            if (fieldName === "ingredientProcurementOption") {
                formik.setFieldTouched("ingredientProcurementOption.value", true, false);
            }
        });
    };

    const validateStep = async () => {
        const activeStep = STEP_DEFINITIONS[currentStep];
        if (!activeStep) return true;

        try {
            await activeStep.schema.validate(formik.values, { abortEarly: false });
            return true;
        } catch (error) {
            if (error instanceof ValidationError) {
                let hasFieldError = false;

                error.inner.forEach((validationError) => {
                    if (validationError.path) {
                        formik.setFieldError(validationError.path, validationError.message);
                        hasFieldError = true;
                    }
                });

                if (!hasFieldError && error.path) {
                    formik.setFieldError(error.path, error.message);
                    hasFieldError = true;
                }

                if (!hasFieldError && STEP_DEFINITIONS[currentStep]?.key === "procurement") {
                    formik.setFieldError("ingredientProcurementOption.value", "Ingredient procurement option is required.");
                }
            }

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

        if (Number(formik.values.menuTotalPrice || 0) > 0) {
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
        const procurementValueMeta = formik.getFieldMeta("ingredientProcurementOption.value");

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

            return (
                <ChefLevel
                title="Expert Level"
                    description="Choose the chef expertise level."
                    serviceId={requestedServiceId || ""}
                    serviceCatId={requestedCategoryId || ""}
                    chefCategory={formik.values.chefCategory}
                    onChange={(nextValue) => { formik.setFieldValue("chefCategory", nextValue); formik.setFieldTouched("chefCategory", true); formik.setFieldValue("selectedChef", null); }}
                    touched={!!formik.touched.chefCategory}
                    error={
                        typeof formik.errors.chefCategory === "string"
                            ? formik.errors.chefCategory
                            : undefined
                    }
                />
            );
        }

        // if (currentStep === 3) {
        //     const eventErrors = [
        //         formik.errors.startDate,
        //         formik.errors.arrivalTime,
        //         formik.errors.serviceTime,
        //         formik.errors.eventAddress,
        //     ].find((value) => typeof value === "string") as string | undefined;

        //     const eventTouched = Boolean(
        //         formik.touched.startDate ||
        //         formik.touched.arrivalTime ||
        //         formik.touched.serviceTime ||
        //         formik.touched.eventAddress
        //     );

        if (currentStep === 2) {

            return (
                <ChooseChef
                    description="Choose chef from your selected category."
                    serviceId={requestedServiceId || ""}
                    chefCategory={formik.values.chefCategory}
                    chef={formik.values.selectedChef}
                    onChange={(nextValue) => { formik.setFieldValue("selectedChef", nextValue); formik.setFieldTouched("selectedChef", true); }}
                    touched={!!formik.touched.selectedChef}
                    error={
                        typeof formik.errors.selectedChef === "string"
                            ? formik.errors.selectedChef
                            : undefined
                    }
                />
            );
        }

        if (currentStep === 3) {
            return (
                <ChooseMenuSelectionOption
                    description="Select how you want your meals planned"
                    serviceId={requestedServiceId || ""}
                    chefCategory={formik.values.chefCategory}
                    chef={formik.values.selectedChef}
                    menuDeliveryOption={formik.values.menuDeliveryOption}
                    selectedMenus={formik.values.selectedMenus}
                    uploadedMenuImageUri={formik.values.uploadedMenuImageUri}
                    onMenuDeliveryOptionChange={(nextValue) => {
                        formik.setFieldValue("menuDeliveryOption", nextValue);
                        formik.setFieldTouched("menuDeliveryOption", true);

                        if (nextValue.value === "upload") {
                            formik.setFieldValue("selectedMenus", []);
                            formik.setFieldValue("menuTotalPrice", 0);
                            formik.setFieldValue("paymentOption", "quotation");
                            return;
                        }

                        formik.setFieldValue("uploadedMenuImage", null);
                        formik.setFieldValue("uploadedMenuImageUri", "");
                        formik.setFieldValue("paymentOption", "instant");
                    }}
                    onSelectedMenusChange={(nextValue) => {
                        formik.setFieldValue("selectedMenus", nextValue);
                        formik.setFieldTouched("selectedMenus", true);

                        const totalMenuCost = nextValue.reduce((sum, menu) => {
                            return sum + Number(menu?.totalGroceryCost || 0);
                        }, 0);
                        formik.setFieldValue("menuTotalPrice", totalMenuCost);

                        if (formik.values.menuDeliveryOption?.value !== "upload") {
                            formik.setFieldValue("paymentOption", "instant");
                        }
                    }}
                    onUploadedMenuImageChange={(nextValue) => {
                        formik.setFieldValue("uploadedMenuImage", nextValue);
                        formik.setFieldValue("uploadedMenuImageUri", nextValue?.uri || "");
                        formik.setFieldTouched("uploadedMenuImageUri", true);
                        formik.setFieldValue("selectedMenus", []);
                        formik.setFieldValue("menuTotalPrice", 0);
                        formik.setFieldValue("paymentOption", "quotation");
                    }}
                    menuDeliveryOptionTouched={!!formik.touched.menuDeliveryOption}
                    menuDeliveryOptionError={
                        typeof formik.errors.menuDeliveryOption === "string"
                            ? formik.errors.menuDeliveryOption
                            : undefined
                    }
                    selectedMenusTouched={!!formik.touched.selectedMenus}
                    selectedMenusError={
                        typeof formik.errors.selectedMenus === "string"
                            ? formik.errors.selectedMenus
                            : undefined
                    }
                />
            );
        }

        if (currentStep === 4) {
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
                <DailyChefEventDetails
                    startDate={formik.values.startDate}
                    arrivalTime={formik.values.arrivalTime}
                    serviceTime={formik.values.serviceTime}
                    addressOfEvent={formik.values.eventAddress}
                    onStartDateChange={(nextValue) => {
                        formik.setFieldValue("startDate", nextValue);
                        formik.setFieldTouched("startDate", true, false);
                    }}
                    onArrivalTimeChange={(nextValue) => {
                        formik.setFieldValue("arrivalTime", nextValue);
                        formik.setFieldTouched("arrivalTime", true, false);
                    }}
                    onServiceTimeChange={(nextValue) => {
                        formik.setFieldValue("serviceTime", nextValue);
                        formik.setFieldTouched("serviceTime", true, false);
                    }}
                    onAddressOfEventChange={(nextValue) => {
                        formik.setFieldValue("eventAddress", nextValue);
                        formik.setFieldTouched("eventAddress", true, false);
                    }}
                    touched={eventTouched}
                    error={eventErrors}
                />
            );
        }

        if (currentStep === 5) {
            return (
                <ProcurementPurchaseStyle
                    serviceId={requestedServiceId || ""}
                    chefCategory={formik.values.chefCategory}
                    chef={formik.values.selectedChef}
                    menuDeliveryOption={formik.values.menuDeliveryOption}
                    selectedMenus={formik.values.selectedMenus}
                    uploadedMenuImageUri={formik.values.uploadedMenuImageUri}
                    procurementPurchaseOption={formik.values.ingredientProcurementOption}
                    onProcurementPurchaseOptionChange={(nextValue) => {
                        formik.setFieldValue("ingredientProcurementOption", nextValue);
                        formik.setFieldTouched("ingredientProcurementOption", true);
                        formik.setFieldTouched("ingredientProcurementOption.value", true, false);
                        formik.setFieldValue("paymentOption", nextValue?.value === "self" ? "quotation" : "instant");
                    }}
                    onCombinedGroceriesChange={handleCombinedGroceriesChange}
                    procurementOptionTouched={Boolean(procurementValueMeta.touched || formik.touched.ingredientProcurementOption)}
                    procurementOptionError={
                        procurementValueMeta.error ||
                        (typeof formik.errors.ingredientProcurementOption === "string"
                            ? formik.errors.ingredientProcurementOption
                            : undefined)
                    }
                    selectedMenusTouched={!!formik.touched.selectedMenus}
                    selectedMenusError={
                        typeof formik.errors.selectedMenus === "string"
                            ? formik.errors.selectedMenus
                            : undefined
                    }
                />
            );
        }

        if (currentStep === 6) {
            return (
                <DailyChefBookingSummary
                    bookingSummary={formik.values}
                    submitLoading={formik.isSubmitting}
                    submitSuccess={bookingSubmissionSuccessful}
                    submitModalVisible={showSubmissionModal}
                    onSubmissionModalClose={handleCloseSubmissionModal}
                />
            );
        }

        return null;

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
                                ? (Number(formik.values.menuTotalPrice || 0) > 0 ? (isPreparingPayment ? "Preparing..." : "Pay") : "Submit")
                                : "Continue"
                        }
                        onPress={handleNext}
                        disabled={currentStep === totalSteps - 1 && Number(formik.values.menuTotalPrice || 0) > 0 && isPreparingPayment}
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
                onInitializationStateChange={(state) => {
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