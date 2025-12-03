import { Image,Text, View } from "react-native";

export default function PrimaryLoader (){
    return (
        <>
        <View style={{alignItems:'center', justifyContent:'center',flex:1, width:'100%'}}>
            <Image source={require('../assets/gif/rentLoader.gif')} style={{ width: 100, height: 100, borderRadius:100 }}/>
            <Text>Loading..</Text>
        </View>
        </>
    )

}