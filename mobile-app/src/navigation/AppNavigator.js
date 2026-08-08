import React from "react";
import { ActivityIndicator, View, TouchableOpacity, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import DoctorDetailsScreen from "../screens/DoctorDetailsScreen";
import PaymentScreen from "../screens/PaymentScreen";
import PaymentSuccessScreen from "../screens/PaymentSuccessScreen";
import MyAppointmentsScreen from "../screens/MyAppointmentsScreen";

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "MediBook",
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate("MyAppointments")}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>My Bookings</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="DoctorDetails" component={DoctorDetailsScreen} options={{ title: "Doctor Profile" }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: "Payment" }} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ title: "Payment Success" }} />
      <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} options={{ title: "My Appointments" }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
