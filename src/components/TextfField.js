import React from "react";
import { StyleSheet, TextInput, View, Animated, Easing } from "react-native";
import { useState, useRef, useEffect } from "react";
import { colors } from "../Colors";

const TextField = (props) => {
  const { label, style, onBlur, onFocus, ...restOfProps } = props;
  const [isFocused, setIsFocused] = useState(false);
  const [hasText, setHasText] = useState(!!restOfProps.value);

  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused || hasText ? 1 : 0,
      duration: 150,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [focusAnim, isFocused, hasText]);

  return (
    <View style={style}>
      <TextInput
        style={styles.input}
        {...restOfProps}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onChangeText={(text) => {
          setHasText(!!text);
          restOfProps.onChangeText?.(text);
        }}
      />
      <Animated.View
        style={[
          styles.labelContainer,
          {
            top: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [hasText || isFocused ? 24 : 18, -6],
            }),
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            {
              fontSize: focusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 13],
              }),
              color: isFocused ? "black" : "#B9C4CA",
            },
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    padding: 16,
    borderColor: "#B9C4CA",
    borderWidth: 1,
    borderRadius: 4,
    fontFamily: "Avenir-Medium",
    fontSize: 16,
  },
  labelContainer: {
    position: "absolute",
    left: 16,
    top: -6,
    paddingHorizontal: 6,
    backgroundColor: colors.background,
  },
  label: {
    fontFamily: "Avenir-Heavy",
    fontSize: 12,
  },
});

export default TextField;
