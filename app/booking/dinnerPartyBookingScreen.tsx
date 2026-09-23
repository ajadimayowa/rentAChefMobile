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
import ProcurementPurchaseStyle, { ICombinedGroceryItem } from "@/components/steps/dailychef/ProcurementPurchaseStyle";
import DailyChefBookingSummary from "@/components/steps/dailychef/DailyChefBookingSummary";
import PaymentModal from "@/components/modals/PaymentModal";
import DateNightEventDetails from "@/components/steps/datenight/DateNightEventDetails";
import ChoosePkg from "@/components/steps/datenight/ChoosePkg";
import ChooseMenus from "@/components/steps/datenight/ChooseMenus";
import DateNightBookingSummary from "@/components/steps/datenight/DateNightBookingSummary";
import DinnerPartyDetails from "@/components/steps/dinnerparty/DinnerPartDetails";
import PricingModel from "@/components/steps/dinnerparty/PricingModel";
import PlaterSizeSelection from "@/components/steps/dinnerparty/PlaterSizeSelection";
import DinnerPartyBookingSummary from "@/components/steps/dinnerparty/DinnerPartyBookingSummary";
import MenuClassSelection from "@/components/steps/dinnerparty/MenuClassSelection";
import DinnerPartyChooseMenu from "@/components/steps/dinnerparty/DinnerPartyChooseMenu";

type BookingStepKey = "terms" | "eventDetails" |  "pricingModel" | "menuClassSelection" | "platerSizeSelection" | "choosePckg" | "chooseMenus" | "chefCategory" | "menuSelectionOption" | "review" | "payment";

interface DinnerPartyBookingFormValues {
    acceptedTerms: false,
    noOfGuests: number | null,
    addressOfEvent: string,
    additionalNotes: string
    startDate: Date | undefined
    endDate?: Date | undefined
    arrivalTime: Date | undefined
    serviceTime: Date | undefined
    selectedPricingModel: {
        id: string;
        name: string;
        value: string;
        description?: string;
    },
    selectedMenuClass?:{
        id: string;
        name: string;
        value: string;
        description?: string;
    }
    selectedPlaterSize?: {
        id: string;
        name: string;
        value: string;
        description?: string;
    },
    selectedCookLocation?: {
        name: string;
        value: string;
        description?: string;
    },
    chefCategory: {
        id: string,
        chefCatId: string,
        name: string,
        basePriceMinor: number,
    },
    vat?: number;
    transportationCost?: number;
    serviceCharge?: number;
    selectedMenus: IMenuItem[],
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
    fields: (keyof DinnerPartyBookingFormValues)[];
    schema: Yup.AnyObjectSchema;
}

const EMPTY_MODEL_SELECTION = {
    id: "",
    name: "",
    value: "",
    description: "",
};

const EMPTY_LOCATION_SELECTION = {
    name: "",
    value: "",
    description: "",
};

const createStepDefinitions = (pricingModelValue: string): StepDefinition[] => {
    const normalizedPricingModelValue = String(pricingModelValue || "").toLowerCase();
    const includeChooseMenusStep = normalizedPricingModelValue !== "plater";

    const stepThreeDefinition: StepDefinition = normalizedPricingModelValue === "plater"
        ? {
            key: "platerSizeSelection",
            fields: ["selectedPlaterSize", "selectedCookLocation"],
            schema: Yup.object({
                selectedPlaterSize: Yup.mixed().test(
                    "plater-size",
                    "Plater size selection is required.",
                    value => !!(value as { id: string; name: string; value: string })?.name
                ),
                selectedCookLocation: Yup.mixed().test(
                    "cook-location",
                    "Cook location selection is required.",
                    value => !!(value as { name: string; value: string })?.name
                ),
            }),
        }
        : {
            key: "menuClassSelection",
            fields: ["selectedMenuClass"],
            schema: Yup.object({
                selectedMenuClass: Yup.mixed().test(
                    "menu-class",
                    "Menu class selection is required.",
                    value => !!(value as { id: string; name: string; value: string })?.name
                )
            }),
        };

    const steps: StepDefinition[] = [
        {
            key: "terms",
            fields: ["acceptedTerms"],
            schema: Yup.object({
                acceptedTerms: Yup.boolean().oneOf([true], "You must accept the terms and conditions."),
            }),
        },
        {
            key: "eventDetails",
            fields: ["noOfGuests", "addressOfEvent", "startDate", "arrivalTime", "serviceTime"],
            schema: Yup.object({
                noOfGuests: Yup.number().required("Number of guests is required.").min(1, "Number of guests must be at least 1.").max(4, "Number of guests cannot exceed 4."),
                addressOfEvent: Yup.string().trim().min(5, "Event address is too short.").required("Event address is required."),
                additionalNotes: Yup.string().trim().min(5, "Additional notes are too short."),
                startDate: Yup.date().required("Start date is required."),
                arrivalTime: Yup.date().required("Arrival time is required."),
                serviceTime: Yup.date().required("Service time is required.")
            }),
        },
        {
            key: "pricingModel",
            fields: ["selectedPricingModel"],
            schema: Yup.object({
                selectedPricingModel: Yup.mixed().test(
                    "pricing-model",
                    "Pricing model selection is required.",
                    value => !!(value as { id: string; name: string; basePriceMinor: number })?.id
                ),
            }),
        },
        stepThreeDefinition,
    ];

    if (includeChooseMenusStep) {
        steps.push({
            key: "chooseMenus",
            fields: ["selectedMenus"],
            schema: Yup.object({
                selectedMenus: Yup.array().min(1, "At least one menu must be selected.")
            }),
        });
    }

    steps.push(
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
            key: "review",
            fields: [],
            schema: Yup.object({}),
        }
    );

    return steps;
};

