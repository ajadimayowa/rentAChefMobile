import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "@/components/typography/SectionText";
import ReusableButton from "@/components/buttons/ReusableButton";
import FrameCard from "@/components/cards/FrameCard";
import { useLocalSearchParams } from "expo-router";
import { ServiceDetails } from "@/interfaces/service";
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
import { getServiceById, getSpecialServiceById } from "@/services/serviceService";
import SpecialServiceTermsAndConditions from "@/components/steps/SpecialServiceTermsAndConditions";
import EventCateringDateDetails from "@/components/steps/eventcatering/EventCateringDateDetails";
import SpecialServiceDateDetails from "@/components/steps/specialService/SpecialServiceDateDetails";
import SpecialServiceBriefData from "@/components/steps/specialService/SpecialServiceBriefData";
import SpecialServiceChefLevel from "@/components/steps/specialService/SpecialServiceChefLevel";
import SpecialServiceChooseChef from "@/components/steps/specialService/SpecialServiceChooseChef";
import SpecialServiceMenuClassSelection from "@/components/steps/dinnerparty/SpecialServiceMenuClassSelection";
import SpecialServiceChooseMenu from "@/components/steps/specialService/SpecialServiceChooseMenu";
import SpecialServiceProcurementPurchaseStyle from "@/components/steps/specialService/SpecialServiceProcurementPurchaseStyle";
import SpecialServiceBookingSummary from "@/components/steps/specialService/SpecialServiceBookingSummary";

type BookingStepKey = "terms" | "dateDetails" | "serviceOptionDetails" | "chefExpertLevel" | "chooseChef" | "menuClassSelection" | "menuSelection" | "procurementOption" | "review";

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

interface ISelectionOption {
    id: string;
    name: string;
    value: string;
    description?: string;
    chefCatId?: string;
    basePriceMinor?: number;
}

interface ResidentialServiceBookingFormValues {
    acceptedTerms: boolean;

    startDate: Date | undefined
    endDate?: Date | undefined
    arrivalTime: Date | undefined
    serviceTime: Date | undefined

    noOfGuests: number;
    locationOfEvent: string;
    additionalDetails: string;
    chefExpertLevel: {
        id: string;
        name: string;
        chefCatId: string;
        basePriceMinor: number;
    };
    selectedChef: {
        id: string;
        name: string;
        chefCatId:string;
    };
    menuClass: {
        id: string;
        name: string;
    }

    selectedMenus: IMenuSelection[];
    groceryProcurementOption: {
        name: string;
        value: string;
        description?: string;
    };
    groceryProcurementTotalCost: number;

    vat: number;
    logisticsCost: number;
    serviceCharge: number;
    totalBookingCost: number;

    transactnRef: string;

    customerId: string;
    serviceId: string;
    serviceCategoryId: string;
    specialMenuId: string;
    workflow: string;
    modeOfPayment: "Paystack" | "Transfer" | "Unpaid";
}

interface StepDefinition {
    key: BookingStepKey;
    fields: (keyof ResidentialServiceBookingFormValues)[];
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
        key: "dateDetails",
        fields: ["startDate", "arrivalTime", "serviceTime"],
        schema: Yup.object({
            startDate: Yup.date().required("Start date is required."),
            arrivalTime: Yup.date().required("Arrival time is required."),
            serviceTime: Yup.date().required("Service time is required."),
        }),
    },
    {
        key: "serviceOptionDetails",
        fields: ["noOfGuests", "locationOfEvent", "additionalDetails"],
        schema: Yup.object({
            noOfGuests: Yup.number().required("Number of people to cook for is required."),
            locationOfEvent: Yup.string().required("Location of event is required."),
            additionalDetails: Yup.string().required("Additional details are required."),
        })
    },
    {
        key: "chefExpertLevel",
        fields: ["chefExpertLevel"],
        schema: Yup.object({
            chefExpertLevel: Yup.mixed().test(
                "chef-expert-level",
                "Chef expert level is required.",
                (value) => !!(value as ISelectionOption)?.id
            ),
        }),
    },
    {
        key: "chooseChef",
        fields: ["selectedChef"],
        schema: Yup.object({
            selectedChef: Yup.mixed().test(
                "chef-selection",
                "Chef selection is required.",
                (value) => !!(value as ISelectionOption)?.id
            ),
        }),
    },
    {
        key: "menuClassSelection",
        fields: ["menuClass"],
        schema: Yup.object({
            menuClass: Yup.mixed().test(
                "menu-class",
                "Menu class selection is required.",
                (value) => !!(value as ISelectionOption)?.id
            ),
        }),
    },
    {
        key: "menuSelection",
        fields: ["selectedMenus"],
        schema: Yup.object({
            selectedMenus: Yup.array().of(
                Yup.mixed().test(
                    "menu-selection",
                    "At least one menu must be selected.",
                    (value) => !!(value as ISelectionOption)?.id
                )
            ).min(1, "At least one menu must be selected.").required("At least one menu must be selected."),
        }),
    },
    {
        key: "procurementOption",
        fields: ["groceryProcurementOption"],
        schema: Yup.object({
            groceryProcurementOption: Yup.mixed().test(
                "grocery-procurement-option",
                "Grocery procurement option is required.",
                (value) => !!(value as ISelectionOption)?.id
            ),
        }),
    },
    {
        key: "review",
        fields: [],
        schema: Yup.object({}),
    },
];

