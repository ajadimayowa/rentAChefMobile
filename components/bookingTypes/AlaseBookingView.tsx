import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed"
import BodyText from "../typography/BodyText"

interface AlaseBookingViewProps {
    bookingDetails: {
        id: string;
        workflow: string;
        clientId: {
            id: string;
            name: string;
            email: string;
            phoneNumber: string;
        };
        bookingType: string;
        clientNote: string;
    };
}
const AlaseBookingView: React.FC<AlaseBookingViewProps> = ({bookingDetails}) =>  {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <BodyText text="Alase Booking View" />
        </View> 
    )
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        padding: "20@ms",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: "24@ms",
        fontWeight: "bold",
        marginBottom: "20@ms",
    },
    scrollContainer: {
        flex: 1,
    },
    text: {
        fontSize: "16@ms",
        marginBottom: "10@ms",
    },
    titleCard: {
        alignItems: "center",
        justifyContent: "center",
    }
});

export default AlaseBookingView;