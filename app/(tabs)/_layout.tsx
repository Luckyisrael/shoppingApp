import { Tabs } from "expo-router";
import { Home2, Profile, ShoppingBag } from "iconsax-react-nativejs";
import React from "react";

import Colors from "@/constants/colors";
import { useAuthStore } from "@/stores/authStore";

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopColor: Colors.light.border,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Products",
          tabBarIcon: ({ color, focused }) => <Home2 size="24" color={color} variant={ focused? "Bold" : "Outline" }/>,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, focused  }) => <ShoppingBag size="24" color={color} variant={ focused? "Bold" : "Outline" }/>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused  }) => <Profile size="24" color={color} variant={ focused? "Bold" : "Outline" }/>,
        }}
      />
    </Tabs>
  );
}