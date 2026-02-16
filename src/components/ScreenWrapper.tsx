import { View, Text } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet } from "react-native";

export default function ScreenWrapper({children}: {children: ReactNode}) {
    return (
        <LinearGradient  colors={['#0078b0', '#001c54', '#050505']}  className="flex-1  bg-[#112]">
            <View className="w-full  shadow-lg shadow-sky-300 border-sky-800"></View>
            {children}
        </LinearGradient>
    )
}

var styles = StyleSheet.create({
  
});