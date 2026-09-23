import { StyleProp, Text, TextStyle } from "react-native"
import { ScaledSheet } from "react-native-size-matters";

interface IBodyText {
    text:string,
    textStyle?: StyleProp<TextStyle>;
}
const TitleText : React.FC<IBodyText> = ({text,textStyle})=>{
    return(<Text style={[styles.p,textStyle]}>{text}</Text>)
}
export default TitleText;

const styles = ScaledSheet.create({
    p:{
        fontFamily:'titleFont',
        fontSize:'34@ms'
    }
})