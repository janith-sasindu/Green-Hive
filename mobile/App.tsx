import "./global.css";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { TransporterThemeProvider } from "./src/context/TransporterThemeContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <TransporterThemeProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </TransporterThemeProvider>
    </SafeAreaProvider>
  );
}


