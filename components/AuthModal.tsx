import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScaledSheet } from "react-native-size-matters";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const router = useRouter();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Welcome to BCKash</Text>
          <Text style={styles.subtitle}>Please sign in or create an account</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              
              onClose();
              router.push("/signup");
            }}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => {
              onClose();
              router.push("/login");
            }}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text ></Text>
            <TouchableOpacity
            style={styles.button}
            onPress={() => {
              onClose();
            }}
          >
            <Text style={styles.buttonText}>Ok</Text>
          </TouchableOpacity>
          </View>
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
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: "16@ms",
    padding: "20@ms",
    alignItems: "center",
  },
  header:{
    width:"30%",
display:"flex",
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
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
    color: "#fff",
    fontSize: "16@ms",
    fontWeight: "600",
  },
});

export default AuthModal;