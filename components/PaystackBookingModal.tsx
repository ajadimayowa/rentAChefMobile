import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScaledSheet } from "react-native-size-matters";
import { Foundation } from "@expo/vector-icons";
import api from "@/services/apiConfig";
import { WebView } from "react-native-webview";

interface AuthModalProps {
  visible: boolean;
  chefId: any;
  date?: string;
  onClose: () => void;
}

const PaystackBookingModal: React.FC<AuthModalProps> = ({ chefId, visible, onClose, date }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const startPayment = async () => {
    setLoading(true)
    try {
      const res = await api.post("/payment/initialize-payment", {
        email: "ajadimayowa879@gmail.com",
        amount: 100,
      });

      console.log({ seeResp: res.data?.data })

      if (res.data) {
        setLoading(false);
        setPaymentUrl(res.data?.data?.authorization_url);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Pay with Paystack</Text>
            <TouchableOpacity onPress={onClose}>
              <Foundation size={24} name="x-circle" />
            </TouchableOpacity>
          </View>

          {!paymentUrl ? (
            <TouchableOpacity style={styles.button} onPress={startPayment}>
              {
                loading ? <ActivityIndicator /> :
                  <Text style={styles.buttonText}>Pay ₦5,000</Text>
              }
            </TouchableOpacity>
          ) : (
            <View style={{ height: 500 }}>
              <WebView
                source={{ uri: paymentUrl }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                originWhitelist={['*']}
                mixedContentMode="always"
                onNavigationStateChange={(state) => {
                  console.log("Current URL:", state.url);

                  if (state.url.includes("reference=")) {
                    onClose();
                    alert("Payment completed");
                  }
                }}
              />
            </View>
          )}

          {/* <TouchableOpacity
            style={styles.button}
            onPress={() => {
              
              onClose();
              router.replace({pathname:"/bookingpage",params:{id:chefId,}});
            }}
          >
            <Text style={styles.buttonText}>Proceed to booking</Text>
          </TouchableOpacity> */}

          {/* <TouchableOpacity
            style={{backgroundColor:'#afafafff', width:'100%',padding:10,borderRadius:5,justifyContent:'center',alignItems:'center'}}
            onPress={() => {
              onClose();
            }}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity> */}

          {/* <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => {
              onClose();
              router.push("/login");
            }}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity> */}

          {/* <View style={styles.header}>
            <Text ></Text>
            <TouchableOpacity
            style={styles.button}
            onPress={() => {
              onClose();
            }}
          >
            <Text style={styles.buttonText}>Ok</Text>
          </TouchableOpacity>
          </View> */}
        </View>
      </View>


    </Modal>
  );
};

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    maxHeight: '80%',
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: "16@ms",
    padding: "20@ms",
    alignItems: "center",
  },
  header: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "18@ms",
    fontWeight: "bold",
    marginBottom: "10@ms",
  },
  subtitle: {
    fontSize: "14@ms",
    color: "#666",
    marginBottom: "20@ms",
    textAlign: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#1B3C53",
    padding: "12@ms",
    borderRadius: "8@ms",
    alignItems: "center",
    marginVertical: "8@ms",
  },
  loginButton: {
    backgroundColor: "#f59e0b",
  },
  buttonText: {
    color: "#ffffffff",
    fontSize: "16@ms",
    fontWeight: "600",
  },
});

export default PaystackBookingModal;