interface ISpecialService {
    id: string;
    title: string;
    description: string;
    minimumGuests: number;
    numberOfDishes: number;
    image: string;
    procurements: string[]
}
export default function SpecialServiceBookingScreen() {
    const profile = useSelector((state: RootState) => state.auth.bioData) as any;
    const navigation = useNavigation();
    const params = useLocalSearchParams<{ specialMenuId: string; serviceId?: string | string[]; serviceName?: string | string[]; categoryId?: string | string[]; workflow?: string | string[] }>();
    const [specialServiceDetails, setSpecialServiceDetails] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPreparingPayment, setIsPreparingPayment] = useState(false);
    const latestPaymentReferenceRef = useRef("");
    const [menuTypes, setMenuTypes] = useState<CollapsableSelectionType[]>([]);
    const [loadingMenus, setLoadingMenus] = useState(false);

    const [bookingSubmissionSuccessful, setBookingSubmissionSuccessful] = useState(false);

    const handleCloseSubmissionModal = () => {
        setShowSubmissionModal(false);
        setBookingSubmissionSuccessful(false);
    };

    const resolveParam = (value?: string | string[]) => {
        if (Array.isArray(value)) return String(value[0] || "").trim();
        return String(value || "").trim();
    };
    const requestedSpecialServiceId = useMemo(() => resolveParam(params?.specialMenuId), [params?.specialMenuId]);
    const requestedServiceName = useMemo(() => resolveParam(params?.serviceName), [params?.serviceName]);
    const requestedCategoryId = useMemo(() => resolveParam(params?.categoryId), [params?.categoryId]);
    const requestedWorkflow = useMemo(() => resolveParam(params?.workflow), [params?.workflow]);

    const activeStepDefinitions = useMemo(() => STEP_DEFINITIONS, []);
    const activeStepKey = activeStepDefinitions[currentStep]?.key;




    const formik = useFormik<ResidentialServiceBookingFormValues>({
        initialValues: {
            acceptedTerms: false,
            startDate: undefined,
            endDate: undefined,
            arrivalTime: undefined,
            serviceTime: undefined,

            noOfGuests: 0,
            locationOfEvent: "",
            additionalDetails: "",
            chefExpertLevel: {
                id: "",
                name: "",
                chefCatId: "",
                basePriceMinor: 0,
            },
            selectedChef: {
                id: "",
                name: "",
                chefCatId:"",
            },
            menuClass: {
                id: "",
                name: "",
            },
            selectedMenus: [],
            groceryProcurementOption: {
        name: "",
        value: "",
        description: "",
    },
            groceryProcurementTotalCost: 0,

            vat: 0,
            logisticsCost: 0,
            serviceCharge: 0,
            totalBookingCost: 0,

            transactnRef: "",

            customerId: "",
            serviceId: requestedSpecialServiceId || "",
            serviceCategoryId: requestedCategoryId || "",
            specialMenuId: requestedSpecialServiceId || "",
            workflow: requestedWorkflow || "SPECIAL_SERVICE",
            modeOfPayment: "Unpaid",
        },
        onSubmit: async (values, helpers) => {
            setShowSubmissionModal(true);
            setBookingSubmissionSuccessful(false);

            if (!values.customerId) {
                Toast.show({ type: "error", text1: "Login required", text2: "Please login before creating booking." });
                helpers.setSubmitting(false);
                return;
            }

            const resolvedWorkflow = String(
                values.workflow || requestedWorkflow || (specialServiceDetails as any)?.workflow || "Special_Service"
            );
            const resolvedServiceCategoryId = String(
                values.serviceCategoryId || (specialServiceDetails as any)?.categoryId?._id || (specialServiceDetails as any)?.categoryId || requestedCategoryId || ""
            );
            const resolvedServiceId = String(values.serviceId || requestedSpecialServiceId || "");
            const resolvedPaymentMode: "Paystack" | "Unpaid" =
                values.transactnRef || latestPaymentReferenceRef.current ? "Paystack" : "Unpaid";

            const payload = {
                customerId: String(values.customerId),
                specialMenuId: String(values.specialMenuId),
                workflow: resolvedWorkflow,
                serviceId: resolvedServiceId,
                serviceCategoryId: resolvedServiceCategoryId,
                transactnRef: values.transactnRef || latestPaymentReferenceRef.current,
                modeOfPayment: resolvedPaymentMode,
                bookingData: {
                    acceptedTerms: values.acceptedTerms,
                    selectedMenus: values.selectedMenus,
                    startDate: typeof values.startDate === "string" ? values.startDate : values.startDate?.toISOString(),
                    endDate: typeof values.endDate === "string" ? values.endDate : values.endDate?.toISOString(),
                    arrivalTime: typeof values.arrivalTime === "string" ? values.arrivalTime : values.arrivalTime?.toISOString(),
                    serviceTime: typeof values.serviceTime === "string" ? values.serviceTime : values.serviceTime?.toISOString(),
                    serviceName: requestedServiceName || "Residential Service",
                    paymentOption: "instant",
                    groceryTotalPrice: values.groceryProcurementTotalCost,
                    vat: values.vat,
                    logisticsCost: values.logisticsCost,
                    serviceCharge: values.serviceCharge,
                    totalBookingCost: values.totalBookingCost,
                    transactnRef: values.transactnRef || latestPaymentReferenceRef.current,
                    serviceCategoryId: resolvedServiceCategoryId,
                    bookingType: "instant",
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

    const instantPaymentAmount = useMemo(() => {
        const totalBookingCost = Number(formValues.totalBookingCost || 0);
        return totalBookingCost > 0 ? totalBookingCost : 0;
    }, [formValues.totalBookingCost]);
    const totalSteps = activeStepDefinitions.length;

    const selectedMenuTotalPrice = useMemo(() => {
        return (formik.values.selectedMenus || []).reduce((sum, menu) => {
            return sum + Number(menu?.totalGroceryCost || 0);
        }, 0);
    }, [formik.values.selectedMenus]);

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
        const fallbackCategoryId = String((specialServiceDetails as any)?.categoryId?._id || (specialServiceDetails as any)?.categoryId || requestedCategoryId || "");
        const fallbackServiceId = String((specialServiceDetails as any)?.serviceId || requestedSpecialServiceId || "");
        const fallbackWorkflow = String((specialServiceDetails as any)?.workflow || requestedWorkflow || "Special_Service");

        if (fallbackCategoryId && !formValues.serviceCategoryId) {
            setFormFieldValue("serviceCategoryId", fallbackCategoryId, false);
        }

        if (fallbackServiceId && !formValues.serviceId) {
            setFormFieldValue("serviceId", fallbackServiceId, false);
        }

        if (requestedSpecialServiceId && !formValues.specialMenuId) {
            setFormFieldValue("specialMenuId", requestedSpecialServiceId, false);
        }

        if (fallbackWorkflow && !formValues.workflow) {
            setFormFieldValue("workflow", fallbackWorkflow, false);
        }

    }, [
        setFormFieldValue,
        specialServiceDetails,
        requestedCategoryId,
        requestedSpecialServiceId,
        requestedWorkflow,
        formValues.serviceCategoryId,
        formValues.serviceId,
        formValues.specialMenuId,
        formValues.workflow,
    ]);

    useEffect(() => {
        if (profile?.id && !formValues.customerId) {
            setFormFieldValue("customerId", String(profile.id), false);
        }
    }, [profile?.id, setFormFieldValue, formValues.customerId]);


    useEffect(() => {
        const menuTotalPrice = Number(formValues.groceryProcurementTotalCost || 0);
        const serviceCharge = Number((menuTotalPrice * 0.1).toFixed(2));
        const vat = Number(((menuTotalPrice + serviceCharge) * 0.075).toFixed(2));
        const transportationCost = 5000;
        const totalBookingCost = Number((menuTotalPrice + serviceCharge + vat + transportationCost).toFixed(2));

        if (Number(formValues.vat || 0) !== vat) {
            setFormFieldValue("vat", vat, false);
        }

        if (Number(formValues.logisticsCost || 0) !== transportationCost) {
            setFormFieldValue("logisticsCost", transportationCost, false);
        }

        if (Number(formValues.serviceCharge || 0) !== serviceCharge) {
            setFormFieldValue("serviceCharge", serviceCharge, false);
        }

        if (Number(formValues.totalBookingCost || 0) !== totalBookingCost) {
            setFormFieldValue("totalBookingCost", totalBookingCost, false);
        }
    }, [
        formValues.groceryProcurementTotalCost,
        formValues.vat,
        formValues.logisticsCost,
        formValues.serviceCharge,
        formValues.totalBookingCost,
        setFormFieldValue,
    ]);

    useEffect(() => {
        if (Number(formValues.groceryProcurementTotalCost || 0) !== Number(selectedMenuTotalPrice || 0)) {
            setFormFieldValue("groceryProcurementTotalCost", Number(selectedMenuTotalPrice || 0), false);
        }
    }, [selectedMenuTotalPrice, formValues.groceryProcurementTotalCost, setFormFieldValue]);

    useEffect(() => {
        const fetchMenuTypes = async () => {
            if (activeStepKey !== "menuSelection") {
                return;
            }

            try {
                setLoadingMenus(true);
                const response = await getMenus({
                    pricingModel: "perhead",
                    limit: 50,
                    page: 1,
                });
                const fetchedMenus = Array.isArray(response?.data?.data) ? response.data.data : [];
                const grouped: Record<string, CollapsableSelectionType> = {};

                fetchedMenus.forEach((menu: any) => {
                    const normalizedMenu = {
                        id: String(menu?.id || menu?._id || ""),
                        name: String(menu?.title || menu?.name || "Untitled menu"),
                        description: menu?.description,
                        totalGroceryCost: Number(menu?.totalGroceryCost || 0),
                        unitTotalGroceryCost: Number(menu?.pricePerHead || menu?.totalGroceryCost || 0),
                        noOfPeople: 0,
                    };

                    const firstCategory = Array.isArray(menu?.menuCategory) ? menu.menuCategory[0] : null;
                    const menuTypeId = String(firstCategory?.id || firstCategory?._id || "uncategorized");
                    const menuTypeName = String(firstCategory?.title || firstCategory?.name || "Other Menus");

                    if (!grouped[menuTypeId]) {
                        grouped[menuTypeId] = {
                            id: menuTypeId,
                            name: menuTypeName,
                            description: firstCategory?.description || "",
                            menus: [],
                        };
                    }

                    grouped[menuTypeId].menus?.push({
                        ...normalizedMenu,
                        menuTypeId,
                        menuTypeName,
                    });
                });

                setMenuTypes(Object.values(grouped));
            } catch {
                setMenuTypes([]);
            } finally {
                setLoadingMenus(false);
            }
        };

        fetchMenuTypes();
    }, [activeStepKey]);

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
                <SpecialServiceTermsAndConditions
                    specialMenuId={params?.specialMenuId ? String(params.specialMenuId) : ""}
                    serviceName={requestedServiceName ? String(requestedServiceName) : specialServiceDetails?.name || "Review Service"}
                    value={formik.values.acceptedTerms}
                    onChange={(nextValue) => formik.setFieldValue("acceptedTerms", nextValue)}
                    touched={!!formik.touched.acceptedTerms}
                    error={formik.errors.acceptedTerms}
                />
            );
        }
        if (activeStepKey === "dateDetails") {
            return (
                <SpecialServiceDateDetails
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
        if (activeStepKey === "serviceOptionDetails") {
            return (
                <SpecialServiceBriefData
                    onEventTypeChange={(nextValue) => {
                        formik.setFieldValue("eventType", nextValue);
                        formik.setFieldTouched("eventType", true, false);
                    }}
                    noOfGuests={formik.values.noOfGuests}
                    additionalNotes={formik.values.additionalDetails}
                    addressOfEvent={formik.values.locationOfEvent}
                    
                    onNoOfGuestsChange={(nextValue) => formik.setFieldValue("noOfGuests", nextValue)}
                    onAdditionalNotesChange={(nextValue) => formik.setFieldValue("additionalDetails", nextValue)}
                    onAddressOfEventChange={(nextValue) => formik.setFieldValue("locationOfEvent", nextValue)}
                    touched={!!formik.touched.noOfGuests || !!formik.touched.additionalDetails || !!formik.touched.locationOfEvent}
                    error={formik.errors.noOfGuests || formik.errors.additionalDetails || formik.errors.locationOfEvent}
                />
            );
        }
        if (activeStepKey === "chefExpertLevel") {

            return (
                <SpecialServiceChefLevel
                title="Select Expert Level"
                    description="Choose the chef expert level."
                    specialServiceId={requestedSpecialServiceId || ""}
                    serviceCatId={requestedCategoryId || ""}
                    chefExpertLevel={formik.values.chefExpertLevel}
                    onChange={(nextValue) => { formik.setFieldValue("chefExpertLevel", nextValue); formik.setFieldTouched("chefExpertLevel", true); formik.setFieldValue("selectedChef", null); }}
                    touched={!!formik.touched.chefExpertLevel}
                    error={
                        typeof formik.errors.chefExpertLevel === "string"
                            ? formik.errors.chefExpertLevel
                            : undefined
                    }
                />
            );
        }

        if (activeStepKey === "chooseChef") {
        
                    return (
                        <SpecialServiceChooseChef
                            description="Choose chef from your selected category."
                            serviceId={specialServiceDetails?.id || ""}
                            chefCategory={formik.values.chefExpertLevel}
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

        if (activeStepKey === "menuClassSelection") {
            return (
                <SpecialServiceMenuClassSelection
                title="Choose Menu Type"
                    description=""
                    selectedMenuClass={formik.values.menuClass}
                    onMenuClassChange={(nextValue) => {
                        formik.setFieldValue("menuClass", nextValue);
                        formik.setFieldTouched("menuClass", true);
                        formik.setFieldValue("selectedMenus", []);
                        formik.setFieldValue("menuTotalPrice", 0);
                    }}
                    selectedMenuClassTouched={!!formik.touched.menuClass}
                    selectedMenuClassError={
                        typeof formik.errors.menuClass === "string"
                            ? formik.errors.menuClass
                            : undefined
                    }
                />
            );
        }

        if (activeStepKey === "menuSelection") {
            return (
                <SpecialServiceChooseMenu
                    title={"Choose Menus"}
                    description="Select dishes and number of people for each"
                    serviceId={specialServiceDetails?.id || ""}
                    selectedPricingModel={{id: "perhead", name: "Per Head", value: "perhead"}}
                    selectedMenuClass={formik.values.menuClass}
                    selectedPlaterSize={{id: "standard", name: "Standard", value: "standard"}}
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

        if (activeStepKey === "procurementOption") {
            return (
                <SpecialServiceProcurementPurchaseStyle
                    serviceId={""}
                    chefCategory={{id:"", name:"",chefCatId:"", basePriceMinor:0}}
                    chef={formik.values.selectedChef}
                    menuDeliveryOption={{name: "", value: ""}}
                    selectedMenus={formik.values.selectedMenus}
                    procurementPurchaseOption={formik.values.groceryProcurementOption}
                    onProcurementPurchaseOptionChange={(nextValue) => {
                        formik.setFieldValue("groceryProcurementOption", nextValue);
                        formik.setFieldTouched("groceryProcurementOption", true);
                        formik.setFieldTouched("groceryProcurementOption.value", true, false);
                        formik.setFieldValue("paymentOption", nextValue?.value === "self" ? "quotation" : "instant");
                    }}
                    onCombinedGroceriesChange={()=>console.log('')}
                    procurementOptionTouched={Boolean(formik.touched.groceryProcurementOption)}
                    procurementOptionError={formik.errors.groceryProcurementOption as string | undefined}
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
                <SpecialServiceBookingSummary
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
                <BodyText text={`Service: ${requestedServiceName || specialServiceDetails?.name || "Residential Service"}`} />
                <BodyText text={`Workflow: ${formik.values.workflow || "RESIDENTIAL_SERVICE"}`} />
                <BodyText text={`Event date: ${formik.values.startDate?.toLocaleDateString() || "-"}`} />
                <BodyText text={`Arrival time: ${formik.values.arrivalTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "-"}`} />
                <BodyText text={`Service time: ${formik.values.serviceTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "-"}`} />
            </FrameCard>
        );
    };

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                // Fetch service details using the specialServiceId from params
                const response = await getSpecialServiceById(requestedSpecialServiceId)
                // console.log("Fetched service details:", response);
                setSpecialServiceDetails(response);
            } catch (error) {
                console.error("Error fetching service details:", error);
            }
        };
        if (requestedSpecialServiceId) {
            fetchServiceDetails();
        }
    }, [requestedSpecialServiceId]);
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

