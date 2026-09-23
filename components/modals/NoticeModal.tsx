import React from "react";
import { Modal, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { IconButton } from "react-native-paper";
import SectionText from "@/components/typography/SectionText";
import BodyText from "@/components/typography/BodyText";
import PrimaryActionButton from "@/components/buttons/PrimaryActionButton";

interface NoticeModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

const NoticeModal: React.FC<NoticeModalProps> = ({
  visible,
  onClose,
  title,
  message,
  confirmLabel = "Got it",
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <SectionText text={title} />
            <IconButton icon="close" size={22} onPress={onClose} />
          </View>

          <BodyText text={message} textStyle={styles.message} />

          <PrimaryActionButton title={confirmLabel} onPress={onClose} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  container: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: "20@ms",
    borderTopRightRadius: "20@ms",
    padding: "18@ms",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10@ms",
  },

  message: {
    lineHeight: "20@ms",
  },

  button: {
    marginTop: "18@ms",
  },
});

export default NoticeModal;
