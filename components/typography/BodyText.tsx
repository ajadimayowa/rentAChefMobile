import {Text,TextStyle} from "react-native"
import { ScaledSheet } from "react-native-size-matters";

interface IBodyText {
    text:string,
    textStyle?: TextStyle;
}
const BodyText : React.FC<IBodyText> = ({text,textStyle})=>{
    return(<Text style={[styles.p,textStyle]}>{text}</Text>)
}
export default BodyText;

const styles = ScaledSheet.create({
    p:{
        fontFamily:'primaryFont',
        fontSize:'15@ms'
    }
})