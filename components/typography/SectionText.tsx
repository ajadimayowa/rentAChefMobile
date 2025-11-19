import {Text,TextStyle} from "react-native"
import { ScaledSheet } from "react-native-size-matters";

interface IBodyText {
    text:string,
    textStyle?: TextStyle;
}
const SectionText : React.FC<IBodyText> = ({text,textStyle})=>{
    return(<Text style={[styles.p,textStyle]}>{text}</Text>)
}
export default SectionText;

const styles = ScaledSheet.create({
    p:{
        fontFamily:'secondaryFont',
        fontSize:'18@ms'
    }
})