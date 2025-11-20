import React, { memo } from 'react';
import {
    View,
    Text,
    Image,
    ImageBackground,
    TouchableOpacity,
    GestureResponderEvent,
    ViewStyle,
    TextStyle,
    ImageStyle,
    StyleProp,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

export interface CardProps {
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
    image?: any; // require('./path') or { uri: '...' }
    onPress?: (e: GestureResponderEvent) => void;
    elevation?: number; // shadow strength
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
    imageStyle?: StyleProp<ImageStyle>;
    rightAccessory?: React.ReactNode; // e.g. icon or badge
    footer?: React.ReactNode;
    disabled?: boolean;
}

const DEFAULT_BORDER_RADIUS = 12;
const DEFAULT_ELEVATION = 2;

const Card: React.FC<CardProps> = ({
    title,
    subtitle,
    children,
    image,
    onPress,
    elevation = DEFAULT_ELEVATION,
    borderRadius = DEFAULT_BORDER_RADIUS,
    style,
    titleStyle,
    subtitleStyle,
    imageStyle,
    rightAccessory,
    footer,
    disabled = false,
}) => {
    const Container: any = onPress ? TouchableOpacity : View; // typed as any to allow style prop

    const wrapperStyle = [
        styles.container,
        { borderRadius, elevation, shadowOpacity: elevation * 0.1 },
        style,
    ];

    const content = (
        <View style={wrapperStyle} accessible accessibilityRole={onPress ? 'button' : 'summary'}>
            {/* Image / header */}
            {image ? (
                <ImageBackground
                    source={image}
                    style={[styles.imageWrapper, { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }]}
                    imageStyle={[{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }, imageStyle]}
                >
                    {/* optional overlay title when image present */}
                </ImageBackground>
            ) : null}

            <View style={styles.inner}>
                <View style={styles.rowBetween}>
                    <View style={styles.textBlock}>
                        {title ? <Text numberOfLines={1} style={[styles.title, titleStyle]}>{title}</Text> : null}
                        {subtitle ? <Text numberOfLines={2} style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text> : null}
                    </View>

                    {rightAccessory ? <View style={styles.rightAccessory}>{rightAccessory}</View> : null}
                </View>

                {/* Body / children */}
                {children ? <View style={styles.childrenWrapper}>{children}</View> : null}

                {/* Footer */}
                {footer ? <View style={styles.footer}>{footer}</View> : null}
            </View>
        </View>
    );

    if (onPress) {
        return (
            <Container onPress={onPress} disabled={disabled} activeOpacity={0.85} style={{ borderRadius }}>
                {content}
            </Container>
        );
    }

    return content;
};

export default memo(Card);

// ---- Styles ----
const styles = ScaledSheet.create({
    container: {
        backgroundColor: '#fdeaeaff',
        overflow: 'hidden',
        marginVertical: '6@vs',
        marginHorizontal: '4@s',
        // iOS shadow
        shadowColor: '#222121ff',
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.12,
        shadowRadius: '6@vs',
        // Android elevation is provided via props
    },
    imageWrapper: {
        width: '100%',
        height: '110@vs',
        justifyContent: 'flex-end',
    },
    inner: {
        paddingHorizontal: '12@s',
        paddingVertical: '10@vs',
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textBlock: {
        flex: 1,
        paddingRight: '8@s',
    },
    title: {
        fontSize: '16@s',
        fontWeight: '600',
        color: '#111',
    },
    subtitle: {
        fontSize: '12@s',
        color: '#666',
        marginTop: '4@vs',
    },
    rightAccessory: {
        marginLeft: '8@s',
    },
    childrenWrapper: {
        marginTop: '8@vs',
    },
    footer: {
        marginTop: '12@vs',
        borderTopWidth: 1,
        borderTopColor: '#f1f1f1',
        paddingTop: '8@vs',
    },
});