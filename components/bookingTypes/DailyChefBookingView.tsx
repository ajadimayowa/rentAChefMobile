import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed"
import BodyText from "../typography/BodyText"

const DailyChefBookingView = () => {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <BodyText text="Daily Chef Booking View" />
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

export default DailyChefBookingView;