export default function DinnerPartyBookingScreen() {
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

    const formik = useFormik<DinnerPartyBookingFormValues>({
        initialValues: {
            acceptedTerms: false,
            noOfGuests: null,
            addressOfEvent: "",
            additionalNotes: "",
            startDate: undefined,
            endDate: undefined,
            arrivalTime: undefined,
            serviceTime: undefined,

            selectedPricingModel: {
                ...EMPTY_MODEL_SELECTION,
            },

            chefCategory: {
                id: "",
                chefCatId: "",
                name: "",
                basePriceMinor: 0,
            },
            vat: 0,
            transportationCost: 5000,
            serviceCharge: 0,
            selectedMenus: [],
            menuTotalPrice: 0,
            ingredientProcurementOption: {
                name: "",
                value: "",
                description: "",
            },
            totalBookingCost: 0,
            combinedGroceries: [],
            paymentOption: "",
            customerId: profile?.id ? String(profile.id) : "",
            serviceId: requestedServiceId || "",
            serviceCategoryId: requestedCategoryId || "",
            workflow: requestedWorkflow || "",
            transactnRef: ''
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
                    addressOfEvent: values.addressOfEvent,
                    additionalNotes: values.additionalNotes,
                    serviceName: serviceDetails?.name || requestedServiceName,
                    transactnRef: values.transactnRef || latestPaymentReferenceRef.current,
                    menuTotalPrice: values.menuTotalPrice,
                    selectedPricingModel: values.selectedPricingModel,
                    selectedMenuClass: values.selectedMenuClass,
                    selectedPlaterSize: values.selectedPlaterSize,
                    selectedCookLocation: values.selectedCookLocation,
                    selectedMenus: values.selectedMenus,
                    vat: values.vat,
                    transportationCost: values.transportationCost,
                    serviceCharge: values.serviceCharge,
                    totalBookingCost: values.totalBookingCost,
                },
            };

            try {
                await cpApi.createBooking(payload);
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

    const activeStepDefinitions = useMemo(
        () => createStepDefinitions(formik.values.selectedPricingModel?.value || ""),
        [formik.values.selectedPricingModel?.value]
    );

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

        if (formValues.menuTotalPrice !== totalMenuCost) {
            setFormFieldValue("menuTotalPrice", totalMenuCost, false);
        }
    }, [formValues.selectedMenus, formValues.menuTotalPrice, setFormFieldValue]);

    useEffect(() => {
        const basePriceMinor = Number(formValues.chefCategory?.basePriceMinor || 0);
        const menuTotalPrice = Number(formValues.menuTotalPrice || 0);
        const isOfficeKitchen = String(formValues.selectedCookLocation?.name || "").toLowerCase() === "our office kitchen";
        const baseServiceChargeRate = 0.1;
        const officeKitchenExtraRate = isOfficeKitchen ? 0.15 : 0;
        const effectiveServiceChargeRate = baseServiceChargeRate + officeKitchenExtraRate;

        const menuCostContribution = menuTotalPrice;
        const serviceCharge = Number((menuTotalPrice * effectiveServiceChargeRate).toFixed(2));
        const vatBase = basePriceMinor + menuCostContribution + serviceCharge;

        const vat = Number((vatBase * 0.075).toFixed(2));
        const transportationCost = 5000;
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
        formValues.selectedCookLocation?.name,
        formValues.vat,
        formValues.transportationCost,
        formValues.serviceCharge,
        formValues.totalBookingCost,
        setFormFieldValue,
    ]);

    const markCurrentStepTouched = () => {
        const currentFields = activeStepDefinitions[currentStep]?.fields || [];
        currentFields.forEach((fieldName) => {
            formik.setFieldTouched(fieldName, true, false);
            if (fieldName === "ingredientProcurementOption") {
                formik.setFieldTouched("ingredientProcurementOption.value", true, false);
            }
        });
    };

    const validateStep = async () => {
        const activeStep = activeStepDefinitions[currentStep];
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

        if (activeStepKey === "eventDetails") {
            const eventErrors = [
                formik.errors.noOfGuests,
                formik.errors.addressOfEvent,
                formik.errors.additionalNotes,
                formik.errors.startDate,
                formik.errors.arrivalTime,
                formik.errors.serviceTime
            ].find((value) => typeof value === "string") as string | undefined;

            const eventTouched = Boolean(
                formik.touched.noOfGuests||
                formik.touched.addressOfEvent||
                formik.touched.additionalNotes||
                formik.touched.startDate ||
                formik.touched.arrivalTime ||
                formik.touched.serviceTime
            );

            return (
                <DinnerPartyDetails
                title="Dinner Party Details"
                description="Fill in the information for your event"
                    noOfGuests={formik.values.noOfGuests}
                    addressOfEvent={formik.values.addressOfEvent}
                    additionalNotes={formik.values.additionalNotes}
                    startDate={formik.values.startDate}
                    arrivalTime={formik.values.arrivalTime}
                    serviceTime={formik.values.serviceTime}

                   onNoOfGuestsChange={(nextValue) => {
    formik.setFieldValue("noOfGuests", nextValue, true);
    formik.setFieldTouched("noOfGuests", true, true);
}}

                    onAddressOfEventChange={(nextValue) => {
                        formik.setFieldValue("addressOfEvent", nextValue);
                        formik.setFieldTouched("addressOfEvent", true, false);
                    }}

                    onAdditionalNotesChange={(nextValue) => {
                        formik.setFieldValue("additionalNotes", nextValue);
                        formik.setFieldTouched("additionalNotes", true, false);
                    }}

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

                    touched={eventTouched}
                    error={eventErrors}
                />
            );
        }

        if (activeStepKey === "pricingModel") {
            return (
                <PricingModel
                title="Pricing Model"
                    description="Select a pricing model for your dinner party"
                    selectedPricingModel={formik.values.selectedPricingModel}
                    onPricingModelChange={(nextValue) => {
                        formik.setFieldValue("selectedPricingModel", nextValue);
                        formik.setFieldTouched("selectedPricingModel", true);
                        formik.setFieldValue("selectedMenus", []);
                        formik.setFieldValue("menuTotalPrice", 0);

                        if (nextValue?.value === "plater") {
                            formik.setFieldValue("selectedPlaterSize", { ...EMPTY_MODEL_SELECTION });
                            formik.setFieldTouched("selectedPlaterSize", false);
                            formik.setFieldError("selectedPlaterSize", undefined);

                            formik.setFieldValue("selectedCookLocation", { ...EMPTY_LOCATION_SELECTION });
                            formik.setFieldTouched("selectedCookLocation", false);
                            formik.setFieldError("selectedCookLocation", undefined);

                            formik.setFieldValue("selectedMenuClass", undefined);
                            formik.setFieldTouched("selectedMenuClass", false);
                            formik.setFieldError("selectedMenuClass", undefined);
                            return;
                        }

                        if (nextValue?.value === "perhead") {
                            formik.setFieldValue("selectedMenuClass", { ...EMPTY_MODEL_SELECTION });
                            formik.setFieldTouched("selectedMenuClass", false);
                            formik.setFieldError("selectedMenuClass", undefined);

                            formik.setFieldValue("selectedPlaterSize", undefined);
                            formik.setFieldTouched("selectedPlaterSize", false);
                            formik.setFieldError("selectedPlaterSize", undefined);

                            formik.setFieldValue("selectedCookLocation", undefined);
                            formik.setFieldTouched("selectedCookLocation", false);
                            formik.setFieldError("selectedCookLocation", undefined);
                            return;
                        }

                        formik.setFieldValue("selectedMenuClass", undefined);
                        formik.setFieldValue("selectedPlaterSize", undefined);
                        formik.setFieldValue("selectedCookLocation", undefined);
                        formik.setFieldTouched("selectedMenuClass", false);
                        formik.setFieldTouched("selectedPlaterSize", false);
                        formik.setFieldTouched("selectedCookLocation", false);
                    }}
                    selectedPricingModelTouched={!!formik.touched.selectedPricingModel}
                    selectedPricingModelError={
                        typeof formik.errors.selectedPricingModel === "string"
                            ? formik.errors.selectedPricingModel
                            : undefined
                    }
                />
            );
        }

        if (activeStepKey === "platerSizeSelection" && formik.values.selectedPricingModel?.value === "plater") {
            return (
                <PlaterSizeSelection
                title="Plater Size Selection"
                    description="Select a plater size for your dinner party"
                    selectedPlaterSize={formik.values.selectedPlaterSize || EMPTY_MODEL_SELECTION}
                    selectedCookLocation={formik.values.selectedCookLocation || EMPTY_LOCATION_SELECTION}
                    onPlaterSizeChange={(nextValue, selectedMenu) => {
                        formik.setFieldValue("selectedPlaterSize", nextValue);
                        formik.setFieldTouched("selectedPlaterSize", true);

                        if (!selectedMenu) {
                            formik.setFieldValue("selectedMenus", []);
                            formik.setFieldValue("menuTotalPrice", 0);
                            return;
                        }

                        const normalizedSelectedMenu: IMenuItem = {
                            id: selectedMenu.id,
                            name: selectedMenu.name,
                            description: selectedMenu.description,
                            screenshot: selectedMenu.screenshot,
                            totalGroceryCost: Number(selectedMenu.totalGroceryCost || selectedMenu.value || 0),
                            groceries: selectedMenu.groceries,
                        };

                        const selectedMenuCost = Number(normalizedSelectedMenu.totalGroceryCost || 0);

                        formik.setFieldValue("selectedMenus", [normalizedSelectedMenu]);
                        formik.setFieldTouched("selectedMenus", true, false);
                        formik.setFieldValue("menuTotalPrice", selectedMenuCost);
                    }}
                    onCookLocationChange={(nextValue) => {
                        formik.setFieldValue("selectedCookLocation", nextValue);
                        formik.setFieldTouched("selectedCookLocation", true);
                    }}
                    
                    selectedPlaterSizeTouched={!!formik.touched.selectedPlaterSize}
                    selectedPlaterSizeError={
                        typeof formik.errors.selectedPlaterSize === "string"
                            ? formik.errors.selectedPlaterSize
                            : undefined
                    }

                    selectedCookLocationTouched={!!formik.touched.selectedCookLocation}
                    selectedCookLocationError={
                        typeof formik.errors.selectedCookLocation === "string"
                            ? formik.errors.selectedCookLocation
                            : undefined
                    }
                />
            );
        }

        if (activeStepKey === "menuClassSelection" && formik.values.selectedPricingModel?.value === "perhead") {
            return (
                <MenuClassSelection
                title="Choose Menu Type"
                    description=""
                    selectedMenuClass={formik.values.selectedMenuClass || EMPTY_MODEL_SELECTION}
                    onMenuClassChange={(nextValue) => {
                        formik.setFieldValue("selectedMenuClass", nextValue);
                        formik.setFieldTouched("selectedMenuClass", true);
                        formik.setFieldValue("selectedMenus", []);
                        formik.setFieldValue("menuTotalPrice", 0);
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
                <DinnerPartyChooseMenu
                    title={"Choose Menus"}
                    description="Select dishes and number of people for each"
                    serviceId={requestedServiceId || ""}
                    selectedPricingModel={formik.values.selectedPricingModel}
                    selectedMenuClass={formik.values.selectedMenuClass}
                    selectedPlaterSize={formik.values.selectedPlaterSize}
                    selectedMenus={formik.values.selectedMenus}
                    onSelectedMenusChange={(nextValue) => {
                        formik.setFieldValue("selectedMenus", nextValue);
                        formik.setFieldTouched("selectedMenus", true);

                        const totalMenuCost = nextValue.reduce((sum, menu) => {
                            return sum + Number(menu?.totalGroceryCost || 0);
                        }, 0);
                        formik.setFieldValue("menuTotalPrice", totalMenuCost);

                        // if (formik.values.menuDeliveryOption?.value !== "upload") {
                        //     formik.setFieldValue("paymentOption", "instant");
                        // }
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

        

        if (activeStepKey === "chefCategory") {

            return (
                <ChefLevel
                title="Choose chef expert level"
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

        if (activeStepKey === "review") {
            return (
                <DinnerPartyBookingSummary
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